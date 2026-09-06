## [v0.1.94-beta] - 06/09/2026

### Corrigido

- CSP bloqueando fetch de changelog do GitHub
- latest.json local desatualizado

### Adicionado

- Parse de markdown para changelog no dialog de update e nas configurações
- Barra de progresso de download com porcentagem real
- Tratamento de erros inline no dialog de atualização

### Melhorado

- CI gera latest.json com Node.js (evita problemas de quoting no bash)
- Git push usa refspec explícito (evita ambiguidade branch/tag)
- Cache keys separadas para jobs check-tauri e build
