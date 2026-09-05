// Welcome Screen
function WelcomeScreen({ onNav, onPreview }) {
  const [clients, setClients] = useState(() => loadClients());
  const empresa = loadCompany();
  const hasCompany = !!(empresa.razaoSocial || empresa.cnpj);
  const recentClients = clients.slice(0, 3);

  useEffect(() => {
    setClients(loadClients());
  }, []);

  return (
    <>
      <div className="page-header" data-od-id="welcome-header">
        <h1 className="page-title">Bem-vindo ao DataDoc</h1>
        <p className="page-subtitle">Gerencie cadastros e documentos de forma simples</p>
      </div>
      <div className="page-body">
        <div className="welcome-grid" data-od-id="welcome-actions">
          <button className="welcome-card" onClick={() => onNav('cadastro')}>
            <div className="welcome-card-icon">{Icons.filePlus}</div>
            <div className="welcome-card-content">
              <div className="welcome-card-title">Novo Cadastro</div>
              <div className="welcome-card-desc">Cadastrar um novo cliente</div>
            </div>
          </button>
          <button className="welcome-card" onClick={() => onNav('empresa')}>
            <div className="welcome-card-icon">{Icons.building}</div>
            <div className="welcome-card-content">
              <div className="welcome-card-title">Dados da Empresa</div>
              <div className="welcome-card-desc">{hasCompany ? 'Editar informações' : 'Configurar sua empresa'}</div>
            </div>
          </button>
          <button className="welcome-card" onClick={() => onNav('historico')}>
            <div className="welcome-card-icon">{Icons.clock}</div>
            <div className="welcome-card-content">
              <div className="welcome-card-title">Histórico</div>
              <div className="welcome-card-desc">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</div>
            </div>
          </button>
          <button className="welcome-card" onClick={() => onNav('importar')}>
            <div className="welcome-card-icon">{Icons.upload}</div>
            <div className="welcome-card-content">
              <div className="welcome-card-title">Importar Clientes</div>
              <div className="welcome-card-desc">Importar dados de arquivos</div>
            </div>
          </button>
          <button className="welcome-card" onClick={() => onNav('exportar')}>
            <div className="welcome-card-icon">{Icons.download}</div>
            <div className="welcome-card-content">
              <div className="welcome-card-title">Exportar Dados</div>
              <div className="welcome-card-desc">Backup de clientes e empresa</div>
            </div>
          </button>
        </div>

        {recentClients.length > 0 && (
          <div className="welcome-recent" data-od-id="welcome-recent">
            <div className="section-label">Cadastros Recentes</div>
            <div className="welcome-recent-list">
              {recentClients.map(c => (
                <button key={c.id} className="welcome-recent-item" onClick={() => onPreview(c)}>
                  <div className="welcome-recent-avatar">{(c.nome || '?').charAt(0).toUpperCase()}</div>
                  <div className="welcome-recent-info">
                    <div className="welcome-recent-name">{c.nome}</div>
                    <div className="welcome-recent-doc">{c.cpf}</div>
                  </div>
                  <span className="badge badge-muted">{(c.tipoPessoa || 'pf') === 'pj' ? 'PJ' : 'PF'}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
