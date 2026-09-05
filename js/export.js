// Export Screen
function ExportScreen({ onBack, showToast }) {
  const [format, setFormat] = useState('json');
  const [scope, setScope] = useState('all');
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const getFilteredClients = () => {
    const clients = loadClients();
    if (scope === 'all') return clients;
    if (scope === 'pf') return clients.filter(c => (c.tipoPessoa || 'pf') === 'pf');
    if (scope === 'pj') return clients.filter(c => (c.tipoPessoa || 'pf') === 'pj');
    return clients;
  };

  const handlePreview = () => {
    const clients = getFilteredClients();
    setPreview(clients.slice(0, 50));
    setShowPreview(true);
  };

  const handleExport = () => {
    const clients = getFilteredClients();
    const empresa = loadCompany();

    if (format === 'json') {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        empresa: empresa,
        clientes: clients
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datadoc-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const headers = ['nome','tipoPessoa','cpf','nascimento','telefone','email','rua','numero','complemento','bairro','cep','cidade','estado'];
      const rows = clients.map(c => headers.map(h => (c[h] || '').replace(/;/g, ',')).join(';'));
      const csv = [headers.join(';'), ...rows].join('\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datadoc-clientes-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'txt') {
      const headers = ['nome','tipoPessoa','cpf','nascimento','telefone','email','rua','numero','complemento','bairro','cep','cidade','estado'];
      const rows = clients.map(c => headers.map(h => (c[h] || '')).join('\t'));
      const txt = [headers.join('\t'), ...rows].join('\n');
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datadoc-clientes-${new Date().toISOString().slice(0,10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    showToast(`${clients.length} cliente${clients.length !== 1 ? 's' : ''} exportado${clients.length !== 1 ? 's' : ''} como ${format.toUpperCase()}`);
  };

  const filteredCount = getFilteredClients().length;

  return (
    <>
      <div className="page-header" data-od-id="export-header">
        <div className="header-with-back">
          <button className="btn btn-ghost btn-sm btn-back" onClick={onBack} aria-label="Voltar">
            {Icons.arrowLeft}
          </button>
          <div>
            <h1 className="page-title">Exportar Dados</h1>
            <p className="page-subtitle">Exporte seus dados em diferentes formatos</p>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="form-grid export-wrap" data-od-id="export-options">
          <div className="form-group full-width">
            <span className="section-label">Formato</span>
          </div>
          <div className="form-group full-width">
            <div className="export-format-grid">
              {[
                { id: 'json', label: 'JSON', desc: 'Backup completo (clientes + empresa)' },
                { id: 'csv', label: 'CSV', desc: 'Planilha, separado por ponto e vírgula' },
                { id: 'txt', label: 'TXT', desc: 'Texto simples, separado por tab' }
              ].map(f => (
                <button key={f.id} className={`export-format-card${format === f.id ? ' active' : ''}`} onClick={() => setFormat(f.id)}>
                  <div className="export-format-label">{f.label}</div>
                  <div className="export-format-desc">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group full-width section-spacer">
            <span className="section-label">Escopo</span>
          </div>
          <div className="form-group full-width">
            <div className="export-scope-grid">
              {[
                { id: 'all', label: 'Todos', count: loadClients().length },
                { id: 'pf', label: 'Pessoa Física', count: loadClients().filter(c => (c.tipoPessoa || 'pf') === 'pf').length },
                { id: 'pj', label: 'Pessoa Jurídica', count: loadClients().filter(c => (c.tipoPessoa || 'pf') === 'pj').length }
              ].map(s => (
                <button key={s.id} className={`export-scope-card${scope === s.id ? ' active' : ''}`} onClick={() => setScope(s.id)}>
                  <span>{s.label}</span>
                  <span className="badge badge-muted">{s.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group full-width">
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={handlePreview}>
                {Icons.eye}
                Visualizar
              </button>
              <button className="btn btn-primary" onClick={handleExport} disabled={filteredCount === 0}>
                {Icons.download}
                Exportar {filteredCount} cliente{filteredCount !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>

        {showPreview && preview.length > 0 && (
          <div className="card export-preview-card" data-od-id="export-preview">
            <div className="card-header">
              <span className="section-label">Pré-visualização ({preview.length} de {filteredCount})</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPreview(false)} aria-label="Fechar pré-visualização">{Icons.x}</button>
            </div>
            <div className="table-wrapper table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Documento</th>
                    <th>Telefone</th>
                    <th>Cidade</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((c, i) => (
                    <tr key={i}>
                      <td><span className="client-name">{c.nome}</span></td>
                      <td><span className="client-doc">{c.cpf}</span></td>
                      <td>{c.telefone || '—'}</td>
                      <td>{[c.cidade, c.estado].filter(Boolean).join('/') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showPreview && preview.length === 0 && (
          <div className="empty-state">
            {Icons.users}
            <div className="empty-state-title">Nenhum cliente encontrado</div>
            <div className="empty-state-text">Não há clientes no escopo selecionado.</div>
          </div>
        )}
      </div>
    </>
  );
}
