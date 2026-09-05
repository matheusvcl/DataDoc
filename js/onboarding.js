// Onboarding Flow
function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [empresaForm, setEmpresaForm] = useState({
    razaoSocial: '', cnpj: '', telefone: '', email: '',
    rua: '', numero: '', complemento: '', bairro: '', cep: '', cidade: '', estado: ''
  });
  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const fileRef = useRef(null);

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
    }
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete(!skipImport && importPreview.length > 0);
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > IMPORT_MAX_BYTES) {
      setImportFile(null);
      setImportPreview([]);
      return;
    }
    const name = asText(file.name, 180);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = String(ev.target.result || '');
        let rows = [];
        if (name.toLowerCase().endsWith('.json')) {
          const data = JSON.parse(text);
          const arr = data && Array.isArray(data.clientes) ? data.clientes : (Array.isArray(data) ? data : [data]);
          if (data && data.empresa && typeof data.empresa === 'object') {
            saveCompany(sanitizeCompany(data.empresa));
          }
          rows = arr.map(sanitizeClient).filter(Boolean);
        } else if (name.toLowerCase().endsWith('.csv') || name.toLowerCase().endsWith('.txt')) {
          const lines = text.split(/\r?\n/).filter((l) => l.trim());
          if (lines.length < 2) throw new Error('Arquivo vazio');
          const sep = lines[0].includes('\t') ? '\t' : ';';
          const headers = lines[0].split(sep).map((h) => h.trim().toLowerCase());
          rows = lines.slice(1).map((line) => {
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
        }
        setImportFile(name);
        setImportPreview(rows);
      } catch (err) {
        setImportFile(null);
        setImportPreview([]);
      }
    };
    reader.readAsText(file);
  };

  const stateNames = STATES.map(s => s.nome);
  const cityOptions = empresaForm.estado ? (CITIES_BY_STATE[empresaForm.estado] || []) : [];

  const steps = [
    // Step 0: Welcome
    <div key="welcome" className="onboarding-step">
      <div className="onboarding-icon">{Icons.layers}</div>
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
      <div className="onboarding-icon">{Icons.building}</div>
      <h2 className="onboarding-title">Dados da Empresa</h2>
      <p className="onboarding-desc">Configure os dados da sua empresa. Eles aparecerão nos documentos gerados.</p>
      <div className="onboarding-step-scroll">
        <div className="form-grid">
          <div className="form-group full-width">
            <label className="form-label" htmlFor="ob-razao">Razão Social</label>
            <input id="ob-razao" className="form-input" placeholder="Nome da empresa" value={empresaForm.razaoSocial} onChange={handleEmpresaSet('razaoSocial')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ob-cnpj">CNPJ</label>
            <input id="ob-cnpj" className="form-input" placeholder="XX.XXX.XXX/XXXX-XX" value={empresaForm.cnpj} onChange={handleEmpresaSet('cnpj')} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="ob-tel">Telefone</label>
            <input id="ob-tel" className="form-input" placeholder="(00) 00000-0000" value={empresaForm.telefone} onChange={handleEmpresaSet('telefone')} />
          </div>
          <div className="form-group full-width">
            <label className="form-label" htmlFor="ob-email">E-mail</label>
            <input id="ob-email" className="form-input" type="email" placeholder="contato@empresa.com" value={empresaForm.email} onChange={handleEmpresaSet('email')} />
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
        <button className="btn btn-primary" onClick={() => setStep(2)}>Próximo</button>
      </div>
      <button className="btn btn-ghost btn-sm onboarding-skip" onClick={() => finishOnboarding(true)}>Pular configuração</button>
    </div>,

    // Step 2: Import
    <div key="import" className="onboarding-step">
      <div className="onboarding-icon">{Icons.upload}</div>
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
            {Icons.check} {importPreview.length} registro{importPreview.length !== 1 ? 's' : ''} encontrado{importPreview.length !== 1 ? 's' : ''}
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
