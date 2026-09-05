## [v0.1.2-beta] - 05/09/2026

### Adicionado

- Cadastro de clientes com busca por nome/CPF/CNPJ/telefone
- Preview de documentos em tempo real
- Exportação para PDF
- Importação de dados
- Tema claro/escuro
- Sistema de atualização automática
- Suporte a Windows (MSI/NSIS)
- Configurações com verificação de versão dinâmica
- Sistema de changelog para releases
- Visualização do changelog nas configurações do app
- CI/CD com validação antes do build

### Corrigido

- Limpeza de erro de telefone ao trocar entre Pessoa Física e Jurídica
- Identifier do Tauri atualizado para com.datadoc.desktop (evita conflito macOS)
- Caminho do changelog no CI/CD corrigido (changelogs/ com 's')
- Changelog agora detecta beta/alpha/rc e usa CHANGELOG_BETA.md

### Alterado

- Largura do card do onboarding aumentada (480px / 780px)
- Largura do form-grid aumentada (720px → 840px)
- Descrição JSON no exportar dados atualizada
- Ícones removidos dos steps do onboarding
