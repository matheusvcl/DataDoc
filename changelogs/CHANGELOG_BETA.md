## [v0.1.92-beta] - 05/09/2026

### Adicionado

- Sidebar recolhível com animação de transição e ícone de toggle
- Configuração do Renovate para gerenciamento automático de dependências
- Tooltip com nome da tela ao passar o mouse em nav items quando sidebar colapsada

### Corrigido

- Endpoint do updater apontava para repositório incorreto (DevVicolli → matheusvcl)
- Ícones removidos das etapas do onboarding (welcome, empresa, importação)
- CI: cp de latest.json copiava arquivo para si mesmo após checkout do branch
- CI: cache key gerava entrada nova a cada run (agora usa hash de dependências)
- CI: cleanup de caches antigos com lógica corrigida

## [v0.1.91-beta] - 05/09/2026

### Corrigido

- Endpoint do updater retornava 404 em releases prerelease
- tauri-action nao gerava latest.json (geracao manual via Tauri CLI)
- CI push automatico de latest.json no branch dev apos cada release
- Corrigido nomes de repositorio e token de auth no test-update.yml
- pnpm nao encontrado no CI (setup-node + npx em vez de pnpm dlx)
