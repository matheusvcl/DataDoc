// Testes da lógica pura (js/core.js) — rodar com: node --test tests/
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../js/core.js');

test('formatCPF formata 11 dígitos e ignora letras', () => {
  assert.equal(core.formatCPF('52998224725'), '529.982.247-25');
  assert.equal(core.formatCPF('abc529def982'), '529.982');
});

test('formatCNPJ formata 14 dígitos', () => {
  assert.equal(core.formatCNPJ('11222333000181'), '11.222.333/0001-81');
});

test('formatPhone: 10 dígitos (fixo) e 11 dígitos (celular)', () => {
  assert.equal(core.formatPhone('1123456789'), '(11) 2345-6789');
  assert.equal(core.formatPhone('11999998888'), '(11) 99999-8888');
  assert.equal(core.formatPhone('xy11a9999b88887'), '(11) 99998-8887');
});

test('formatCEP formata 8 dígitos', () => {
  assert.equal(core.formatCEP('01310100'), '01310-100');
});

test('formatDate e localDateISO sem off-by-one de UTC', () => {
  assert.equal(core.formatDate('2026-10-31'), '31/10/2026');
  assert.equal(core.localDateISO(new Date(2026, 9, 8)), '2026-10-08');
});

test('isValidCPF valida dígitos verificadores e rejeita dígitos extras', () => {
  assert.equal(core.isValidCPF('529.982.247-25'), true);
  assert.equal(core.isValidCPF('111.111.111-11'), false);
  assert.equal(core.isValidCPF('5299822472'), false);
  // 12 dígitos cujos 11 primeiros formam CPF válido NÃO pode passar
  assert.equal(core.isValidCPF('529982247250'), false);
});

test('isValidCNPJ valida dígitos verificadores e rejeita dígitos extras', () => {
  assert.equal(core.isValidCNPJ('11.222.333/0001-81'), true);
  assert.equal(core.isValidCNPJ('11.222.333/0001'), false);
  assert.equal(core.isValidCNPJ('112223330001810'), false);
});

test('isValidEmail e isValidPhone', () => {
  assert.equal(core.isValidEmail(''), true);
  assert.equal(core.isValidEmail('a@b.com'), true);
  assert.equal(core.isValidEmail('invalido@'), false);
  assert.equal(core.isValidPhone('(11) 9999'), false);
  assert.equal(core.isValidPhone('(11) 2345-6789'), true);
});

test('validatePerson: cliente exige documento, empresa não', () => {
  const erCli = core.validatePerson({ nome: '', cpf: '', telefone: '' }, { requireDocumento: true });
  assert.ok(erCli.nome && erCli.cpf && erCli.telefone);
  const erEmp = core.validatePerson({ nome: 'Empresa Sem Doc', cpf: '', telefone: '' }, { requireDocumento: false, isPJ: true });
  assert.deepEqual(erEmp, {}); // documento/telefone opcionais quando requireDocumento=false
  const erBad = core.validatePerson({ nome: 'X', cpf: '11.222.333/0001', telefone: '(11) 99999-8888' }, { requireDocumento: false, isPJ: true });
  assert.equal(erBad.cpf, 'CNPJ inválido');
});

test('sanitizeClient: trunca nome em 200, normaliza estado para UF e exige nome+documento', () => {
  const c = core.sanitizeClient({ nome: 'A'.repeat(300), cpf: '529.982.247-25', estado: 'São Paulo' });
  assert.equal(c.nome.length, 200);
  assert.equal(c.estado, 'SP');
  assert.equal(core.sanitizeClient({ nome: 'Sem Doc' }), null);
  assert.equal(core.sanitizeClient({ nome: 'X', cpf: '1', estado: 'zz' }).estado, '');
});

test('estadoFromUf / ufFromEstado aceitam UF e nome', () => {
  assert.equal(core.estadoFromUf('SP'), 'São Paulo');
  assert.equal(core.estadoFromUf('São Paulo'), 'São Paulo');
  assert.equal(core.ufFromEstado('São Paulo'), 'SP');
  assert.equal(core.ufFromEstado('sp'), 'SP');
});

test('parseDelimited: campos com aspas, ;, quebra de linha e aspas dobradas', () => {
  const csv = 'nome;cpf\n"Nome; com ponto e virgula";111\n"Linha1\nLinha2";222\n"Aspas ""duplas""";333\n';
  const rows = core.parseDelimited(csv, ';');
  assert.equal(rows.length, 4);
  assert.equal(rows[1][0], 'Nome; com ponto e virgula');
  assert.equal(rows[2][0], 'Linha1\nLinha2');
  assert.equal(rows[3][0], 'Aspas "duplas"');
});

test('parseDelimited detecta separador tab (TXT)', () => {
  const rows = core.parseDelimited('nome\tcpf\nAna\t111');
  assert.equal(rows[1][1], '111');
});

test('rowToClient: tipoPessoa explícito, inferido por CNPJ e aliases de coluna', () => {
  const pj = core.rowToClient({ tipoPessoa: 'pj', nome: 'Empresa X', cpf: '11.222.333/0001-81' });
  assert.equal(pj.tipoPessoa, 'pj');
  const inferred = core.rowToClient({ nome: 'Empresa Y', documento: '11222333000181' });
  assert.equal(inferred.tipoPessoa, 'pj');
  const pf = core.rowToClient({ nome: 'Ana', cpf: '529.982.247-25' });
  assert.equal(pf.tipoPessoa, 'pf');
  const alias = core.rowToClient({ 'razão social': 'Via Alias', cnpj: '11222333000181' });
  assert.equal(alias.nome, 'Via Alias');
});

test('parseImportText: JSON com clientes inválidos conta skipped e erros em pt-BR', () => {
  const r = core.parseImportText(JSON.stringify([
    { nome: 'Ok', cpf: '529.982.247-25' },
    { nome: 'Sem Documento' },
    'não-objeto'
  ]), 'x.json');
  assert.equal(r.clients.length, 1);
  assert.equal(r.skipped, 2);
  assert.deepEqual(r.errors, []);
  const bad = core.parseImportText('{"broken": [', 'x.json');
  assert.equal(bad.clients.length, 0);
  assert.match(bad.errors[0], /JSON inválido/);
  const wrong = core.parseImportText('qualquer', 'x.exe');
  assert.match(wrong.errors[0], /Formato não suportado/);
});

test('round-trip CSV: aspas, ponto-e-vírgula, PJ e injeção de fórmula', () => {
  const clients = [
    core.sanitizeClient({ nome: 'Nome; com "aspas" e\nquebra', cpf: '529.982.247-25', tipoPessoa: 'pf', telefone: '(11) 99999-8888' }),
    core.sanitizeClient({ nome: '=1+1 perigoso', cpf: '11.222.333/0001-81', tipoPessoa: 'pj', cidade: 'São Paulo', estado: 'SP' })
  ];
  const csv = core.serializeCSV(clients);
  const parsed = core.parseImportText(csv.replace('\uFEFF', ''), 'clientes.csv');
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.clients.length, 2);
  assert.equal(parsed.clients[0].nome, 'Nome; com "aspas" e\nquebra');
  assert.equal(parsed.clients[1].nome, '=1+1 perigoso'); // marcador removido no import
  assert.equal(parsed.clients[1].tipoPessoa, 'pj');
  assert.equal(parsed.clients[1].estado, 'SP');
});

test('serializeCSV neutraliza fórmulas e preserva TXT por tab', () => {
  const c = core.sanitizeClient({ nome: '@cmd', cpf: '529.982.247-25' });
  assert.match(core.serializeCSV([c]), /'@cmd/);
  const txt = core.serializeTXT([c]);
  assert.ok(txt.split('\n')[1].split('\t').length >= 2);
});

test('mergeImportedClients: dedup por id e por documento+nome', () => {
  const existing = [core.sanitizeClient({ id: 'a1', nome: 'Ana', cpf: '529.982.247-25' })];
  const incoming = [
    core.sanitizeClient({ id: 'a1', nome: 'Ana Duplicada Outro Nome', cpf: '529.982.247-25' }), // id igual → novo id
    core.sanitizeClient({ id: 'b2', nome: 'Ana', cpf: '529.982.247-25' }),                    // doc+nome igual → descartada
    core.sanitizeClient({ id: 'c3', nome: 'Bia', cpf: '11.222.333/0001-81' })                  // nova
  ];
  const merged = core.mergeImportedClients(incoming, existing);
  assert.equal(merged.length, 3);
  assert.equal(new Set(merged.map(c => c.id)).size, 3);
  const again = core.mergeImportedClients(merged, []);
  assert.equal(again.length, 3); // reimportar o mesmo backup não duplica
});

test('renderMarkdownSafe escapa HTML antes de marcar o markdown', () => {
  const html = core.renderMarkdownSafe('## Título\n- item <img src=x onerror=alert(1)>\n- <script>alert(2)</script>');
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('<strong'));
  assert.ok(html.includes('changelog-item'));
});

test('normalizeText ignora acentos', () => {
  assert.equal(core.normalizeText('José'), core.normalizeText('jose'));
  assert.equal(core.normalizeText('SÃO PAULO'), 'sao paulo');
});
