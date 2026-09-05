// Update System
function UpdateManager({ showToast }) {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const checkForUpdates = async (silent = false) => {
    if (checking) return;
    setChecking(true);

    try {
      const tauri = window.__TAURI__;
      if (!tauri || !tauri.core) {
        if (!silent) showToast('Sistema de atualização não disponível');
        setChecking(false);
        return;
      }

      const update = await tauri.core.invoke('plugin:updater|check');
      
      if (update && update.available) {
        setUpdateInfo(update);
        setShowDialog(true);
        if (!silent) showToast('Nova versão disponível: ' + update.version);
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

    try {
      const tauri = window.__TAURI__;
      let downloadedBytes = 0;
      let totalBytes = 0;

      await tauri.core.invoke('plugin:updater|download', {
        onEvent: (event) => {
          if (event.event === 'Started') {
            totalBytes = event.data.contentLength || 0;
          } else if (event.event === 'Progress') {
            downloadedBytes += event.data.chunkLength || 0;
            if (totalBytes > 0) {
              setDownloadProgress(Math.round((downloadedBytes / totalBytes) * 100));
            }
          } else if (event.event === 'Finished') {
            setDownloadProgress(100);
          }
        }
      });

      setDownloaded(true);
      showToast('Download concluído! Clique em Instalar para aplicar.');
    } catch (err) {
      console.error('Download error:', err);
      showToast('Erro ao baixar atualização');
    }

    setDownloading(false);
  };

  const installUpdate = async () => {
    try {
      const tauri = window.__TAURI__;
      await tauri.core.invoke('plugin:updater|install');
    } catch (err) {
      console.error('Install error:', err);
      showToast('Erro ao instalar atualização');
    }
  };

  const dismiss = () => {
    setShowDialog(false);
    setUpdateInfo(null);
    setDownloaded(false);
    setDownloadProgress(0);
  };

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

        {updateInfo.body && (
          <div className="update-notes">
            <div className="update-notes-label">Novidades:</div>
            <div className="update-notes-text">{updateInfo.body}</div>
          </div>
        )}

        {downloading && (
          <div className="update-progress">
            <div className="update-progress-bar">
              <div className="update-progress-fill" style={{width: downloadProgress + '%'}} />
            </div>
            <div className="update-progress-text">
              {downloadProgress < 100 ? `Baixando... ${downloadProgress}%` : 'Preparando instalação...'}
            </div>
          </div>
        )}

        <div className="update-actions">
          {!downloading && !downloaded && (
            <>
              <button className="btn btn-secondary" onClick={dismiss}>
                Depois
              </button>
              <button className="btn btn-primary" onClick={downloadUpdate}>
                Baixar Atualização
              </button>
            </>
          )}
          {downloading && (
            <button className="btn btn-secondary" disabled>
              Baixando...
            </button>
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
      </div>
    </div>
  );
}
