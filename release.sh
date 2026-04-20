#!/bin/bash
set -e

VERSION="$1"

if [[ -z "$VERSION" ]]; then
  echo "Usage: ./release.sh <version>"
  echo "Example: ./release.sh 0.2.16"
  exit 1
fi

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Error: Version must be semver (e.g. 0.2.16)"
  exit 1
fi

# Check that the new version is higher than the last release
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null | sed 's/^v//' || echo "0.0.0")
if [[ $(printf '%s\n' "$LAST_TAG" "$VERSION" | sort -V | head -n1) == "$VERSION" ]] && [[ "$LAST_TAG" != "$VERSION" ]]; then
  echo "Error: Version $VERSION is not higher than last release $LAST_TAG"
  exit 1
fi

echo "==> Bumping cache-busting params to ?v=$VERSION"
# Replace any existing ?v=X.Y.Z in all JS files that use them
for f in dist/Venus-OS-Dashboard-ongas.js dist/editor.js dist/lib-editor.js; do
  sed -i "s/?v=[0-9]\+\.[0-9]\+\.[0-9]\+/?v=$VERSION/g" "$f"
done

echo "==> Normalizing CRLF line endings"
for f in dist/*.js; do
  sed -i 's/\r$//' "$f"
  sed -i 's/$/\r/' "$f"
done

echo "==> Validating JS syntax"
for f in dist/*.js; do
  node -c "$f" || { echo "Syntax error in $f"; exit 1; }
done

echo "==> Linting"
npm run lint

echo "==> Rebuilding .gz files"
for f in dist/*.js; do
  gzip -c "$f" > "$f".gz
done

echo "==> Staging dist/"
git add dist/*.js dist/*.js.gz

echo ""
echo "Done! Review staged changes with: git diff --cached --stat"
echo ""
echo "To complete the release:"
echo "  git commit -m \"Release v$VERSION\""
echo "  git tag v$VERSION"
echo "  git push origin main v$VERSION"
echo "  gh release create v$VERSION --title \"v$VERSION\" --notes \"...\""
