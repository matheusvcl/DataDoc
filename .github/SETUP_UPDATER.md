# DataDoc - CI/CD e Sistema de Atualização

## Workflows

### `ci.yml` — CI (validação)
- **Trigger:** push em `main`, PRs para `main`
- Frontend lint (HTML, JS, CSS)
- Tauri Rust check (compilação)
- Build do frontend (dist/)

### `build.yml` — Build + Release
- **Trigger:** tag `v*` ou manual
- **Job 1: `build`** — compila o app Windows (NSIS + MSI), assina com updater key
- **Job 2: `release`** — publica os artifacts no GitHub Release (depende do build)

### `test-update.yml` — Teste do Updater
- **Trigger:** manual (workflow_dispatch)
- Build com versão de teste (ex: `0.0.9-test`)
- Publica como prerelease no GitHub
- Verifica se `latest.json` está acessível e correto
- Verifica se o instalador foi assinado

## Secrets necessários

| Secret | Descrição |
|--------|-----------|
| `TAURI_SIGNING_PRIVATE_KEY` | Conteúdo de `tauri-updater.key` |

## Como criar um release

```bash
# Bump a versão em tauri/tauri.conf.json
# Commit e tag
git tag v1.0.0
git push origin v1.0.0
```

O workflow `build.yml` vai:
1. Compilar o app (job `build`)
2. Publicar no GitHub Releases (job `release`)
3. Gerar `latest.json` para o updater

## Como testar o updater

1. Vá em Actions > "Test Update System" > Run workflow
2. Use a versão default `0.0.9-test`
3. Espere o workflow completar
4. Baixe o instalador nos artifacts
5. Instale e abra o app
6. Vá em Configurações > Verificar Atualizações
7. Deve aparecer o dialog de atualização

## Chaves de assinatura

- `tauri-updater.key` — chave privada (gitignored)
- `tauri-updater.key.pub` — chave pública (no repo)

A chave pública está em `tauri.conf.json` no campo `plugins.updater.pubkey`.
O updater verifica a assinatura do `latest.json` contra essa chave.
