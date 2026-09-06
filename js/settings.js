// Settings Screen
function SettingsScreen({ showToast }) {
  const [theme, setTheme] = useState(() => {
    try {
      return normalizeTheme(localStorage.getItem(THEME_KEY));
    } catch (e) {
      return 'light';
    }
  });
  const [appVersion, setAppVersion] = useState('...');
  const [changelog, setChangelog] = useState(null);
  const [loadingChangelog, setLoadingChangelog] = useState(false);

  useEffect(() => {
    const tauri = window.__TAURI__;
    if (tauri && tauri.app) {
      tauri.app.getVersion().then(v => setAppVersion(v)).catch(() => {});
    }
  }, []);

  // Parse markdown to simple HTML for changelog display
  const parseChangelog = (text) => {
    if (!text) return '';
    return text
      .replace(/^### (.+)$/gm, '<strong>$1</strong>')
      .replace(/^## (.+)$/gm, '<strong style="font-size:14px">$1</strong>')
      .replace(/^- (.+)$/gm, '<span class="changelog-item">• $1</span>')
      .replace(/\n/g, '<br/>');
  };

  const fetchChangelog = async () => {
    if (changelog) {
      setChangelog(null);
      return;
    }
    setLoadingChangelog(true);
    try {
      // Determine which changelog to fetch based on version
      const isBeta = appVersion.includes('beta') || appVersion.includes('alpha') || appVersion.includes('rc');
      const changelogFile = isBeta ? 'CHANGELOG_BETA.md' : 'CHANGELOG.md';
      const branch = isBeta ? 'dev' : 'main';
      const response = await fetch(`https://raw.githubusercontent.com/matheusvcl/DataDoc/${branch}/changelogs/${changelogFile}`);
      if (response.ok) {
        const text = await response.text();
        setChangelog(text);
      } else {
        showToast('Erro ao carregar changelog');
      }
    } catch (err) {
      showToast('Erro ao carregar changelog');
    }
    setLoadingChangelog(false);
  };

  const handleTheme = (t) => {
    const next = applyTheme(t);
    setTheme(next);
    showToast(next === 'dark' ? 'Modo escuro ativado' : 'Modo claro ativado');
  };

  return (
    <>
      <div className="page-header" data-od-id="settings-header">
        <h1 className="page-title">Configurações</h1>
        <p className="page-subtitle">Personalize o aplicativo</p>
      </div>
      <div className="page-body">
        <div className="settings-sections settings-wrap">

          {/* Tema */}
          <div className="settings-section">
            <span className="section-label">Aparência</span>
            <div className="theme-toggle-group">
              <button
                className={`theme-toggle-card${theme === 'light' ? ' active' : ''}`}
                onClick={() => handleTheme('light')}
              >
                <div className="theme-toggle-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                </div>
                <div className="theme-toggle-info">
                  <div className="theme-toggle-label">Claro</div>
                  <div className="theme-toggle-desc">Fundo branco, texto escuro</div>
                </div>
                {theme === 'light' && <span className="theme-toggle-check">{Icons.check}</span>}
              </button>

              <button
                className={`theme-toggle-card${theme === 'dark' ? ' active' : ''}`}
                onClick={() => handleTheme('dark')}
              >
                <div className="theme-toggle-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                </div>
                <div className="theme-toggle-info">
                  <div className="theme-toggle-label">Escuro</div>
                  <div className="theme-toggle-desc">Fundo escuro, texto claro</div>
                </div>
                {theme === 'dark' && <span className="theme-toggle-check">{Icons.check}</span>}
              </button>
            </div>
          </div>

          {/* Atualizações */}
          <div className="settings-section">
            <span className="section-label">Atualizações</span>
            <div className="settings-card">
              <div className="settings-card-row">
                <div className="settings-card-info">
                  <div className="settings-card-label">Versão atual</div>
                  <div className="settings-card-value">{appVersion}</div>
                </div>
                <div className="settings-card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => window.checkForUpdates && window.checkForUpdates(false)}
                  >
                    Verificar atualizações
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={fetchChangelog}
                    disabled={loadingChangelog}
                  >
                    {loadingChangelog ? 'Carregando...' : changelog ? 'Fechar changelog' : 'Ver changelog'}
                  </button>
                </div>
              </div>
              <div className="settings-card-desc">
                O DataDoc verifica atualizações automaticamente ao iniciar.
              </div>
              {changelog && (
                <div className="changelog-content">
                  <div 
                    className="changelog-parsed"
                    dangerouslySetInnerHTML={{ __html: parseChangelog(changelog) }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sobre */}
          <div className="settings-section">
            <span className="section-label">Sobre</span>
            <div className="settings-card">
              <div className="settings-about-logo">
                <img src="favicon.png" alt="DataDoc" className="settings-about-logo-img" />
                <span>DataDoc</span>
              </div>
              <div className="settings-about-desc">
                Gerencie cadastros e documentos de forma simples e organizada.
              </div>
              <div className="settings-about-meta">
                <div className="settings-about-row">
                  <span className="settings-about-label">Versão</span>
                  <span className="settings-about-value">{appVersion}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
