#!/bin/bash
# Extract latest changelog entry for release notes
# Usage: ./scripts/extract-changelog.sh [version]

CHANGELOG="changelogs/CHANGELOG.md"
CHANGELOG_BETA="changelogs/CHANGELOG_BETA.md"

VERSION="${1:-}"

# Pick changelog file: beta/alpha/rc tags use CHANGELOG_BETA.md
if [ -n "$VERSION" ] && echo "$VERSION" | grep -qE '(beta|alpha|rc)' && [ -f "$CHANGELOG_BETA" ]; then
  CHANGELOG="$CHANGELOG_BETA"
fi

if [ ! -f "$CHANGELOG" ]; then
  echo "Changelog não encontrado"
  exit 1
fi

if [ -n "$VERSION" ]; then
  # Try matching with v prefix first, then without
  NOTES=$(sed -n "/^## \[$VERSION\]/,/^## \[/p" "$CHANGELOG" | sed '1d;/^## \[/d' | sed '/^$/N;/^\n$/d')
  if [ -z "$NOTES" ]; then
    NOTES=$(sed -n "/^## \[v$VERSION\]/,/^## \[/p" "$CHANGELOG" | sed '1d;/^## \[/d' | sed '/^$/N;/^\n$/d')
  fi
  if [ -z "$NOTES" ]; then
    echo "Sem notas de release para $VERSION"
    exit 1
  fi
  echo "$NOTES"
else
  # Extract latest version section (first ## [x.x.x] block)
  sed -n '/^## \[/,/^## \[/p' "$CHANGELOG" | sed '1d;/^## \[/d' | sed '/^$/N;/^\n$/d'
fi
