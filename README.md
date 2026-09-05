# DataDoc

Aplicativo desktop para gerenciamento de cadastros e documentos de clientes (PF/PJ).

## Funcionalidades

- Cadastro de clientes pessoa física e jurídica
- Configuração de dados da empresa
- Geração e visualização de documentos em PDF (via jsPDF)
- Histórico de cadastros
- Importação e exportação (JSON, CSV, TXT)
- Consulta de endereço por CEP (ViaCEP)
- Tema claro/escuro
- Atualização automática via Tauri Updater

## Estrutura

```
.
├── index.html              # Entrada principal
├── css/                    # Estilos (variáveis, sidebar, forms, components)
├── js/
│   ├── shared.js           # Ícones, constantes, utilitários
│   ├── app.js              # Sidebar + roteamento
│   ├── welcome.js          # Tela inicial
│   ├── cadastro.js         # Formulário de cadastro
│   ├── empresa.js          # Dados da empresa
│   ├── preview.js          # Visualização do documento
│   ├── historico.js        # Lista de cadastros
│   ├── export.js           # Exportar dados
│   ├── import.js           # Importar dados
│   ├── settings.js         # Configurações (tema, versão)
│   ├── onboarding.js       # Wizard de primeiro acesso
│   └── vendor/             # React, ReactDOM, Babel, jsPDF
├── src-tauri/              # Tauri v2 (desktop)
│   ├── tauri.conf.json     # Configuração do app
│   ├── Cargo.toml          # Dependências Rust
│   ├── src/lib.rs          # Entry point Rust
│   └── capabilities/       # Permissões
├── server.sh               # Servidor de desenvolvimento (Python)
└── tauri-updater.key       # Chave de assinatura (gitignored)
```

## Pré-requisitos

- [Rust](https://rustup.rs/) (toolchain estável)
- [Node.js](https://nodejs.org/) &gt;= 18 + pnpm
- WebView2 (já vem com Windows 10/11)
- Tauri

## Desenvolvimento

```bash
# Servidor de desenvolvimento (browser)
./server.sh 8000

# Tauri dev (desktop)
pnpm dlx @tauri-apps/cli dev
```

## Build

```bash
pnpm dlx @tauri-apps/cli build
```

O output fica em `src-tauri/target/release/bundle/` (`.msi`, `.exe` NSIS).

### Assinatura de updates

Para assinar os builds, defina as variáveis de ambiente:

```bash
export TAURI_SIGNING_PRIVATE_KEY_PATH="Caminho/para/tauri-updater.key"
```

## Stack

- **Frontend:** HTML + CSS + JavaScript (React via CDN com Babel in-browser)
- **Desktop:** [Tauri v2](https://v2.tauri.app/) com updater plugin
- **PDF:** jsPDF
- **CEP:** ViaCEP API

