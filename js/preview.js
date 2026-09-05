// Preview Screen
function PreviewScreen({ client, empresa, onEdit, onBack }) {
  if (!client) {
    return (
      <>
        <div className="page-header">
          <h1 className="page-title">Visualização</h1>
          <p className="page-subtitle">Nenhum documento para visualizar</p>
        </div>
        <div className="page-body">
          <div className="empty-state" data-od-id="preview-empty">
            {Icons.fileText}
            <div className="empty-state-title">Nenhum documento gerado</div>
            <div className="empty-state-text">Cadastre um cliente primeiro para visualizar o documento aqui.</div>
          </div>
        </div>
      </>
    );
  }

  const generatePDF = () => {
    if (!window.jspdf || !window.jspdf.jsPDF) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const maxWidth = pageW - 40;
    let y = 20;
    const isPJ = (client.tipoPessoa || 'pf') === 'pj';

    const ensureSpace = (needed) => {
      if (y + needed > pageH - 20) {
        doc.addPage();
        y = 20;
      }
    };

    const addField = (label, value) => {
      const lines = doc.splitTextToSize(String(value || '—'), maxWidth);
      ensureSpace(8 + lines.length * 6);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100);
      doc.text(String(label).toUpperCase(), 20, y);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30);
      doc.text(lines, 20, y + 6);
      y += 8 + lines.length * 6;
    };

    const addSection = (title) => {
      y += 4;
      ensureSpace(16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100);
      doc.text(title, 20, y);
      y += 2;
      doc.setDrawColor(220);
      doc.line(20, y, pageW - 20, y);
      y += 8;
    };

    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FICHA DE CLIENTE', pageW / 2, y, { align: 'center' });
    y += 14;

    // Empresa section
    if (empresa && (empresa.razaoSocial || empresa.cnpj)) {
      addSection('Dados da Empresa');
      if (empresa.razaoSocial) addField('Razão Social', empresa.razaoSocial);
      if (empresa.cnpj) addField('CNPJ', empresa.cnpj);
      if (empresa.telefone) addField('Telefone', empresa.telefone);
      if (empresa.email) addField('E-mail', empresa.email);
      if (empresa.rua) {
        const endereco = [empresa.rua && `${empresa.rua}${empresa.numero ? ', ' + empresa.numero : ''}`, empresa.complemento, empresa.bairro, empresa.cidade && `${empresa.cidade}/${empresa.estado}`, empresa.cep].filter(Boolean).join(' — ');
        addField('Endereço', endereco);
      }
    }

    addSection(isPJ ? 'Dados do Cliente (PJ)' : 'Dados do Cliente');
    addField(isPJ ? 'Razão Social' : 'Nome Completo', client.nome);
    addField(isPJ ? 'CNPJ' : 'CPF', client.cpf);
    if (!isPJ) addField('Data de Nascimento', formatDate(client.nascimento));
    addField('Telefone', client.telefone);
    addField('E-mail', client.email);

    addSection('Endereço');
    addField('Rua', client.rua);
    addField('Número', client.numero);
    addField('Complemento', client.complemento);
    addField('Bairro', client.bairro);
    addField('CEP', client.cep);
    addField('Cidade', client.cidade);
    addField('Estado', client.estado);

    if (client.camposExtras && client.camposExtras.length > 0) {
      addSection('Informações Adicionais');
      client.camposExtras.forEach(cf => {
        addField(cf.label, cf.value);
      });
    }

    doc.save(`ficha-${safeFilename(client.nome)}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  const isPJ = (client.tipoPessoa || 'pf') === 'pj';

  return (
    <>
        <div className="page-header" data-od-id="preview-header">
          <div className="header-with-back">
            <button className="btn btn-ghost btn-sm btn-back" onClick={onBack} aria-label="Voltar">
              {Icons.arrowLeft}
            </button>
            <div>
              <h1 className="page-title">Visualização do Documento</h1>
              <p className="page-subtitle">Confira os dados antes de gerar o PDF</p>
            </div>
          </div>
        </div>
        <div className="page-body">
          <div className="preview-container" data-od-id="preview-doc">
          <div className="preview-doc">
            <div className="doc-header">
              <div className="doc-company">{empresa?.razaoSocial || 'Ficha de Cliente'}</div>
            </div>

            {empresa && (empresa.razaoSocial || empresa.cnpj) && (
              <div className="doc-section">
                <div className="doc-section-title">Dados da Empresa</div>
                {empresa.razaoSocial && (
                  <div className="doc-field">
                    <span className="doc-field-label">Razão Social</span>
                    <span className="doc-field-value">{empresa.razaoSocial}</span>
                  </div>
                )}
                {empresa.cnpj && (
                  <div className="doc-field">
                    <span className="doc-field-label">CNPJ</span>
                    <span className="doc-field-value">{empresa.cnpj}</span>
                  </div>
                )}
                {empresa.telefone && (
                  <div className="doc-field">
                    <span className="doc-field-label">Telefone</span>
                    <span className="doc-field-value">{empresa.telefone}</span>
                  </div>
                )}
                {empresa.email && (
                  <div className="doc-field">
                    <span className="doc-field-label">E-mail</span>
                    <span className="doc-field-value">{empresa.email}</span>
                  </div>
                )}
                {(empresa.rua || empresa.cidade) && (
                  <div className="doc-field">
                    <span className="doc-field-label">Endereço</span>
                    <span className="doc-field-value">
                      {[empresa.rua && `${empresa.rua}${empresa.numero ? ', ' + empresa.numero : ''}`, empresa.complemento, empresa.bairro, empresa.cidade && `${empresa.cidade}/${empresa.estado}`, empresa.cep].filter(Boolean).join(' — ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="doc-section">
              <div className="doc-section-title">Dados {isPJ ? 'do Cliente (PJ)' : 'do Cliente'}</div>
              <div className="doc-field">
                <span className="doc-field-label">{isPJ ? 'Razão Social' : 'Nome Completo'}</span>
                <span className="doc-field-value">{client.nome}</span>
              </div>
              <div className="doc-field">
                <span className="doc-field-label">{isPJ ? 'CNPJ' : 'CPF'}</span>
                <span className="doc-field-value">{client.cpf}</span>
              </div>
              {!isPJ && (
                <div className="doc-field">
                  <span className="doc-field-label">Data de Nascimento</span>
                  <span className="doc-field-value">{formatDate(client.nascimento)}</span>
                </div>
              )}
              <div className="doc-field">
                <span className="doc-field-label">Telefone</span>
                <span className="doc-field-value">{client.telefone}</span>
              </div>
              <div className="doc-field">
                <span className="doc-field-label">E-mail</span>
                <span className="doc-field-value">{client.email || '—'}</span>
              </div>
            </div>

            <div className="doc-section">
              <div className="doc-section-title">Endereço</div>
              <div className="doc-field">
                <span className="doc-field-label">Rua</span>
                <span className="doc-field-value">{client.rua || '—'}</span>
              </div>
              <div className="doc-field">
                <span className="doc-field-label">Número</span>
                <span className="doc-field-value">{client.numero || '—'}</span>
              </div>
              <div className="doc-field">
                <span className="doc-field-label">Complemento</span>
                <span className="doc-field-value">{client.complemento || '—'}</span>
              </div>
              <div className="doc-field">
                <span className="doc-field-label">Bairro</span>
                <span className="doc-field-value">{client.bairro || '—'}</span>
              </div>
              <div className="doc-field">
                <span className="doc-field-label">CEP</span>
                <span className="doc-field-value">{client.cep || '—'}</span>
              </div>
              <div className="doc-field">
                <span className="doc-field-label">Cidade/Estado</span>
                <span className="doc-field-value">{[client.cidade, client.estado].filter(Boolean).join(' — ') || '—'}</span>
              </div>
            </div>

            {client.camposExtras && client.camposExtras.length > 0 && (
              <div className="doc-section">
                <div className="doc-section-title">Informações Adicionais</div>
                {client.camposExtras.map((cf, i) => (
                  <div className="doc-field" key={i}>
                    <span className="doc-field-label">{cf.label}</span>
                    <span className="doc-field-value">{cf.value || '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="preview-actions">
            <button className="btn btn-secondary" onClick={onBack}>
              {Icons.arrowLeft}
              Voltar
            </button>
            <button className="btn btn-secondary" onClick={() => onEdit(client)}>
              {Icons.edit}
              Editar
            </button>
            <button className="btn btn-primary" onClick={generatePDF}>
              {Icons.download}
              Gerar PDF
            </button>
            <button className="btn btn-secondary" onClick={handlePrint}>
              {Icons.printer}
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
