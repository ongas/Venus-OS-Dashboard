# Venus OS Dashboard — Deployment & Change Management

This guide explains the build, release, and deployment workflow for the Venus OS Dashboard HACS custom card.

## Architecture

```
Edit JS files in dist/ (VS Code)
    ↓
./release.sh X.Y.Z
    ├─ Bumps cache-busting ?v= params
    ├─ Normalizes CRLF line endings
    ├─ Validates JS syntax (node -c)
    ├─ Runs ESLint
    ├─ Rebuilds .gz files
    └─ Stages dist/ for commit
    ↓
git commit + tag + push
    ↓
gh release create (GitHub Release)
    ↓
HACS picks up the new release automatically
    ↓
Users update via HACS in their HA instance
```

## Prerequisites

- Node.js (for syntax validation and ESLint)
- npm dependencies installed: `npm install`
- GitHub CLI (`gh`) for creating releases
- Repository: `git@github.com:ongas/Venus-OS-Dashboard.git`

## Release Process

### 1. Make your changes

Edit JS files in `dist/`. See **Editing Rules** below.

### 2. Run the release script

```bash
./release.sh X.Y.Z
```

The script automates:
- **Cache-busting**: Updates `?v=X.Y.Z` params in import statements
- **CRLF normalization**: Ensures Windows-style line endings (required by HA's Lovelace loader)
- **Syntax validation**: Runs `node -c` on all JS files
- **Linting**: Runs `npm run lint` (ESLint)
- **Gzip rebuild**: Regenerates all `.gz` files from `.js` files
- **Git staging**: Stages all `dist/*.js` and `dist/*.js.gz`

### 3. Commit, tag, and push

```bash
git commit -m "Release vX.Y.Z — description of changes"
git tag vX.Y.Z
git push origin main vX.Y.Z
```

### 4. Create a GitHub Release

```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "Description of changes"
```

> **CRITICAL:** HACS requires a GitHub Release object, not just a git tag.
> A tag alone will NOT be picked up by HACS.

## Build Commands

| Command | Purpose |
|---|---|
| `npm run build` | Lint + rebuild all .gz files |
| `npm run lint` | Run ESLint on dist/*.js |
| `npm run test` | Run gauge-exceeded and editor-tabs tests |
| `./release.sh X.Y.Z` | Full release automation (steps 1–5) |

## Editing Rules

**CRITICAL: Never rewrite entire files. Use targeted edits only.**

- **DO NOT** use tools that rewrite full files (e.g., Python `open()`/`write()`) — this converts CRLF line endings to LF, which breaks HA's Lovelace card loader ("Configuration error")
- **DO NOT** use JavaScript private class fields (`#field`) — HA's JS environment does not support them. Use `this._field` instead
- **DO** use `sed -i` for targeted line replacements
- **DO** preserve CRLF line endings. Verify with `file dist/<name>.js` after editing
- **DO** validate syntax with `node -c dist/<name>.js` before committing
- **DO** always rebuild `.gz` files after editing any `.js` file

## Project Structure

| File/Directory | Purpose |
|---|---|
| `dist/Venus-OS-Dashboard-ongas.js` | Card entry point (imports other modules) |
| `dist/lib-venus.js` | Main library (rendering, animation, SVG, gauges) |
| `dist/editor.js` | Card editor UI |
| `dist/lib-editor.js` | Editor tab/form management |
| `dist/css-dark.js` / `css-light.js` | Theme styles |
| `dist/css-editor.js` | Editor-specific styles |
| `dist/lang-*.js` | Internationalization files |
| `dist/*.js.gz` | Gzipped copies (must stay in sync with .js) |
| `hacs.json` | HACS integration metadata |
| `package.json` | Build scripts and dev dependencies |
| `release.sh` | Release automation script |
| `test/` | Test files |

## How Users Install / Update

1. **Install**: Add this repository in HACS → Frontend → Custom repositories
2. **Update**: HACS detects new GitHub Releases and shows an update notification
3. **Apply**: After HACS update, user clears browser cache or hard-refreshes (Ctrl+Shift+R)

## Troubleshooting

### Card shows "Configuration error" after update
CRLF line endings were likely converted to LF. Fix:
```bash
for f in dist/*.js; do sed -i 's/\r$//' "$f"; sed -i 's/$/\r/' "$f"; done
```
Then rebuild `.gz` files and re-release.

### HACS doesn't show the new version
Ensure you created a **GitHub Release** (not just a tag):
```bash
gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."
```

### Browser shows old version after update
The cache-busting `?v=X.Y.Z` params in import statements force browsers to load new versions. If still stale, hard-refresh with Ctrl+Shift+R or clear browser cache.

### ESLint fails during release
Fix lint errors first, then re-run `./release.sh X.Y.Z`. The script will not proceed past lint failures.
