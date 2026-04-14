/*

 switch auto theme light/dark or manual choice
 
 additional param tab

*/

console.info(
  "%c 🗲 %c - %cVenus OS BD%c - %c 🗲 \n%c version 0.1.17 ",
  "color: white; font-weight: bold; background: black",
  "color: orange; font-weight: bold; background: blue; font-weight: bold;",
  "color: white; font-weight: bold; background: blue; text-decoration: underline; text-decoration-color: orange; text-decoration-thickness: 5px; text-underline-offset: 2px;",
  "color: orange; font-weight: bold; background: blue; font-weight: bold;",
  "color: white; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: grey"
);

import './editor.js?v=0.2.68';
import * as libVenus from './lib-venus.js?v=0.2.68';

import { cssDataDark } from './css-dark.js?v=0.2.68';
import { cssDataLight } from './css-light.js?v=0.2.68';

class venusOsDashboardCard extends HTMLElement {

  static isDark = true;

  static periodicTaskStarted = false;

  static cycle = 0;

  constructor() {
    super();
    this._lastReverseCheck = 0;
    this._appliedTheme = null;
    this._hassUpdatePending = false;

    // Listen for the custom event
    this._configChangedHandler = () => { libVenus.razDashboardOldWidth(); };
    document.addEventListener('config-changed', this._configChangedHandler);

  }

  setConfig(config) {

    this.config = config;

    // Create the static structure after receiving the configuration
    if (!this.content) {
      this._createCardStructure();
    }
  }

  _createCardStructure() {

    // Initialize the content if it's not there yet.
    if (!this.content) {

      const cardElem = document.createElement('ha-card');
      this.appendChild(cardElem);

      const contElem = document.createElement('div');
      contElem.setAttribute('id', 'db-container');
      contElem.setAttribute('class', 'db-container');
      cardElem.appendChild(contElem);

      this.content = this.querySelector("div");


    }

    // retrieve parameters
    const param = this.config.param || [];

    // render the base card structure (normal mode or demo "image")
    libVenus.baseRender(this.config, this.content);

    // retrieve the number of boxes to create per column from parameters
    const boxCol1 = param.boxCol1 ? Math.min(Math.max(param.boxCol1, 1), 4) : 1;
    const boxCol2 = param.boxCol2 ? Math.min(Math.max(param.boxCol2, 1), 2) : 1;
    const boxCol3 = param.boxCol3 ? Math.min(Math.max(param.boxCol3, 1), 4) : 1;

    // add boxes
    if (this.config.demo !== true) libVenus.addBox(boxCol1, boxCol2, boxCol3, this.content);

    // add line anchor points
    if (this.config.demo !== true) libVenus.addAnchors(this.config, this.content);

  }

  set hass(hass) {

    this._hass = hass;

    if (this._hass) {

      // Determine effective theme (only rewrite CSS when it changes)
      const isDarkTheme = this._hass.themes.darkMode;
      const wantDark = (isDarkTheme && this.config.theme === 'auto') || this.config.theme === 'dark';
      const effectiveTheme = wantDark ? 'dark' : 'light';

      if (this._appliedTheme !== effectiveTheme) {
        this._appliedTheme = effectiveTheme;
        let style = this.querySelector('style');
        if (!style) {
          style = document.createElement('style');
          this.querySelector('ha-card').appendChild(style);
        }
        style.textContent = wantDark ? cssDataDark() : cssDataLight();
        venusOsDashboardCard.isDark = wantDark;
      }
    }

    // pause (or stop) if demo mode
    if (this.config.demo === true) return;

    // Batch heavy work: schedule ONE update per animation frame
    if (!this._hassUpdatePending) {
      this._hassUpdatePending = true;
      requestAnimationFrame(() => {
        this._hassUpdatePending = false;
        this._processHassUpdate();
      });
    }
  }

  _processHassUpdate() {
    const hass = this._hass;
    if (!hass) return;

    // retrieve card parameters
    const devices = this.config.devices || [];
    const styles = this.config.styles || "";

    // fill boxes with the given parameters
    libVenus.fillBox(this.config, styles, venusOsDashboardCard.isDark, hass, this.content);

    // check for size change... if so, recreate lines
    libVenus.checkReSize(devices, venusOsDashboardCard.isDark, this.content);

    // check direction reversal (throttled to 500ms)
    const now = Date.now();
    if (now - this._lastReverseCheck >= 500) {
      this._lastReverseCheck = now;
      libVenus.checkForReverse(devices, hass);
    }

    // Initial launch of startPeriodicTask
    if (!this.periodicTaskStarted) {
      const taskStarted = libVenus.startPeriodicTask(this.config, hass);

      if (taskStarted) {
        this.periodicTaskStarted = true;
      } else {
        this.periodicTaskStarted = false;
      }
    }
  }

  // Method to generate the configuration element
  static getConfigElement(hass) {
    const editor = document.createElement('venus-os-editor');
    editor.hass = hass; // Explicitly pass hass instance to the editor
    return editor;
  }

  /*static getStubConfig() {
      return { 
          demo: true,
      };
  }*/

  static getStubConfig(hass) {
    // get available power entities
    return libVenus.getDefaultConfig(hass);
  }

  // Method to get the card size
  getCardSize() {
    return 1;
  }

  // Cleanup function when the card is removed
  disconnectedCallback() {
    libVenus.clearAllIntervals(); // Stop all tasks, animations, clear caches
    if (this._configChangedHandler) {
      document.removeEventListener('config-changed', this._configChangedHandler);
      this._configChangedHandler = null;
    }
    this.periodicTaskStarted = false;
  }

}
customElements.define('venus-os-dashboard-ongas', venusOsDashboardCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'venus-os-dashboard-ongas',
  name: 'Venus OS Dashboard (ongas)',
  preview: true,
  description: 'A Dashboard that looks like Venus OS gui-v2 from Victron.',
});
