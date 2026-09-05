// Sidebar
function Sidebar({ active, onNav }) {
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('datadoc.sidebar.collapsed') === '1'; } catch (e) { return false; }
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('datadoc.sidebar.collapsed', next ? '1' : '0');
        if (next) {
          document.documentElement.setAttribute('data-sidebar-collapsed', '1');
        } else {
          document.documentElement.removeAttribute('data-sidebar-collapsed');
        }
      } catch (e) {}
      return next;
    });
  };

  const items = [
    { id: 'welcome', label: 'Início', icon: Icons.home },
    { id: 'cadastro', label: 'Novo Cadastro', icon: Icons.user },
    { id: 'empresa', label: 'Empresa', icon: Icons.building },
    { id: 'preview', label: 'Visualização', icon: Icons.fileText },
    { id: 'historico', label: 'Histórico', icon: Icons.clock },
    { id: 'exportar', label: 'Exportar', icon: Icons.download },
    { id: 'importar', label: 'Importar', icon: Icons.upload },
    { id: 'configuracoes', label: 'Configurações', icon: Icons.settings },
  ];
  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} data-od-id="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="favicon.png" alt="DataDoc" className="sidebar-logo-img" />
          <span className="sidebar-logo-text">DataDoc</span>
        </div>
        <button className="sidebar-toggle" onClick={toggleCollapsed} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M9 3v18"/>
            <path className="arrow-open" d="m13.5 12 3-3-3 3 3 3"/>
            <path className="arrow-collapsed" d="m16.5 12-3-3 3 3-3 3"/>
          </svg>
        </button>
      </div>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        {items.map(it => (
          <button
            key={it.id}
            className={`nav-item${active === it.id ? ' active' : ''}`}
            onClick={() => onNav(it.id)}
            title={collapsed ? it.label : undefined}
          >
            {it.icon}
            <span className="nav-label">{it.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}


// App
function App() {
  const [screen, setScreen] = useState('welcome');
  const [previewClient, setPreviewClient] = useState(null);
  const [editData, setEditData] = useState(null);
  const [toast, setToast] = useState(null);
  const [empresaData, setEmpresaData] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(() => localStorage.getItem(ONBOARDING_KEY) === 'true');
  const [postOnboardingImport, setPostOnboardingImport] = useState(false);

  const showToast = useCallback((msg) => setToast(msg), []);

  const handlePreview = (client) => {
    setPreviewClient(client);
    setScreen('preview');
  };

  const handleEdit = (client) => {
    setEditData(client);
    setScreen('cadastro');
  };

  const handleNav = (id) => {
    setEditData(null);
    setScreen(id);
  };

  const handleGeneratePDF = (empresa) => {
    setEmpresaData(empresa);
    if (previewClient) {
      setScreen('preview');
    } else {
      showToast('Cadastre um cliente primeiro');
      setScreen('cadastro');
    }
  };

  if (!onboardingDone) {
    return (
      <OnboardingFlow onComplete={(hadImport) => {
        setOnboardingDone(true);
        if (hadImport) {
          setPostOnboardingImport(true);
        }
      }} />
    );
  }

  if (postOnboardingImport) {
    return (
      <div className="app-layout">
        <Sidebar active="importar" onNav={(id) => { setPostOnboardingImport(false); handleNav(id); }} />
        <main className="main-content" data-od-id="main-content">
          <ImportScreen
            onBack={() => setPostOnboardingImport(false)}
            showToast={showToast}
          />
        </main>
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar active={screen} onNav={handleNav} />
      <main className="main-content" data-od-id="main-content">
        {screen === 'welcome' && (
          <WelcomeScreen onNav={handleNav} onPreview={handlePreview} />
        )}
        {screen === 'cadastro' && (
          <CadastroScreen
            onPreview={handlePreview}
            onGoEmpresa={(client) => { setPreviewClient(client); setScreen('empresa'); }}
            editData={editData}
            onClearEdit={() => setEditData(null)}
            showToast={showToast}
          />
        )}
        {screen === 'empresa' && (
          <EmpresaScreen
            clientData={previewClient}
            onBack={() => setScreen('cadastro')}
            onContinue={(empresa) => { setEmpresaData(empresa); setScreen('preview'); }}
            showToast={showToast}
          />
        )}
        {screen === 'importar' && (
          <ImportScreen
            onBack={() => setScreen('welcome')}
            showToast={showToast}
          />
        )}
        {screen === 'exportar' && (
          <ExportScreen
            onBack={() => setScreen('welcome')}
            showToast={showToast}
          />
        )}
        {screen === 'preview' && (
          <PreviewScreen
            client={previewClient}
            empresa={empresaData || loadCompany()}
            onEdit={handleEdit}
            onBack={() => setScreen('empresa')}
          />
        )}
        {screen === 'historico' && (
          <HistoricoScreen
            onPreview={handlePreview}
            onEdit={handleEdit}
            showToast={showToast}
          />
        )}
        {screen === 'configuracoes' && (
          <SettingsScreen showToast={showToast} />
        )}
      </main>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <UpdateManager showToast={showToast} />
    </div>
  );
}

// Desabilitar menu de contexto do navegador
document.addEventListener('contextmenu', e => e.preventDefault());

ReactDOM.createRoot(document.getElementById('root')).render(<App />);