// History Screen
function HistoricoScreen({ onPreview, onEdit, showToast }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    setClients(loadClients());
  }, []);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nome = String(c.nome || '').toLowerCase();
    const doc = String(c.cpf || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return nome.includes(search.toLowerCase()) || doc.includes(q);
  }).sort((a, b) => {
    const ca = [a.cidade, a.estado].filter(Boolean).join('/').toLowerCase();
    const cb = [b.cidade, b.estado].filter(Boolean).join('/').toLowerCase();
    return ca.localeCompare(cb, 'pt-BR');
  });

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const updated = clients.filter(c => c.id !== deleteTarget.id);
    saveClients(updated);
    setClients(updated);
    setDeleteTarget(null);
    showToast('Cadastro removido');
  };

  return (
    <>
      <div className="page-header" data-od-id="historico-header">
        <h1 className="page-title">Histórico de Cadastros</h1>
        <p className="page-subtitle">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="page-body">
        <div className="historico-toolbar" data-od-id="historico-search">
          <div className="search-bar">
            {Icons.search}
            <input
              placeholder="Buscar por nome, razão social, CPF ou CNPJ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Buscar por nome, razão social, CPF ou CNPJ"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state" data-od-id="historico-empty">
            {Icons.users}
            <div className="empty-state-title">{search ? 'Nenhum resultado' : 'Nenhum cadastro'}</div>
            <div className="empty-state-text">
              {search ? 'Tente buscar com outros termos.' : 'Cadastre seu primeiro cliente para vê-lo aqui.'}
            </div>
          </div>
        ) : (
          <div className="card" data-od-id="historico-table">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Documento</th>
                    <th>Telefone</th>
                    <th>Cidade</th>
                    <th>Cadastrado em</th>
                    <th className="actions-cell"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td><span className="client-name">{c.nome}</span></td>
                      <td><span className="badge badge-muted">{(c.tipoPessoa || 'pf') === 'pj' ? 'PJ' : 'PF'}</span></td>
                      <td><span className="client-doc">{c.cpf}</span></td>
                      <td>{c.telefone || '—'}</td>
                      <td>{[c.cidade, c.estado].filter(Boolean).join('/') || '—'}</td>
                      <td className="cell-date">
                        {c.criadoEm ? new Date(c.criadoEm).toLocaleDateString('pt-BR') : '—'}
                      </td>
                      <td>
                        <div className="row-actions">
                          <button title="Visualizar" aria-label={`Visualizar cadastro de ${c.nome}`} onClick={() => onPreview(c)}>
                            {Icons.eye}
                          </button>
                          <button title="Editar" aria-label={`Editar cadastro de ${c.nome}`} onClick={() => onEdit(c)}>
                            {Icons.edit}
                          </button>
                          <button title="Excluir" aria-label={`Excluir cadastro de ${c.nome}`} onClick={() => setDeleteTarget(c)}>
                            {Icons.trash}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {deleteTarget && (
        <ConfirmDialog
          title="Excluir cadastro"
          message={`Tem certeza que deseja excluir o cadastro de ${deleteTarget.nome}? Esta ação não pode ser desfeita.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
