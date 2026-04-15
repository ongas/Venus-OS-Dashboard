
import {css} from './css-editor.js?v=0.2.76';

import * as libEditor from './lib-editor.js?v=0.2.76';

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
                paper-tabs {
                  width: 100%;
                  --paper-tabs-selection-color: #0ea5e9;
                }
                paper-tab {
                  --paper-tab-ink: #0ea5e9;
                }
              </style>
            
              <paper-tabs id="tab-group" selected="conf-0" attr-for-selected="name">
                <paper-tab name="conf-0">Main</paper-tab>
                <paper-tab name="conf-1">Col. 1</paper-tab>
                <paper-tab name="conf-2">Col. 2</paper-tab>
                <paper-tab name="conf-3">Col. 3</paper-tab>
              </paper-tabs>
            
              <div id="tab-content" class="content"></div>
            `;
            
      tabGroup = this.shadowRoot.querySelector('#tab-group');
      
      // Set up event listener for tab changes using iron-select (native HA event)
      tabGroup.addEventListener('iron-select', (event) => {
        const selectedName = event.detail.item.getAttribute('name');
        const selectedTab = parseInt(selectedName.replace('conf-', ''), 10);
        this._currentTab = selectedTab;
        this._config.currentTab = selectedTab;
        
        console.log('[venus-editor] Tab changed to:', selectedTab, 'from name:', selectedName);
        
        this.renderTabContent();
        libEditor.notifyConfigChange(this);
      });
      
      // Also watch for property changes as fallback (paper-tabs may not fire iron-select on all interactions)
      const handleTabSelectedChange = () => {
        const selectedName = tabGroup.selected;
        if (typeof selectedName === 'string' && selectedName.startsWith('conf-')) {
          const selectedTab = parseInt(selectedName.replace('conf-', ''), 10);
          if (this._currentTab !== selectedTab) {
            this._currentTab = selectedTab;
            this._config.currentTab = selectedTab;
            console.log('[venus-editor] Tab changed (via property watch) to:', selectedTab);
            this.renderTabContent();
            libEditor.notifyConfigChange(this);
          }
        }
      };
      
      // Create a MutationObserver to watch for selected attribute changes
      const observer = new MutationObserver(handleTabSelectedChange);
      observer.observe(tabGroup, { attributes: true, attributeFilter: ['selected'] });
      
      const style = document.createElement('style');
      style.textContent = css();
      this.shadowRoot.appendChild(style);
      
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
      tabGroup.selected = `conf-${this._currentTab}`;
      console.log('[venus-editor] Setting tab to:', `conf-${this._currentTab}`);
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
