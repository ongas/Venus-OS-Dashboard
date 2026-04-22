
import {css} from './css-editor.js?v=0.6.51';

import * as libEditor from './lib-editor.js?v=0.6.51';

class venusOsDashBoardEditor extends HTMLElement {
  constructor() {
    super();
    
  }
    
  async setConfig(config) {
    
    // CRITICAL: Preserve currentTab explicitly so Home Assistant recognizes it as a configuration value
    const newConfig = { 
      ...config, 
      entities: { ...(config.entities || {}) },
      currentTab: config.currentTab !== undefined ? config.currentTab : 0
    };
    
    // Skip re-render if config hasn't changed (prevents expandable sections collapsing on round-trip)
    if (this._config && JSON.stringify(newConfig) === JSON.stringify(this._config)) {
      return;
    }
    this._config = newConfig;
    
    // Initialize sub-tab (box) selection
    this._currentSubTab = 0;
    
    console.log('[venus-editor] setConfig called with:', { 
      hasCurrentTab: !!config.currentTab,
      currentTabValue: config.currentTab,
      preservedCurrentTab: this._config.currentTab,
      fullConfig: config 
    });
        
    await libEditor.loadTranslations(this);
    
    if (!this.shadowRoot) {
            
      this.attachShadow({ mode: 'open' });
            
      this.shadowRoot.innerHTML = `
              <style>
                #tab-group {
                  width: 100%;
                  display: flex;
                  flex-direction: row;
                  border-bottom: 2px solid #ccc;
                  margin: 0;
                  padding: 0;
                }
                .native-tab {
                  flex: 1;
                  padding: 12px 16px;
                  cursor: pointer;
                  text-align: center;
                  font-weight: 500;
                  color: #666;
                  border-bottom: 3px solid transparent;
                  transition: all 0.3s ease;
                  background: none;
                  border: none;
                  font-size: 14px;
                  font-family: inherit;
                }
                .native-tab:hover {
                  color: #333;
                  background-color: #f5f5f5;
                }
                .native-tab.active {
                  color: #0ea5e9;
                  border-bottom: 3px solid #0ea5e9;
                }
                .sub-tab-group {
                  display: flex;
                  flex-direction: row;
                  border-bottom: 2px solid #ddd;
                  margin: 12px 0 12px 0;
                  padding: 0;
                  gap: 0;
                }
                .native-box-tab {
                  flex: 1;
                  padding: 10px 12px;
                  cursor: pointer;
                  text-align: center;
                  font-weight: 400;
                  color: #666;
                  transition: all 0.3s ease;
                  background: none;
                  border: none;
                  border-bottom: 3px solid transparent;
                  font-size: 13px;
                  font-family: inherit;
                }
                .native-box-tab:hover {
                  color: #333;
                  background-color: #fafafa;
                }
                .native-box-tab.active {
                  color: #0ea5e9;
                  border-bottom: 3px solid #0ea5e9;
                }
                @keyframes editor-spin {
                  to { transform: rotate(360deg); }
                }
              </style>
            
              <div id="tab-group" role="tablist">
                <button class="native-tab" data-tab="conf-0" role="tab" aria-selected="false">Main</button>
                <button class="native-tab" data-tab="conf-1" role="tab" aria-selected="false">Col. 1</button>
                <button class="native-tab" data-tab="conf-2" role="tab" aria-selected="false">Col. 2</button>
                <button class="native-tab" data-tab="conf-3" role="tab" aria-selected="false">Col. 3</button>
              </div>
            
              <div id="tab-content" class="content">
                <div style="display: flex; align-items: center; justify-content: center; padding: 40px 20px; color: #888; gap: 12px;">
                  <div style="width: 24px; height: 24px; border: 3px solid #ddd; border-top-color: #0ea5e9; border-radius: 50%; animation: editor-spin 0.8s linear infinite;"></div>
                  <span>Loading editor...</span>
                </div>
              </div>
            `;
            
      console.log('[venus-editor] setConfig: Initializing native tab system');
      
      // Store the last known selected value
      let lastSelected = 'conf-0';
      
      // Function to handle tab change
      const handleTabChange = (newTabName) => {
        const selectedTab = parseInt(newTabName.replace('conf-', ''), 10);
        console.log('[venus-editor] *** TAB CHANGE DETECTED ***: from', lastSelected, 'to', newTabName);
        
        this._currentTab = selectedTab;
        this._currentSubTab = 0;
        this._config.currentTab = selectedTab;
        lastSelected = newTabName;
        
        // Update UI: remove active class from all tabs and add to clicked one
        const allTabs = this.shadowRoot.querySelectorAll('.native-tab');
        allTabs.forEach(tab => {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
        });
        
        const activeTab = this.shadowRoot.querySelector(`.native-tab[data-tab="${newTabName}"]`);
        if (activeTab) {
          activeTab.classList.add('active');
          activeTab.setAttribute('aria-selected', 'true');
        }
        
        this.renderTabContent();
        libEditor.notifyConfigChange(this);
      };
      
      // Attach click handlers to native tab buttons
      const nativeTabs = this.shadowRoot.querySelectorAll('.native-tab');
      console.log(`[venus-editor] Found ${nativeTabs.length} native tab buttons`);
      
      nativeTabs.forEach((tab, idx) => {
        const tabName = tab.getAttribute('data-tab');
        console.log(`[venus-editor] Attaching handler to native-tab[${idx}]: ${tabName}`);
        
        // Add click listener
        tab.addEventListener('click', (e) => {
          console.log('[venus-editor] CLICK on native tab:', tabName);
          handleTabChange(tabName);
          e.preventDefault();
        });
      });
      
      // Initialize with Main tab active
      this._currentTab = this._config.currentTab || 0;
      const initialTab = `conf-${this._currentTab}`;
      
      // Set initial active tab
      const initialActiveTab = this.shadowRoot.querySelector(`.native-tab[data-tab="${initialTab}"]`);
      if (initialActiveTab) {
        initialActiveTab.classList.add('active');
        initialActiveTab.setAttribute('aria-selected', 'true');
      }
      
      const style = document.createElement('style');
      style.textContent = css();
      this.shadowRoot.appendChild(style);
      
      console.log('[venus-editor] Tab initialization:', {
        configCurrentTab: this._config.currentTab,
        currentTabValue: this._currentTab,
        initialTab: initialTab
      });
      
      libEditor.attachLinkClick(this.renderTabContent.bind(this), this);
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
