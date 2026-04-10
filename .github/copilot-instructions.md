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

**MANDATORY: Follow this exact sequence. Never skip steps.**

1. **Edit** the JS file(s) in `dist/`
2. **Rebuild gzip**: `gzip -c dist/<file>.js > dist/<file>.js.gz` for each changed file
3. **Stage both** the `.js` and `.js.gz` files: `git add dist/<file>.js dist/<file>.js.gz`
4. **Commit** with a descriptive message
5. **Tag** with semver: `git tag vX.Y.Z`
6. **Push** both: `git push origin main vX.Y.Z`
7. **Create GitHub Release** (not just a tag): `gh release create vX.Y.Z --title "vX.Y.Z" --notes "..."`

**CRITICAL:** HACS requires a GitHub Release object, not just a git tag. A tag alone will NOT be picked up by HACS.

## Project Structure

- `dist/` — Production JS files and their gzipped counterparts
- `dist/lib-venus.js` — Main library (rendering, animation, SVG paths)
- `dist/Venus-OS-Dashboard-ongas.js` — Card entry point
- `dist/css-dark.js` / `dist/css-light.js` — Theme styles
- `dist/editor.js` — Card editor UI
- `package.json` — Build script: `npm run build` runs lint + gzip
