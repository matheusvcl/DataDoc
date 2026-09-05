// Import Screen
function ImportScreen({ onBack, showToast }) {
  const [fileData, setFileData] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > IMPORT_MAX_BYTES) {
      showToast('Arquivo muito grande (máximo 5 MB)');
      return;
    }
    const name = asText(file.name, 180);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target.result || '');
        if (name.toLowerCase().endsWith('.json')) {
          const data = JSON.parse(text);
          if (data && Array.isArray(data.clientes)) {
            const valid = data.clientes.map(sanitizeClient).filter(Boolean);
            setFileData({
              name,
              type: 'json',
              isBackup: true,
              hasEmpresa: !!(data.empresa && typeof data.empresa === 'object'),
              empresa: data.empresa && typeof data.empresa === 'object' ? sanitizeCompany(data.empresa) : null
            });
            setPreview(valid);
          } else {
            const arr = Array.isArray(data) ? data : [data];
            const valid = arr.map(sanitizeClient).filter(Boolean);
            setFileData({ name, type: 'json', empresa: null });
            setPreview(valid);
          }
        } else if (name.toLowerCase().endsWith('.csv') || name.toLowerCase().endsWith('.txt')) {
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          if (lines.length < 2) throw new Error('Arquivo vazio');
          const sep = lines[0].includes('\t') ? '\t' : ';';
          const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
          const rows = lines.slice(1).map((line) => {
            const vals = line.split(sep).map((v) => v.trim());
            const obj = {};
            headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
            return sanitizeClient({
              tipoPessoa: 'pf',
              nome: obj.nome || obj['razão social'] || obj.razao_social || '',
              cpf: obj.cpf || obj.cnpj || obj.documento || '',
              nascimento: obj.nascimento || obj['data de nascimento'] || '',
              telefone: obj.telefone || '',
              email: obj.email || obj['e-mail'] || '',
              rua: obj.rua || obj.endereço || obj.endereco || '',
              numero: obj.numero || '',
              complemento: obj.complemento || '',
              bairro: obj.bairro || '',
              cep: obj.cep || '',
              cidade: obj.cidade || '',
              estado: obj.estado || ''
            });
          }).filter(Boolean);
          setFileData({ name, type: name.toLowerCase().endsWith('.txt') ? 'txt' : 'csv', empresa: null });
          setPreview(rows);
        } else {
          throw new Error('Formato não suportado');
        }
      } catch (err) {
        showToast('Erro ao ler arquivo: ' + (err && err.message ? err.message : 'formato inválido'));
        setFileData(null);
        setPreview([]);
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
    const msg = fileData && fileData.isBackup
      ? `Backup restaurado: ${preview.length} cliente${preview.length !== 1 ? 's' : ''}${fileData.hasEmpresa ? ' + dados da empresa' : ''}`
      : `${preview.length} cliente${preview.length !== 1 ? 's' : ''} importado${preview.length !== 1 ? 's' : ''} com sucesso`;
    showToast(msg);
    setFileData(null);
    setPreview([]);
    setImporting(false);
    if (fileRef.current) fileRef.current.value = '';
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
                  <span className="import-preview-count">{preview.length} registro{preview.length !== 1 ? 's' : ''} encontrado{preview.length !== 1 ? 's' : ''}</span>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => { setFileData(null); setPreview([]); if (fileRef.current) fileRef.current.value = ''; }}>
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
                          <th>Documento</th>
                          <th>Telefone</th>
                          <th>Cidade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.slice(0, 20).map((c, i) => (
                          <tr key={i}>
                            <td><span className="client-name">{c.nome}</span></td>
                            <td><span className="client-doc">{c.cpf}</span></td>
                            <td>{c.telefone || '—'}</td>
                            <td>{[c.cidade, c.estado].filter(Boolean).join('/') || '—'}</td>
                          </tr>
                        ))}
                        {preview.length > 20 && (
                          <tr>
                            <td colSpan={4} className="table-empty-note">
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
                <div className="import-help-desc">Separado por ponto e vírgula (;). Primeira linha deve conter os cabeçalhos.</div>
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
