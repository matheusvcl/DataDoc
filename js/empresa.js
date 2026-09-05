// Empresa Screen
function EmpresaScreen({ clientData, onBack, onContinue, showToast }) {
  const [form, setForm] = useState(() => loadCompany());
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
    setForm(f => {
      const cities = CITIES_BY_STATE[val] || [];
      const cidade = cities.includes(f.cidade) ? f.cidade : '';
      const next = { ...f, estado: val, cidade };
      saveCompany(next);
      return next;
    });
    setSaved(true);
  };

  const setCidade = (val) => {
    setForm(f => {
      const next = { ...f, cidade: val };
      saveCompany(next);
      return next;
    });
    setSaved(true);
  };

  const autoSave = () => {
    if (saveCompany(form)) setSaved(true);
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
            <input id="emp-razao" className="form-input" placeholder="Nome da empresa" value={form.razaoSocial} onChange={set('razaoSocial')} onBlur={autoSave} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp-cnpj">CNPJ</label>
            <input id="emp-cnpj" className="form-input" placeholder="XX.XXX.XXX/XXXX-XX" value={form.cnpj} onChange={set('cnpj')} onBlur={autoSave} />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="emp-telefone">Telefone</label>
            <input id="emp-telefone" className="form-input" placeholder="(00) 00000-0000" value={form.telefone} onChange={set('telefone')} onBlur={autoSave} />
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="emp-email">E-mail</label>
            <input id="emp-email" className="form-input" type="email" placeholder="contato@empresa.com" value={form.email} onChange={set('email')} onBlur={autoSave} />
          </div>

          <div className="form-group full-width section-spacer">
            <span className="section-label">Endereço</span>
          </div>

          <div className="form-group full-width">
            <AddressLookup
              estado={form.estado}
              cidade={form.cidade}
              onSelect={(addr) => {
                setForm(f => ({
                  ...f,
                  rua: addr.rua || f.rua,
                  bairro: addr.bairro || f.bairro,
                  cidade: addr.cidade || f.cidade,
                  estado: addr.estado || f.estado,
                  cep: addr.cep ? formatCEP(addr.cep) : f.cep,
                  complemento: addr.complemento || f.complemento
                }));
                setSaved(false);
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
              <button className="btn btn-primary" onClick={() => { saveCompany(form); onContinue(form); }} disabled={!clientData}>
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
