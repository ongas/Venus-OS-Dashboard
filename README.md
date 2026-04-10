
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

*Not available yet (coming soon).*

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

Venus OS Dashboard can be configured using Dashboard UI editor.

1. In Dashboard UI, click 3 dots in top right corner.
2. Click _Edit Dashboard_.
3. Click Plus button to add a new card.
4. Find the _Custom: Venus OS Dashboard card in the list.


---

## YAML Configuration Reference

While most options are available through the visual editor, some advanced features require YAML configuration.

### Gauge Bars

Display vertical power-level bars inside device boxes (similar to the Victron Venus OS UI). Requires both `gauge` and `gaugeMax` per device.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `gauge` | boolean | Yes | Enable the gauge bar |
| `gaugeMax` | number | Yes | Maximum value for 100% fill (e.g., inverter max watts, or `100` for SOC) |

- If `gaugeMax` is not set, the gauge bar is hidden
- Uses the absolute value of the entity state, so negative values (grid export, battery discharge) still display correctly
- Fill is capped at 100%

**Example:**

```yaml
type: custom:venus-os-dashboard-card
devices:
  "1-1":
    name: Grid
    entity: sensor.grid_power
    gauge: true
    gaugeMax: 5000
  "2-1":
    name: Inverter
    entity: sensor.inverter_state
  "3-1":
    name: AC Loads
    entity: sensor.ac_loads_power
    gauge: true
    gaugeMax: 5000
  "2-2":
    name: Battery
    entity: sensor.battery_soc
    gauge: true
    gaugeMax: 100
```
