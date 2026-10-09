## [v0.1.98-beta] - 09/10/2026

### Melhorado

- CI: cache de Rust com ciclo restaurar, salvar e deletar antigo (só um cache ativo por job, sem acumular storage)
- CI: criação de release com fallback para token próprio (RELEASE_TOKEN) e assinatura via --private-key-path
- CI: Node 24 em todos os jobs e github-script v9 (fim do warning de Node 20)
- CI: build do dist validado em toda execução
