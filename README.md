
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

Venus OS Dashboard can be configured using Dashboard UI editor.

1. In Dashboard UI, click 3 dots in top right corner.
2. Click _Edit Dashboard_.
3. Click Plus button to add a new card.
4. Find the _Custom: Venus OS Dashboard card in the list.

---

## Configuration Guide

### Icon Modes

Each device/box in the dashboard supports two icon configuration modes:

#### Static Icon
- Uses the standard icon picker to select from Home Assistant's built-in Material Design Icons (MDI)
- Best for devices that don't need dynamic updates
- Examples: `mdi:battery-charging`, `mdi:home`, `mdi:solar-panel`

#### Dynamic Icon (Entity-Based)
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

You can customize this template with any logic you need - different icons for charging/discharging states, different ranges, etc.

