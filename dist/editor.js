
import {css} from './css-editor.js?v=0.2.78';

import * as libEditor from './lib-editor.js?v=0.2.78';

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
                  display: flex;
                  flex-direction: row;
                  border-bottom: 2px solid #ccc;
                  --paper-tabs-selection-color: #0ea5e9;
                }
                paper-tab {
                  flex: 1;
                  padding: 12px 16px;
                  cursor: pointer;
                  text-align: center;
                  font-weight: 500;
                  color: #666;
                  border-bottom: 3px solid transparent;
                  transition: all 0.3s ease;
                  --paper-tab-ink: #0ea5e9;
                }
                paper-tab:hover {
                  color: #333;
                  background-color: #f5f5f5;
                }
                paper-tab[active] {
                  color: #0ea5e9;
                  border-bottom: 3px solid #0ea5e9;
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
      
      console.log('[venus-editor] setConfig: Initializing tab system');
      
      // Store the last known selected value
      let lastSelected = tabGroup.selected || 'conf-0';
      console.log('[venus-editor] Initial selected tab:', lastSelected);
      
      // Function to handle tab change
      const handleTabChange = (newTabName) => {
        const selectedTab = parseInt(newTabName.replace('conf-', ''), 10);
        console.log('[venus-editor] *** TAB CHANGE DETECTED ***: from', lastSelected, 'to', newTabName);
        
        this._currentTab = selectedTab;
        this._config.currentTab = selectedTab;
        lastSelected = newTabName;
        
        this.renderTabContent();
        libEditor.notifyConfigChange(this);
      };
      
      // Try attaching click handlers to paper-tab elements
      const paperTabs = this.shadowRoot.querySelectorAll('paper-tab');
      console.log(`[venus-editor] Found ${paperTabs.length} paper-tab elements`);
      
      paperTabs.forEach((tab, idx) => {
        const tabName = tab.getAttribute('name');
        console.log(`[venus-editor] Attaching handler to paper-tab[${idx}]: ${tabName}`);
        
        // Add click listener
        tab.addEventListener('click', (e) => {
          console.log('[venus-editor] CLICK on tab:', tabName);
          handleTabChange(tabName);
          e.stopImmediatePropagation();
          e.preventDefault();
        }, { capture: true, passive: false });
        
        // Also try pointerdown
        tab.addEventListener('pointerdown', (e) => {
          console.log('[venus-editor] POINTERDOWN on tab:', tabName);
          handleTabChange(tabName);
          e.stopImmediatePropagation();
          e.preventDefault();
        }, { capture: true, passive: false });
      });
      
      // Fallback: Poll the selected attribute directly every 100ms
      const pollInterval = setInterval(() => {
        const currentSelected = tabGroup.selected || 'conf-0';
        if (currentSelected !== lastSelected) {
          console.log('[venus-editor] POLL DETECTED CHANGE from', lastSelected, 'to', currentSelected);
          handleTabChange(currentSelected);
        }
      }, 100);
      
      // Store interval ID so it can be cleaned up if needed
      this._tabPollInterval = pollInterval;
      
      // Also listen for iron-select event as additional fallback
      tabGroup.addEventListener('iron-select', (event) => {
        const selectedName = event.detail.item?.getAttribute('name') || 'conf-0';
        console.log('[venus-editor] IRON-SELECT event:', selectedName);
        handleTabChange(selectedName);
      });
      
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
