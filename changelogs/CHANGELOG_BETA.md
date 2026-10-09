## [v0.1.97-beta] - 08/10/2026

### Corrigido

- Fluxo de atualização: check/download/install corrigidos para o contrato real do plugin (atualização nunca era detectada)
- Importação CSV/TXT: parser RFC 4180 com aspas, ponto-e-vírgula e quebras de linha; clientes PJ mantêm tipoPessoa
- Exportação CSV/TXT não corrompe mais campos com separadores e neutraliza fórmulas perigosas
- Nome do cliente não é mais truncado silenciosamente em 200 caracteres ao exportar/editar
- Estado salvo como UF em todo o app (documento mostra "São Paulo/SP")
- Validação de CNPJ/telefone/e-mail nos dados da empresa e no onboarding; nascimento rejeita data futura
- Cancelar edição via "Novo Cadastro" não cria mais duplicata
- Endereço preenchido por CEP/rua agora é salvo na hora na tela Empresa
- Telefone fixo formatado como (XX) XXXX-XXXX
- Toast sempre fecha; "Voltar" da visualização volta para a tela de origem
- Busca do histórico sem acento e por e-mail; ordenação por mais recentes
- Changelog e release notes renderizados com escape de HTML (XSS)
- Nome de arquivo de backup usa data local (não UTC)

### Melhorado

- Importação mostra registros ignorados e erros em português; dedup por documento+nome
- DatePicker: grade de anos paginada e botão "Limpar data" acessível
- Build gera dist/ transpilado sem Babel e CSP sem unsafe-eval/unsafe-inline
- 20 testes automatizados da lógica central (tests/core.test.js), rodando no CI
- Plugin shell removido (sem uso)
