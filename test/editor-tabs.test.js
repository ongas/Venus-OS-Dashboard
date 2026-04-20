const puppeteer = require('puppeteer');
const path = require('path');

const HTML = 'file://' + path.resolve(__dirname, 'editor-tabs.test.html');
let browser, page;
let passed = 0, failed = 0;

function assert(condition, name) {
  if (condition) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name}`); }
}

(async () => {
  browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  page = await browser.newPage();
  await page.goto(HTML, { waitUntil: 'domcontentloaded' });

  const baseConfig = {
    param: { boxCol1: 1, boxCol2: 2, boxCol3: 1 },
    devices: {
      '1-1': { name: 'Grid', entity: 'sensor.grid' },
      '2-1': { name: 'Multiplus', entity: 'sensor.multiplus' },
      '2-2': { name: 'Battery', entity: 'sensor.battery' },
      '3-1': { name: 'Home', entity: 'sensor.home' },
    },
    entities: {},
  };

  // ─── Test 1: Initial state ───
  console.log('\nTest 1: Initial editor state');
  let r = await page.evaluate(async (config) => {
    await window.initEditor(config);
    const state = await new Promise(r => setTimeout(() => r(window.getCurrentState()), 50));
    return {
      currentTab: state.currentTab,
      currentSubTab: state.currentSubTab,
      configTab: state.config.currentTab,
    };
  }, baseConfig);
  assert(r.currentTab === 0, 'Initial currentTab is 0 (Main)');
  assert(r.currentSubTab === 0, 'Initial currentSubTab is 0');
  assert(r.configTab === 0, 'Config currentTab is 0');

  // ─── Test 2: Switch to Col. 2 (2 boxes) and navigate to Box 2 ───
  console.log('\nTest 2: Navigate to Column 2, Box 2');
  r = await page.evaluate(() => {
    window.clickTab(2);  // Switch to Col. 2
    return new Promise(resolve => setTimeout(() => {
      const state = window.getCurrentState();
      resolve({
        currentTab: state.currentTab,
        currentSubTab: state.currentSubTab,
        boxColCount: state.config.param.boxCol2,
      });
    }, 50));
  });
  assert(r.currentTab === 2, 'currentTab is 2 (Col. 2)');
  assert(r.currentSubTab === 0, 'currentSubTab reset to 0 on tab switch');
  assert(r.boxColCount === 2, 'Col. 2 has 2 boxes');

  // ─── Test 3: Switch to Col. 1 (1 box) — sub-tab should reset ───
  console.log('\nTest 3: Switch from Col. 2 to Col. 1 — sub-tab reset');
  r = await page.evaluate(() => {
    window.clickTab(1);  // Switch to Col. 1
    return new Promise(resolve => setTimeout(() => {
      const state = window.getCurrentState();
      resolve({
        currentTab: state.currentTab,
        currentSubTab: state.currentSubTab,
        boxColCount: state.config.param.boxCol1,
      });
    }, 50));
  });
  assert(r.currentTab === 1, 'currentTab is 1 (Col. 1)');
  assert(r.currentSubTab === 0, 'currentSubTab reset to 0 on tab switch');
  assert(r.boxColCount === 1, 'Col. 1 has 1 box (1-1)');

  // ─── Test 4: Switch to Col. 3 (1 box) — sub-tab should reset ───
  console.log('\nTest 4: Switch from Col. 1 to Col. 3 — sub-tab reset');
  r = await page.evaluate(() => {
    window.clickTab(3);  // Switch to Col. 3
    return new Promise(resolve => setTimeout(() => {
      const state = window.getCurrentState();
      resolve({
        currentTab: state.currentTab,
        currentSubTab: state.currentSubTab,
        boxColCount: state.config.param.boxCol3,
      });
    }, 50));
  });
  assert(r.currentTab === 3, 'currentTab is 3 (Col. 3)');
  assert(r.currentSubTab === 0, 'currentSubTab reset to 0 on tab switch');
  assert(r.boxColCount === 1, 'Col. 3 has 1 box (3-1)');

  // ─── Test 5: Back to Col. 2 — sub-tab should reset ───
  console.log('\nTest 5: Switch back to Col. 2 — sub-tab reset');
  r = await page.evaluate(() => {
    window.clickTab(2);  // Switch back to Col. 2
    return new Promise(resolve => setTimeout(() => {
      const state = window.getCurrentState();
      resolve({
        currentTab: state.currentTab,
        currentSubTab: state.currentSubTab,
      });
    }, 50));
  });
  assert(r.currentTab === 2, 'currentTab is 2 (Col. 2)');
  assert(r.currentSubTab === 0, 'currentSubTab reset to 0 on tab switch');

  // ─── Test 6: Config dispatch creates new object reference ───
  console.log('\nTest 6: Config dispatch deep-copies (new reference)');
  r = await page.evaluate(async (config) => {
    await window.initEditor(config);
    const beforeRef = window.testEditor._config;
    
    let dispatchedConfig = null;
    window.testEditor.addEventListener('config-changed', (e) => {
      dispatchedConfig = e.detail.config;
    });
    
    // Trigger config change
    window.clickTab(1);
    await new Promise(r => setTimeout(r, 100));
    
    return {
      beforeRef: beforeRef === window.testEditor._config,
      dispatchedRef: dispatchedConfig === window.testEditor._config,
      configIsObject: typeof dispatchedConfig === 'object',
    };
  }, baseConfig);
  assert(r.beforeRef === true, 'Internal config reference unchanged');
  assert(r.dispatchedRef === false, 'Dispatched config is new object (deep copy)');
  assert(r.configIsObject === true, 'Dispatched config is valid object');

  // ─── Test 7: JSON comparison prevents round-trip re-renders ───
  console.log('\nTest 7: JSON comparison prevents re-renders on identical config');
  r = await page.evaluate(async (config) => {
    await window.initEditor(config);
    const initialTabContent = window.testEditor.shadowRoot.querySelector('#tab-content').innerHTML;
    
    // Simulate setConfig round-trip with identical config
    await window.testEditor.setConfig(window.testEditor._config);
    const afterRoundTripContent = window.testEditor.shadowRoot.querySelector('#tab-content').innerHTML;
    
    return {
      contentUnchanged: initialTabContent === afterRoundTripContent,
    };
  }, baseConfig);
  assert(r.contentUnchanged === true, 'Tab content unchanged on identical config round-trip');

  // ─── Test 8: Config change with different data triggers setConfig ───
  console.log('\nTest 8: Config change with different data triggers logic');
  r = await page.evaluate(async (config) => {
    await window.initEditor(config);
    let configChangedFired = false;
    
    window.testEditor.addEventListener('config-changed', () => {
      configChangedFired = true;
    });
    
    // First call to setConfig should set initial config
    await window.testEditor.setConfig(window.testEditor._config);
    const fireOnRoundTrip = configChangedFired;
    
    configChangedFired = false;
    
    // Change config and call setConfig again
    const modifiedConfig = { ...window.testEditor._config };
    modifiedConfig.param = { ...modifiedConfig.param, boxCol1: 2 };
    
    await window.testEditor.setConfig(modifiedConfig);
    const fireOnChange = configChangedFired;
    
    return {
      roundTripPrevent: !fireOnRoundTrip,  // Should NOT fire on identical config
      changeDetect: fireOnChange,          // Should fire on different config
      configUpdated: window.testEditor._config.param.boxCol1 === 2,
    };
  }, baseConfig);
  assert(r.roundTripPrevent === true, 'Round-trip prevention: no dispatch on identical config');
  assert(r.changeDetect === true, 'Change detection: dispatch on new config data');
  assert(r.configUpdated === true, 'Config updated with new boxCol1 value');

  // ─── Test 9: Main tab state preserved across column switches ───
  console.log('\nTest 9: currentTab state preserved through navigation');
  r = await page.evaluate(() => {
    window.clickTab(2);
    return new Promise(resolve => setTimeout(() => {
      window.clickTab(1);
      setTimeout(() => {
        window.clickTab(2);
        setTimeout(() => {
          const state = window.getCurrentState();
          resolve({
            finalTab: state.currentTab,
            finalSubTab: state.currentSubTab,
          });
        }, 50);
      }, 50);
    }, 50));
  });
  assert(r.finalTab === 2, 'Final currentTab is 2');
  assert(r.finalSubTab === 0, 'Final currentSubTab is 0');

  // ─── Summary ───
  console.log(`\n${'═'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'═'.repeat(40)}\n`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
