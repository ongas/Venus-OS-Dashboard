
import {css} from './css-editor.js?v=0.2.71';

import * as libEditor from './lib-editor.js?v=0.2.71';

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
                ha-tabs {
                  width: 100%;
                  --mdc-tab-text-label-color-default: var(--text-primary-color, #000);
                  --mdc-tab__text-label: { color: var(--text-primary-color, #000); };
                  --mdc-tab-color-default: var(--text-primary-color, #000);
                  --mdc-theme-primary: #0ea5e9;
                }
              </style>
            
              <ha-tabs id="tab-group" scrollable attr="activeTab">
                <ha-tab id="main-tab" icon="mdi:home">Main</ha-tab>
                <ha-tab id="col1-tab" icon="mdi:table">Col. 1</ha-tab>
                <ha-tab id="col2-tab" icon="mdi:table">Col. 2</ha-tab>
                <ha-tab id="col3-tab" icon="mdi:table">Col. 3</ha-tab>
              </ha-tabs>
            
              <div id="tab-content" class="content"></div>
            `;
            
      tabGroup = this.shadowRoot.querySelector('#tab-group');
      
      // Set up event listener for tab changes using ha-tabs native event
      tabGroup.addEventListener('iron-activate', (event) => {
        const selectedTab = event.detail.selected;
        this._currentTab = selectedTab;
        this._config.currentTab = selectedTab;
        
        console.log('[venus-editor] Tab changed to:', selectedTab, 'config.currentTab:', this._config.currentTab);
        
        this.renderTabContent();
        libEditor.notifyConfigChange(this);
      });
      
      const style = document.createElement('style');
      style.textContent = css();
      tabGroup.appendChild(style);
      
      this._currentTab = this._config.currentTab || 0;
      
      console.log('[venus-editor] Tab initialization:', {
        configCurrentTab: this._config.currentTab,
        currentTabValue: this._currentTab
      });
      
      libEditor.attachLinkClick(this.renderTabContent.bind(this), this);
    } else {
      tabGroup = this.shadowRoot.querySelector('#tab-group');
    }
    
    if (tabGroup) {
      tabGroup.activeTab = this._currentTab;
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
