const puppeteer = require('puppeteer');
const path = require('path');

const HTML = 'file://' + path.resolve(__dirname, 'gauge-exceeded.test.html');
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

  // ─── Test 1: Value below max — no styles applied ───
  console.log('\nTest 1: Value below max');
  let r = await page.evaluate(() => {
    simulateGaugeUpdate('1-1', 1.5, 2.2);
    const g = document.querySelector('#gauge_1-1');
    const b = document.querySelector('#box_1-1');
    return {
      gaugeBoxShadow: g.style.boxShadow,
      boxBoxShadow: b.style.boxShadow,
      cache: gaugeExceededCache.get('1-1'),
      hasFlash: gaugeExceededTimers.has('1-1_flash'),
    };
  });
  assert(r.gaugeBoxShadow === '', 'Gauge has no glow');
  assert(r.cache === undefined || r.cache === false, 'Cache not set to exceeded');
  assert(!r.hasFlash, 'No flash interval running');

  // ─── Test 2: Value equals max — exceeded triggers ───
  console.log('\nTest 2: Value equals max (exact match)');
  r = await page.evaluate(() => {
    simulateGaugeUpdate('1-1', 2.2, 2.2);
    const g = document.querySelector('#gauge_1-1');
    return {
      gaugeBoxShadow: g.style.boxShadow,
      cache: gaugeExceededCache.get('1-1'),
      hasFlash: gaugeExceededTimers.has('1-1_flash'),
    };
  });
  assert(r.gaugeBoxShadow.includes('217, 74, 74'), 'Gauge has red glow');
  assert(r.gaugeBoxShadow.includes('inset'), 'Gauge glow is inset');
  assert(r.cache === true, 'Cache set to exceeded');
  assert(r.hasFlash === true, 'Flash interval started');

  // ─── Test 3: Value exceeds max — still exceeded ───
  console.log('\nTest 3: Value exceeds max');
  r = await page.evaluate(() => {
    simulateGaugeUpdate('1-1', 3.5, 2.2);
    const g = document.querySelector('#gauge_1-1');
    return {
      gaugeBoxShadow: g.style.boxShadow,
      gaugeHeight: g.style.height,
      cache: gaugeExceededCache.get('1-1'),
      hasFlash: gaugeExceededTimers.has('1-1_flash'),
    };
  });
  assert(r.gaugeBoxShadow.includes('217, 74, 74'), 'Gauge still has red glow');
  assert(r.gaugeHeight === '100%', 'Gauge height capped at 100%');
  assert(r.cache === true, 'Cache still exceeded');
  assert(r.hasFlash === true, 'Flash interval still running');

  // ─── Test 4: Box flash actually toggles ───
  console.log('\nTest 4: Box flash toggles box-shadow');
  r = await page.evaluate(async () => {
    const b = document.querySelector('#box_1-1');
    const shadows = [];
    for (let i = 0; i < 4; i++) {
      await new Promise(r => setTimeout(r, 320));
      shadows.push(b.style.boxShadow);
    }
    return { shadows, uniqueCount: new Set(shadows).size };
  });
  assert(r.uniqueCount >= 2, `Box shadow alternated (${r.uniqueCount} distinct values over 4 samples)`);
  assert(r.shadows.some(s => s.includes('217, 74, 74')), 'At least one flash state has red glow');

  // ─── Test 5: Return to safe value — flash stops, warned state ───
  console.log('\nTest 5: Return to safe value');
  r = await page.evaluate(() => {
    simulateGaugeUpdate('1-1', 1.0, 2.2);
    const g = document.querySelector('#gauge_1-1');
    const b = document.querySelector('#box_1-1');
    return {
      gaugeBoxShadow: g.style.boxShadow,
      boxBoxShadow: b.style.boxShadow,
      cache: gaugeExceededCache.get('1-1'),
      hasFlash: gaugeExceededTimers.has('1-1_flash'),
      hasWarn: gaugeExceededTimers.has('1-1_warn'),
    };
  });
  assert(!r.hasFlash, 'Flash interval stopped');
  assert(r.boxBoxShadow === '', 'Box shadow reset to CSS default');
  assert(r.gaugeBoxShadow.includes('217, 74, 74'), 'Gauge has warned glow');
  assert(r.gaugeBoxShadow.includes('4px 1px'), 'Warned glow is lighter than exceeded');
  assert(r.cache === false, 'Cache set to not-exceeded');
  assert(r.hasWarn === true, 'Warn timer is running');

  // ─── Test 6: Warned glow disappears after 3s ───
  console.log('\nTest 6: Warned glow disappears after 3s');
  r = await page.evaluate(async () => {
    await new Promise(r => setTimeout(r, 3100));
    const g = document.querySelector('#gauge_1-1');
    return {
      gaugeBoxShadow: g.style.boxShadow,
      hasWarn: gaugeExceededTimers.has('1-1_warn'),
    };
  });
  assert(r.gaugeBoxShadow === '', 'Gauge glow removed after 3s');
  assert(!r.hasWarn, 'Warn timer cleaned up');

  // ─── Test 7: Re-exceed after recovery ───
  console.log('\nTest 7: Re-exceed after recovery');
  r = await page.evaluate(() => {
    simulateGaugeUpdate('1-1', 2.5, 2.2);
    const g = document.querySelector('#gauge_1-1');
    return {
      gaugeBoxShadow: g.style.boxShadow,
      cache: gaugeExceededCache.get('1-1'),
      hasFlash: gaugeExceededTimers.has('1-1_flash'),
    };
  });
  assert(r.gaugeBoxShadow.includes('217, 74, 74'), 'Gauge glow re-applied');
  assert(r.cache === true, 'Cache set to exceeded again');
  assert(r.hasFlash === true, 'Flash interval restarted');

  // ─── Test 8: Re-exceed while in warned state (within 3s) ───
  console.log('\nTest 8: Re-exceed during warned state');
  r = await page.evaluate(() => {
    // First return to safe
    simulateGaugeUpdate('1-1', 1.0, 2.2);
    // Immediately exceed again (within 3s warn window)
    simulateGaugeUpdate('1-1', 2.2, 2.2);
    const g = document.querySelector('#gauge_1-1');
    return {
      gaugeBoxShadow: g.style.boxShadow,
      hasFlash: gaugeExceededTimers.has('1-1_flash'),
      hasWarn: gaugeExceededTimers.has('1-1_warn'),
    };
  });
  assert(r.gaugeBoxShadow.includes('8px 2px'), 'Full exceeded glow (not warned)');
  assert(r.hasFlash === true, 'Flash running');
  assert(!r.hasWarn, 'Warn timer cleared');

  // ─── Summary ───
  // Clean up flash for clean exit
  await page.evaluate(() => {
    gaugeExceededTimers.forEach((id, key) => {
      if (key.endsWith('_flash')) clearInterval(id); else clearTimeout(id);
    });
  });

  console.log(`\n${'═'.repeat(40)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'═'.repeat(40)}\n`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
