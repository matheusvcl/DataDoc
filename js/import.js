// Import Screen
function ImportScreen({ onBack, showToast }) {
  const [fileData, setFileData] = useState(null);
  const [preview, setPreview] = useState([]);
  const [skipped, setSkipped] = useState(0);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const resetInput = () => { if (fileRef.current) fileRef.current.value = ''; };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > IMPORT_MAX_BYTES) {
      showToast('Arquivo muito grande (máximo 5 MB)');
      resetInput();
      return;
    }
    const name = asText(file.name, 180);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target.result || '');
        const parsed = parseImportText(text, name);
        if (parsed.errors.length > 0) {
          showToast('Erro ao ler arquivo: ' + parsed.errors[0]);
          setFileData(null);
          setPreview([]);
          setSkipped(0);
          resetInput();
          return;
        }
        setFileData({
          name,
          type: name.toLowerCase().endsWith('.json') ? 'json' : (name.toLowerCase().endsWith('.txt') ? 'txt' : 'csv'),
          isBackup: !!parsed.empresa,
          hasEmpresa: !!parsed.empresa,
          empresa: parsed.empresa
        });
        setPreview(parsed.clients);
        setSkipped(parsed.skipped);
      } catch (err) {
        showToast('Erro ao ler arquivo: formato inválido');
        setFileData(null);
        setPreview([]);
        setSkipped(0);
        resetInput();
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (preview.length === 0) return;
    setImporting(true);
    const existing = loadClients();
    const merged = mergeImportedClients(preview, existing);
    if (!saveClients(merged)) {
      setImporting(false);
      showToast('Não foi possível importar. Espaço de armazenamento insuficiente.');
      return;
    }
    if (fileData && fileData.empresa) saveCompany(fileData.empresa);
    const added = merged.length - existing.length;
    const skippedNote = skipped > 0 ? ` (${skipped} registro${skipped !== 1 ? 's' : ''} ignorado${skipped !== 1 ? 's' : ''})` : '';
    const msg = fileData && fileData.isBackup
      ? `Backup restaurado: ${added} cliente${added !== 1 ? 's' : ''}${fileData.hasEmpresa ? ' + dados da empresa' : ''}${skippedNote}`
      : `${added} cliente${added !== 1 ? 's' : ''} importado${added !== 1 ? 's' : ''} com sucesso${skippedNote}`;
    showToast(msg);
    setFileData(null);
    setPreview([]);
    setSkipped(0);
    setImporting(false);
    resetInput();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = fileRef.current;
      if (input) {
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  };

  return (
    <>
      <div className="page-header" data-od-id="import-header">
        <div className="header-with-back">
          <button className="btn btn-ghost btn-sm btn-back" onClick={onBack} aria-label="Voltar">
            {Icons.arrowLeft}
          </button>
          <div>
            <h1 className="page-title">Importar Clientes</h1>
            <p className="page-subtitle">Importe dados de arquivos JSON, CSV ou TXT</p>
          </div>
        </div>
      </div>
      <div className="page-body">
        <div className="import-area" data-od-id="import-dropzone">
          <div
            className="import-dropzone"
            onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Selecionar arquivo para importar"
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); }}}
          >
            <div className="import-dropzone-icon">{Icons.upload}</div>
            <div className="import-dropzone-title">Arraste um arquivo aqui</div>
            <div className="import-dropzone-desc">ou clique para selecionar • JSON, CSV ou TXT</div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,.csv,.txt"
              onChange={handleFile}
              className="hidden-input"
              aria-label="Selecionar arquivo"
            />
          </div>

          {fileData && (
            <div className="import-preview" data-od-id="import-preview">
              <div className="import-preview-header">
                <div>
                  <span className="import-preview-name">{fileData.name}</span>
                  <span className="import-preview-count">
                    {preview.length} registro{preview.length !== 1 ? 's' : ''} válido{preview.length !== 1 ? 's' : ''}
                    {skipped > 0 ? ` • ${skipped} ignorado${skipped !== 1 ? 's' : ''} (sem nome/documento)` : ''}
                  </span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setFileData(null); setPreview([]); setSkipped(0); resetInput(); }}>
                  {Icons.x}
                </button>
              </div>

              {preview.length > 0 ? (
                <>
                  <div className="table-wrapper table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th>Documento</th>
                          <th>Telefone</th>
                          <th>Cidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(0, 20).map((c, i) => (
                          <tr key={i}>
                            <td><span className="client-name">{c.nome}</span></td>
                            <td><span className="badge badge-muted">{(c.tipoPessoa || 'pf') === 'pj' ? 'PJ' : 'PF'}</span></td>
                            <td><span className="client-doc">{c.cpf}</span></td>
                            <td>{c.telefone || '—'}</td>
                            <td>{[c.cidade, c.estado].filter(Boolean).join('/') || '—'}</td>
                          </tr>
                        ))}
                        {preview.length > 20 && (
                          <tr>
                            <td colSpan={5} className="table-empty-note">
                              + {preview.length - 20} outros registros
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="import-actions">
                    <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
                      {importing ? 'Importando...' : `Importar ${preview.length} cliente${preview.length !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-title">Nenhum registro válido</div>
                  <div className="empty-state-text">O arquivo não contém dados com nome e documento.</div>
                </div>
              )}
            </div>
          )}

          <div className="import-help" data-od-id="import-help">
            <div className="section-label">Formatos Suportados</div>
            <div className="import-help-grid">
              <div className="import-help-item">
                <div className="import-help-title">JSON</div>
                <div className="import-help-desc">Array de objetos com campos: nome, cpf, telefone, email, cidade, estado, etc.</div>
              </div>
              <div className="import-help-item">
                <div className="import-help-title">CSV</div>
                <div className="import-help-desc">Separado por ponto e vírgula (;), com suporte a campos entre aspas. Primeira linha deve conter os cabeçalhos.</div>
              </div>
              <div className="import-help-item">
                <div className="import-help-title">TXT</div>
                <div className="import-help-desc">Separado por ponto e vírgula (;) ou tab. Primeira linha deve conter os cabeçalhos.</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
