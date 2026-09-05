// Registration Form
function CadastroScreen({ onPreview, onGoEmpresa, editData, onClearEdit, showToast }) {
  const empty = {
    tipoPessoa: 'pf',
    nome: '', cpf: '', nascimento: '',
    telefone: '', email: '', rua: '', numero: '', complemento: '', bairro: '', cep: '', cidade: '', estado: '',
    camposExtras: []
  };
  const [form, setForm] = useState(() => {
    const base = editData ? sanitizeClient(editData) : null;
    return base || empty;
  });
  const [errors, setErrors] = useState({});
  const [extraLabel, setExtraLabel] = useState('');
  const [extraValue, setExtraValue] = useState('');

  useEffect(() => {
    if (editData) {
      const next = sanitizeClient(editData);
      if (next) setForm(next);
    }
  }, [editData]);

  const set = (field) => (e) => {
    let val = e.target.value;
    if (field === 'cpf') val = form.tipoPessoa === 'pj' ? formatCNPJ(val) : formatCPF(val);
    if (field === 'telefone') val = formatPhone(val);
    if (field === 'cep') val = formatCEP(val);
    setForm(f => ({ ...f, [field]: val }));
    if (errors[field]) setErrors(er => ({ ...er, [field]: null }));
  };

  const setEstado = (val) => {
    setForm(f => {
      const cities = CITIES_BY_STATE[val] || [];
      const cidade = cities.includes(f.cidade) ? f.cidade : '';
      return { ...f, estado: val, cidade };
    });
    if (errors.estado) setErrors(er => ({ ...er, estado: null }));
  };

  const setCidade = (val) => {
    setForm(f => ({ ...f, cidade: val }));
    if (errors.cidade) setErrors(er => ({ ...er, cidade: null }));
  };

  const validate = () => {
    const er = {};
    const isPJ = form.tipoPessoa === 'pj';
    if (!form.nome.trim()) er.nome = isPJ ? 'Informe a razão social' : 'Informe o nome completo';
    if (!form.cpf.trim()) {
      er.cpf = isPJ ? 'Informe o CNPJ' : 'Informe o CPF';
    } else if (isPJ && !isValidCNPJ(form.cpf)) {
      er.cpf = 'CNPJ inválido';
    } else if (!isPJ && !isValidCPF(form.cpf)) {
      er.cpf = 'CPF inválido';
    }
    if (!form.telefone.trim()) er.telefone = 'Informe o telefone';
    else if (digitsOnly(form.telefone, 11).length < 10) er.telefone = 'Telefone incompleto';
    if (form.email && !isValidEmail(form.email)) er.email = 'E-mail inválido';
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const clients = loadClients();
    const entry = {
      ...form,
      id: editData?.id || generateId(),
      criadoEm: editData?.criadoEm || new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    if (editData) {
      const idx = clients.findIndex(c => c.id === editData.id);
      if (idx >= 0) clients[idx] = entry;
    } else {
      clients.unshift(entry);
    }
    if (!saveClients(clients)) {
      showToast('Não foi possível salvar. Espaço de armazenamento insuficiente.');
      return;
    }
    onGoEmpresa(entry);
    if (!editData) {
      setForm(empty);
      setErrors({});
    }
    showToast(editData ? 'Cadastro atualizado' : 'Cliente cadastrado com sucesso');
  };

  const addExtra = () => {
    if (!extraLabel.trim()) return;
    setForm(f => ({
      ...f,
      camposExtras: [...(f.camposExtras || []), { label: extraLabel.trim(), value: extraValue }]
    }));
    setExtraLabel('');
    setExtraValue('');
  };

  const removeExtra = (i) => {
    setForm(f => ({
      ...f,
      camposExtras: (f.camposExtras || []).filter((_, idx) => idx !== i)
    }));
  };

  const isPJ = form.tipoPessoa === 'pj';
  const stateNames = STATES.map(s => s.nome);
  const cityOptions = form.estado ? (CITIES_BY_STATE[form.estado] || []) : [];

  return (
    <>
      <div className="page-header" data-od-id="cadastro-header">
        <h1 className="page-title">{editData ? 'Editar Cadastro' : 'Novo Cadastro'}</h1>
        <p className="page-subtitle">Preencha os dados do cliente</p>
      </div>
      <div className="page-body">
        <div className="form-grid" data-od-id="cadastro-form">
          <div className="form-group full-width">
            <div className="person-type-toggle" role="radiogroup" aria-label="Tipo de pessoa">
              <button type="button" className={`person-type-btn${!isPJ ? ' active' : ''}`} onClick={() => { setForm(f => ({ ...f, tipoPessoa: 'pf', cpf: '' })); setErrors(er => ({ ...er, nome: null, cpf: null, telefone: null })); }} role="radio" aria-checked={!isPJ}>
                Pessoa Física
              </button>
              <button type="button" className={`person-type-btn${isPJ ? ' active' : ''}`} onClick={() => { setForm(f => ({ ...f, tipoPessoa: 'pj', cpf: '' })); setErrors(er => ({ ...er, nome: null, cpf: null, telefone: null })); }} role="radio" aria-checked={isPJ}>
                Pessoa Jurídica
              </button>
            </div>
            <span className="section-label">{isPJ ? 'Dados Empresariais' : 'Dados Pessoais'}</span>
          </div>

          <div className="form-group full-width" data-od-id="field-nome">
            <label className="form-label" htmlFor="input-nome">{isPJ ? 'Razão Social' : 'Nome completo'} *</label>
            <input id="input-nome" className={`form-input${errors.nome ? ' error' : ''}`} placeholder={isPJ ? 'Razão social da empresa' : 'Nome completo do cliente'} value={form.nome} onChange={set('nome')} aria-describedby={errors.nome ? 'err-nome' : undefined} aria-invalid={errors.nome ? 'true' : undefined} />
            {errors.nome && <span className="form-error" id="err-nome" role="alert">{errors.nome}</span>}
          </div>

          <div className="form-group" data-od-id="field-cpf">
            <label className="form-label" htmlFor="input-cpf">{isPJ ? 'CNPJ' : 'CPF'} *</label>
            <input id="input-cpf" className={`form-input${errors.cpf ? ' error' : ''}`} placeholder={isPJ ? 'XX.XXX.XXX/XXXX-XX' : '000.000.000-00'} value={form.cpf} onChange={set('cpf')} aria-describedby={errors.cpf ? 'err-cpf' : undefined} aria-invalid={errors.cpf ? 'true' : undefined} />
            {errors.cpf && <span className="form-error" id="err-cpf" role="alert">{errors.cpf}</span>}
          </div>

          {!isPJ && (
          <div className="form-group">
            <label className="form-label" htmlFor="input-nascimento">Data de nascimento</label>
            <DatePicker id="input-nascimento" label="Data de nascimento" value={form.nascimento} onChange={(val) => { setForm(f => ({ ...f, nascimento: val })); if (errors.nascimento) setErrors(er => ({ ...er, nascimento: null })); }} />
          </div>
          )}

          <div className="form-group" data-od-id="field-telefone">
            <label className="form-label" htmlFor="input-telefone">Telefone *</label>
            <input id="input-telefone" className={`form-input${errors.telefone ? ' error' : ''}`} placeholder="(00) 00000-0000" value={form.telefone} onChange={set('telefone')} aria-describedby={errors.telefone ? 'err-telefone' : undefined} aria-invalid={errors.telefone ? 'true' : undefined} />
            {errors.telefone && <span className="form-error" id="err-telefone" role="alert">{errors.telefone}</span>}
          </div>

          <div className="form-group full-width">
            <label className="form-label" htmlFor="input-email">E-mail</label>
            <input id="input-email" className={`form-input${errors.email ? ' error' : ''}`} type="email" placeholder="email@exemplo.com" value={form.email} onChange={set('email')} aria-invalid={errors.email ? 'true' : undefined} />
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
                setForm(f => ({
                  ...f,
                  rua: addr.rua || f.rua,
                  bairro: addr.bairro || f.bairro,
                  cidade: addr.cidade || f.cidade,
                  estado: addr.estado || f.estado,
                  cep: addr.cep ? formatCEP(addr.cep) : f.cep,
                  complemento: addr.complemento || f.complemento
                }));
              }}
            />
          </div>

          <div className="form-group col-3">
            <label className="form-label" htmlFor="input-rua">Rua</label>
            <input id="input-rua" className="form-input" placeholder="Nome da rua" value={form.rua} onChange={set('rua')} />
          </div>

          <div className="form-group col-1">
            <label className="form-label" htmlFor="input-numero">Número</label>
            <input id="input-numero" className="form-input" placeholder="Nº" value={form.numero} onChange={set('numero')} />
          </div>

          <div className="form-group col-2">
            <label className="form-label" htmlFor="input-complemento">Complemento</label>
            <input id="input-complemento" className="form-input" placeholder="Apto, bloco, etc." value={form.complemento} onChange={set('complemento')} />
          </div>

          <div className="form-group col-2">
            <label className="form-label" htmlFor="input-bairro">Bairro</label>
            <input id="input-bairro" className="form-input" placeholder="Bairro" value={form.bairro} onChange={set('bairro')} />
          </div>

          <div className="form-group col-1">
            <label className="form-label" htmlFor="input-cep">CEP</label>
            <input id="input-cep" className="form-input" placeholder="00000-000" value={form.cep} onChange={set('cep')} />
          </div>

          <div className="form-group col-1">
            <label className="form-label" htmlFor="input-estado">Estado</label>
            <CustomSelect id="input-estado" value={form.estado} onChange={setEstado} options={stateNames} placeholder="Selecione o estado" />
          </div>

          <div className="form-group col-2">
            <label className="form-label" htmlFor="input-cidade">Cidade</label>
            <CustomSelect id="input-cidade" value={form.cidade} onChange={setCidade} options={cityOptions} placeholder={form.estado ? 'Selecione a cidade' : 'Selecione o estado primeiro'} />
          </div>

          <div className="form-group full-width section-spacer">
            <span className="section-label">Campos Adicionais</span>
          </div>

          {(form.camposExtras || []).map((cf, i) => (
            <div className="form-group full-width" key={i}>
              <div className="additional-field-row">
                <div className="form-group">
                  <label className="form-label" htmlFor={`extra-val-${i}`}>{cf.label}</label>
                  <input id={`extra-val-${i}`} className="form-input" value={cf.value} onChange={(e) => {
                    const val = e.target.value;
                    setForm(f => ({...f, camposExtras: (f.camposExtras || []).map((c, idx) => idx === i ? {...c, value: val} : c)}));
                  }} />
                </div>
                <button className="remove-field-btn" onClick={() => removeExtra(i)} title="Remover campo" aria-label={`Remover campo ${cf.label}`}>
                  {Icons.x}
                </button>
              </div>
            </div>
          ))}

          <div className="form-group full-width">
            <div className="additional-field-row">
              <div className="form-group">
                <label className="sr-only" htmlFor="extra-label-input">Nome do campo</label>
                <input id="extra-label-input" className="form-input" placeholder="Nome do campo" value={extraLabel} onChange={e => setExtraLabel(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor="extra-value-input">Valor</label>
                <input id="extra-value-input" className="form-input" placeholder="Valor" value={extraValue} onChange={e => setExtraValue(e.target.value)} />
              </div>
              <button className="btn btn-secondary btn-sm" onClick={addExtra}>
                {Icons.plus}
                <span>Adicionar</span>
              </button>
            </div>
            <span className="form-hint">Adicione campos específicos do seu negócio (ex: número da matrícula, plano contratado)</span>
          </div>

          <div className="form-group full-width">
            <div className="btn-group">
              <button className="btn btn-primary" onClick={handleSave}>
                {editData ? 'Salvar' : 'Continuar'}
              </button>
              {editData && (
                <button className="btn btn-ghost" onClick={() => { onClearEdit(); setForm(empty); setErrors({}); }}>
                  Cancelar edição
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
