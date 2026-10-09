// Empresa Screen
function EmpresaScreen({ clientData, onBack, onContinue, showToast }) {
  const [form, setForm] = useState(() => {
    const c = loadCompany();
    // form trabalha com o nome do estado (select); o storage guarda a UF
    return { ...c, estado: estadoFromUf(c.estado) };
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const set = (field) => (e) => {
    let val = e.target.value;
    if (field === 'cnpj') val = formatCNPJ(val);
    if (field === 'telefone') val = formatPhone(val);
    if (field === 'cep') val = formatCEP(val);
    setForm(f => ({ ...f, [field]: val }));
    setSaved(false);
  };

  const setEstado = (val) => {
    const cities = CITIES_BY_STATE[val] || [];
    const next = { ...form, estado: val, cidade: cities.includes(form.cidade) ? form.cidade : '' };
    setForm(next);
    saveCompany(next);
    setSaved(true);
  };

  const setCidade = (val) => {
    const next = { ...form, cidade: val };
    setForm(next);
    saveCompany(next);
    setSaved(true);
  };

  const autoSave = () => {
    if (saveCompany(form)) setSaved(true);
  };

  // Empresa 100% vazia é permitida (o documento usa fallback); se houver qualquer
  // dado preenchido, ele precisa ser válido (CNPJ com dígitos verificadores etc.).
  const validate = () => {
    const any = ['razaoSocial', 'cnpj', 'telefone', 'email', 'rua', 'bairro', 'cep']
      .some(k => String(form[k] || '').trim());
    if (!any) { setErrors({}); return true; }
    const er = validatePerson(
      { nome: form.razaoSocial, cpf: form.cnpj, telefone: form.telefone, email: form.email },
      { requireDocumento: false, isPJ: true }
    );
    if (Object.keys(er).length === 0 && !String(form.razaoSocial || '').trim()) {
      er.nome = 'Informe a razão social';
    }
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const stateNames = STATES.map(s => s.nome);
  const cityOptions = form.estado ? (CITIES_BY_STATE[form.estado] || []) : [];

  return (
    <>
      <div className="page-header" data-od-id="empresa-header">
        <h1 className="page-title">Dados da Empresa</h1>
        <p className="page-subtitle">Informações da sua empresa que aparecerão no documento gerado</p>
      </div>
      <div className="page-body">
        {clientData && (
          <div className="client-context">
            <span className="client-context-label">Cliente:</span>
            <span className="client-context-name">{clientData.nome}</span>
            <span className="client-context-doc">{clientData.cpf}</span>
          </div>
        )}
        <div className="form-grid" data-od-id="empresa-form">
          <div className="form-group full-width">
            <span className="section-label">Identificação</span>
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="emp-razao">Razão Social</label>
            <input id="emp-razao" maxLength={200} className={`form-input${errors.nome ? ' error' : ''}`} placeholder="Nome da empresa" value={form.razaoSocial} onChange={set('razaoSocial')} onBlur={autoSave} />
            {errors.nome && <span className="form-error" role="alert">{errors.nome}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp-cnpj">CNPJ</label>
            <input id="emp-cnpj" className={`form-input${errors.cpf ? ' error' : ''}`} placeholder="XX.XXX.XXX/XXXX-XX" value={form.cnpj} onChange={set('cnpj')} onBlur={autoSave} />
            {errors.cpf && <span className="form-error" role="alert">{errors.cpf}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp-telefone">Telefone</label>
            <input id="emp-telefone" className={`form-input${errors.telefone ? ' error' : ''}`} placeholder="(00) 00000-0000" value={form.telefone} onChange={set('telefone')} onBlur={autoSave} />
            {errors.telefone && <span className="form-error" role="alert">{errors.telefone}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="emp-email">E-mail</label>
            <input id="emp-email" className={`form-input${errors.email ? ' error' : ''}`} type="email" placeholder="contato@empresa.com" value={form.email} onChange={set('email')} onBlur={autoSave} />
            {errors.email && <span className="form-error" role="alert">{errors.email}</span>}
          </div>

          <div className="form-group full-width section-spacer">
            <span className="section-label">Endereço</span>
          </div>

          <div className="form-group full-width">
            <AddressLookup
              estado={form.estado}
              cidade={form.cidade}
              onSelect={(addr) => {
                const next = {
                  ...form,
                  rua: addr.rua || form.rua,
                  bairro: addr.bairro || form.bairro,
                  cidade: addr.cidade || form.cidade,
                  estado: addr.estado || form.estado,
                  cep: addr.cep ? formatCEP(addr.cep) : form.cep,
                  complemento: addr.complemento || form.complemento
                };
                setForm(next);
                // persiste imediatamente — antes, navegar sem tocar em outro campo perdia o endereço
                saveCompany(next);
                setSaved(true);
              }}
            />
          </div>

          <div className="form-group col-3">
            <label className="form-label" htmlFor="emp-rua">Rua</label>
            <input id="emp-rua" className="form-input" placeholder="Nome da rua" value={form.rua} onChange={set('rua')} onBlur={autoSave} />
          </div>

          <div className="form-group col-1">
            <label className="form-label" htmlFor="emp-numero">Número</label>
            <input id="emp-numero" className="form-input" placeholder="Nº" value={form.numero} onChange={set('numero')} onBlur={autoSave} />
          </div>

          <div className="form-group col-2">
            <label className="form-label" htmlFor="emp-complemento">Complemento</label>
            <input id="emp-complemento" className="form-input" placeholder="Sala, andar, etc." value={form.complemento} onChange={set('complemento')} onBlur={autoSave} />
          </div>

          <div className="form-group col-2">
            <label className="form-label" htmlFor="emp-bairro">Bairro</label>
            <input id="emp-bairro" className="form-input" placeholder="Bairro" value={form.bairro} onChange={set('bairro')} onBlur={autoSave} />
          </div>

          <div className="form-group col-1">
            <label className="form-label" htmlFor="emp-cep">CEP</label>
            <input id="emp-cep" className="form-input" placeholder="00000-000" value={form.cep} onChange={set('cep')} onBlur={autoSave} />
          </div>

          <div className="form-group col-1">
            <label className="form-label" htmlFor="emp-estado">Estado</label>
            <CustomSelect id="emp-estado" value={form.estado} onChange={setEstado} options={stateNames} placeholder="Selecione o estado" />
          </div>

          <div className="form-group col-2">
            <label className="form-label" htmlFor="emp-cidade">Cidade</label>
            <CustomSelect id="emp-cidade" value={form.cidade} onChange={setCidade} options={cityOptions} placeholder={form.estado ? 'Selecione a cidade' : 'Selecione o estado primeiro'} />
          </div>

          <div className="form-group full-width">
            {saved && (
              <span className="form-hint form-hint-success">
                Dados salvos automaticamente
              </span>
            )}
            <div className="btn-group">
              <button className="btn btn-secondary" onClick={onBack}>
                Voltar
              </button>
              <button className="btn btn-primary" onClick={() => { if (!validate()) return; saveCompany(form); onContinue(form); }} disabled={!clientData}>
                Continuar
              </button>
            </div>
            {!clientData && (
              <span className="form-hint">
                Preencha o cadastro do cliente primeiro para continuar.
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
