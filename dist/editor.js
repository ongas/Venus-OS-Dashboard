
import {css} from './css-editor.js?v=0.2.72';

import * as libEditor from './lib-editor.js?v=0.2.72';

class venusOsDashBoardEditor extends HTMLElement {
  constructor() {
    super();
    
  }
    
  async setConfig(config) {
    
    // CRITICAL: Preserve currentTab explicitly so Home Assistant recognizes it as a configuration value
    this._config = { 
      ...config, 
      entities: { ...(config.entities || {}) },
      currentTab: config.currentTab !== undefined ? config.currentTab : 0
    };
    
    console.log('[venus-editor] setConfig called with:', { 
      hasCurrentTab: !!config.currentTab,
      currentTabValue: config.currentTab,
      preservedCurrentTab: this._config.currentTab,
      fullConfig: config 
    });
        
    await libEditor.loadTranslations(this);
    
    let tabGroup;
    if (!this.shadowRoot) {
            
      this.attachShadow({ mode: 'open' });
            
      this.shadowRoot.innerHTML = `
              <style>
                sl-tab-group {
                  width: 100%;
                }
              </style>
            
              <sl-tab-group id="tab-group">
                <sl-tab slot="nav" panel="conf-0">Main</sl-tab>
                <sl-tab slot="nav" panel="conf-1">Col. 1</sl-tab>
                <sl-tab slot="nav" panel="conf-2">Col. 2</sl-tab>
                <sl-tab slot="nav" panel="conf-3">Col. 3</sl-tab>
                <sl-tab-panel name="conf-0"><div id="tab-content"></div></sl-tab-panel>
                <sl-tab-panel name="conf-1"></sl-tab-panel>
                <sl-tab-panel name="conf-2"></sl-tab-panel>
                <sl-tab-panel name="conf-3"></sl-tab-panel>
              </sl-tab-group>
            `;
            
      tabGroup = this.shadowRoot.querySelector('#tab-group');
      
      // Set up event listener for tab changes
      tabGroup.addEventListener('sl-change', (event) => {
        const selectedValue = event.detail.value;
        const dataTab = parseInt(selectedValue.replace('conf-', ''), 10);
        this._currentTab = dataTab;
        this._config.currentTab = dataTab;
        
        console.log('[venus-editor] Tab changed to:', dataTab, 'from value:', selectedValue);
        
        this.renderTabContent();
        libEditor.notifyConfigChange(this);
      });
      
      const style = document.createElement('style');
      style.textContent = css();
      this.shadowRoot.appendChild(style);
      
      this._currentTab = this._config.currentTab || 0;
      
      console.log('[venus-editor] Tab initialization:', {
        configCurrentTab: this._config.currentTab,
        currentTabValue: this._currentTab,
        tabToActivate: `conf-${this._currentTab}`
      });
      
      libEditor.attachLinkClick(this.renderTabContent.bind(this), this);
    } else {
      tabGroup = this.shadowRoot.querySelector('#tab-group');
    }
    
    if (tabGroup) {
      tabGroup.value = `conf-${this._currentTab}`;
      console.log('[venus-editor] Setting tab to:', this._currentTab);
    }
    
    this.renderTabContent();
  }
    
  
    
  renderTabContent() {
        
    if (this._currentTab === 0) {
            
      libEditor.tab1Render(this);
            
      console.log("conf.");
            
    } else if (this._currentTab === 1) {
            
      libEditor.tabColRender(1, this);
            
      console.log("tab 1");
    
    } else if (this._currentTab === 2) {
            
      libEditor.tabColRender(2, this);
            
      console.log("tab 2");
            
    } else if (this._currentTab === 3) {
            
      libEditor.tabColRender(3, this);
            
      console.log("tab 3");
            
    }
    
    libEditor.attachInputs(this);
        
  }
  
  set hass(hass) {
    this._hass = hass;
  }
      
  get hass() {
    return this._hass;
  }
      
  get value() {
    return this._config;
  }
}

customElements.define('venus-os-editor', venusOsDashBoardEditor);
