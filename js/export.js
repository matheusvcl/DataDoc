// Export Screen
function ExportScreen({ onBack, showToast }) {
  const [format, setFormat] = useState('json');
  const [preview, setPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const handlePreview = () => {
    const clients = loadClients();
    setPreview(clients.slice(0, 50));
    setShowPreview(true);
  };

  const handleExport = () => {
    const clients = loadClients();
    const empresa = loadCompany();
    const today = localDateISO();

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
      a.download = `datadoc-backup-${today}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const blob = new Blob([serializeCSV(clients)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datadoc-clientes-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'txt') {
      const blob = new Blob([serializeTXT(clients)], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `datadoc-clientes-${today}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }

    showToast(`${clients.length} cliente${clients.length !== 1 ? 's' : ''} exportado${clients.length !== 1 ? 's' : ''} como ${format.toUpperCase()}`);
  };

  const filteredCount = loadClients().length;

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
                { id: 'json', label: 'JSON', desc: 'Array de objetos com campos: nome, cpf, telefone, email, cidade, estado, etc.' },
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
            <div className="empty-state-text">Cadastre ou importe clientes para exportar.</div>
          </div>
        )}
      </div>
    </>
  );
}
