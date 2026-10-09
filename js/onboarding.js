// Onboarding Flow
function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [empresaForm, setEmpresaForm] = useState({
    razaoSocial: '', cnpj: '', telefone: '', email: '',
    rua: '', numero: '', complemento: '', bairro: '', cep: '', cidade: '', estado: ''
  });
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importEmpresa, setImportEmpresa] = useState(null);
  const [importError, setImportError] = useState(null);
  const [empresaErrors, setEmpresaErrors] = useState({});
  const fileRef = useRef(null);

  // Mesma regra da tela Empresa: empresa vazia é permitida; se houver dados, precisam ser válidos.
  const validateEmpresa = () => {
    const any = ['razaoSocial', 'cnpj', 'telefone', 'email', 'rua', 'bairro', 'cep']
      .some(k => String(empresaForm[k] || '').trim());
    if (!any) { setEmpresaErrors({}); return true; }
    const er = validatePerson(
      { nome: empresaForm.razaoSocial, cpf: empresaForm.cnpj, telefone: empresaForm.telefone, email: empresaForm.email },
      { requireDocumento: false, isPJ: true }
    );
    if (Object.keys(er).length === 0 && !String(empresaForm.razaoSocial || '').trim()) {
      er.nome = 'Informe a razão social';
    }
    setEmpresaErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleEmpresaSet = (field) => (e) => {
    let val = e.target.value;
    if (field === 'cnpj') val = formatCNPJ(val);
    if (field === 'telefone') val = formatPhone(val);
    if (field === 'cep') val = formatCEP(val);
    setEmpresaForm(f => ({ ...f, [field]: val }));
  };

  const setEstado = (val) => {
    setEmpresaForm(f => {
      const cities = CITIES_BY_STATE[val] || [];
      const cidade = cities.includes(f.cidade) ? f.cidade : '';
      return { ...f, estado: val, cidade };
    });
  };

  const setCidade = (val) => {
    setEmpresaForm(f => ({ ...f, cidade: val }));
  };

  const finishOnboarding = (skipImport) => {
    if (empresaForm.razaoSocial || empresaForm.cnpj) {
      saveCompany(empresaForm);
    }
    if (!skipImport && importPreview.length > 0) {
      const existing = loadClients();
      saveClients(mergeImportedClients(importPreview, existing));
      // a empresa do arquivo só é aplicada na confirmação da importação
      if (importEmpresa) saveCompany(importEmpresa);
    }
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) { /* storage bloqueado — segue sem persistir a flag */ }
    onComplete(!skipImport && importPreview.length > 0);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > IMPORT_MAX_BYTES) {
      setImportFile(null);
      setImportPreview([]);
      setImportEmpresa(null);
      setImportError('Arquivo muito grande (máximo 5 MB)');
      return;
    }
    const name = asText(file.name, 180);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target.result || '');
        const parsed = parseImportText(text, name);
        if (parsed.errors.length > 0) {
          setImportFile(null);
          setImportPreview([]);
          setImportEmpresa(null);
          setImportError(parsed.errors[0]);
          return;
        }
        setImportFile(name);
        setImportPreview(parsed.clients);
        setImportEmpresa(parsed.empresa);
        setImportError(parsed.skipped > 0
          ? `${parsed.skipped} registro${parsed.skipped !== 1 ? 's' : ''} ignorado${parsed.skipped !== 1 ? 's' : ''} (sem nome/documento)`
          : null);
      } catch (err) {
        setImportFile(null);
        setImportPreview([]);
        setImportEmpresa(null);
        setImportError('Erro ao ler arquivo: formato inválido');
      }
    };
    reader.readAsText(file);
  };

  const stateNames = STATES.map(s => s.nome);
  const cityOptions = empresaForm.estado ? (CITIES_BY_STATE[empresaForm.estado] || []) : [];

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="onboarding-step">
      <h2 className="onboarding-title">Bem-vindo ao DataDoc</h2>
      <p className="onboarding-desc">Gerencie cadastros e documentos de forma simples e organizada. Vamos configurar sua conta em poucos passos.</p>
      <div className="onboarding-features">
        <div className="onboarding-feature"><span className="onboarding-feature-icon">{Icons.user}</span><span>Cadastro de clientes PF e PJ</span></div>
        <div className="onboarding-feature"><span className="onboarding-feature-icon">{Icons.building}</span><span>Dados da empresa para documentos</span></div>
        <div className="onboarding-feature"><span className="onboarding-feature-icon">{Icons.download}</span><span>Exportação em PDF, JSON, CSV</span></div>
      </div>
      <button className="btn btn-primary btn-lg" onClick={() => setStep(1)}>Começar Configuração</button>
      <button className="btn btn-ghost btn-sm onboarding-skip" onClick={() => finishOnboarding(true)}>Pular configuração</button>
    </div>,

    // Step 1: Empresa
    <div key="empresa" className="onboarding-step">
      <h2 className="onboarding-title">Dados da Empresa</h2>
      <p className="onboarding-desc">Configure os dados da sua empresa. Eles aparecerão nos documentos gerados.</p>
      <div className="onboarding-step-scroll">
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label" htmlFor="ob-razao">Razão Social</label>
            <input id="ob-razao" maxLength={200} className={`form-input${empresaErrors.nome ? ' error' : ''}`} placeholder="Nome da empresa" value={empresaForm.razaoSocial} onChange={handleEmpresaSet('razaoSocial')} />
            {empresaErrors.nome && <span className="form-error" role="alert">{empresaErrors.nome}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ob-cnpj">CNPJ</label>
            <input id="ob-cnpj" className={`form-input${empresaErrors.cpf ? ' error' : ''}`} placeholder="XX.XXX.XXX/XXXX-XX" value={empresaForm.cnpj} onChange={handleEmpresaSet('cnpj')} />
            {empresaErrors.cpf && <span className="form-error" role="alert">{empresaErrors.cpf}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ob-tel">Telefone</label>
            <input id="ob-tel" className={`form-input${empresaErrors.telefone ? ' error' : ''}`} placeholder="(00) 00000-0000" value={empresaForm.telefone} onChange={handleEmpresaSet('telefone')} />
            {empresaErrors.telefone && <span className="form-error" role="alert">{empresaErrors.telefone}</span>}
          </div>
          <div className="form-group full-width">
            <label className="form-label" htmlFor="ob-email">E-mail</label>
            <input id="ob-email" className={`form-input${empresaErrors.email ? ' error' : ''}`} type="email" placeholder="contato@empresa.com" value={empresaForm.email} onChange={handleEmpresaSet('email')} />
            {empresaErrors.email && <span className="form-error" role="alert">{empresaErrors.email}</span>}
          </div>

          <div className="form-group full-width section-spacer">
            <span className="section-label">Endereço</span>
          </div>

          <div className="form-group col-3">
            <label className="form-label" htmlFor="ob-rua">Rua</label>
            <input id="ob-rua" className="form-input" placeholder="Nome da rua" value={empresaForm.rua} onChange={handleEmpresaSet('rua')} />
          </div>
          <div className="form-group col-1">
            <label className="form-label" htmlFor="ob-numero">Número</label>
            <input id="ob-numero" className="form-input" placeholder="Nº" value={empresaForm.numero} onChange={handleEmpresaSet('numero')} />
          </div>
          <div className="form-group col-2">
            <label className="form-label" htmlFor="ob-complemento">Complemento</label>
            <input id="ob-complemento" className="form-input" placeholder="Sala, andar, etc." value={empresaForm.complemento} onChange={handleEmpresaSet('complemento')} />
          </div>
          <div className="form-group col-2">
            <label className="form-label" htmlFor="ob-bairro">Bairro</label>
            <input id="ob-bairro" className="form-input" placeholder="Bairro" value={empresaForm.bairro} onChange={handleEmpresaSet('bairro')} />
          </div>
          <div className="form-group col-1">
            <label className="form-label" htmlFor="ob-cep">CEP</label>
            <input id="ob-cep" className="form-input" placeholder="00000-000" value={empresaForm.cep} onChange={handleEmpresaSet('cep')} />
          </div>
          <div className="form-group col-1">
            <label className="form-label" htmlFor="ob-estado">Estado</label>
            <CustomSelect id="ob-estado" value={empresaForm.estado} onChange={setEstado} options={stateNames} placeholder="Selecione" />
          </div>
          <div className="form-group col-2">
            <label className="form-label" htmlFor="ob-cidade">Cidade</label>
            <CustomSelect id="ob-cidade" value={empresaForm.cidade} onChange={setCidade} options={cityOptions} placeholder={empresaForm.estado ? 'Selecione' : 'Estado primeiro'} />
          </div>
        </div>
      </div>
      <div className="onboarding-nav">
        <button className="btn btn-ghost" onClick={() => setStep(0)}>Voltar</button>
        <button className="btn btn-primary" onClick={() => { if (validateEmpresa()) setStep(2); }}>Próximo</button>
      </div>
      <button className="btn btn-ghost btn-sm onboarding-skip" onClick={() => finishOnboarding(true)}>Pular configuração</button>
    </div>,

    // Step 2: Import
    <div key="import" className="onboarding-step">
      <h2 className="onboarding-title">Importar Dados</h2>
      <p className="onboarding-desc">Já tem dados? Importe de um arquivo JSON, CSV ou TXT. Ou pule para começar do zero.</p>
      <div className="import-area">
        <div className="import-dropzone" onClick={() => fileRef.current?.click()} role="button" tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); }}}>
          <div className="import-dropzone-icon">{Icons.upload}</div>
          <div className="import-dropzone-title">{importFile || 'Clique para selecionar um arquivo'}</div>
          <div className="import-dropzone-desc">JSON, CSV ou TXT</div>
          <input ref={fileRef} type="file" accept=".json,.csv,.txt" onChange={handleImportFile} className="hidden-input" />
        </div>
        {importPreview.length > 0 && (
          <div className="import-result">
            {Icons.check} {importPreview.length} registro{importPreview.length !== 1 ? 's' : ''} válido{importPreview.length !== 1 ? 's' : ''}{importError ? ` • ${importError}` : ''}
          </div>
        )}
        {importPreview.length === 0 && importError && (
          <div className="import-result" role="alert" style={{ color: 'var(--danger, #d33)' }}>
            {importError}
          </div>
        )}
      </div>
      <div className="onboarding-nav">
        <button className="btn btn-ghost" onClick={() => setStep(1)}>Voltar</button>
        <button className="btn btn-primary" onClick={() => finishOnboarding(false)}>
          {importPreview.length > 0 ? `Importar e Finalizar` : 'Finalizar'}
        </button>
      </div>
      <button className="btn btn-ghost btn-sm onboarding-skip" onClick={() => finishOnboarding(true)}>Pular importação</button>
    </div>
  ];

  return (
    <div className="onboarding-overlay">
      <div className={`onboarding-card${step === 1 ? ' onboarding-card-wide' : ''}`}>
        <div className="onboarding-progress">
          {[0,1,2].map(i => (
            <div key={i} className={`onboarding-dot${step >= i ? ' active' : ''}`} />
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  );
}
