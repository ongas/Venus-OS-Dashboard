/**********************************************/
/* Variable to track which panels   */
/* are expanded                      */
/**********************************************/
let expandedPanelsState = new Set();

/**********************************************/
/* Variable to track event handlers  */
/* on objects to avoid duplicates     */
/**********************************************/
export const eventHandlers = new WeakMap();

/**************************************/
/* Functions for translation          */
/* of the graphical editor            */
/**************************************/
let translations = {}; // Stores loaded translations

export async function loadTranslations(appendTo) {
  let lang = appendTo._hass?.language || "en"; // HA language, or "en" by default
  const supportedLanguages = ["en", "fr"]; // List of supported languages

  if (!supportedLanguages.includes(lang)) {
    lang = "en"; // Default to English if language is not supported
  }

  try {
    const response = await import(`./lang-${lang}.js?v=0.2.20`);
    translations = response.default;
  } catch (error) {
    console.error("Erreur de chargement de la langue :", error);
    const response = await import(`./lang-en.js?v=0.2.20`);
    translations = response.default;
  }
}

export function t(func, key) {
  return translations?.[func]?.[key] || `⚠️ ${func}.${key} ⚠️`; // If missing, show a visual alert
}

/***************************************/
/* Main tab render function :         */
/***************************************/
export function tab1Render(appendTo) {
    
  const tabContent = appendTo.shadowRoot.querySelector('#tab-content');
  tabContent.innerHTML = '';
    
  // Add content to the appendTo element
  const editorDiv = document.createElement('div');
  editorDiv.classList.add('editor');
    
  /*// Mode Demo
    const demoRow = document.createElement('div');
    demoRow.classList.add('row');
    const demoLabel = document.createElement('div');
    demoLabel.classList.add('cell', 'left');
    demoLabel.textContent = t("tab1Render", "demo_mode");//'Mode Demo';
    const demoSwitchContainer = document.createElement('div');
    demoSwitchContainer.classList.add('cell', 'right');
    const demoSwitch = document.createElement('ha-switch');
    demoSwitch.setAttribute('data-path', 'demo');
    if (appendTo._config.demo === true) demoSwitch.setAttribute('checked', '');
    demoSwitchContainer.appendChild(demoSwitch);
    demoRow.appendChild(demoLabel);
    demoRow.appendChild(demoSwitchContainer);
    editorDiv.appendChild(demoRow);*/
    
  // Theme selection
  const themeRow = document.createElement('div');
  themeRow.classList.add('col');
  const themeLabel = document.createElement('div');
  themeLabel.classList.add('left');
  themeLabel.textContent = t("tab1Render", "theme_choice");//'Choix du theme de la carte :';
  const radioGroup = document.createElement('div');
  radioGroup.classList.add('radio-group', 'row');
  const themeOptions = [
    { label: t("tab1Render", "light"), value: 'light' }, // claire
    { label: t("tab1Render", "dark"), value: 'dark' }, // sombre
    { label: t("tab1Render", "auto"), value: 'auto' }, // auto
  ];
    
  // Check if no option is defined in the YAML
  const defaultTheme = appendTo._config.theme || 'auto';
    
  themeOptions.forEach(option => {
    const formfield = document.createElement('ha-formfield');
    formfield.setAttribute('label', option.label);
    formfield.classList.add('cell');
    const radio = document.createElement('ha-radio');
    radio.setAttribute('name', 'themeSelect');
    radio.setAttribute('data-path', 'theme');
    radio.setAttribute('value', option.value);
    if (defaultTheme  === option.value) radio.setAttribute('checked', '');
    formfield.appendChild(radio);
    radioGroup.appendChild(formfield);
  });
    
  themeRow.appendChild(themeLabel);
  themeRow.appendChild(radioGroup);
  editorDiv.appendChild(themeRow);
    
  // Nombre de "Devices" pour chaque colonne
  const devicesRow = document.createElement('div');
  devicesRow.classList.add('col');
  const devicesLabel = document.createElement('div');
  devicesLabel.classList.add('left');
  devicesLabel.textContent = t("tab1Render", "devices_per_column"); //'Nombre de "Devices" pour chaque colonne :';
    
  const devicesInputs = [
    { id: 'boxCol1', label: 'col. 1', value: appendTo._config.param?.boxCol1 ?? 1, min: 1, max: 4, step: 1 },
    { id: 'boxCol2', label: 'col. 2', value: appendTo._config.param?.boxCol2 ?? 1, min: 1, max: 2, step: 1 },
    { id: 'boxCol3', label: 'col. 3', value: appendTo._config.param?.boxCol3 ?? 1, min: 1, max: 4, step: 1 },
  ];
    
  const devicesRowContainer = document.createElement('div');
  devicesRowContainer.classList.add('row');
  devicesInputs.forEach(input => {
    const textfield = document.createElement('ha-textfield');
    textfield.classList.add('cell');
    textfield.setAttribute('id', input.id);
    textfield.setAttribute('data-path', `param.${input.id}`);
    textfield.setAttribute('label', input.label);
    textfield.setAttribute('value', input.value);
    textfield.setAttribute('type', 'number');
    textfield.setAttribute('min', input.min);
    textfield.setAttribute('max', input.max);
    textfield.setAttribute('step', input.step);
    devicesRowContainer.appendChild(textfield);
  });
  devicesRow.appendChild(devicesLabel);
  devicesRow.appendChild(devicesRowContainer);
  editorDiv.appendChild(devicesRow);
    
  // Taille de la font dans les zones des "Devices"
  const fontSizeRow = document.createElement('div');
  fontSizeRow.classList.add('col');
  const fontSizeLabel = document.createElement('div');
  fontSizeLabel.classList.add('row');
  fontSizeLabel.textContent = t("tab1Render", "font_size_zones");// 'Taille de la font dans les zones des "Devices" :';
  fontSizeRow.appendChild(fontSizeLabel);
    
  // Define sections
  const fontSizeSections = [
    { label: t("tab1Render", "in_header"), path: 'header', id: 'header' }, // 'dans le header'
    { label: t("tab1Render", "in_devices"), path: 'sensor', id: 'sensor' }, // 'dans le Devices'
    { label: t("tab1Render", "in_footer"), path: 'footer', id: 'footer' }, // 'dans le footer'
  ];
    
  // Boucle sur chaque section
  fontSizeSections.forEach(section => {
    const sectionRow = document.createElement('div');
    sectionRow.classList.add('row');
    
    const labelCell = document.createElement('div');
    labelCell.classList.add('row', 'cellx1-5');
    const labelText = document.createElement('div');
    labelText.classList.add('cell', 'left');
    labelText.textContent = `- ${section.label}`;
    labelCell.appendChild(labelText);
    sectionRow.appendChild(labelCell);
    
    const inputCell = document.createElement('div');
    inputCell.classList.add('cell', 'right');
    const textfield = document.createElement('ha-textfield');
    textfield.setAttribute('id', section.id);
    textfield.setAttribute('data-path', `styles.${section.path}`);
    textfield.setAttribute('data-group', section.path);
    textfield.setAttribute('label', t("tab1Render", "font_size"));
    textfield.setAttribute('type', 'number');
    textfield.setAttribute('min', 1);
    textfield.setAttribute('step', 1);
    
    // Check if the key exists before setting its value or enabling the field
    if (appendTo._config.styles && appendTo._config.styles[section.path]) {
      if (appendTo._config.styles[section.path] === 'auto') {
        textfield.setAttribute('disabled', '');
      } else {
        textfield.setAttribute('value', appendTo._config.styles[section.path]);
      }
    }
      
    inputCell.appendChild(textfield);
    sectionRow.appendChild(inputCell);
    
    const switchCell = document.createElement('div');
    switchCell.classList.add('row', 'cell');
    const switchContainer = document.createElement('div');
    switchContainer.classList.add('cell', 'right');
    const fontSwitch = document.createElement('ha-switch');
    fontSwitch.setAttribute('data-path', `styles.${section.path}`);
    fontSwitch.setAttribute('data-group', section.path);
    
    // Enable the switch only if the key exists and its value is "auto"
    if (appendTo._config.styles && appendTo._config.styles[section.path] === 'auto') {
      fontSwitch.setAttribute('checked', '');
    }
    
    switchContainer.appendChild(fontSwitch);
    switchCell.appendChild(switchContainer);
    sectionRow.appendChild(switchCell);
    
    fontSizeRow.appendChild(sectionRow);
  });
    
  editorDiv.appendChild(fontSizeRow);
    
  // Add content to the DOM
  tabContent.appendChild(editorDiv);

}

/**********************************************/
/* Column tab content render function : */
/**********************************************/
export function tabColRender(col, appendTo) {
    
  const boxCol = appendTo._config.param[`boxCol${col}`] ?? 1;
    
  const tabContent = appendTo.shadowRoot.querySelector('#tab-content');
  tabContent.innerHTML = '';

  let tabsHTML = ''; // Initialise une variable pour stocker les onglets
  for (let i = 1; i <= boxCol; i++) {
    tabsHTML += `<sl-tab slot="nav" panel="anchor" label="${i}" data-tab="${i - 1}">Box ${i}</sl-tab>`;
  }
            
  tabContent.innerHTML = `
        <div class="devices-editor">
            <sl-tab-group id="subTab-group">
                ${tabsHTML}
            </sl-tab-group>
        
            <sl-tab-panel id="sl-subTab-content" name="anchor">
              <div id="subTab-content" class="subTab-content">
                <!-- Active section content will be displayed here -->
              </div>
            </sl-tab-panel>
        </div>
    `;
            
  const tabBar = tabContent.querySelector('#subLink-container');
  if (tabBar && typeof appendTo._currentSubTab === 'number') {
    tabBar.activeIndex = appendTo._currentSubTab; // Set the active tab
  }
    
  attachSubLinkClick(appendTo);
  renderSubTabContent(col, appendTo);
}

/************************************************/
/* Function that calls the sub-tab        */
/* render function                         */
/* don't ask me why I made two             */
/* functions, I don't remember anymore      */
/************************************************/

export function renderSubTabContent(col, appendTo) {
  const boxId = `${col}-${appendTo._currentSubTab+1}`;
  subtabRender(boxId, appendTo._config, appendTo._hass, appendTo);
  attachInputs(appendTo); // Call the existing attachInputs function
}

/************************************************/
/* Sub-tab content render function :        */
/* all box configuration areas              */
/************************************************/
export function subtabRender(box, config, hass, appendTo) {
    
  const subTabContent = appendTo.shadowRoot.querySelector('#subTab-content');
    
  let leftQty = 0, topQty = 0, bottomQty = 0, rightQty = 0;
    
  // Check if anchors exist in the configuration
  const anchors = config?.devices?.[box]?.anchors ? config?.devices?.[box]?.anchors.split(', ') : [];
    
  let thisAllAnchors = [];

  // Iterate over anchors to extract quantities per side
  anchors.forEach((anchor) => {
    const [side, qtyStr] = anchor.split('-'); // Exemple : "L-2" devient ["L", "2"]
    const qty = parseInt(qtyStr, 10); // Convert quantity to number
    
    if (side === 'L') leftQty += qty;
    else if (side === 'T') topQty += qty;
    else if (side === 'B') bottomQty += qty;
    else if (side === 'R') rightQty += qty;
        
    for (let i = 1; i <= qty; i++) {
      thisAllAnchors.push(`${side}-${i}`);
    }
  });
    
  thisAllAnchors.sort();
    
  const OtherAllAnchors = getAllAnchorsExceptCurrent(config, box);
  //console.log(box + " : " + OtherAllAnchors);
    
  subTabContent.innerHTML = `
        
        <!-- ICON ET NOM -->
        <ha-expansion-panel expanded outlined id="subPanel_header" header="${t("subtabRender", "header_title")}">
            <div class="col inner">
                <div class="row">
                    <ha-icon-picker
                        class="cell"
                        label="${t("subtabRender", "icon_choice")}"
                        id="device_icon"
                        data-path="devices.${box}.icon"
                    >
                    </ha-icon-picker>
                    <ha-textfield 
                        class="cell"
                        label="${t("subtabRender", "name_choice")}"
                        id="device_name"
                        data-path="devices.${box}.name"
                    ></ha-textfield>
                </div>
            </div>
        </ha-expansion-panel>
        
        <!-- ENTITE 1 et 2-->
        <ha-expansion-panel outlined id="subPanel_entities" header="${t("subtabRender", "sensor_title")}">
            <div class="col inner">
                <ha-entity-picker
                    label="${t("subtabRender", "entity_choice")}"
                    id="device_sensor"
                    data-path="devices.${box}.entity"
                >
                </ha-entity-picker>
                <ha-entity-picker
                    label="${t("subtabRender", "entity2_choice")}"
                    id="device_sensor2"
                    data-path="devices.${box}.entity2"
                >
                </ha-entity-picker>
    
                <!-- SWITCHS GRAPH ET GAUGE -->
                <div class="row">
                    <div class="row cell">
                        ${t("subtabRender", "enable_graph")} :
                        <ha-switch class="cell right" 
                            id="graph_switch"
                            data-path="devices.${box}.graph" 
                        ></ha-switch>
                    </div>
                    <div id="gauge_div" class="row cell">
                        ${t("subtabRender", "enable_gauge")} :
                        <ha-switch class="cell right"
                            id="gauge_switch"
                            data-path="devices.${box}.gauge" 
                        ></ha-switch>
                    </div>
                    <div id="gaugeMax_div" class="row cell">
                        ${t("subtabRender", "gauge_max")} :
                        <ha-textfield class="cell right"
                            id="gaugeMax_field"
                            type="number"
                            data-path="devices.${box}.gaugeMax"
                        ></ha-textfield>
                    </div>
                    <div id="sideGauge_div" class="row cell">
                        ${t("subtabRender", "enable_side_gauge")} :
                        <ha-switch class="cell right"
                            id="sideGauge_switch"
                            data-path="devices.${box}.sideGauge"
                        ></ha-switch>
                    </div>
                    <div id="sideGaugeEntity_div" class="row">
                        <ha-entity-picker
                            label="${t("subtabRender", "side_gauge_entity")}"
                            id="sideGaugeEntity_picker"
                            data-path="devices.${box}.sideGaugeEntity"
                        >
                        </ha-entity-picker>
                    </div>
                    <div id="sideGaugeMax_div" class="row cell">
                        ${t("subtabRender", "side_gauge_max")} :
                        <ha-textfield class="cell right"
                            id="sideGaugeMax_field"
                            type="number"
                            data-path="devices.${box}.sideGaugeMax"
                        ></ha-textfield>
                    </div>
                </div>
            </div>
        </ha-expansion-panel>
        
        <!-- HEADER ET FOOTER 1 -->
        <ha-expansion-panel outlined id="subPanel_entities2" header="${t("subtabRender", "header_footer_title")}">
            <div class="col inner">
                <div class="row">
                    <ha-entity-picker
                        label="${t("subtabRender", "entity_header")}"
                        id="header_sensor"
                        data-path="devices.${box}.headerEntity"
                    >
                    </ha-entity-picker>
                    <ha-entity-picker
                        label="${t("subtabRender", "entity_footer")}"
                        id="footer1_sensor"
                        data-path="devices.${box}.footerEntity1"
                    >
                    </ha-entity-picker>
                </div>
                
                <!-- FOOTER 2 ET 3 -->
                <div class="row">
                    <ha-entity-picker
                        label="${t("subtabRender", "entity2_footer")}"
                        id="footer2_sensor"
                        data-path="devices.${box}.footerEntity2"
                    >
                    </ha-entity-picker>
                    <ha-entity-picker
                        label="${t("subtabRender", "entity3_footer")}"
                        id="footer3_sensor"
                        data-path="devices.${box}.footerEntity3"
                    >
                    </ha-entity-picker>
                </div>
            </div>
        </ha-expansion-panel>
        
        <!-- ANCHORS -->
        <ha-expansion-panel outlined id="subPanel_anchors" header="${t("subtabRender", "anchor_title")}">
            <div class="col inner">
                <div class="row">
                    <div class="col cell">
                        <ha-textfield class="anchor cell"
                            id="anchor_left"
                            data-path="devices.${box}.anchors" 
                            label="${t("subtabRender", "left_qtyBox")}"
                            value=""
                            type="number"
                            min="0"
                            max="3"
                            step="1"
                        ></ha-textfield>
                    </div>
                    <div class="col cell">
                        <ha-textfield class="anchor cell"
                            id="anchor_top"
                            data-path="devices.${box}.anchors" 
                            label="${t("subtabRender", "top_qtyBox")}"
                            value=""
                            type="number"
                            min="0"
                            max="3"
                            step="1"
                        ></ha-textfield>
                        <ha-textfield class="anchor cell"
                            id="anchor_bottom"
                            data-path="devices.${box}.anchors" 
                            label="${t("subtabRender", "bottom_qtyBox")}"
                            value=""
                            type="number"
                            min="0"
                            max="3"
                            step="1"
                        ></ha-textfield>
                    </div>
                    <div class="col cell">
                        <ha-textfield class="anchor cell"
                            id="anchor_right"
                            data-path="devices.${box}.anchors" 
                            label="${t("subtabRender", "right_qtyBox")}"
                            value=""
                            type="number"
                            min="0"
                            max="3"
                            step="1"
                        ></ha-textfield>
                    </div>
                </div>
            </div>
        </ha-expansion-panel>
        
        <!-- LINKS -->
        <div class="contMenu">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div class="headerMenu">${t("subtabRender", "add_links")}</div>
                <ha-icon-button id="add-link-button" aria-label="${t("subtabRender", "add_link")}">
                    <ha-icon icon="mdi:plus" style="display: flex;"></ha-icon>
                </ha-icon-button>
            </div>
            <div id="link-container" class="col noGap"></div>
        </div>
    `;
    
  // Reapply the "expanded" attribute to panels that had it before
  expandedPanelsState.forEach(id => {
    const panel = subTabContent.querySelector(`ha-expansion-panel#${id}`);
    if (panel) {
      panel.setAttribute("expanded", "");
    }
  });
            
  const iconPicker = subTabContent.querySelector('#device_icon');
  const nameField = subTabContent.querySelector('#device_name');
  const entityPicker = subTabContent.querySelector('#device_sensor');
  const entity2Picker = subTabContent.querySelector('#device_sensor2');
  const graphSwitch = subTabContent.querySelector('#graph_switch');
  const gaugeSwitch = subTabContent.querySelector('#gauge_switch');
  const headerEntity = subTabContent.querySelector('#header_sensor');
  const footerEntity1 = subTabContent.querySelector('#footer1_sensor');
  const footerEntity2 = subTabContent.querySelector('#footer2_sensor');
  const footerEntity3 = subTabContent.querySelector('#footer3_sensor');
  const anchorLeft = subTabContent.querySelector('#anchor_left');
  const anchorTop = subTabContent.querySelector('#anchor_top');
  const anchorbottom = subTabContent.querySelector('#anchor_bottom');
  const anchorRight = subTabContent.querySelector('#anchor_right');
	
  // Retrieve values for each side
  anchorLeft.value = leftQty;
  anchorTop.value = topQty;
  anchorbottom.value = bottomQty;
  anchorRight.value = rightQty;
    
  // After inserting content, configure values for ha-icon-picker and ha-entity-picker
  nameField.value = config?.devices?.[box]?.name ?? "";
  iconPicker.value = config?.devices?.[box]?.icon ?? ""; 
  entityPicker.value = config?.devices?.[box]?.entity ?? "";
  entity2Picker.value = config?.devices?.[box]?.entity2 ?? "";
  headerEntity.value = config?.devices?.[box]?.headerEntity ?? "";
  footerEntity1.value = config?.devices?.[box]?.footerEntity1 ?? "";
  footerEntity2.value = config?.devices?.[box]?.footerEntity2 ?? "";
  footerEntity3.value = config?.devices?.[box]?.footerEntity3 ?? "";
    
  iconPicker.hass = hass; // Pass the object directly here
  entityPicker.hass = hass; // Pass the object directly here
  entity2Picker.hass = hass; // Pass the object directly here
  headerEntity.hass = hass; // Pass the object directly here  
  footerEntity1.hass = hass; // Pass the object directly here
  footerEntity2.hass = hass; // Pass the object directly here
  footerEntity3.hass = hass; // Pass the object directly here
           
  if (config?.devices?.[box]?.graph === true) graphSwitch.setAttribute('checked', '');
    
  const entity = hass.states?.[entityPicker.value];
  const unit = entity?.attributes?.unit_of_measurement;

  if (config.devices?.[box]?.gauge === true) gaugeSwitch.setAttribute('checked', '');
  const gaugeMaxField = subTabContent.querySelector("#gaugeMax_field");
  gaugeMaxField.value = config?.devices?.[box]?.gaugeMax ?? "";
  const sideGaugeSwitch = subTabContent.querySelector("#sideGauge_switch");
  if (config.devices?.[box]?.sideGauge === true) sideGaugeSwitch.setAttribute('checked', '');
  const sideGaugeEntityPicker = subTabContent.querySelector("#sideGaugeEntity_picker");
  sideGaugeEntityPicker.value = config?.devices?.[box]?.sideGaugeEntity ?? "";
  sideGaugeEntityPicker.hass = hass;
  const sideGaugeMaxField = subTabContent.querySelector("#sideGaugeMax_field");
  sideGaugeMaxField.value = config?.devices?.[box]?.sideGaugeMax ?? "";
    
    
  const linkContainer = subTabContent.querySelector('#link-container');
  const addLinkButton = subTabContent.querySelector('#add-link-button');
    
  Object.entries(config.devices?.[box]?.link || {}).forEach(([linkKey]) => {
        
    addLink(linkKey, box, hass, thisAllAnchors, OtherAllAnchors, appendTo);

  });
    
  addLinkButton.addEventListener('click', () => {
    addLink(linkContainer.children.length+1, box, hass, thisAllAnchors, OtherAllAnchors, appendTo);
  });
    
  function trackExpansionState() {
    subTabContent.querySelectorAll("ha-expansion-panel").forEach(panel => {
      panel.addEventListener("expanded-changed", (event) => {
        if (event.detail.expanded) {
          expandedPanelsState.add(panel.id); // Ajoute l'ID du panel s'il est expandu
        } else {
          expandedPanelsState.delete(panel.id); // Remove if collapsed
        }
      });
    });
  }
    
  // Call this function on initial load to capture events
  trackExpansionState();
}

export function getAllAnchorsExceptCurrent(config, currentBox) {
  let allAnchors = [];

  Object.entries(config.devices || {}).forEach(([boxKey, device]) => {
    if (boxKey === currentBox || !device.anchors) return; // Skip the current device

    const anchors = device.anchors.split(', ');

    anchors.forEach((anchor) => {
      const [side, qtyStr] = anchor.split('-'); // Exemple : "L-2" → ["L", "2"]
      const qty = parseInt(qtyStr, 10);

      for (let i = 1; i <= qty; i++) {
        allAnchors.push(`${boxKey}_${side}-${i}`); // Associate the anchor with the device
      }
    });
  });

  allAnchors.sort();
  return allAnchors;
}

export function addLink(index, box, hass, thisAllAnchors, OtherAllAnchors, appendTo) {
    
  const subTabContent = appendTo.shadowRoot.querySelector('#subTab-content');
  const linkContainer = subTabContent.querySelector('#link-container');
    
  const panel = document.createElement('ha-expansion-panel');
  panel.setAttribute('outlined', '');
  panel.setAttribute('expanded', '');
  panel.setAttribute('style', 'margin: 0px 0px 8px 0px');
        
  panel.innerHTML = `
        <div slot="header" style="display: flex; justify-content: space-between; align-items: center;">
            <span>Link ${index}</span>
            <ha-icon-button id="add-link-button" aria-label="Add a link">
                <ha-icon icon="mdi:trash-can" style="display: flex;"></ha-icon>
            </ha-icon-button>
        </div>
        <div id="link-container" class="inner">
            <div class="col">
                <div class="row">
                    <ha-combo-box class="cell" 
                        label="${t("addLink", "start")}" 
                        id="start_link_${index}"
                        data-path="devices.${box}.link.${index}.start" 
                    ></ha-combo-box>
                    
                    <ha-combo-box class="cell" 
                        label="${t("addLink", "end")}" 
                        id="end_link_${index}"
                        data-path="devices.${box}.link.${index}.end" 
                    ></ha-combo-box>
                </div>
                
                <div class="row">
                    <ha-entity-picker class="cell"
                        label="${t("addLink", "entity_picker")}"
                        id="entity_link_${index}"
                        data-path="devices.${box}.link.${index}.entity" 
                    >
                    </ha-entity-picker>
                    
                    <div class="row cell">
                        ${t("addLink", "reverse")} :
                        <ha-switch class="cell right" 
                            id="inv_link_${index}"
                            data-path="devices.${box}.link.${index}.inv" 
                        ></ha-switch>
                    </div>
                </div>
            </div>
        </div>
    `;
    
  const startLink = panel.querySelector(`#start_link_${index}`);
  startLink.items = thisAllAnchors.map(anchor => ({ label: anchor, value: anchor })); // Convertit en objets
  startLink.value = appendTo._config.devices?.[box]?.link?.[index]?.start ?? "";
    
  const endLink = panel.querySelector(`#end_link_${index}`);
  endLink.items = OtherAllAnchors.map(anchor => ({ label: anchor, value: anchor }));
  endLink.value = appendTo._config.devices?.[box]?.link?.[index]?.end ?? "";
    
  const entityLink = panel.querySelector(`#entity_link_${index}`);
  entityLink.hass = hass;
  entityLink.value = appendTo._config.devices[box]?.link?.[index]?.entity ?? "";
    
  const invLink = panel.querySelector(`#inv_link_${index}`);
  if (appendTo._config.devices[box]?.link?.[index]?.inv === true) invLink.setAttribute('checked', '');
    
  const path = `devices.${box}.link.${index}`;
        
  const deleteButton = panel.querySelector('ha-icon-button');
  deleteButton.addEventListener('click', () => {
    appendTo._config = updateConfigRecursively(appendTo._config, path, null, true);
    notifyConfigChange(appendTo);
        
    panel.remove();
  });
    
  // Add the panel to the container
  linkContainer.appendChild(panel);
    
  attachLinkInputs(appendTo)
        
}

export function attachLinkInputs(appendTo) {
        
  // Listener for ha-textfield except anchor fields
  appendTo.shadowRoot.querySelectorAll('ha-combo-box').forEach((comboBox) => {
        
    if (eventHandlers.has(comboBox)) {
      //console.log("Event already attached to this ha-combo-box element:", comboBox);
      return; // Do nothing if event is already attached
    }
        
    // Create a new event handler
    const handleChange = (e) => {
      const key = comboBox.dataset.path;
      let value = e.detail.value;
            
      if (!value) {
        value = null; // Trigger key deletion in YAML
      }
            
      // Update config if a key is defined
      if (key) {
        appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
        notifyConfigChange(appendTo);
      }
            
      // Emit a custom event to signal that the configuration has changed
      const event = new CustomEvent('config-changed', {
        detail: { redrawRequired: true }
      });
      document.dispatchEvent(event);

    };
        
    // Add the event listener
    comboBox.addEventListener("value-changed", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(comboBox, handleChange);
        
  });
    
  // Listener for ha-textfield except anchor fields
  appendTo.shadowRoot.querySelectorAll('ha-textfield').forEach((textField) => {
        
    if (eventHandlers.has(textField)) {
      //console.log("Event already attached to this ha-textfield element:", textField);
      return; // Do nothing if event is already attached
    }
        
    // Create a new event handler
    const handleChange = (e) => {
      const key = textField.dataset.path;
      let value = e.target.value;
    
      // Handle values based on field type
      if (e.target.type === 'number') {
        // If it's a numeric field
        if (!value || isNaN(parseInt(value, 10))) {
          value = null; // Trigger key deletion in YAML
        } else {
          value = parseInt(value, 10); // Convert to integer if valid
        }
      } else {
        // If text field, keep value as-is
        value = value.trim(); // Trim whitespace
        if (value === "") {
          value = null; // If empty, delete from YAML
        }
      }
        
      // Update config if a key is defined
      if (key) {
        appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
        notifyConfigChange(appendTo);
      }
            
      // Emit a custom event to signal that the configuration has changed
      const event = new CustomEvent('config-changed', {
        detail: { redrawRequired: true }
      });
      document.dispatchEvent(event);
    };
        
    // Add the event listener
    textField.addEventListener("change", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(textField, handleChange);
        
  });
    
  // Listener for ha-switch
  appendTo.shadowRoot.querySelectorAll('ha-switch').forEach((toggle) => {
        
    if (eventHandlers.has(toggle)) {
      //console.log("Event already attached to this ha-switch element:", toggle);
      return; // Do nothing if event is already attached
    }
        
    // Create a new event handler
    const handleChange = (e) => {
      const key = toggle.dataset.path;
      const value = e.target.checked ? true : null; // `true` if enabled, `null` for deletion
            
      if (key) {
        appendTo._config = updateConfigRecursively(appendTo._config, key, value, true); // Delete if disabled
        notifyConfigChange(appendTo);
      }
            
      // Emit a custom event to signal that the configuration has changed
      const event = new CustomEvent('config-changed', {
        detail: { redrawRequired: true }
      });
      document.dispatchEvent(event);
    };
        
    // Add the event listener
    toggle.addEventListener("change", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(toggle, handleChange);
        
  });
}

/************************************************/
/* function to create events attached to           */
/* differents inputs de l'interface puis tri et */
/* different inputs then sort and           */
/* send for YAML update                     */
export function attachInputs(appendTo) {
        
  // Listener for ha-textfield except anchor fields
  appendTo.shadowRoot.querySelectorAll('ha-textfield:not(.anchor)').forEach((textField) => {
        
    if (eventHandlers.has(textField)) {
      //console.log("Event already attached to this ha-textfield element:", textField);
      return; // Do nothing if event is already attached
    }
        
    // Create a new event handler
    const handleChange = (e) => {
      const key = textField.dataset.path;
      let value = e.target.value;
    
      // Handle values based on field type
      if (e.target.type === 'number') {
        // If it's a numeric field
        if (!value || isNaN(parseInt(value, 10))) {
          value = null; // Trigger key deletion in YAML
        } else {
          value = parseInt(value, 10); // Convert to integer if valid
        }
      } else {
        // If text field, keep value as-is
        value = value.trim(); // Trim whitespace
        if (value === "") {
          value = null; // If empty, delete from YAML
        }
      }
        
      // Update config if a key is defined
      if (key) {
        appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
        notifyConfigChange(appendTo);
      }
    };
        
    // Add the event listener
    textField.addEventListener("change", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(textField, handleChange);
        
  });

  // Listener for anchor fields
  appendTo.shadowRoot.querySelectorAll('ha-textfield.anchor').forEach((textField) => {
        
    if (eventHandlers.has(textField)) {
      return; // Do nothing if event is already attached
    }
        
    // Create a new event handler
    const handleChange = () => {
      const key = textField.dataset.path;
    
      // Retrieve values from the "left", "top", "bottom", "right" fields
      const anchorLeft = appendTo.shadowRoot.querySelector('#anchor_left').value;
      const anchorTop = appendTo.shadowRoot.querySelector('#anchor_top').value;
      const anchorBottom = appendTo.shadowRoot.querySelector('#anchor_bottom').value;
      const anchorRight = appendTo.shadowRoot.querySelector('#anchor_right').value;
            
      // Create an array to store anchors
      let anchors = [];
            
      // Add anchors if valid (non-null and non-zero)
      if (anchorLeft && anchorLeft !== "0") {
        anchors.push(`L-${anchorLeft}`);
      }
      if (anchorTop && anchorTop !== "0") {
        anchors.push(`T-${anchorTop}`);
      }
      if (anchorBottom && anchorBottom !== "0") {
        anchors.push(`B-${anchorBottom}`);
      }
      if (anchorRight && anchorRight !== "0") {
        anchors.push(`R-${anchorRight}`);
      }
        
      // Check if any anchors were added
      if (anchors.length > 0) {

        const strAnchors = anchors.join(', ');
        
        // Save the update to YAML (or config structure)
        appendTo._config = updateConfigRecursively(appendTo._config, key, strAnchors, true);
        notifyConfigChange(appendTo);
      } else {
        appendTo._config = updateConfigRecursively(appendTo._config, key, null, true);
        notifyConfigChange(appendTo);
      }
    };
        
    // Add the event listener
    textField.addEventListener("change", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(textField, handleChange);
        
  });
 
  // Listener for ha-switch
  appendTo.shadowRoot.querySelectorAll('ha-switch').forEach((toggle) => {
        
    if (eventHandlers.has(toggle)) {
      //console.log("Event already attached to this ha-switch element:", toggle);
      return; // Do nothing if event is already attached
    }
        
    // Create a new event handler
    const handleChange = (e) => {
      const key = toggle.dataset.path;
      const value = e.target.checked ? true : null; // `true` if enabled, `null` for deletion
      const group = toggle.dataset.group;
      const isChecked = e.target.checked;
            
      if (group) {
        // Find the text field associated with the switch
        const textField = appendTo.shadowRoot.querySelector(`ha-textfield[data-group="${group}"]`);
        const key2 = textField.dataset.path;
        
        if (isChecked) {
          appendTo._config = updateConfigRecursively(appendTo._config, key2, "auto"); // Set to "auto"
        } else {

          const value = textField.value && !isNaN(parseInt(textField.value, 10)) 
            ? parseInt(textField.value, 10) 
            : null;
                    
          appendTo._config = updateConfigRecursively(appendTo._config, key2, value, true);

        }
        notifyConfigChange(appendTo);
                
      } else {
        if (key) {
          appendTo._config = updateConfigRecursively(appendTo._config, key, value, true); // Delete if disabled
          notifyConfigChange(appendTo);
        }
      }
    };
        
    // Add the event listener
    toggle.addEventListener("change", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(toggle, handleChange);
        
  });
    
  // Listener for ha-radio
  appendTo.shadowRoot.querySelectorAll('ha-radio').forEach((radio) => {
        
    if (eventHandlers.has(radio)) {
      //console.log("Event already attached to this ha-radio element:", radio);
      return; // Do nothing if event is already attached
    }
        
    // Create a new event handler
    const handleChange = (e) => {
      const key = radio.dataset.path; // Ensure the `name` matches the key in the config
      const value = e.target.value; // 'light', 'dark', 'auto'
    
      if (key) {
        appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
        notifyConfigChange(appendTo);
      }
    };
        
    // Add the event listener
    radio.addEventListener("change", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(radio, handleChange);
        
  });
          
  // Listener for ha-icon-picker
  appendTo.shadowRoot.querySelectorAll('ha-icon-picker').forEach((iconPicker) => {
        
    if (eventHandlers.has(iconPicker)) {
      //console.log("Event already attached to this ha-icon-picker element:", iconPicker);
      return; // Do nothing if event is already attached
    }
        
    // Create a new event handler
    const handleChange = (e) => {
      const key = iconPicker.dataset.path; // Ensure the `name` matches the key in the config
      let value = e.detail.value;
            
      // If the value is an empty string, treat as icon removal
      if (value === "") {
        value = null; // Mark for deletion in YAML
      }
            
      if (key) {
        appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
        notifyConfigChange(appendTo);
      }
    }
            
    // Add the event listener
    iconPicker.addEventListener("value-changed", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(iconPicker, handleChange);
        
  });
    
  // Listener for ha-entity-picker
  appendTo.shadowRoot.querySelectorAll('ha-entity-picker').forEach((entityPicker) => {
        
    if (eventHandlers.has(entityPicker)) {
      //console.log("Event already attached to this ha-entity-picker element:", entityPicker);
      return; // Do nothing if event is already attached
    }
            
    // Create a new event handler
    const handleChange = (e) => {
      const key = entityPicker.dataset.path; // Ensure the `name` matches the key in the config
      let value = e.detail.value;
            
      // If the value is an empty string, treat as icon removal
      if (!value || value.trim() === "") {
        value = null; // Mark for deletion in YAML
      }
            
      if (key) {
        appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
        notifyConfigChange(appendTo);
      }
    }
        
    // Add the event listener
    entityPicker.addEventListener("value-changed", handleChange);
        
    // Register the handler in the WeakMap
    eventHandlers.set(entityPicker, handleChange);
        
  });
    
}

/**********************************************/
/* Function to modify the YAML config       */
/* en local (en fait l'array local)           */
/* renvoi la nouvelle confif pour mod du yaml */
/* via the notifyConfigChange function      */
/**********************************************/
export function updateConfigRecursively(obj, path, value, removeIfNull = false) {
  const cloneObject = (o) => {
    return Array.isArray(o)
      ? o.map(cloneObject)
      : o && typeof o === "object"
        ? { ...o }
        : o;
  };

  const keys = path.split('.');
  let clonedObj = cloneObject(obj);
  let current = clonedObj;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];

    if (i === keys.length - 1) {
      if (value === null && removeIfNull) {
        delete current[key]; // Delete the key if `null` and `removeIfNull` is true
      } else {
        current[key] = value; // Set the new value
      }
      break;
    }

    if (!current[key]) {
      current[key] = {};
    }

    current[key] = cloneObject(current[key]);
    current = current[key];
  }

  // Remove empty keys (recursively remove empty objects)
  const removeEmptyKeys = (obj) => {
    for (const key in obj) {
      if (obj[key] && typeof obj[key] === 'object') {
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        } else {
          removeEmptyKeys(obj[key]);
        }
      }
    }
  };

  removeEmptyKeys(clonedObj);
  return clonedObj;
}

/***********************************/
/* function to update the yaml */
/***********************************/
export function notifyConfigChange(appendTo) {
  const event = new Event('config-changed', {
    bubbles: true,
    composed: true,
  });
    
  //console.log(appendTo._config);
    
  event.detail = { config: appendTo._config };
  appendTo.dispatchEvent(event);
}

/********************************/
/* Click handling function */
/* dans les onglets principaux  */
/********************************/
export function attachLinkClick(renderTabContent, appendTo) {
  appendTo.shadowRoot.querySelectorAll('#tab-group sl-tab').forEach((link) => {
    if (eventHandlers.has(link)) {
      console.log("Event already attached to this #link-container mwc-tab element:", link);
      return;
    }

    const handleClick = (e) => {
      const tab = parseInt(e.currentTarget.getAttribute('data-tab'), 10);
      appendTo._currentTab = tab;
      appendTo._currentSubTab = 0;
      renderTabContent(appendTo); // Call the function passed as parameter
    };

    link.addEventListener("click", handleClick);
    eventHandlers.set(link, handleClick);
  });
}

/********************************/
/* Click handling function */
/* dans les onglets secondaires */
/********************************/
export function attachSubLinkClick(appendTo) {
  appendTo.shadowRoot.querySelectorAll('#subTab-group sl-tab').forEach((sublink) => {
    if (eventHandlers.has(sublink)) {
      console.log("Event already attached to this #sublink-container mwc-tab element:", sublink);
      return;
    }

    const handleClick = (e) => {
      // Manually manage 'selected-tab' class for sub-tabs
      appendTo.shadowRoot.querySelectorAll('#subTab-group sl-tab').forEach(tab => {
        tab.classList.remove('selected-tab');
      });
      e.currentTarget.classList.add('selected-tab');
    
      const tab = parseInt(e.currentTarget.getAttribute('data-tab'), 10);
      appendTo._currentSubTab = tab;
      renderSubTabContent(appendTo._currentTab, appendTo);
    };
    sublink.addEventListener("click", handleClick);
    eventHandlers.set(sublink, handleClick);
  });
}
    
