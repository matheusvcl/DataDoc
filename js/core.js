// DataDoc core — lógica pura (sem JSX/React), compartilhada pelo app e pelos testes.
// Carregado antes de shared.js. Em Node, exporta via module.exports para os testes.

// ---------- Texto e formatação ----------

const asText = (v, max) => String(v == null ? '' : v).slice(0, max);

const allDigits = (v) => String(v == null ? '' : v).replace(/\D/g, '');

const digitsOnly = (v, max) => allDigits(v).slice(0, max);

const formatCPF = (v) => {
  const d = digitsOnly(v, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
  if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
  return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
};

const formatCNPJ = (v) => {
  const d = digitsOnly(v, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return d.slice(0, 2) + '.' + d.slice(2);
  if (d.length <= 8) return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5);
  if (d.length <= 12) return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) + '/' + d.slice(8);
  return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) + '/' + d.slice(8, 12) + '-' + d.slice(12);
};

// Telefone: 10 dígitos (fixo) → (XX) XXXX-XXXX; 11 dígitos (celular) → (XX) XXXXX-XXXX
const formatPhone = (v) => {
  const d = digitsOnly(v, 11);
  if (d.length <= 2) return d.length ? '(' + d : '';
  if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  if (d.length === 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
};

const formatCEP = (v) => {
  const d = digitsOnly(v, 8);
  if (d.length <= 5) return d;
  return d.slice(0, 5) + '-' + d.slice(5);
};

// 'yyyy-mm-dd' → 'dd/mm/yyyy'
const formatDate = (d) => {
  if (!d || typeof d !== 'string') return '—';
  const parts = d.split('-');
  if (parts.length !== 3) return d;
  const [y, m, day] = parts;
  if (!y || !m || !day) return '—';
  return `${day}/${m}/${y}`;
};

// Data local no formato yyyy-mm-dd (sem off-by-one de UTC)
const localDateISO = (date) => {
  const d = date || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

const safeFilename = (name) => {
  const s = asText(name, 80)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  return s.slice(0, 60) || 'cliente';
};

// Busca sem acento: "Jose" encontra "José"
const normalizeText = (s) => String(s == null ? '' : s)
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

// ---------- Validação ----------

const isValidCPF = (value) => {
  const d = allDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== Number(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === Number(d[10]);
};

const isValidCNPJ = (value) => {
  const d = allDigits(value);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (weights) => {
    const sum = weights.reduce((acc, n, i) => acc + Number(d[i]) * n, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return calc([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(d[12])
    && calc([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(d[13]);
};

const isValidEmail = (value) => {
  const email = asText(value, 200).trim();
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (value) => allDigits(value).length >= 10;

// Valida os dados do cliente/empresa. Retorna { campo: mensagem } (vazio = ok).
// opts: { requireDocumento: true } para cliente; false para empresa (documento opcional).
const validatePerson = (form, opts) => {
  const o = Object.assign({ requireDocumento: true, isPJ: false }, opts || {});
  const er = {};
  const nome = String(form.nome == null ? '' : form.nome).trim();
  const doc = String(form.cpf == null ? '' : form.cpf).trim();
  const tel = String(form.telefone == null ? '' : form.telefone).trim();

  if (!nome) er.nome = o.isPJ ? 'Informe a razão social' : 'Informe o nome completo';
  if (!doc) {
    if (o.requireDocumento) er.cpf = o.isPJ ? 'Informe o CNPJ' : 'Informe o CPF';
  } else if (o.isPJ) {
    if (!isValidCNPJ(doc)) er.cpf = 'CNPJ inválido';
  } else if (!isValidCPF(doc)) {
    er.cpf = 'CPF inválido';
  }
  if (!tel) {
    if (o.requireDocumento) er.telefone = 'Informe o telefone';
  } else if (!isValidPhone(tel)) {
    er.telefone = 'Telefone incompleto';
  }
  if (form.email && !isValidEmail(form.email)) er.email = 'E-mail inválido';
  return er;
};

// ---------- Estados (storage em UF; nomes só para exibição) ----------

const STATES = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' }, { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' }, { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' }, { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' }, { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' }
];

// Aceita UF ("SP") ou nome ("São Paulo") e devolve o nome por extenso.
const estadoFromUf = (value) => {
  if (!value) return '';
  const needle = String(value).toLowerCase();
  const found = STATES.find((s) => s.uf.toLowerCase() === needle || s.nome.toLowerCase() === needle);
  return found ? found.nome : String(value);
};

// Aceita UF ou nome e devolve a UF de 2 letras (canônico para storage).
const ufFromEstado = (value) => {
  if (!value) return '';
  const needle = String(value).toLowerCase();
  const found = STATES.find((s) => s.uf.toLowerCase() === needle || s.nome.toLowerCase() === needle);
  return found ? found.uf : '';
};

// ---------- Sanitização / persistência ----------

const STORAGE_KEY = 'cadastro_clientes';
const COMPANY_KEY = 'datadoc_empresa';
const ONBOARDING_KEY = 'datadoc_onboarding_done';
const THEME_KEY = 'datadoc_theme';
const IMPORT_MAX_BYTES = 5 * 1024 * 1024;

const EMPTY_EMPRESA = {
  razaoSocial: '',
  cnpj: '',
  telefone: '',
  email: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cep: '',
  cidade: '',
  estado: ''
};

const sanitizeExtras = (raw) => {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item === 'object')
    .slice(0, 20)
    .map((item) => ({
      label: asText(item.label, 80).trim(),
      value: asText(item.value, 500)
    }))
    .filter((item) => item.label);
};

const sanitizeClient = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const nome = asText(raw.nome, 200).trim();
  const cpf = asText(raw.cpf, 32).trim();
  if (!nome || !cpf) return null;
  return {
    id: asText(raw.id, 64) || generateId(),
    tipoPessoa: raw.tipoPessoa === 'pj' ? 'pj' : 'pf',
    nome,
    cpf,
    nascimento: asText(raw.nascimento, 16),
    telefone: asText(raw.telefone, 32),
    email: asText(raw.email, 200),
    rua: asText(raw.rua, 200),
    numero: asText(raw.numero, 20),
    complemento: asText(raw.complemento, 100),
    bairro: asText(raw.bairro, 100),
    cep: asText(raw.cep, 16),
    cidade: asText(raw.cidade, 100),
    estado: ufFromEstado(raw.estado),
    camposExtras: sanitizeExtras(raw.camposExtras),
    criadoEm: asText(raw.criadoEm, 40) || new Date().toISOString(),
    atualizadoEm: asText(raw.atualizadoEm, 40) || new Date().toISOString()
  };
};

const sanitizeCompany = (raw) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...EMPTY_EMPRESA };
  return {
    razaoSocial: asText(raw.razaoSocial, 200),
    cnpj: asText(raw.cnpj, 32),
    telefone: asText(raw.telefone, 32),
    email: asText(raw.email, 200),
    rua: asText(raw.rua, 200),
    numero: asText(raw.numero, 20),
    complemento: asText(raw.complemento, 100),
    bairro: asText(raw.bairro, 100),
    cep: asText(raw.cep, 16),
    cidade: asText(raw.cidade, 100),
    estado: ufFromEstado(raw.estado)
  };
};

const loadClients = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeClient).filter(Boolean);
  } catch (e) {
    return [];
  }
};

const saveClients = (clients) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
    return true;
  } catch (e) {
    return false;
  }
};

const loadCompany = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(COMPANY_KEY) || 'null');
    if (!stored) return { ...EMPTY_EMPRESA };
    return sanitizeCompany(stored);
  } catch (e) {
    return { ...EMPTY_EMPRESA };
  }
};

const saveCompany = (data) => {
  try {
    localStorage.setItem(COMPANY_KEY, JSON.stringify(sanitizeCompany(data)));
    return true;
  } catch (e) {
    return false;
  }
};

// Dedup por id e também por documento+nome (reimportar o mesmo backup não duplica).
const mergeImportedClients = (incoming, existing) => {
  const usedIds = new Set(existing.map((c) => c.id));
  const usedKeys = new Set(existing.map((c) => (allDigits(c.cpf) + '|' + normalizeText(c.nome))));
  const prepared = [];
  incoming.forEach((c) => {
    const key = allDigits(c.cpf) + '|' + normalizeText(c.nome);
    if (usedKeys.has(key)) return; // já existe — ignora duplicata
    let next = c;
    if (!next.id || usedIds.has(next.id)) {
      next = { ...c, id: generateId() };
    }
    usedIds.add(next.id);
    usedKeys.add(key);
    prepared.push(next);
  });
  return [...prepared, ...existing];
};

// ---------- Importação (JSON / CSV / TXT) ----------

// Parser de delimitado com suporte a campos entre aspas (RFC 4180):
// aspas dobradas escapam aspas; separador detectado (';' ou tab); CR/LF dentro de aspas preservado.
const parseDelimited = (text, sep) => {
  const rows = [];
  let field = '';
  let row = [];
  let inQuotes = false;
  const s = String(text == null ? '' : text).replace(/^\uFEFF/, '');
  const firstLine = (s.split('\n')[0] || '');
  const separator = sep || (firstLine.includes('\t') ? '\t' : ';');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQuotes) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"' && field === '') { inQuotes = true; continue; }
    if (ch === separator) { row.push(field); field = ''; continue; }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
      continue;
    }
    field += ch;
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => String(v).trim() !== ''));
};

const CLIENT_EXPORT_HEADERS = ['tipoPessoa', 'nome', 'cpf', 'nascimento', 'telefone', 'email', 'rua', 'numero', 'complemento', 'bairro', 'cep', 'cidade', 'estado'];

// Converte uma linha/objeto bruto em cliente, lendo colunas alternativas.
const rowToClient = (obj) => {
  const get = (...keys) => {
    for (const k of keys) {
      if (obj[k] != null && String(obj[k]).trim() !== '') {
        let v = String(obj[k]).trim();
        // remove o marcador de proteção contra injeção de fórmula adicionado na exportação
        if (/^'[=+\-@]/.test(v)) v = v.slice(1);
        return v;
      }
    }
    return '';
  };
  const tipoRaw = get('tipoPessoa', 'tipo pessoa', 'tipo');
  const cpf = get('cpf', 'cnpj', 'documento');
  const digits = allDigits(cpf);
  // 'pj' explícito, ou inferido pelo tamanho do documento (14 dígitos = CNPJ)
  const tipoPessoa = /pj|jur/i.test(tipoRaw) ? 'pj'
    : (/pf|f[ií]s/i.test(tipoRaw) ? 'pf' : (digits.length > 11 ? 'pj' : 'pf'));
  return sanitizeClient({
    tipoPessoa,
    nome: get('nome', 'razão social', 'razao_social', 'razao social'),
    cpf,
    nascimento: get('nascimento', 'data de nascimento'),
    telefone: get('telefone'),
    email: get('email', 'e-mail'),
    rua: get('rua', 'endereço', 'endereco'),
    numero: get('numero'),
    complemento: get('complemento'),
    bairro: get('bairro'),
    cep: get('cep'),
    cidade: get('cidade'),
    estado: get('estado', 'uf')
  });
};

// Resultado: { clients: [...], skipped: N, errors: [motivos] }
const parseImportText = (text, filename) => {
  const name = String(filename || '').toLowerCase();
  const result = { clients: [], skipped: 0, errors: [], empresa: null };
  if (name.endsWith('.json')) {
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      result.errors.push('JSON inválido: ' + (e && e.message ? e.message : 'formato incorreto'));
      return result;
    }
    const arr = data && Array.isArray(data.clientes) ? data.clientes : (Array.isArray(data) ? data : [data]);
    if (data && data.empresa && typeof data.empresa === 'object') result.empresa = sanitizeCompany(data.empresa);
    arr.forEach((item) => {
      const c = item && typeof item === 'object' && !Array.isArray(item) ? rowToClient(item) : null;
      if (c) result.clients.push(c); else result.skipped++;
    });
    return result;
  }
  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    const rows = parseDelimited(text);
    if (rows.length < 2) {
      result.errors.push('Arquivo vazio ou sem registros além do cabeçalho');
      return result;
    }
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    rows.slice(1).forEach((vals) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      const c = rowToClient(obj);
      if (c) result.clients.push(c); else result.skipped++;
    });
    return result;
  }
  result.errors.push('Formato não suportado (use JSON, CSV ou TXT)');
  return result;
};

// ---------- Exportação (JSON / CSV / TXT) ----------

// Escapa um campo CSV/TXT (RFC 4180) e neutraliza injeção de fórmula no Excel.
const escapeDelimited = (value) => {
  let s = String(value == null ? '' : value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  if (/[;"\n\r\t]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
  return s;
};

const serializeDelimited = (clients, sep) => {
  const lines = [CLIENT_EXPORT_HEADERS.join(sep)];
  clients.forEach((c) => {
    lines.push(CLIENT_EXPORT_HEADERS.map((h) => {
      const v = h === 'tipoPessoa' ? (c.tipoPessoa || 'pf') : (c[h] || '');
      return escapeDelimited(v);
    }).join(sep));
  });
  return lines.join('\n');
};

const serializeCSV = (clients) => '\uFEFF' + serializeDelimited(clients, ';');
const serializeTXT = (clients) => serializeDelimited(clients, '\t');

// ---------- Markdown seguro (changelog / release notes) ----------

const escapeHTML = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Escapa TODO o texto antes de aplicar os padrões de markdown — nada do conteúdo
// remoto chega ao DOM como HTML vivo.
// Cada linha vira um bloco (heading / item / texto) e linhas em branco são
// descartadas: o espaçamento fica só no CSS, sem <br/> empilhados.
const renderMarkdownSafe = (text, opts) => {
  const o = Object.assign({ headingStyle: '' }, opts || {});
  if (!text) return '';
  const headingStyle = o.headingStyle ? ` style="${o.headingStyle}"` : '';
  return escapeHTML(text)
    .split(/\r?\n/)
    .map((raw) => {
      const line = raw.trim();
      if (!line) return '';
      let m;
      if ((m = line.match(/^#{1,3}\s+(.+)$/))) return `<strong class="md-heading"${headingStyle}>${m[1]}</strong>`;
      if ((m = line.match(/^[-*]\s+(.+)$/))) return `<span class="changelog-item">• ${m[1]}</span>`;
      return `<span class="md-line">${line}</span>`;
    })
    .filter(Boolean)
    .join('');
};

// Extrai a seção de uma versão específica do changelog (sem o heading),
// parando no próximo heading — espelha scripts/extract-changelog.sh.
const extractChangelogSection = (text, version) => {
  if (!text || !version) return '';
  const target = String(version).replace(/^v/i, '').trim().toLowerCase();
  if (!target) return '';
  const lines = String(text).split(/\r?\n/);
  const out = [];
  let collecting = false;
  for (const line of lines) {
    const trimmed = line.trim();
    // Só headings `##` delimitam versões; `###` são subseções dentro da entrada
    const heading = trimmed.match(/^##\s+\[?v?([^\]\s]+)\]?/i);
    if (heading) {
      if (collecting) break;
      if (heading[1].toLowerCase() === target) collecting = true;
      continue;
    }
    if (collecting) out.push(line);
  }
  return out.join('\n').trim();
};

// ---------- Tema ----------

const normalizeTheme = (value) => (value === 'dark' ? 'dark' : 'light');

const applyTheme = (value) => {
  const theme = normalizeTheme(value);
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) { /* quota */ }
  return theme;
};

// ---------- Export para testes em Node ----------

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    asText, allDigits, digitsOnly, formatCPF, formatCNPJ, formatPhone, formatCEP,
    formatDate, localDateISO, generateId, safeFilename, normalizeText,
    isValidCPF, isValidCNPJ, isValidEmail, isValidPhone, validatePerson,
    STATES, estadoFromUf, ufFromEstado,
    STORAGE_KEY, COMPANY_KEY, ONBOARDING_KEY, THEME_KEY, IMPORT_MAX_BYTES, EMPTY_EMPRESA,
    sanitizeExtras, sanitizeClient, sanitizeCompany, loadClients, saveClients, loadCompany, saveCompany,
    mergeImportedClients,
    parseDelimited, rowToClient, parseImportText, CLIENT_EXPORT_HEADERS,
    escapeDelimited, serializeDelimited, serializeCSV, serializeTXT,
    escapeHTML, renderMarkdownSafe, extractChangelogSection, normalizeTheme, applyTheme
  };
}
