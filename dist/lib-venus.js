export let pathControls = new Map();

export let directionControls = new Map();

export let intervals = new Map();

export let historicData = new Map();

export let updateGraphTriggers = new Map();

let dashboardOldWidth;

let mustRedrawLine = true;

let editorOpen = false;

let boxContentCache = new Map();
let boxStateCache = new Map();
let boxWidthCache = new Map();
let gaugeExceededCache = new Map();
let gaugeExceededTimers = new Map();

/************************************************/
/* function to render the card skeleton:          */
/* renders an image if YAML mode = DEMO           */
/************************************************/
export function baseRender(config, appendTo) {
    
  appendTo.innerHTML = `
      <div id="dashboard" class="dashboard">
        <svg id="svg_container" class="line" viewBox="0 0 1000 600" width="100%" height="100%">
          <defs>
            <filter id="blurEffect">
              <feGaussianBlur in="SourceGraphic" stdDeviation="1"/> <!-- Adjust stdDeviation for blur amount -->
            </filter>
            <radialGradient id="gradientDark" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="1"></stop>
              <stop offset="90%" stop-color="#ffffff" stop-opacity="0"></stop>
            </radialGradient>
            <radialGradient id="gradientLight" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#000000" stop-opacity="1"></stop>
              <stop offset="90%" stop-color="#000000" stop-opacity="0"></stop>
            </radialGradient>
          </defs>
            <g id="path_container" class="balls"></g>
          <g id="circ_container" class="lines"></g>
        </svg>
            <div id="column-1" class="column column-1"></div>
            <div id="column-2" class="column column-2"></div>
            <div id="column-3" class="column column-3"></div>
        </div>
  `;

}

/**********************************/
/* function to create boxes:        */
/* qty per column                   */
/**********************************/
export function addBox(col1, col2, col3, appendTo) {
    
  const boxCounts = [col1, col2, col3];
    
  boxCounts.forEach((count, columnIndex) => {
    const column = appendTo.querySelector(`#dashboard > #column-${columnIndex + 1}`); // Access columns via querySelector

    if (column) {
      const gapPercentage = count === 3 ? '5%' : count === 2 ? '10%' : '0';
      column.style.gap = gapPercentage; // Apply gap to the column

      for (let i = 1; i <= count; i++) {
                
        const content = document.createElement('div'); // Create a new div element
        content.id = `content_${columnIndex + 1}-${i}`; // Set the box id
        content.className = 'content'; // Apply the 'content' class
                
        const graph = document.createElement('div'); // Create a new div element
        graph.id = `graph_${columnIndex + 1}-${i}`;
        graph.className = 'graph';
                
        const gauge = document.createElement('div'); // Create a new div element
        gauge.id = `gauge_${columnIndex + 1}-${i}`;
        gauge.className = 'gauge';
        gauge.style.height = `0px`;
        const sideGauge = document.createElement('div');
        sideGauge.id = `sideGauge_${columnIndex + 1}-${i}`;
        sideGauge.className = 'sideGauge';
        sideGauge.innerHTML = '<div class="sideGaugeTrack"></div><div class="sideGaugeFill"></div>';
        sideGauge.style.display = 'none';
                
        const box = document.createElement('div'); // Create a new div element
        box.id = `box_${columnIndex + 1}-${i}`; // Set the box id
        box.className = 'box'; // Apply the 'box' class
        box.appendChild(graph);
        box.appendChild(gauge);
        box.appendChild(sideGauge);
        box.appendChild(content);
        column.appendChild(box); // Add the box to the column
      }
    } else {
      console.warn(`Column ${columnIndex + 1} not found.`);
    }
  });
}

/****************************************/
/* function to add anchors:                */
/* lists the anchors to create in boxes    */
/* then calls the creatAnchors function    */
/* based on YAML parameters                */
/****************************************/
export function addAnchors(config, appendTo) {
    
  // Iterate over all devices in the configuration
  Object.entries(config.devices || {}).forEach(([boxKey, device]) => {
    if (device?.anchors) {
      // Extract the anchors defined for the device
      const anchors = device.anchors.split(', ').map((anchors) => {
        const [type, qtyStr] = anchors.split('-'); // Exemple : "R-1" devient ["R", "1"]
        const qty = parseInt(qtyStr, 10); // Number of anchors to create
        return { box: boxKey, type, qty };
      });

      // Process each anchor
      anchors.forEach(({ type, qty }) => {
        const col = parseInt(boxKey[0], 10); // First part of boxKey (column)
        const box = parseInt(boxKey[2], 10); // Third part of boxKey (box)
                
        // Call the creatAnchors function
        creatAnchors(col, box, qty, type, appendTo);
      });
    }
  });
}

/****************************************/
/* function to create anchors:              */
/* receives column, box,                    */
/* the number to create per side, and       */
/* the side (position)                      */
/****************************************/
function creatAnchors(colNbrs, boxNbrs, numAnchors, type, appendTo) {
  const box = appendTo.querySelector(`#dashboard > #column-${colNbrs} > #box_${colNbrs}-${boxNbrs}`); // Access columns via querySelector
  
  if (!box) {
    console.error(`Box with ID "box_${colNbrs}-${boxNbrs}" not found.`);
    return;
  }

  // Add the new anchors
  for (let i = 0; i < numAnchors; i++) {
    const anchor = document.createElement('div');
    
    anchor.className = 'anchor anchor-'+type;
    anchor.id = `anchor_${colNbrs}-${boxNbrs}_${type}-${i+1}`;
    
    // Calculate the position of each anchor
    const positionPercent = ((i + 1) / (numAnchors + 1)) * 100; // Evenly distributed
    
    if(type === "T" ||  type === "B")
      anchor.style.left = `${positionPercent}%`;
    else {
      anchor.style.top = `${positionPercent}%`;
    }
    
    // Add the anchor to the box
    box.appendChild(anchor);
  }
}

/**********************************************/
/* function to fill boxes:                       */
/* receives the different devices,                */
/* optional style or string size                  */
/* (defined or auto),                             */
/**********************************************/
export function fillBox(config, styles, isDark, hass, appendTo) {
    
  const devices = config.devices || [];
    
  for (const boxId in devices) {
        
    const boxIdtest = parseInt(boxId[2], 10);
    const boxIdmax = parseInt(config.param[`boxCol${boxId[0]}`], 10);
        
    if(boxIdtest > boxIdmax )  {
      console.error(`Box with ID "${boxIdtest}" not found.`);
      return;
    }
            
    const device = devices[boxId];
            
    // Fast-path: skip box if entity states haven't changed
    const _ents = [device.entity, device.entity2, device.headerEntity, device.footerEntity1, device.footerEntity2, device.footerEntity3, device.iconEntity, device.sideGaugeEntity, device.sideGaugeMax].filter(Boolean);
    const _stateKey = _ents.map(function(k) { var s = hass.states[k]; return s ? s.state + (s.attributes && s.attributes.unit_of_measurement || '') : ''; }).join('|');
    if (boxStateCache.get(boxId) === _stateKey) continue;
    boxStateCache.set(boxId, _stateKey);

    const divGauge = appendTo.querySelector(`#dashboard > #column-${boxId[0]} > #box_${boxId} > #gauge_${boxId}`);
    const divSideGauge = appendTo.querySelector(`#dashboard > #column-${boxId[0]} > #box_${boxId} > #sideGauge_${boxId}`);
    const innerContent = appendTo.querySelector(`#dashboard > #column-${boxId[0]} > #box_${boxId} > #content_${boxId}`);
    const _boxW = boxWidthCache.get(boxId) || innerContent.offsetWidth;
                
    let state = hass.states[device.entity];
    let value = state ? state.state : 'N/C';
    let unit = state && state.attributes.unit_of_measurement ? state.attributes.unit_of_measurement : '';
            

    let addHeaderEntity = "";
    let addEntity2 = "";
    let addFooter = "";
    let addHeaderStyle = "";
    let addSensorStyle = "";
    let addSensor2Style = "";
    let addFooterStyle = "";
        
    if(device.graph) creatGraph(boxId, device, isDark, appendTo);
        
    if(device.gauge && device.gaugeMax) {
      const gaugeMax = parseFloat(device.gaugeMax);
      const gaugeAbsVal = Math.abs(parseFloat(value));
      const gaugeVal = Math.min(gaugeAbsVal / gaugeMax * 100, 100);
      divGauge.style.height = gaugeVal + `%`;
      
      const isExceeded = gaugeAbsVal >= gaugeMax;
      const wasExceeded = gaugeExceededCache.get(boxId) || false;
      const divBox = divGauge.closest('.box');
      
      if (isExceeded) {
        if (divBox) divBox.classList.add('box-exceeded');
        divGauge.classList.add('exceeded');
        divGauge.classList.remove('warned');
        gaugeExceededCache.set(boxId, true);
        clearTimeout(gaugeExceededTimers.get(boxId));
        gaugeExceededTimers.delete(boxId);
      } else if (!isExceeded && wasExceeded) {
        if (divBox) divBox.classList.remove('box-exceeded');
        divGauge.classList.remove('exceeded');
        divGauge.classList.add('warned');
        gaugeExceededCache.set(boxId, false);
        
        clearTimeout(gaugeExceededTimers.get(boxId));
        const timer = setTimeout(() => {
          divGauge.classList.remove('warned');
          gaugeExceededTimers.delete(boxId);
        }, 3000);
        gaugeExceededTimers.set(boxId, timer);
      }
    } else {
      divGauge.style.height = `0px`;
    }

    if(device.sideGauge && divSideGauge) {
      var sgEntity = device.sideGaugeEntity;
      var sgState = sgEntity ? hass.states[sgEntity] : null;
      var sgValue = sgState ? parseFloat(sgState.state) : 0;
      var sgMaxState = device.sideGaugeMax ? hass.states[device.sideGaugeMax] : null;
      var sgMax = sgMaxState ? parseFloat(sgMaxState.state) || 100 : 100;
      if(isNaN(sgValue)) sgValue = 0;
      var sgPct = Math.min(Math.abs(sgValue) / sgMax * 100, 100);
      var sgFill = divSideGauge.querySelector('.sideGaugeFill');
      if(sgFill) {
        sgFill.style.height = sgPct + '%';
        if(sgPct >= 90) sgFill.style.background = 'linear-gradient(to top, #d94a4a, #e06060)';
        else if(sgPct >= 70) sgFill.style.background = 'linear-gradient(to top, #d9944a, #e0a860)';
        else sgFill.style.background = 'linear-gradient(to top, #4a90d9, #70a1d5)';
      }
      divSideGauge.style.display = '';
    } else if(divSideGauge) {
      divSideGauge.style.display = 'none';
    }
            
    if(styles.header != "") {
      if(styles.header == "auto") {
                
        let dynSizeHeader = "";
                
        if(boxId[0] == "2") dynSizeHeader = Math.round(0.0693*_boxW+1.9854);
        else dynSizeHeader = Math.round(0.0945*_boxW+2.209);

        addHeaderStyle = ` style="font-size: ${dynSizeHeader}px;"`;
                
      } else {
        addHeaderStyle = ` style="font-size: ${styles.header}px;"`;
      }
    } 
        
    if(styles.sensor != "") {
      if(styles.sensor == "auto") {
                    
        let dynSizeSensor = "";
                    
        if(boxId[0] == "2") dynSizeSensor = Math.round(0.1065*_boxW+8.7929);
        else dynSizeSensor = Math.round(0.1452*_boxW+9.0806);
                    
        addSensorStyle = ` style="font-size: ${dynSizeSensor}px;"`;
                    
      } else {
        addSensorStyle = ` style="font-size: ${styles.sensor};"`;
      }
    }
        
    if(styles.sensor2 != "") {
      if(styles.sensor == "auto") {
                    
        let dynSizeSensor2 = "";
                    
        if(boxId[0] == "2") dynSizeSensor2 = Math.round(0.0693*_boxW+1.9854);
        else dynSizeSensor2 = Math.round(0.0945*_boxW+2.209);
                    
        addSensor2Style = ` style="font-size: ${dynSizeSensor2}px;"`;
                    
      } else {
        addSensor2Style = ` style="font-size: ${styles.sensor2}px;"`
      }
    }
            
    if(styles.footer != "") {
      if(styles.footer == "auto") {
                    
        let dynSizeFooter = "";
                    
        if(boxId[0] == "2") dynSizeFooter = Math.round(0.0803*_boxW-2.438);
        else dynSizeFooter = Math.round(0.1095*_boxW-2.1791);
                    
        addFooterStyle = ` style="font-size: ${dynSizeFooter}px;"`;
                    
      } else {
        addFooterStyle = ` style="font-size: ${styles.footer};"`;
      }
    }
            
    // Handle dynamic icon from iconEntity or static icon
    let iconToUse = 'mdi:circle';  // Fallback icon
    
    // Check if iconMode is set to dynamic
    if(device.iconMode === 'dynamic' && device.iconEntity) {
      const iconEntityState = hass.states[device.iconEntity];
      if(iconEntityState) {
        const iconName = iconEntityState.state.trim();  // Strip whitespace!
        // If the icon name doesn't already start with 'mdi:' or 'custom:', prepend 'mdi:'
        iconToUse = (iconName.startsWith('mdi:') || iconName.startsWith('custom:')) ? iconName : `mdi:${iconName}`;
      }
    } else if(device.icon) {
      // Use static icon if iconMode is not dynamic or not set
      iconToUse = device.icon;
    }

    if(device.headerEntity) {
      const stateHeaderEnt = hass.states[device.headerEntity];
      const valueHeaderEnt = stateHeaderEnt ? stateHeaderEnt.state : '';
      const unitvalueHeaderEnt = stateHeaderEnt && stateHeaderEnt.attributes.unit_of_measurement ? stateHeaderEnt.attributes.unit_of_measurement : '';
                
      addHeaderEntity = `
                <div class="headerEntity">${valueHeaderEnt}<div class="boxUnit">${unitvalueHeaderEnt}</div></div>
            `;
    }
        
    if(device.entity2) {
      const stateEntity2 = hass.states[device.entity2];
      const valueEntity2 = stateEntity2 ? stateEntity2.state : '';
      const unitvalueEntity2 = stateEntity2 && stateEntity2.attributes.unit_of_measurement ? stateEntity2.attributes.unit_of_measurement : '';
                
      addEntity2 = `
                <div class="boxSensor2"${addSensor2Style}>${valueEntity2}<div class="boxUnit">${unitvalueEntity2}</div></div>
            `;
    }
            
    if(device.footerEntity1) {
                
      const stateFooterEnt1 = hass.states[device.footerEntity1];
      const valueFooterEnt1 = stateFooterEnt1 ? stateFooterEnt1.state : '';
      const unitvalueFooterEnt1 = stateFooterEnt1 && stateFooterEnt1.attributes.unit_of_measurement ? stateFooterEnt1.attributes.unit_of_measurement : '';
                
      const stateFooterEnt2 = hass.states[device.footerEntity2];
      const valueFooterEnt2 = stateFooterEnt2 ? stateFooterEnt2.state : '';
      const unitvalueFooterEnt2 = stateFooterEnt2 && stateFooterEnt2.attributes.unit_of_measurement ? stateFooterEnt2.attributes.unit_of_measurement : '';
                
      const stateFooterEnt3 = hass.states[device.footerEntity3];
      const valueFooterEnt3 = stateFooterEnt3 ? stateFooterEnt3.state : '';
      const unitvalueFooterEnt3 = stateFooterEnt3 && stateFooterEnt3.attributes.unit_of_measurement ? stateFooterEnt3.attributes.unit_of_measurement : '';
            
      addFooter = `
                <div class="boxFooter"${addFooterStyle}>
                    <div class="footerCell">${valueFooterEnt1}<div class="boxUnit">${unitvalueFooterEnt1}</div></div>
                    <div class="footerCell">${valueFooterEnt2}<div class="boxUnit">${unitvalueFooterEnt2}</div></div>
                    <div class="footerCell">${valueFooterEnt3}<div class="boxUnit">${unitvalueFooterEnt3}</div></div>
                </div>
            `;
    }
            
    const newHtml = `

            <div class="boxHeader"${addHeaderStyle}>
                <ha-icon icon="${iconToUse}" class="boxIcon"></ha-icon>
                <div class="boxTitle">${device.name}</div>
                ${addHeaderEntity}
            </div>
            <div class="boxSensor1"${addSensorStyle}>${value}<div class="boxUnit">${unit}</div></div>
            ${addEntity2}
            ${addFooter}
        `;

    // Only update DOM if content actually changed (skip unnecessary layout recalcs)
    if (boxContentCache.get(boxId) !== newHtml) {
      boxContentCache.set(boxId, newHtml);
      innerContent.innerHTML = newHtml;
      boxWidthCache.set(boxId, innerContent.offsetWidth);
    }
        
    if (!innerContent.dataset.listener) {
      innerContent.dataset.listener = "true"; // Mark as having a listener
        
      innerContent.addEventListener('click', () => {
        const entityId = device.entity; // Replace with the entity associated with the div
        
        // Trigger the Home Assistant "more-info" event
        const event = new Event('hass-more-info', { bubbles: true, composed: true });
        event.detail = { entityId }; // Pass the entity to display
        innerContent.dispatchEvent(event);
      });
    }
  }
}

function creatGraph (boxId, device, isDark, appendTo) {
    
  if(!updateGraphTriggers.get(device.entity)) return;
    
  const divGraph = appendTo.querySelector(`#dashboard > #column-${boxId[0]} > #box_${boxId} > #graph_${boxId}`);
  const data = historicData.get(device.entity);
    
  if (!data || data.length === 0) {
    console.warn(`No data for entity ${device.entity}.`);
    return;
  }
    
  //console.log(data);
  if (!data || data.length === 0) {
    console.warn(`Data not available for ${device.entity}.`);
    updateGraphTriggers.set(device.entity, false); // Temporarily disable the trigger
    return;
  }
    
  // Generate the SVG path
  const pathD = generatePath(data, 500, 99); // Fixed SVG dimensions for this example

  let colorPath = "#00000077";
  if(isDark) {
    colorPath = "#ffffff77";
  } 
    
  divGraph.innerHTML = `
        <svg viewBox="0 0 500 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width: 100%; height: 100%;">
            <path fill="none" stroke="${colorPath}" stroke-width="3" d="${pathD}" />
        </svg>
    `;

  updateGraphTriggers.set(device.entity, false);
}

function generatePath(data, svgWidth = 500, svgHeight = 100) {
  if (!data || data.length === 0) return '';

  // Step 1: Calculate min/max for normalization
  const minY = Math.min(...data.map(d => d.value));
  const maxY = Math.max(...data.map(d => d.value));

  // Step 2: Normalize data points
  const normalizedData = data.map((d, index) => ({
    x: (index / (data.length - 1)) * svgWidth, // Uniform X distribution
    y: svgHeight - ((d.value - minY) / (maxY - minY)) * svgHeight, // Inverted Y normalization (SVG: 0 at top)
  }));

  // Step 3 (optional): Simplify data points
  //const simplifiedData = simplifyPath(normalizedData, 3); // Tolerance to adjust
  const simplifiedData = normalizedData;
    
  // Step 4: Construct the path
  let path = `M${simplifiedData[0].x},${simplifiedData[0].y}`; // Starting point
  for (let i = 1; i < simplifiedData.length; i++) {
    const prev = simplifiedData[i - 1];
    const curr = simplifiedData[i];
    const midX = (prev.x + curr.x) / 2; // Midpoint for a smooth curve
    path += ` Q${prev.x},${prev.y} ${midX},${curr.y}`;
  }
  path += ` T${simplifiedData[simplifiedData.length - 1].x},${simplifiedData[simplifiedData.length - 1].y}`; // Dernier point

  return path;
}



/******************************************************/
/* function to add links between boxes:              */
/* compares sizes from one "set hass" loop to the next   */
/* and if there is a change, launches the                */
/* addLine function (also on the first loop)             */
/******************************************************/
export function checkReSize(devices, isDarkTheme, appendTo) {
    
  // retrieve card size for path recalculation if necessary
  const rect = appendTo.querySelector(`#dashboard`).getBoundingClientRect();
    
  // if width differs from previous: recalculate
  if(dashboardOldWidth != rect.width) {
        
    // container for paths and circles
    const circContainer = appendTo.querySelector(`#dashboard > #svg_container > #circ_container`);
    const pathContainer = appendTo.querySelector(`#dashboard > #svg_container > #path_container`);
            
    // if the DOM is ready...
    const checkReady = () => {
      const dashboard = appendTo.querySelector("#dashboard");
        
      if (dashboard) {
                    
        // check if the main Home Assistant window is inert (or if the card config window is open)
        const homeAssistant = window.document.querySelector('home-assistant');
        const homeAssistantMain = homeAssistant.shadowRoot.querySelector('home-assistant-main');
        const hasInert = homeAssistantMain.hasAttribute('inert');
                    
        // different cases...
        if (mustRedrawLine) { // following a YAML update
                        
          circContainer.innerHTML = "";
          pathContainer.innerHTML = "";
          addLine(devices, isDarkTheme, appendTo);
                        
        } else if(hasInert && !editorOpen) { // premiere boucle a l'ouverture de l'editeur

          editorOpen = true;
                        
          circContainer.innerHTML = "";
          pathContainer.innerHTML = "";
          addLine(devices, isDarkTheme, appendTo);
                        
        } else if (hasInert && editorOpen) { // subsequent loops after first editor open... no more updates
                        
        } else if (!hasInert && editorOpen) {
                        
          editorOpen = false;

          circContainer.innerHTML = "";
          pathContainer.innerHTML = "";
          addLine(devices, isDarkTheme, appendTo);
                        
        } else {

          circContainer.innerHTML = "";
          pathContainer.innerHTML = "";
          addLine(devices, isDarkTheme, appendTo);
                        
        }
                
        mustRedrawLine = false;
        return; // Stop the loop
      }
        
      // Otherwise, reschedule the check
      requestAnimationFrame(checkReady);
    };
        
    // Start the initial check
    requestAnimationFrame(checkReady);
        
  }
        
  // update card width in global variable for comparison on next iteration
  dashboardOldWidth = rect.width;
  boxWidthCache.clear();
}

export function razDashboardOldWidth() {
  mustRedrawLine = true;
  boxStateCache.clear();
}

/********************************************************/
/* function to launch link creation between              */
/* boxes:                                                */
/* retrieves creation params and calls the               */
/* creatLine function accordingly                        */
/********************************************************/
function addLine(devices, isDarkTheme, appendTo) {
  for (const boxId in devices) {
    const device = devices[boxId];
        
    // Iterate over numbered links
    const links = device.link;
        
    if(links !== "nolink") {
      for (const linkId in links) {
        const link = links[linkId];
                
        if(link == "nolink") continue;
                
        const inv = link.inv === true ? -1 : 1;          // By default, "inv" is 1 if not defined
                        
        // Display link information
        if (link.start && link.end) creatLine(`${boxId}_${link.start}`, link.end, inv, isDarkTheme, appendTo);
                                
      }
    }
  }
}

/*********************************************************/
/* function to create links between boxes:                */
/* receives the start anchor, end anchor,                 */
/* initial animation movement direction                   */
/*********************************************************/
function creatLine(anchorId1, anchorId2, direction_init, isDarkTheme, appendTo) {
    
  const circContainer = appendTo.querySelector(`#dashboard > #svg_container > #circ_container`);
  const pathContainer = appendTo.querySelector(`#dashboard > #svg_container > #path_container`);

  if (!circContainer) {
    console.error("circContainer container not found.");
    return;
  }
  
  if (!pathContainer) {
    console.error("pathContainer container not found.");
    return;
  }
  
  var coords1 = getAnchorCoordinates(anchorId1, appendTo);
  var coords2 = getAnchorCoordinates(anchorId2, appendTo);
  
  if (!coords1 || !coords2) {
    console.error("Unable to calculate coordinates.");
    return;
  }
  
  let pathData = "";
  
  if (coords1.x === coords2.x || coords1.y === coords2.y) {
    pathData = `M ${coords1.x} ${coords1.y} L ${coords2.x} ${coords2.y}`;
  } else {
  
    const anchor1isH = anchorId1.includes("L") || anchorId1.includes("R");
    const anchor2isH = anchorId2.includes("L") || anchorId2.includes("R");

    if (anchor1isH && anchor2isH) {
      const midX = (coords1.x + coords2.x) / 2;
      pathData = `M${coords1.x},${coords1.y} C${midX},${coords1.y} ${midX},${coords2.y} ${coords2.x},${coords2.y}`;
    } else {
      if (anchor1isH) {
        coords1 = getAnchorCoordinates(anchorId2, appendTo);
        coords2 = getAnchorCoordinates(anchorId1, appendTo);
      }

      pathData = `
          M ${coords1.x} ${coords1.y} 
          C ${coords1.x} ${coords2.y}, ${coords1.x} ${coords2.y}, ${coords2.x} ${coords2.y}
        `;
    }
  }
    
  // Create the SVG <path> element
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

  if (!pathData.includes("NaN")) {
    path.setAttribute("d", pathData);
  } else {
    console.warn("SVG path ignored because pathData contains NaN");
    return;
  }
    
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", "2");
  
  // Create the dots with gradient (4 evenly spaced dots)
  const circles = [];
  const numBalls = 4;
  for (let i = 0; i < numBalls; i++) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "ball");
    circle.setAttribute("cx", coords1.x);
    circle.setAttribute("cy", coords1.y);
    circle.setAttribute("r", "4");
    circle.setAttribute("data-offset", String(i / numBalls));
    if(isDarkTheme) circle.setAttribute("fill", "url(#gradientDark)");
    else circle.setAttribute("fill", "url(#gradientLight)");
    circles.push(circle);
    circContainer.appendChild(circle);
  }
  
  // Add the path to the group
  pathContainer.appendChild(path);
  
  // Animate the dots along the path
  const controls = animateBallAlongPath(anchorId1, path, circles, appendTo);
  
  // add the "reverse" pointer to a map for later use
  pathControls.set(anchorId1, controls);
  
  // add the original path direction to a map
  directionControls.set(anchorId1, direction_init);
}

/*********************************************************/
/* function to retrieve anchor coordinates:               */
/* receives the target anchor as parameter                */
/*********************************************************/
function getAnchorCoordinates(anchorId, appendTo) {
  
  const columnIndex = anchorId[0];
  const boxIndex = anchorId.substring(0, 3);
  
  const anchor = appendTo.querySelector(`#dashboard > #column-${columnIndex} > #box_${boxIndex} > #anchor_${anchorId}`);
  const container = appendTo.querySelector(`#dashboard`);
  
  if (!anchor || !container) {
    console.error("Anchor or container not found: " + anchorId);
    return null;
  }
  
  // Position of the anchor in the document
  const anchorRect = anchor.getBoundingClientRect();
  
  // Position of the container in the document
  const containerRect = container.getBoundingClientRect();
  
  // Calculate relative coordinates
  const relativeX = (anchorRect.left - containerRect.left + anchorRect.width / 2)*1000/containerRect.width;
  const relativeY = (anchorRect.top - containerRect.top + anchorRect.height / 2)*600/containerRect.height;
  
  //const relativeX = anchorRect.left - containerRect.left + anchorRect.width / 2;
  //const relativeY = anchorRect.top - containerRect.top + anchorRect.height / 2;
  
  return { x: parseFloat(relativeX.toFixed(2)), y: parseFloat(relativeY.toFixed(2)) };
}

/******************************************************************/
/* function to start animation on links:                             */
/* receives the link id in the map (its origin anchor) as parameter  */
/* needed to retrieve the base direction of                          */
/* the circle, the path for circle movement, and the circle to       */
/* move                                                              */
/******************************************************************/
function animateBallAlongPath(anchorId1, path, circles, appendTo) {
  
  let direction = directionControls.get(anchorId1);
  let running = true;
  
  const pathLength = path.getTotalLength();
  
  const box = appendTo.querySelector(`#dashboard`);
  const boxWidth = box.offsetWidth;

  const speed = boxWidth/40;
  const duration = pathLength / speed * 1000;
  let startTime;
  
  function reverseDirection(cmd) {
    const directionInit = directionControls.get(anchorId1);
    direction = directionInit*cmd;
  }
  
  function moveBall(time) {
    if (!running) return;
    if (!startTime) startTime = time;
    
    const elapsed = time - startTime;
    var progress = (elapsed % duration) / duration;
    
    if (direction == -1) {
      progress = 1 - progress;
    } if (direction == 0) {
      progress = 0; 
    }
    
    // Animate all dots with offset
    circles.forEach((circle) => {
      if (direction == 0) {
        circle.setAttribute("opacity", "0");
      } else {
        circle.setAttribute("opacity", "1");
        const offset = parseFloat(circle.getAttribute("data-offset"));
        let ballProgress = (progress + offset) % 1;
        
        if (direction == -1) {
          ballProgress = (1 - progress - offset) % 1;
          if (ballProgress < 0) ballProgress += 1;
        }
        
        const point = path.getPointAtLength(ballProgress * pathLength);
        circle.setAttribute("cx", point.x);
        circle.setAttribute("cy", point.y);
      }
    });
    
    requestAnimationFrame(moveBall);
  }
  
  requestAnimationFrame(moveBall);
  
  return {
    reverse: reverseDirection,
    stop: function() { running = false; },
  };
}

/******************************************************/
/* function to reverse the animation:                    */
/* checks the entity value and changes direction if      */
/* necessary                                             */
/******************************************************/
export function checkForReverse(devices, hass) {
    
  for (const boxId in devices) {
    const device = devices[boxId];
            
    // Iterate over numbered links
    const links = device.link;
            
    if(links !== "nolink") {
      for (const linkId in links) {
                    
        const link = links[linkId];
        
        if (!link.entity) continue; // Skip links without an entity - they keep their default direction
                    
        const stateLinkEnt = hass.states[link.entity];
        const valueLinkEnt = stateLinkEnt ? stateLinkEnt.state : '';
                    
        const pathControl = pathControls.get(`${boxId}_${link.start}`);
                    
        if (pathControl && typeof pathControl.reverse === "function") {
          if(valueLinkEnt < -0.5) pathControls.get(`${boxId}_${link.start}`).reverse(-1); 
          else if(valueLinkEnt > 0.5) pathControls.get(`${boxId}_${link.start}`).reverse(1); 
          else pathControls.get(`${boxId}_${link.start}`).reverse(0); 
        } 
      }
    }
  }
}

/******************************************************/
/* group of functions to launch periodic                 */
/* history retrieval at regular intervals                */
/******************************************************/
export async function startPeriodicTask(config, hass) {
    
  clearAllIntervals();
    
  const devices = config.devices || [];
    
  for (const boxId in devices) {
        
    const device = devices[boxId];
            
    if(device.graph) {
            
      const intervalMinutes = 15;
            
      //console.log(`Attempting to start periodic task for ${device.entity}. Interval: ${intervalMinutes} minutes.`);
            
      // Check if the first execution succeeds
      const firstExecutionSuccessful = await performTask(device.entity, hass);
            
      if (!firstExecutionSuccessful) {
        console.warn(`First execution failed for ${device.entity}. Periodic task cancelled.`);
        clearAllIntervals();
        return false; // Don't start periodic task if first execution fails
      }
            
      //console.log(`First execution succeeded for ${device.entity}. Setting up periodic task.`);

            
      // Schedule the periodic task for this entity
      const intervalId = setInterval(() => {
        performTask(device.entity, hass);
      }, intervalMinutes * 60 * 1000);
    
      // Store the interval in the Map
      intervals.set(device.entity, intervalId);
    }
  }
  return true;
}

export function clearAllIntervals() {
  // Stop all running tasks
  intervals.forEach((intervalId) => {
    clearInterval(intervalId);
    //console.log(`Task for entity "${id}" stopped.`);
  });
  intervals.clear();
  // Stop all animation RAF loops
  pathControls.forEach((controls) => {
    if (controls.stop) controls.stop();
  });
  pathControls.clear();
  directionControls.clear();
  boxContentCache.clear();
  boxStateCache.clear();
  boxWidthCache.clear();
  historicData.clear();
  updateGraphTriggers.clear();
}

function performTask(entityId, hass) {
  // Function to execute periodically for each entity
  //console.log(`Periodic task running for entity "${entityId}"...`);
  // Add data retrieval logic here
    
  const historicalData = fetchHistoricalData(entityId, 24, hass); // fetch 24h of data
    
  if (historicalData === "false") {
    console.warn(`Unable to retrieve history for ${entityId}.`);
    return false; // Return false if history could not be retrieved
  }

  //console.log(`Periodic task succeeded for ${entityId}.`);
  return true; // Return true if everything succeeded
}

async function fetchHistoricalData(entityId, periodInHours = 24, hass, numSegments = 6) {
  const now = new Date();
  const startTime = new Date(now.getTime() - periodInHours * 60 * 60 * 1000); // Specified period

  if (!hass || !hass.states || !hass.states[entityId]) {
    console.error(`hass or entity ${entityId} is not yet available.`);
    return false;
  }

  // URL for Home Assistant API
  const url = `history/period/${startTime.toISOString()}?filter_entity_id=${entityId}&minimal_response=true&significant_changes_only=true`;

  try {
    const response = await hass.callApi('GET', url);

    if (response.length === 0 || response[0].length === 0) {
      console.log(`No data available for "${entityId}" in the period of ${periodInHours} hour(s).`);
      return false;
    }

    const rawData = response[0];

    // Step 1: Transform data into a usable format
    const formattedData = rawData
      .map((item) => ({
        time: new Date(item.last_changed),
        state: parseFloat(item.state), // Conversion en nombre
      }))
      .filter((item) => !isNaN(item.state)); // Filter invalid data

    if (formattedData.length === 0) {
      console.log(`No valid formatted data for "${entityId}".`);
      return false;
    }

    // Step 2: Reduce data into segments while maintaining constant Y scale
    const interval = 30 * 60 * 1000; // 15 minutes en millisecondes
    const totalIntervals = (periodInHours * 60 * 60 * 1000) / interval; // Calculate the number of intervals for the given period
    const startTimestamp = Math.floor(startTime.getTime() / interval) * interval;
            
    const reducedData = [];
    for (let i = 0; i < totalIntervals; i++) {
      const targetTime = new Date(startTimestamp + i * interval);
      const closest = formattedData.reduce((prev, curr) => {
        return Math.abs(curr.time - targetTime) < Math.abs(prev.time - targetTime) ? curr : prev;
      });
      reducedData.push({ time: targetTime, value: closest.state });
    }
        
    // Step 2b: Add min and max points to the reducedData array
    const segmentSize = Math.ceil(formattedData.length / numSegments);
    for (let i = 0; i < formattedData.length; i += segmentSize) {
      const segment = formattedData.slice(i, i + segmentSize);
        
      let minPoint = { value: Infinity, time: null };
      let maxPoint = { value: -Infinity, time: null };
        
      segment.forEach((point) => {
        if (point.state < minPoint.value) minPoint = { value: point.state, time: point.time };
        if (point.state > maxPoint.value) maxPoint = { value: point.state, time: point.time };
      });
        
      // Add min and max to the reduced array
      reducedData.push({ time: minPoint.time, value: minPoint.value });
      reducedData.push({ time: maxPoint.time, value: maxPoint.value });
    }

    // Step 3: Sort chronologically
    reducedData.sort((a, b) => a.time - b.time);
        
    //console.log(reducedData);

    // Step 4: Store the reduced data
    historicData.set(
      entityId,
      reducedData.map((point) => ({
        time: point.time,
        value: point.value,
      }))
    );
        
    updateGraphTriggers.set(entityId, true);

    return true;
  } catch (error) {
    console.error('Error retrieving history:', error);
    return false;
  }
}





export const getEntityNames = (entities) => {
  return entities?.split("|").map((p) => p.trim());
};

export const getFirstEntityName = (entities) => {
  const names = getEntityNames(entities);
  return names.length > 0 ? names[0] : "";
};


export function getDefaultConfig(hass) {
      
  const powerEntities = Object.keys(hass.states).filter((entityId) => {
    const stateObj = hass.states[getFirstEntityName(entityId)];
    const isAvailable =
          (stateObj.state && stateObj.attributes && stateObj.attributes.device_class === "power") || stateObj.entity_id.includes("power");
    return isAvailable;
  });
  
  function checkStrings(entiyId, testStrings) {
    const firstId = getFirstEntityName(entiyId);
    const friendlyName = hass.states[firstId].attributes.friendly_name;
    return testStrings.some((str) => firstId.includes(str) || friendlyName?.includes(str));
  }
  
  const gridPowerTestString = ["grid", "utility", "net", "meter"];
  const solarTests = ["solar", "pv", "photovoltaic", "inverter"];
  const batteryTests = ["battery"];
  const batteryPercentTests = ["battery_percent", "battery_level", "state_of_charge", "soc", "percentage"];
  const firstGridPowerEntity = powerEntities.filter((entityId) => checkStrings(entityId, gridPowerTestString))[0];
  const firstSolarPowerEntity = powerEntities.filter((entityId) => checkStrings(entityId, solarTests))[0];
    
  const currentEntities = Object.keys(hass.states).filter((entityId) => {
    const stateObj = hass.states[entityId];
    const isAvailable = stateObj && stateObj.state && stateObj.attributes && stateObj.attributes.unit_of_measurement === "A";
    return isAvailable;
  });
  const percentageEntities = Object.keys(hass.states).filter((entityId) => {
    const stateObj = hass.states[entityId];
    const isAvailable = stateObj && stateObj.state && stateObj.attributes && stateObj.attributes.unit_of_measurement === "%";
    return isAvailable;
  });
  const firstBatteryPercentageEntity = percentageEntities.filter((entityId) => checkStrings(entityId, batteryPercentTests))[0];
    
  const firstCurrentEntity = currentEntities.filter((entityId) => checkStrings(entityId, batteryTests))[0];
  
  return {
    param: {
      boxCol1: 2,
      boxCol3: 2,
    },
    theme: "auto",
    styles: {
      header: 10,
      sensor: 16,
    },
    devices: {
      "1-1": {
        icon: "mdi:transmission-tower",
        name: "Grid",
        entity: firstGridPowerEntity ?? "",
        anchors: "R-1",
        link: {
          "1":{
            start: "R-1",
            end: "2-1_L-1",
          },
        },
      },
      "1-2": {
        icon: "mdi:battery-charging",
        name: "Battery",
        entity: firstBatteryPercentageEntity ?? "",
        anchors: "R-1",
        gauge: "true",
        link: {
          "1":{
            start: "R-1",
            end: "2-1_B-1",
            entity: firstCurrentEntity ?? "",
          },
        },
      },
      "2-1": {
        icon: "mdi:cellphone-charging",
        name: "Multiplus",
        anchors: "L-1, B-2, R-1",
      },
      "3-1": {
        icon: "mdi:home-lightning-bolt",
        name: "Home",
        entity: firstGridPowerEntity ?? "",
        anchors: "L-1",
        link: {
          "1":{
            start: "L-1",
            end: "2-1_R-1",
          },
        },
      },
      "3-2": {
        icon: "mdi:weather-sunny",
        name: "Solar",
        entity: firstSolarPowerEntity ?? "",
        anchors: "L-1",
        link: {
          "1":{
            start: "L-1",
            end: "2-1_B-2",
            entity: firstSolarPowerEntity ?? "",
            inv: "true",
          },
        },
      },
    },
  }
}

