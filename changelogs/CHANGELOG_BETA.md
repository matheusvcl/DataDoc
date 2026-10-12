## [v0.2.0-beta] - 12/10/2026

### Corrigido

- CI: assinatura do instalador no fluxo de release — a chave agora é passada em base64 direto ao `signer sign` (é o formato que o CLI espera), sem decodificar antes; o `.sig` e o `latest.json` voltam a ser gerados e as atualizações pelo app funcionam de ponta a ponta
