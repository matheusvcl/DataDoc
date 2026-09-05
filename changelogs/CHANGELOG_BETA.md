## [v0.1.9-beta] - 05/09/2026

### Corrigido

- Endpoint do updater retornava 404 em releases prerelease
- `tauri-action` não gerava `latest.json` (adicionado `updaterJsonPreferNsis`)
- CI push automático de `latest.json` no branch dev após cada release
- Corrigido nomes de repositório e token de auth no test-update.yml

## [v0.1.8-beta] - 05/09/2026

### Corrigido

- Cache do CI: limpeza de caches antigos apenas no build, não no CI
