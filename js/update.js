// Update System
function UpdateManager({ showToast }) {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [bytesRid, setBytesRid] = useState(null);
  const [changelogText, setChangelogText] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [error, setError] = useState(null);

  // Changelog da versão disponível (dev/main + CHANGELOG_BETA.md/CHANGELOG.md),
  // com fallback para o body do release.
  const fetchUpdateChangelog = async (version) => {
    try {
      const isBeta = /(beta|alpha|rc)/i.test(version);
      const branch = isBeta ? 'dev' : 'main';
      const file = isBeta ? 'CHANGELOG_BETA.md' : 'CHANGELOG.md';
      const response = await fetch(`https://raw.githubusercontent.com/matheusvcl/DataDoc/${branch}/changelogs/${file}`);
      if (response.ok) {
        return extractChangelogSection(await response.text(), version);
      }
    } catch (err) {
      // offline: mantém o body do release
    }
    return '';
  };

  const checkForUpdates = async (silent = false) => {
    if (checking) return;
    setChecking(true);
    setError(null);

    try {
      const tauri = window.__TAURI__;
      if (!tauri || !tauri.core) {
        if (!silent) showToast('Sistema de atualização não disponível');
        setChecking(false);
        return;
      }

      // Contrato do tauri-plugin-updater: check retorna Option<Metadata>,
      // Metadata = { rid, currentVersion, version, date, body, rawJson }.
      // Some(metadata) => há atualização; None => já está na versão mais recente.
      const meta = await tauri.core.invoke('plugin:updater|check');

      if (meta && meta.rid != null) {
        setUpdateInfo(meta);
        setChangelogText('');
        setShowDialog(true);
        fetchUpdateChangelog(meta.version).then((section) => {
          if (section) setChangelogText(section);
        });
        if (!silent) showToast('Nova versão disponível: ' + meta.version);
      } else {
        if (!silent) showToast('Você já está na versão mais recente');
      }
    } catch (err) {
      console.error('Update check error:', err);
      if (!silent) showToast('Erro ao verificar atualizações');
    }

    setChecking(false);
  };

  const downloadUpdate = async () => {
    if (downloading || !updateInfo) return;
    setDownloading(true);
    setDownloadProgress(0);
    setError(null);

    try {
      const tauri = window.__TAURI__;
      const ChannelCtor = tauri && tauri.core && tauri.core.Channel;
      if (!ChannelCtor) throw new Error('Channel da IPC indisponível');
      let downloadedBytes = 0;
      let totalBytes = 0;

      // download exige o rid do check e um Channel (função simples não é Channel na IPC v2);
      // o retorno é o ResourceId dos bytes, usado no install.
      const onEvent = new ChannelCtor();
      onEvent.onmessage = (event) => {
        if (event.event === 'Started') {
          totalBytes = (event.data && event.data.contentLength) || 0;
        } else if (event.event === 'Progress') {
          downloadedBytes += (event.data && event.data.chunkLength) || 0;
          if (totalBytes > 0) {
            setDownloadProgress(Math.min(99, Math.round((downloadedBytes / totalBytes) * 100)));
          }
        } else if (event.event === 'Finished') {
          setDownloadProgress(100);
        }
      };

      const bytes = await tauri.core.invoke('plugin:updater|download', {
        rid: updateInfo.rid,
        onEvent
      });
      setBytesRid(bytes);

      setDownloaded(true);
      showToast('Download concluído! Clique em Instalar para aplicar.');
    } catch (err) {
      console.error('Download error:', err);
      setError('Erro ao baixar atualização');
      showToast('Erro ao baixar atualização');
    }

    setDownloading(false);
  };

  const installUpdate = async () => {
    if (installing || !updateInfo || bytesRid == null) return;
    setInstalling(true);
    try {
      const tauri = window.__TAURI__;
      // No Windows o plugin lança o instalador e encerra o app; o instalador
      // NSIS reinicia o app na nova versão (restart_after_install padrão).
      await tauri.core.invoke('plugin:updater|install', {
        updateRid: updateInfo.rid,
        bytesRid: bytesRid
      });
      showToast('Atualização instalada. Reinicie o aplicativo.');
      setInstalling(false);
    } catch (err) {
      console.error('Install error:', err);
      setInstalling(false);
      showToast('Erro ao instalar atualização');
    }
  };

  const dismiss = () => {
    if (downloading || installing) return;
    setShowDialog(false);
    setUpdateInfo(null);
    setDownloaded(false);
    setBytesRid(null);
    setDownloadProgress(0);
    setChangelogText('');
    setError(null);
  };

  // Markdown renderizado com escape de HTML (renderMarkdownSafe em js/core.js)
  const parseMarkdown = (text) => renderMarkdownSafe(text);

  useEffect(() => {
    window.checkForUpdates = checkForUpdates;
    const timer = setTimeout(() => checkForUpdates(true), 3000);
    return () => {
      clearTimeout(timer);
      if (window.checkForUpdates === checkForUpdates) {
        delete window.checkForUpdates;
      }
    };
  }, []);

  if (!showDialog || !updateInfo) return null;

  return (
    <div className="dialog-overlay" onClick={dismiss} role="dialog" aria-modal="true" aria-labelledby="update-title">
      <div className="update-dialog" onClick={e => e.stopPropagation()}>
        <div className="update-header">
          <div className="update-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <h2 className="update-title" id="update-title">Atualização Disponível</h2>
          <p className="update-version">Versão {updateInfo.version}</p>
        </div>

        {(changelogText || updateInfo.body) && (
          <div className="update-notes">
            <div className="update-notes-label">Novidades</div>
            <div 
              className="update-notes-text"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(changelogText || updateInfo.body) }}
            />
          </div>
        )}

        {error && (
          <div className="update-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {(downloading || installing) && (
          <div className="update-progress">
            <div className="update-progress-bar">
              <div className="update-progress-fill" style={{width: (installing ? 100 : downloadProgress) + '%'}} />
            </div>
            <div className="update-progress-text">
              {installing
                ? 'Instalando e reiniciando...'
                : downloadProgress < 100 ? `Baixando... ${downloadProgress}%` : 'Preparando instalação...'}
            </div>
          </div>
        )}

        {!downloading && !installing && (
          <div className="update-actions">
            {!downloaded && (
              <>
                <button className="btn btn-secondary" onClick={dismiss}>
                  Depois
                </button>
                <button className="btn btn-primary" onClick={downloadUpdate}>
                  Baixar Atualização
                </button>
              </>
            )}
            {downloaded && (
              <>
                <button className="btn btn-secondary" onClick={dismiss}>
                  Depois
                </button>
                <button className="btn btn-primary" onClick={installUpdate}>
                  Reiniciar e Instalar
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
