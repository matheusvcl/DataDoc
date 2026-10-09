## [v0.1.99-beta] - 09/10/2026

### Adicionado

- Popup de atualização exibe a changelog completa da versão nova (com fallback para as notas do release)
- Barra de progresso durante o download: os botões somem e voltam como "Depois" e "Reiniciar e Instalar" ao concluir
- Estado "Instalando e reiniciando..." durante a instalação, com o popup travado até o app reiniciar

### Corrigido

- Changelog em Configurações sem espaçamento excessivo entre linhas e itens (renderização em blocos, sem `<br/>` duplicados)
- CI: `TAURI_SIGNING_PRIVATE_KEY` removido do ambiente apenas na execução do `signer sign` (o CLI preenchia `--private-key` automaticamente e conflitava com `--private-key-path`, quebrando a assinatura do instalador)
