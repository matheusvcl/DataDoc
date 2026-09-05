#!/bin/bash
# Extract latest changelog entry for release notes
# Usage: ./scripts/extract-changelog.sh [version]

CHANGELOG="changelog/CHANGELOG.md"

if [ ! -f "$CHANGELOG" ]; then
  echo "Changelog não encontrado"
  exit 1
fi

VERSION="${1:-}"

if [ -n "$VERSION" ]; then
  # Extract specific version section
  # Match from ## [version] to next ## [
  sed -n "/^## \[$VERSION\]/,/^## \[/p" "$CHANGELOG" | sed '$d' | tail -n +2
else
  # Extract latest version section (first ## [x.x.x] block)
  sed -n '/^## \[/,/^## \[/p' "$CHANGELOG" | sed '$d' | tail -n +2
fi
