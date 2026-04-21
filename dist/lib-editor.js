/**********************************************/
/* Variable to track event handlers  */
/* on objects to avoid duplicates     */
/**********************************************/
export const eventHandlers = new WeakMap();

/**********************************************/
/* Debounce timer for config changes */
/* to prevent excessive notifications */
/**********************************************/
const debounceTimers = new WeakMap();

function createDebouncedNotifyConfigChange(appendTo) {
  return function notifyWithDebounce() {
    // Clear existing timer
    if (debounceTimers.has(appendTo)) {
      clearTimeout(debounceTimers.get(appendTo));
    }
    
    // Set new timer - notify after 300ms of inactivity
    const timer = setTimeout(() => {
      notifyConfigChange(appendTo);
    }, 300);
    
    debounceTimers.set(appendTo, timer);
  };
}

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
    const response = await import(`./lang-${lang}.js?v=0.6.38`);
    translations = response.default;
  } catch (error) {
    console.error("Erreur de chargement de la langue :", error);
    const response = await import(`./lang-en.js?v=0.6.38`);
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
  
  // Ensure sub-tab is within valid range for this column
  if (appendTo._currentSubTab >= boxCol) {
    appendTo._currentSubTab = 0;
  }
    
  const tabContent = appendTo.shadowRoot.querySelector('#tab-content');
  tabContent.innerHTML = '';

  let tabsHTML = '';
  
  for (let i = 1; i <= boxCol; i++) {
    const isActive = i === 1 ? 'active' : '';
    tabsHTML += `<button class="native-box-tab ${isActive}" data-box="box-${i - 1}" role="tab" aria-selected="${i === 1 ? 'true' : 'false'}">Box ${i}</button>`;
  }
            
  tabContent.innerHTML = `
        <div class="devices-editor">
            <div id="subTab-group" role="tablist" class="sub-tab-group">
                ${tabsHTML}
            </div>
        
            <div id="subTab-content" class="subTab-content">
              <!-- Active section content will be displayed here -->
            </div>
        </div>
    `;
            
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
  try {
    const boxId = `${col}-${appendTo._currentSubTab+1}`;
    console.log('[venus-editor] renderSubTabContent:', { boxId, hasHass: !!appendTo._hass });
    subtabRender(boxId, appendTo._config, appendTo._hass, appendTo);
    const pickerCount = appendTo.shadowRoot.querySelectorAll('ha-entity-picker').length;
    console.log('[venus-editor] After subtabRender, found entity pickers:', pickerCount);
    attachInputs(appendTo); // Call the existing attachInputs function
    console.log('[venus-editor] attachInputs completed');
  } catch (error) {
    console.error("[venus-editor] Error in renderSubTabContent:", error);
    const subTabContent = appendTo.shadowRoot.querySelector('#subTab-content');
    if (subTabContent) {
      subTabContent.innerHTML = `<p style="color: red; padding: 20px;">Error loading editor: ${error.message}</p>`;
    }
  }
}

/************************************************/
/* Sub-tab content render function :        */
/* all box configuration areas              */
/************************************************/
/**
 * Helper: Generate schema based on icon mode
 * Returns schema with only the relevant icon field (static OR dynamic, not both)
 */
function getBoxDeviceSchema(iconMode = 'static') {
  return [
    {
      type: 'grid',
      column_min_width: '200px',
      schema: [
        {
          name: 'iconMode',
          label: 'Icon Mode',
          selector: {
            select: {
              options: [
                { value: 'static', label: 'Static Icon' },
                { value: 'dynamic', label: 'Dynamic Icon (Entity)' }
              ]
            }
          }
        },
        {
          name: 'name',
          label: 'Name',
          selector: { text: {} }
        }
      ]
    },
    {
      type: 'grid',
      column_min_width: '200px',
      schema: iconMode === 'static' ? [
        {
          name: 'icon',
          label: 'Select Icon',
          selector: { icon: {} }
        }
      ] : [
        {
          name: 'iconEntity',
          label: 'Icon Entity',
          description: 'Template entity that outputs icon names (e.g., "mdi:battery-75")',
          selector: { 
            entity: {
              filter: {
                domain: ['template', 'input_text']
              }
            }
          }
        }
      ]
    },
    {
      type: 'expandable',
      title: 'Main Entity',
      schema: [
        {
          name: 'entity',
          label: 'Main Entity',
          selector: { entity: {} }
        },
        {
          name: 'entity2',
          label: 'Secondary Entity',
          selector: { entity: {} }
        },
        {
          type: 'grid',
          column_min_width: '200px',
          schema: [
            {
              name: 'sideGaugeEntity',
              label: 'Side Gauge Entity',
              selector: { entity: {} }
            },
            {
              name: 'sideGaugeMax',
              label: 'Side Gauge Max',
              selector: { entity: {} }
            }
          ]
        },
        {
          name: 'sideGaugeMin',
          label: 'Side Gauge Min (optional)',
          selector: { entity: {} }
        },
        {
          type: 'grid',
          column_min_width: '200px',
          schema: [
            {
              name: 'graph',
              label: 'Enable Graph',
              selector: { boolean: {} }
            },
            {
              name: 'gauge',
              label: 'Enable Gauge',
              selector: { boolean: {} }
            }
          ]
        },
        {
          name: 'gaugeMax',
          label: 'Gauge Max Value',
          selector: { number: { mode: 'box', min: 0, step: 1 } }
        },
        {
          name: 'sideGauge',
          label: 'Enable Side Gauge',
          selector: { boolean: {} }
        }
      ]
    },
    {
      type: 'expandable',
      title: 'Header & Footer',
      schema: [
        {
          type: 'grid',
          column_min_width: '200px',
          schema: [
            {
              name: 'headerEntity',
              label: 'Header Entity',
              selector: { entity: {} }
            },
            {
              name: 'footerEntity1',
              label: 'Footer 1 Entity',
              selector: { entity: {} }
            }
          ]
        },
        {
          type: 'grid',
          column_min_width: '200px',
          schema: [
            {
              name: 'footerEntity2',
              label: 'Footer 2 Entity',
              selector: { entity: {} }
            },
            {
              name: 'footerEntity3',
              label: 'Footer 3 Entity',
              selector: { entity: {} }
            }
          ]
        }
      ]
    }
  ];
}

export function subtabRender(box, config, hass, appendTo) {
    
  const subTabContent = appendTo.shadowRoot.querySelector('#subTab-content');
  subTabContent.innerHTML = '';
  
  // Detect icon mode based on what's populated in the config
  // If iconEntity exists, it's dynamic; otherwise default to static
  let initialIconMode = config?.devices?.[box]?.iconMode || 'static';
  
  // Smart detection: if no explicit iconMode but iconEntity is filled, assume dynamic
  if (!config?.devices?.[box]?.iconMode && config?.devices?.[box]?.iconEntity) {
    initialIconMode = 'dynamic';
  }
  
  console.log('[venus-editor] Box:', box);
  console.log('[venus-editor] Config devices:', config?.devices);
  console.log('[venus-editor] This box config:', config?.devices?.[box]);
  console.log('[venus-editor] Initial icon mode:', initialIconMode);
  
  // Define schema for ha-form - this is the CORRECT approach
  const schema = getBoxDeviceSchema(initialIconMode);
  
  // Create ha-form element
  const form = document.createElement('ha-form');
  form.schema = schema;
  form.hass = hass;
  
  // Prepare initial data with iconMode
  const initialData = config?.devices?.[box] ? { ...config.devices[box] } : {};
  if (!initialData.iconMode) {
    initialData.iconMode = initialIconMode;  // Use the detected mode
  }
  
  console.log('[venus-editor] Initial data being set:', initialData);
  
  form.data = initialData;
  
  form.computeLabel = (schema) => {
    return schema.name ? schema.name.charAt(0).toUpperCase() + schema.name.slice(1) : '';
  };
  
  // Create debounced notify function for this form
  const debouncedNotify = createDebouncedNotifyConfigChange(appendTo);
  
  // Listen for value changes and regenerate schema if iconMode changes
  form.addEventListener('value-changed', (e) => {
    const newDeviceConfig = e.detail.value;
    console.log('[venus-editor] Form value-changed:', newDeviceConfig);
    
    // Update the config immediately for all changes
    if (!config.devices) config.devices = {};
    config.devices[box] = newDeviceConfig;
    appendTo._config = config;
    
    // If iconMode changed, regenerate schema with only the relevant field
    const currentIconMode = newDeviceConfig.iconMode || 'static';
    if (currentIconMode !== (form._lastIconMode || 'static')) {
      form._lastIconMode = currentIconMode;
      form.schema = getBoxDeviceSchema(currentIconMode);
      // Preserve the data when schema changes
      form.data = newDeviceConfig;
      // Notify immediately on schema change
      notifyConfigChange(appendTo);
    } else {
      // Notify with debounce for normal edits
      debouncedNotify();
    }
  });
  
  form._lastIconMode = initialIconMode;
  subTabContent.appendChild(form);
  
  console.log('[venus-editor] Created ha-form for box:', box, {
    hasForm: !!form,
    hasHass: !!hass,
    hasData: !!form.data,
    statesCount: Object.keys(hass?.states || {}).length
  });
    
  // Check if anchors exist in the configuration
  const anchors = config?.devices?.[box]?.anchors ? config?.devices?.[box]?.anchors.split(', ') : [];
    
  let thisAllAnchors = [];

  // Iterate over anchors to extract and build anchor list
  anchors.forEach((anchor) => {
    const [side, qtyStr] = anchor.split('-'); // Exemple : "L-2" devient ["L", "2"]
    const qty = parseInt(qtyStr, 10); // Convert quantity to number
    
    for (let i = 1; i <= qty; i++) {
      thisAllAnchors.push(`${side}-${i}`);
    }
  });
    
  thisAllAnchors.sort();
    
  const OtherAllAnchors = getAllAnchorsExceptCurrent(config, box);
  
  // Create links section
  const linksSection = document.createElement('div');
  linksSection.className = 'contMenu';
  linksSection.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div class="headerMenu">${t("subtabRender", "add_links")}</div>
      <ha-icon-button id="add-link-button" aria-label="${t("subtabRender", "add_link")}">
        <ha-icon icon="mdi:plus" style="display: flex;"></ha-icon>
      </ha-icon-button>
    </div>
    <div id="link-container" class="col noGap"></div>
  `;
  
  subTabContent.appendChild(linksSection);
  
  // Initialize links
  const linkContainer = subTabContent.querySelector('#link-container');
  const addLinkButton = subTabContent.querySelector('#add-link-button');
  
  Object.entries(config.devices?.[box]?.link || {}).forEach(([linkKey]) => {
    addLink(linkKey, box, hass, thisAllAnchors, OtherAllAnchors, appendTo);
  });
  
  addLinkButton.addEventListener('click', () => {
    addLink(linkContainer.children.length+1, box, hass, thisAllAnchors, OtherAllAnchors, appendTo);
  });
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
  
  // Create header with delete button
  const headerDiv = document.createElement('div');
  headerDiv.setAttribute('slot', 'header');
  headerDiv.style.display = 'flex';
  headerDiv.style.justifyContent = 'space-between';
  headerDiv.style.alignItems = 'center';
  
  const headerSpan = document.createElement('span');
  headerSpan.textContent = `Link ${index}`;
  headerDiv.appendChild(headerSpan);
  
  const deleteButton = document.createElement('ha-icon-button');
  deleteButton.id = 'add-link-button';
  deleteButton.setAttribute('aria-label', t("addLink", "delete_link") || 'Delete link');
  const deleteIcon = document.createElement('ha-icon');
  deleteIcon.setAttribute('icon', 'mdi:trash-can');
  deleteIcon.style.display = 'flex';
  deleteButton.appendChild(deleteIcon);
  headerDiv.appendChild(deleteButton);
  
  panel.appendChild(headerDiv);
  
  // Create content container
  const contentDiv = document.createElement('div');
  contentDiv.id = 'link-container';
  contentDiv.className = 'inner';
  
  const colDiv = document.createElement('div');
  colDiv.className = 'col';
  
  // Create first row with combo boxes
  const row1 = document.createElement('div');
  row1.className = 'row';
  
  const startCombo = document.createElement('ha-combo-box');
  startCombo.className = 'cell';
  startCombo.setAttribute('label', t("addLink", "start"));
  startCombo.id = `start_link_${index}`;
  startCombo.setAttribute('data-path', `devices.${box}.link.${index}.start`);
  row1.appendChild(startCombo);
  
  const endCombo = document.createElement('ha-combo-box');
  endCombo.className = 'cell';
  endCombo.setAttribute('label', t("addLink", "end"));
  endCombo.id = `end_link_${index}`;
  endCombo.setAttribute('data-path', `devices.${box}.link.${index}.end`);
  row1.appendChild(endCombo);
  
  colDiv.appendChild(row1);
  
  // Create second row with entity picker and switch
  const row2 = document.createElement('div');
  row2.className = 'row';
  
  const entityPicker = document.createElement('ha-entity-picker');
  entityPicker.className = 'cell';
  entityPicker.setAttribute('label', t("addLink", "entity_picker"));
  entityPicker.id = `entity_link_${index}`;
  entityPicker.setAttribute('data-path', `devices.${box}.link.${index}.entity`);
  entityPicker.setAttribute('allow-custom-entity', '');
  row2.appendChild(entityPicker);
  
  const switchRow = document.createElement('div');
  switchRow.className = 'row cell';
  switchRow.textContent = `${t("addLink", "reverse")} :`;
  
  const switchToggle = document.createElement('ha-switch');
  switchToggle.className = 'cell right';
  switchToggle.id = `inv_link_${index}`;
  switchToggle.setAttribute('data-path', `devices.${box}.link.${index}.inv`);
  switchRow.appendChild(switchToggle);
  
  row2.appendChild(switchRow);
  
  colDiv.appendChild(row2);
  contentDiv.appendChild(colDiv);
  panel.appendChild(contentDiv);
  
  // NOW configure the web components with hass and values
  startCombo.items = thisAllAnchors.map(anchor => ({ label: anchor, value: anchor }));
  startCombo.value = appendTo._config.devices?.[box]?.link?.[index]?.start ?? "";
  
  endCombo.items = OtherAllAnchors.map(anchor => ({ label: anchor, value: anchor }));
  endCombo.value = appendTo._config.devices?.[box]?.link?.[index]?.end ?? "";
  
  entityPicker.hass = hass;
  entityPicker.value = appendTo._config.devices[box]?.link?.[index]?.entity ?? "";
  
  if (appendTo._config.devices[box]?.link?.[index]?.inv === true) {
    switchToggle.setAttribute('checked', '');
  }
  
  const path = `devices.${box}.link.${index}`;
  
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
            
    // Add the event listener - try both value-changed and change events
    iconPicker.addEventListener("value-changed", handleChange);
    iconPicker.addEventListener("change", handleChange);
        
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
      console.log('[venus-editor] Entity picker value-changed:', { key, value, id: entityPicker.id });
            
      // If the value is an empty string, treat as icon removal
      if (!value || value.trim() === "") {
        value = null; // Mark for deletion in YAML
      }
            
      if (key) {
        appendTo._config = updateConfigRecursively(appendTo._config, key, value, true);
        notifyConfigChange(appendTo);
      }
    }
        
    // Add the event listener - try both value-changed and change events
    entityPicker.addEventListener("value-changed", handleChange);
    entityPicker.addEventListener("change", handleChange);
    console.log('[venus-editor] Attached value-changed listener to entity picker:', entityPicker.id);
        
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
  // Deep copy so HA always sees a new object reference (not a mutated original)
  const configCopy = JSON.parse(JSON.stringify(appendTo._config));
  const event = new Event('config-changed', {
    bubbles: true,
    composed: true,
  });
  event.detail = { config: configCopy };
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
  const subTabGroup = appendTo.shadowRoot.querySelector('#subTab-group');
  
  if (!subTabGroup) {
    console.warn('[venus-editor] subTab-group not found');
    return;
  }
  
  // Clear old handlers for this element
  if (eventHandlers.has(subTabGroup)) {
    console.log("Event already attached to subTab-group element");
    return;
  }

  const handleTabChange = (event) => {
    // Get the button that was clicked
    const clickedButton = event.target.closest('.native-box-tab');
    if (!clickedButton) return;
    
    const selectedName = clickedButton.getAttribute('data-box');
    const tab = parseInt(selectedName.replace('box-', ''), 10);
    appendTo._currentSubTab = tab;
    
    console.log('[venus-editor] Box tab changed to:', tab);
    
    // Update UI: remove active class from all tabs and add to clicked one
    const allTabs = subTabGroup.querySelectorAll('.native-box-tab');
    allTabs.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    
    clickedButton.classList.add('active');
    clickedButton.setAttribute('aria-selected', 'true');
    
    // Render the sub-tab content
    renderSubTabContent(appendTo._currentTab, appendTo);
  };

  subTabGroup.addEventListener('click', handleTabChange);
  eventHandlers.set(subTabGroup, handleTabChange);
}
    
