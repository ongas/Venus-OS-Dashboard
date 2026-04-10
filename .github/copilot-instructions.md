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

## Project Structure

- `dist/` — Production JS files and their gzipped counterparts
- `dist/lib-venus.js` — Main library (rendering, animation, SVG paths)
- `dist/Venus-OS-Dashboard-ongas.js` — Card entry point
- `dist/css-dark.js` / `dist/css-light.js` — Theme styles
- `dist/editor.js` — Card editor UI
- `package.json` — Build script: `npm run build` runs lint + gzip
- `release.sh` — Release automation: version bump, CRLF, validate, lint, gzip, stage
