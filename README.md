
# 🗲 - Venus OS Dashboard - 🗲

![Overview](https://github.com/user-attachments/assets/5c450676-acba-4c8b-a558-dc36ff85c208)

<img src="https://github.com/user-attachments/assets/7148bde1-ef7e-4869-b67a-e442fc76ba14" width="300">
<img src="https://github.com/user-attachments/assets/16c48420-e28a-472e-b3df-fe50922d1e70" width="300">

## **What is Venus OS Dashboard ?**

Venus OS Dashboard is a card that replicates the look and feel of the Venus OS GUI v2 for [Home Assistant][home-assistant] Dashboard UI.

---

### Features

-   🛠  Full editor for all options (no need to edit `yaml`)
-   😍 Icon picker
-   ⚓ Entity picker
-   🚀 Zero dependencies : no need to install additional cards.
-   🌈 Based on Material UI
-   🌓 Supports both light and dark themes
-   🌎 Internationalization

---

## **Installation**

### HACS

1. Open HACS in Home Assistant (Settings → Devices & Services → HACS)
2. Click **Explore & Download Repositories**
3. Search for "**Venus OS Dashboard**"
4. Click on the repository and select **Download**
5. Restart Home Assistant
6. Add the custom card resource in your dashboard

### Manual Installation

1. Place this package inside the www directory (or any subdirectory within www) in Home Assistant.

2. Add the resource in Settings → Dashboards → Three dots (top right) → Resources.

3. Click on "Add resource" and enter the following URL :
  - If you placed the venus directory directly in www, use :

```bash
/local/venus/venus.js
```

  - If you placed it in www/community, use:
```bash
/local/community/venus/venus.js
```

4. Select "JavaScript Module" and click "Create".

5. Restart Home Assistant.

And voilà! Venus OS Dashboard should now be available in the Lovelace card picker menu.

Enjoy! 🎉

---

## Usage

Venus OS Dashboard can be configured using the visual Dashboard UI editor — almost all options are available there. A few advanced options are YAML-only.

1. In Dashboard UI, click the 3 dots in the top-right corner.
2. Click _Edit Dashboard_.
3. Click the Plus button to add a new card.
4. Find _Custom: Venus OS Dashboard_ in the card list.

---

## Configuration Reference

Below is the full list of every configurable property. The **UI** column shows whether the option is available in the visual editor.

### Top-Level (Card) Options

These appear on the **first tab** of the visual editor (or at the root of the YAML).

| Property | Type | Default | UI | Required | Description |
|---|---|---|---|---|---|
| `type` | string | — | — | **Yes** | Must be `custom:venus-os-dashboard-card` |
| `theme` | string | `auto` | ✅ | No | `light`, `dark`, or `auto` (follows HA theme) |
| `maxPower` | number | — | ✅ | **Recommended** | Your system's max power in Watts (e.g. `5000`). Enables throughput-based animation speed on connector links. Without this, link animations run at a constant speed. |
| `demo` | boolean | `false` | ❌ | No | Renders a static demo layout (YAML-only) |

### Layout Options — `param`

These control the grid layout (how many boxes per column). Available on the first tab of the editor.

| Property | Type | Default | UI | Required | Description |
|---|---|---|---|---|---|
| `param.boxCol1` | number | `1` | ✅ | No | Number of boxes in column 1 (1–4) |
| `param.boxCol2` | number | `1` | ✅ | No | Number of boxes in column 2 (1–2) |
| `param.boxCol3` | number | `1` | ✅ | No | Number of boxes in column 3 (1–4) |

### Font Size Overrides — `styles`

These override the auto-detected font size for each zone. Available on the first tab of the editor. Each can be set to a CSS value (e.g. `12px`, `0.8em`) or `auto`.

| Property | Type | Default | UI | Required | Description |
|---|---|---|---|---|---|
| `styles.header` | string | `auto` | ✅ | No | Font size in box headers |
| `styles.sensor` | string | `auto` | ✅ | No | Font size in the main sensor/entity area |
| `styles.footer` | string | `auto` | ✅ | No | Font size in box footers |

### Device / Box Options — `devices.<box-id>`

Each box is identified by a `<col>-<row>` ID (e.g. `1-1`, `2-1`, `3-2`). These are configured on the **Column tabs** (Col 1, Col 2, Col 3) in the editor, each with sub-tabs per box.

| Property | Type | Default | UI | Required | Description |
|---|---|---|---|---|---|
| `name` | string | — | ✅ | **Yes** | Display name shown in the box header |
| `icon` | string | — | ✅ | Recommended | MDI icon (e.g. `mdi:battery`). Used when `iconMode` is `static` (default) |
| `iconMode` | string | `static` | ✅ | No | `static` (use `icon`) or `dynamic` (use `iconEntity`) |
| `iconEntity` | string | — | ✅ | No | Entity whose state is an icon name (e.g. `sensor.battery_icon`). Used when `iconMode` is `dynamic` |
| `entity` | string | — | ✅ | **Yes** | Main entity shown in the box body (e.g. `sensor.battery_soc`) |
| `entity2` | string | — | ✅ | No | Secondary entity shown below the main entity |
| `graph` | boolean | `false` | ✅ | No | Show a mini sparkline graph of the main entity |
| `gauge` | boolean | `false` | ✅ | No | Show a vertical gauge bar inside the box |
| `gaugeMax` | number | — | ✅ | If `gauge` | Maximum value for the gauge |
| `sideGauge` | boolean | `false` | ✅ | No | Show a side gauge bar on the box edge |
| `sideGaugeEntity` | string | — | ✅ | If `sideGauge` | Entity driving the side gauge value |
| `sideGaugeMax` | string | — | ✅ | If `sideGauge` | Entity whose state is the max value for the side gauge |
| `sideGaugeMin` | string | — | ✅ | No | Entity whose state is the min value for the side gauge (defaults to 0) |
| `headerEntity` | string | — | ✅ | No | Entity shown in the box header bar |
| `footerEntity1` | string | — | ✅ | No | First entity shown in the box footer |
| `footerEntity2` | string | — | ✅ | No | Second entity shown in the box footer |
| `footerEntity3` | string | — | ✅ | No | Third entity shown in the box footer |
| `anchors` | string | — | ❌ | **Yes** | Connector anchor points. Format: `<side>-<count>` comma-separated. Sides: `L` (left), `R` (right), `T` (top), `B` (bottom). Example: `L-1, R-2` = 1 left anchor + 2 right anchors. **(YAML-only — the editor reads this but doesn't provide a picker)** |

### Link Options — `devices.<box-id>.link.<n>`

Links define the animated connector lines between boxes. Configured under each box in the editor.

| Property | Type | Default | UI | Required | Description |
|---|---|---|---|---|---|
| `start` | string | — | ✅ | **Yes** | Start anchor on this box (e.g. `R-1`) |
| `end` | string | — | ✅ | **Yes** | End anchor on another box (e.g. `2-1_L-1`) |
| `entity` | string | — | ✅ | **Recommended** | Power entity for this link. Drives animation direction (positive = start→end, negative = end→start, near-zero = stopped) and speed (when `maxPower` is set). Without this, the link animates at constant speed in the default direction. |
| `inv` | boolean | `false` | ✅ | No | Invert the direction logic (swap positive/negative meaning) |
| `balls` | number | `0` | ❌ | No | Number of animated dots. `0` = auto (calculated from path length, ~1 ball per 34 px — matches Victron gui-v2). Set a specific number to override. **(YAML-only)** |

---

## What Do I *Need* to Configure?

### Minimum Required

To get a working dashboard you **must** provide:

1. `type: custom:venus-os-dashboard-card`
2. At least one device with `name`, `entity`, and `anchors`
3. At least one link with `start` and `end` to connect boxes

### Strongly Recommended

These aren't strictly required but you'll want them:

| What | Why |
|---|---|
| `maxPower` | Without it, all link animations move at the same constant speed regardless of power flow. Set it to your inverter's rated power (e.g. `3000`, `5000`, `8000`, `15000`). |
| `entity` on each link | Without it, the link can't auto-detect direction or speed — it just animates in one direction forever. Point it at the power sensor for that connection (e.g. grid input power, battery power, consumption). |
| `icon` on each device | Without it, the box header has no icon. |

---

## Animation Behaviour

The connector link animations are modelled on the Victron Venus OS gui-v2:

- **Ball count**: Automatically calculated from path length (~1 ball per 34 px), just like gui-v2. Override per-link with the `balls` YAML property.
- **Direction**: Determined by the sign of the link's `entity` value. Positive = start→end, negative = end→start, near-zero = paused. Use `inv: true` to flip this logic.
- **Speed**: When `maxPower` is set, speed scales linearly with throughput (8–45 px/sec). When `maxPower` is not set, all links move at a constant 20 px/sec.

---

## Full YAML Example

```yaml
type: custom:venus-os-dashboard-card
theme: auto
maxPower: 5000
param:
  boxCol1: 1
  boxCol2: 2
  boxCol3: 1
devices:
  1-1:
    name: Grid
    icon: mdi:transmission-tower
    entity: sensor.grid_power
    headerEntity: sensor.grid_voltage
    footerEntity1: sensor.grid_frequency
    anchors: "R-1"
    link:
      1:
        start: R-1
        end: 2-1_L-1
        entity: sensor.grid_input_power
  2-1:
    name: Inverter
    icon: mdi:flash
    entity: sensor.inverter_power
    anchors: "L-1, R-1, B-1"
    link:
      1:
        start: R-1
        end: 3-1_L-1
        entity: sensor.consumption_power
      2:
        start: B-1
        end: 2-2_T-1
        entity: sensor.battery_power
  2-2:
    name: Battery
    icon: mdi:battery
    entity: sensor.battery_soc
    gauge: true
    gaugeMax: 100
    sideGauge: true
    sideGaugeEntity: sensor.battery_power
    sideGaugeMax: sensor.battery_max_charge_power
    anchors: "T-1"
  3-1:
    name: Home
    icon: mdi:home
    entity: sensor.consumption_power
    footerEntity1: sensor.critical_loads
    footerEntity2: sensor.non_critical_loads
    anchors: "L-1"
```

---

## Icon Modes

Each device/box supports two icon configuration modes:

### Static Icon
- Uses the standard icon picker to select from Home Assistant's built-in Material Design Icons (MDI)
- Best for devices that don't need dynamic updates
- Examples: `mdi:battery-charging`, `mdi:home`, `mdi:solar-panel`

### Dynamic Icon (Entity-Based)
- Reads icon names from a Home Assistant template entity
- Perfect for devices like batteries where the icon should change based on SOC percentage
- The entity's state should return an icon name (with or without `mdi:` prefix)
- Entity picker is filtered to show only `template` and `input_text` entities for easier discovery

**Example: Dynamic Battery Icon Setup**

1. Create a template sensor in Home Assistant's `configuration.yaml`:

```yaml
template:
  - sensor:
      - name: "Battery Icon"
        unique_id: battery_icon
        unit_of_measurement: null
        state: |
          {% set soc = states('sensor.battery_soc') | float(0) %}
          {% if soc >= 80 %}
            mdi:battery
          {% elif soc >= 60 %}
            mdi:battery-60
          {% elif soc >= 40 %}
            mdi:battery-40
          {% elif soc >= 20 %}
            mdi:battery-20
          {% else %}
            mdi:battery-alert
          {% endif %}
```

2. Restart Home Assistant to create the new entity (`sensor.battery_icon`)

3. In the Venus OS Dashboard card editor:
   - Select a box and go to its settings
   - Choose **Icon Mode**: **Dynamic Icon (Entity)**
   - Select Entity: **sensor.battery_icon** from the entity picker
   - Save the configuration

The battery icon will now automatically update as the SOC percentage changes!

You can customize this template with any logic you need — different icons for charging/discharging states, different ranges, etc.

