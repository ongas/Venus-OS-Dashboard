# Venus OS Dashboard - Entity Configuration Guide

## Overview

The Venus OS Dashboard card uses **`ha-form` component with entity selectors** to manage entity configuration in the editor UI. This is the proven pattern used by Home Assistant's web components.

## Configuration Structure

### Card Configuration (YAML)

The card configuration is organized as:

```yaml
type: custom:venus-os-dashboard-ongas
param:
  boxCol1: 1          # Number of devices in column 1
  boxCol2: 2          # Number of devices in column 2
  boxCol3: 1          # Number of devices in column 3
  devices:            # All configured devices
    1-1:              # Column 1, Device 1
      icon: mdi:transmission-tower
      name: Grid
      entity: sensor.grid_power
      entity2: sensor.grid_current
      graph: true
      sideGaugeEntity: null
    2-1:              # Column 2, Device 1
      icon: mdi:lightning-bolt-circle
      name: Multiplus II
      entity: sensor.multiplus_power
      entity2: sensor.multiplus_current
    2-2:              # Column 2, Device 2
      icon: mdi:battery
      name: Battery
      entity: sensor.battery_percentage
      sideGaugeMax: sensor.battery_voltage
```

### Device ID Format

Devices are identified by: `<column>-<position>`
- `1-1`: Column 1, Device 1
- `2-1`: Column 2, Device 1
- `2-2`: Column 2, Device 2
- `3-1`: Column 3, Device 1

## Editor UI Flow

### Tab Navigation

1. **Main Tab** (`conf-0`)
   - Theme selection (Light/Dark/Auto)
   - Number of devices per column (boxCol1, boxCol2, boxCol3)
   - Font sizes (header, devices, footer)

2. **Column Tabs** (`conf-1`, `conf-2`, `conf-3`)
   - Sub-tabs for each device in the column
   - Entity-specific configuration

### Entity Configuration Form

For each device, the editor displays an `ha-form` with this schema:

#### Grid Section
- **Icon**: Icon selector (`selector: { icon: {} }`)
- **Name**: Text input for device name

#### Main Entity (Expandable Section)
- **Main Entity**: Entity picker (`selector: { entity: {} }`)
- **Secondary Entity**: Entity picker for secondary values
- **Side Gauge Entity**: Entity picker for side gauge
- **Side Gauge Max**: Entity selector for max value
- **Enable Graph**: Boolean toggle
- **Enable Gauge**: Boolean toggle
- **Gauge Max Value**: Number input
- **Enable Side Gauge**: Boolean toggle

#### Anchor Configuration (Expandable Section)
- **Anchors**:L, B-1, R-1 format for spatial positioning

#### Link Configuration (Expandable Section)
- Link connection definitions for flows

## The `ha-form` Component

### Why `ha-form` Is Used

Home Assistant's `ha-form` component:
1. **Automatically creates entity pickers** from schema definitions
2. **Manages Web Component lifecycle** internally
3. **Handles reactive binding** - property changes trigger re-renders
4. **Provides event-driven updates** via `value-changed` events
5. **Never requires manual hass binding** - `ha-form` handles it

### Implementation Pattern

```javascript
// Define the form schema (from lib-editor.js)
const schema = [
  {
    type: 'grid',
    column_min_width: '200px',
    schema: [
      {
        name: 'icon',
        label: 'Icon',
        selector: { icon: {} }
      },
      {
        name: 'entity',
        label: 'Main Entity',
        selector: { entity: {} }  // Entity picker
      }
    ]
  }
];

// Create and render the form
const form = document.createElement('ha-form');
form.schema = schema;
form.hass = hass;           // Set hass (ha-form manages binding)
form.data = deviceConfig;   // Populate with existing config
form.computeLabel = (schema) => 
  schema.name?.charAt(0).toUpperCase() + schema.name?.slice(1) || '';

// Listen for changes
form.addEventListener('value-changed', (e) => {
  const newConfig = e.detail.value;
  // Update parent configuration
  updateDeviceConfig(newConfig);
});

container.appendChild(form);
```

## Code Location

- **Editor Setup**: [dist/editor.js](dist/editor.js) lines 1-130
  - Paper-tabs definition
  - Tab switching logic
  - `renderTabContent()` dispatcher

- **Entity Configuration**: [dist/lib-editor.js](dist/lib-editor.js) lines 210-350
  - `tabColRender()`: Column tab structure
  - `subtabRender()`: Device-level form with `ha-form` and entity selectors
  - `schema[]`: Complete form definition with entity pickers

## How It Works

1. **User selects a column tab** (Col. 1, Col. 2, or Col. 3)
2. **sub-tabs appear** for each device in that column (1-to-N based on boxCol setting)
3. **User selects a device sub-tab** (Box 1, Box 2, etc.)
4. **Entity configuration form renders** via `ha-form` with schema
5. **User selects entities** using entity pickers (created by `ha-form`)
6. **`value-changed` event fires** on form
7. **Configuration updates** and is sent to Home Assistant via `notifyConfigChange()`

## Key Insight: ha-form Delegation

The critical pattern is that **all entity picker management is delegated to the `ha-form` component**. The form:
- Creates entity picker elements automatically
- Binds `hass` reactively
- Handles initialization
- Manages user input

**Manual entity picker management (the broken approach):**
```javascript
// ❌ WRONG - These approaches fail:
const picker = document.createElement('ha-entity-picker');
picker.hass = hass;        // Won't work - misses lifecycle
container.appendChild(picker);

// ❌ OR using Object.defineProperty - Still broken
Object.defineProperty(picker, 'hass', { value: hass, writable: true });

// ❌ OR using MutationObserver - Also broken
const observer = new MutationObserver(() => {
  picker.hass = hass;      // Still won't work
});
```

**Correct approach:**
```javascript
// ✅ CORRECT - Delegate to ha-form
const form = document.createElement('ha-form');
form.schema = [
  {
    name: 'entity',
    selector: { entity: {} }
  }
];
form.hass = hass;          // ha-form handles binding properly
form.data = config;
container.appendChild(form);
```

## Summary

The Venus OS Dashboard editor provides entity configuration through:
1. **Hierarchical tabs**: Main → Columns → Devices
2. **Entity pickers**: Created by `ha-form` component
3. **Schema-driven forms**: Each device has a standardized configuration schema
4. **Event-driven updates**: `value-changed` events notify the parent of config changes

This architecture ensures proper Home Assistant integration and follows best practices for custom card editors.
