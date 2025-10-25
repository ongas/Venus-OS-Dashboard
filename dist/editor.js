
import {css} from './css-editor.js?v=0.1';

import * as libEditor from './lib-editor.js';

class venusOsDashBoardEditor extends HTMLElement {
  constructor() {
    super();
    
  }
    
  async setConfig(config) {
    
    this._config = { ...config, entities: { ...(config.entities || {}) } };
        
    await libEditor.loadTranslations(this);
    
    let tabGroup;
    if (!this.shadowRoot) {
            
      this.attachShadow({ mode: 'open' });
            
      this.shadowRoot.innerHTML = `
              <style>
                sl-tab-group {
                  width: 100%;
                  --sl-tab-border-color: var(--divider-color, #ccc);
                }
                sl-tab-panel {
                  padding: 1em;
                }
              </style>
            
              <sl-tab-group id="tab-group">
                <sl-tab slot="nav" panel="conf-0" data-tab="0" id="main-tab">Main</sl-tab>
                <sl-tab slot="nav" panel="conf-1" data-tab="1" id="col1-tab">Col. 1</sl-tab>
                <sl-tab slot="nav" panel="conf-2" data-tab="2" id="col2-tab">Col. 2</sl-tab>
                <sl-tab slot="nav" panel="conf-3" data-tab="3" id="col3-tab">Col. 3</sl-tab>
            
                <sl-tab-panel id="sl-tab-content-0" name="conf-0">
                  <div id="tab-content" class="content"></div>
                </sl-tab-panel>
                <sl-tab-panel id="sl-tab-content-1" name="conf-1">
                  <div id="tab-content" class="content"></div>
                </sl-tab-panel>
                <sl-tab-panel id="sl-tab-content-2" name="conf-2">
                  <div id="tab-content" class="content"></div>
                </sl-tab-panel>
                <sl-tab-panel id="sl-tab-content-3" name="conf-3">
                  <div id="tab-content" class="content"></div>
                </sl-tab-panel>
              </sl-tab-group>
            `;
            
      tabGroup = this.shadowRoot.querySelector('#tab-group');
            
      tabGroup.addEventListener('sl-tab-show', (event) => {
        const clickedTab = event.detail.tab;
        const dataTab = parseInt(clickedTab.dataset.tab, 10);
        this._currentTab = dataTab;
        this._config.currentTab = dataTab;
        tabGroup.value = `conf-${dataTab}`;
        
        // Manually manage 'selected-tab' class
        this.shadowRoot.querySelectorAll('sl-tab[slot="nav"]').forEach(tab => {
          tab.classList.remove('selected-tab');
        });
        clickedTab.classList.add('selected-tab');
        
        this.renderTabContent();
      });
        
      const style = document.createElement('style');
      style.textContent = css();
      tabGroup.appendChild(style);
        
      this._currentTab = this._config.currentTab || 0;
        
      libEditor.attachLinkClick(this.renderTabContent.bind(this), this);
        
    } else {
      tabGroup = this.shadowRoot.querySelector('#tab-group');
    }
    if (tabGroup) {
      tabGroup.value = `conf-${this._currentTab}`;
      // Manually manage 'selected-tab' class for initial load
      this.shadowRoot.querySelectorAll('sl-tab[slot="nav"]').forEach(tab => {
        tab.classList.remove('selected-tab');
      });
      const initialTab = this.shadowRoot.querySelector(`sl-tab[panel="conf-${this._currentTab}"]`);
      if (initialTab) {
        initialTab.classList.add('selected-tab');
      }
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
