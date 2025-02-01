
# 🗲 - Venus OS Dashboard - 🗲

![Overview](https://github.com/user-attachments/assets/5c450676-acba-4c8b-a558-dc36ff85c208)

<img src="https://github.com/user-attachments/assets/7148bde1-ef7e-4869-b67a-e442fc76ba14" width="300">


## What is Venus OS Dashboard ?

Venus OS Dashboard is a card that replicates the look and feel of the Venus OS GUI v2 for [Home Assistant][home-assistant] Dashboard UI.

### Features

-   🛠  Full editor for all options (no need to edit `yaml`)
-   😍 Icon picker
-   ⚓ Entity picker
-   🚀 Zero dependencies : no need to install additional cards.
-   🌈 Based on Material UI
-   🌓 Supports both light and dark themes
-   🌎 Internationalization

## Installation

### HACS

Not available yet (coming soon).

### Manual

Install this package in www directory (and any sub directory in www) in HA and add "ressource"s in "parameter / dashboard / 3 dots on right upper corner / ressources" and click on "add ressources" bouton.

Type "/local/any_dir/venus/venus.js" in URL (where "any_dir" is the directory where you put "venus" directory). So, if you put "venus" directly in www, youy URL was "/local/venus/venus.js". If you put "venus" in "www/community", your URL was "/local/community/venus/venus.js".

After that, select "Javascript module" and click on "creat".

Restart HA and "et voila"... Venus OS Dashboard must be available in lovelace card picker menu.

Enjoy ! 

## Usage

Venus OS Dashboard can be configured using Dashboard UI editor.

1. In Dashboard UI, click 3 dots in top right corner.
2. Click _Edit Dashboard_.
3. Click Plus button to add a new card.
4. Find the _Custom: Venus OS Dashboard card in the list.

