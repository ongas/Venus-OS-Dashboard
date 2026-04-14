# Venus OS Dashboard - Build & Release Instructions

## Build Process

**MANDATORY: Always rebuild gzipped files before committing.**

All `.js` files in `dist/` have corresponding `.gz` files that must stay in sync.

After editing any JS file in `dist/`:

```bash
gzip -c dist/<file>.js > dist/<file>.js.gz
```

Or rebuild all:

```bash
npm run build
```

## Release Process

**Use `release.sh` — it automates steps 1-5 below.**

```bash
./release.sh X.Y.Z
```

The script handles: version bump (`?v=` params), CRLF normalization, syntax validation, linting, gzip rebuild, and git staging. It then prints the manual steps (commit/tag/push/release).

**Full sequence (for reference):**

1. **Edit** the JS file(s) in `dist/`
2. **Run** `./release.sh X.Y.Z` (bumps versions, validates, gzips, stages)
3. **Commit** with a descriptive message
4. **Tag** with semver: `git tag vX.Y.Z`
5. **Push** both: `git push origin main vX.Y.Z`
6. **Create GitHub Release** (not just a tag): `gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."`

**CRITICAL:** HACS requires a GitHub Release object, not just a git tag. A tag alone will NOT be picked up by HACS.

## Editing JS Files in `dist/`

**CRITICAL: Never rewrite entire files. Use targeted edits only.**

- **DO NOT** use Python `open()`/`write()` or any tool that rewrites the full file — this converts CRLF line endings to LF, which breaks HA's Lovelace card loader and causes "Configuration error".
- **DO NOT** use JavaScript private class fields (`#field`) — HA's JS environment does not support them. Use regular properties (`this._field`) instead.
- **DO** use `sed -i` for targeted line replacements.
- **DO** preserve original line endings (CRLF). Verify with `file dist/<name>.js` after editing.
- **DO** validate syntax with `node -c dist/<name>.js` before committing.
- After editing, always bump the cache-busting `?v=X.Y.Z` params in the import statements of `Venus-OS-Dashboard-ongas.js` to force HA to load the new version.

## Home Assistant Web Component Initialization in `lib-editor.js`

**CRITICAL: Use `ha-form` component to manage all entity pickers, never manually manage them.**

Home Assistant's Web Components **cannot** be manually initialized properly through property assignment. Manual approaches fail because they bypass the component lifecycle management. The solution is to delegate all picker management to Home Assistant's `ha-form` component, which:
- Automatically creates entity pickers from schema definitions
- Handles initialization, rendering, and hass binding reactively
- Manages value changes through standard events
- Properly integrates with Home Assistant's state system

**Proven working in v0.2.62 after 13 failed releases (v0.2.49-v0.2.61) trying manual picker management.**

### ❌ DO NOT DO THIS (All Broken - Manual Picker Management):
```javascript
// Fails: innerHTML templates with manual hass assignment
subTabContent.innerHTML = `<ha-entity-picker id="picker" ...></ha-entity-picker>`;
const picker = subTabContent.querySelector("#picker");
picker.hass = hass;  // ❌ Won't work properly - misses lifecycle

// Fails: Object.defineProperty forcing
Object.defineProperty(picker, 'hass', {
  value: hass,
  writable: true,
  configurable: true
});

// Fails: MutationObserver waiting for DOM changes
const observer = new MutationObserver(() => {
  picker.hass = hass;  // ❌ Still won't work
});
```

### ✅ DO THIS INSTEAD (Works - ha-form Delegation):
```javascript
// Define picker schema
const schema = [
  {
    type: 'grid',
    column_min_width: '200px',
    schema: [
      {
        name: 'entity',
        label: 'Entity',
        selector: { entity: {} }
      },
      {
        name: 'icon',
        label: 'Icon',
        selector: { icon: {} }
      }
    ]
  }
];

// Create ha-form element (handles everything automatically)
const form = document.createElement('ha-form');
form.schema = schema;
form.hass = hass;  // ✅ ha-form manages proper binding
form.data = config || {};
form.computeLabel = (schema) => schema.name?.charAt(0).toUpperCase() + schema.name?.slice(1) || '';

// Listen for value changes
form.addEventListener('value-changed', (e) => {
  const newConfig = e.detail.value;
  // Update parent config with form data
});

subTabContent.appendChild(form);
```

### Why ha-form Works
1. **Delegated Lifecycle**: ha-form manages Web Component initialization internally
2. **Reactive Binding**: Property changes trigger proper re-renders
3. **Event-Driven**: `value-changed` events provide stable config updates
4. **Framework Integration**: Properly integrated with Home Assistant's architecture
5. **Proven Pattern**: Used by Power Flow Card Plus and other working cards

### Pattern
All entity pickers in `lib-editor.js` are created by `ha-form` from schema definitions. Never manually create, upgrade, or manage picker elements.

## Project Structure

- `dist/` — Production JS files and their gzipped counterparts
- `dist/lib-venus.js` — Main library (rendering, animation, SVG paths)
- `dist/Venus-OS-Dashboard-ongas.js` — Card entry point
- `dist/css-dark.js` / `dist/css-light.js` — Theme styles
- `dist/editor.js` — Card editor UI
- `package.json` — Build script: `npm run build` runs lint + gzip
- `release.sh` — Release automation: version bump, CRLF, validate, lint, gzip, stage
