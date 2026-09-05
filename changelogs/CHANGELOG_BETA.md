## [v0.1.91-beta] - 05/09/2026

### Corrigido

- Endpoint do updater retornava 404 em releases prerelease
- tauri-action nao gerava latest.json (geracao manual via Tauri CLI)
- CI push automatico de latest.json no branch dev apos cada release
- Corrigido nomes de repositorio e token de auth no test-update.yml
- pnpm nao encontrado no CI (setup-node + npx em vez de pnpm dlx)
