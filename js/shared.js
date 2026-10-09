const { useState, useEffect, useRef, useCallback } = React;

// Icons
const Icons = {
  user: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  fileText: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  clock: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  search: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  download: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  printer: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>,
  edit: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  eye: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  plus: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  x: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  trash: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  users: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  fileDown: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>,
  check: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrowLeft: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  layers: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  building: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  calendar: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chevronLeft: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevronRight: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  home: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  upload: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  settings: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  filePlus: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
};

// Funções puras (asText, digitsOnly, máscaras, validadores, sanitização, CSV, tema)
// vivem em js/core.js — carregado antes deste arquivo.

const fetchJson = async (url, timeoutMs = 8000) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const lookupCEP = async (cep) => {
  const digits = digitsOnly(cep, 8);
  if (digits.length !== 8) return null;
  const data = await fetchJson(`https://viacep.com.br/ws/${digits}/json/`);
  if (!data || data.erro) return null;
  return {
    rua: asText(data.logradouro, 200),
    bairro: asText(data.bairro, 100),
    cidade: asText(data.localidade, 100),
    estado: asText(data.uf, 50),
    cep: formatCEP(data.cep || digits),
    complemento: asText(data.complemento, 100)
  };
};

const searchAddressByStreet = async (uf, cidade, rua) => {
  if (!uf || !cidade || !rua || rua.length < 3) return [];
  const data = await fetchJson(
    `https://viacep.com.br/ws/${encodeURIComponent(uf)}/${encodeURIComponent(cidade)}/${encodeURIComponent(rua)}/json/`
  );
  if (!Array.isArray(data)) return [];
  return data.slice(0, 10).map((item) => ({
    cep: asText(item.cep, 16),
    rua: asText(item.logradouro, 200),
    bairro: asText(item.bairro, 100),
    cidade: asText(item.localidade, 100),
    estado: asText(item.uf, 50),
    complemento: asText(item.complemento, 100)
  }));
};

// STORAGE_KEY, EMPTY_EMPRESA, sanitize*, load/saveClients/Company, tema: js/core.js

// mergeImportedClients: js/core.js (dedup por id e por documento+nome)

// STATES/estadoFromUf/ufFromEstado: js/core.js

const CITIES_BY_STATE = {
  'Acre': ['Brasiléia','Cruzeiro do Sul','Feijó','Rio Branco','Sena Madureira','Senador Guiomard','Tarauacá'],
  'Alagoas': ['Arapiraca','Coruripe','Delmiro Gouveia','Maceió','Marechal Deodoro','Palmeira dos Índios','Penedo','Rio Largo','São Miguel dos Campos','Unai'],
  'Amapá': ['Laranjal do Jari','Macapá','Mazagão','Oiapoque','Santana','Tartarugalzinho','Vitória do Jari'],
  'Amazonas': ['Autazes','Coari','Humaitá','Iranduba','Itacoatiara','Manacapuru','Manaus','Parintins','Presidente Figueiredo','Tabatinga','Tefé'],
  'Bahia': ['Alagoinhas','Barra do Choça','Barreiras','Belmonte','Camaçari','Candeias','Eunápolis','Feira de Santana','Guanambi','Ilhéus','Irece','Itabuna','Jequié','Juazeiro','Lauro de Freitas','Mucuri','Paulo Afonso','Porto Seguro','Salvador','Santo Antônio de Jesus','Simões Filho','Teixeira de Freitas','Valença','Vitória da Conquista'],
  'Ceará': ['Aquiraze','Canindé','Caucaia','Crateús','Crato','Fortaleza','Iguatu','Itapipoca','Jaguaribe','Juazeiro do Norte','Limoeiro do Norte','Maracanaú','Maranguape','Morada Nova','Orós','Pacatuba','Quixadá','Russas','Sobral','Tianguá'],
  'Distrito Federal': ['Brasília','Candangolândia','Catolândia','Ceilândia','Gama','Itapoã','Lago Norte','Lago Sul','Núcleo Bandeirante','Paranoá','Park Way','Plano Piloto','Recanto das Emas','Riacho Fundo','Samambaia','Santa Maria','Sudoeste/Octogonal','São Sebastião','Taguatinga','Varjão','Águas Claras'],
  'Espírito Santo': ['Aracruz','Baixo Guandu','Cachoeiro de Itapemirim','Cariacica','Castelo','Colatina','Conceição do Castelo','Fundão','Guarapari','Iúna','Linhares','Nova Venécia','Santa Teresa','Serra','Sooretama','São Mateus','Venda Nova do Imigrante','Vila Velha','Vitória'],
  'Goiás': ['Anápolis','Aparecida de Goiânia','Caldas Novas','Catalão','Cristalina','Formosa','Goiânia','Itapirapuã','Itumbiara','Jataí','Luziânia','Morrinhos','Novo Gama','Planaltina','Rio Verde','Senador Canedo','Trindade','Valparaíso de Goiás','Águas de Lindóia','Águas Lindas de Goiás'],
  'Maranhão': ['Acailandia','Bacabal','Balsas','Biritiba Mirim','Caxias','Chapadinha','Codó','Imperatriz','Paulino Neves','Paço do Lumiar','Presidente Dutra','Santa Inês','São José de Ribamar','São Luís','Timon','Unha'],
  'Mato Grosso': ['Alta Floresta','Barra do Garças','Campo Verde','Canarana','Chapada dos Guimarães','Cuiabá','Cáceres','Itiquira','Jaciara','Lucas do Rio Verde','Nova Mutum','Primavera do Leste','Querência','Rondonópolis','Sinop','Sorriso','São José do Rio Claro','Tangará da Serra','Tapurah','Várzea Grande'],
  'Mato Grosso do Sul': ['Angélica','Aquidauana','Campo Grande','Corumbá','Deodápolis','Dourados','Itaporã','Maracaju','Naviraí','Nova Alvorada do Sul','Nova Andradina','Nova Brasilândia do Sul','Ponta Porã','Sidrolândia','Três Lagoas'],
  'Minas Gerais': ['Alfenas','Barbacena','Belo Horizonte','Betim','Cambuí','Congresso','Contagem','Divinópolis','Governador Valadares','Ipatinga','Itabira','Juiz de Fora','Lavras','Monte Carmelo','Montes Claros','Passos','Patos de Minas','Pouso Alegre','Poços de Caldas','Ribeirão das Neves','Sabará','Santa Rita do Sapucaí','Sete Lagoas','Teófilo Otoni','Três Corações','Uberaba','Uberlândia','Varginha','Viçosa'],
  'Pará': ['Abaetetuba','Altamira','Ananindeua','Belém','Bragança','Breves','Cametá','Castanhal','Itaituba','Marabá','Marituba','Oriximiná','Paragominas','Parauapebas','Redenção','Santarém','Tailândia','Tucumã','Tucuruí'],
  'Paraíba': ['Areia','Bananeiras','Bayeux','Cabedelo','Cajazeiras','Campina Grande','Conceição','Donoso','Esperança','Guarabira','Itabaiana','João Pessoa','Monteiro','Patos','Pombal','Santa Rita','Sapé','Solânea','Sousa','Souza'],
  'Paraná': ['Agudos do Sul','Almirante Tamandaré','Antônio Carlos','Arapongas','Araucária','Astorgas','Bandeirantes','Belém do Caeté','Bocaiúva do Sul','Campo Largo','Campo Mourão','Cascavel','Colombo','Cornélio Procópio','Cruzeiro do Sul','Curitiba','Faxinal','Floresta','Fortaleza do Tabocão','Foz do Iguaçu','Guarapuava','Ibaiti','Ivaiporã','Jacarezinho','Jandaia do Sul','Japira','Lapa','Londrina','Mandaguari','Mandaguaçu','Mandirituba','Manoel Ribas','Maringá','Marumbi','Palmeira','Paranaguá','Pinhais','Piên','Ponta Grossa','Prudentópolis','Quitandinha','Rolândia','Santa Mariana','Sertaneja','São José dos Pinhais','São Mateus do Sul','São Pedro do Ivaí','Tijucas do Sul','Toledo','Tonga','Umuarama','Wenceslau Bras'],
  'Pernambuco': ['Abreu e Lima','Belo Jardim','Buenos Aires','Cabo de Santo Agostinho','Camaragibe','Caruaru','Escada','Garanhuns','Glória do Goitá','Goiana','Igarassu','Ipojuca','Jaboatão dos Guararapes','Lagoa do Itaenga','Olinda','Paulista','Petrolina','Recife','Sirinhaém','Surubim','São Lourenço da Mata','Taquaritinga do Norte','Tejucupapo','Vitória de Santo Antão'],
  'Piauí': ['Altos','Barras','Campo Maior','Canto do Buriti','Castelo do Piauí','Coivaras','Currais Novos','Floriano','José de Freitas','Luis Correia','Oeiras','Parnaíba','Picos','Piripiri','Simplicio Mendes','São Pedro do Piauí','São Raimundo Nonato','Teresina','Unai'],
  'Rio de Janeiro': ['Angra dos Reis','Barra Mansa','Belford Roxo','Cabo Frio','Campos dos Goytacazes','Carmo','Cordeiro','Duque de Caxias','Itaboraí','Itaguaí','Macaé','Magé','Mesquita','Nilópolis','Niterói','Nova Friburgo','Nova Iguaçu','Paraty','Paraíba do Sul','Petrópolis','Queimados','Resende','Rio das Ostras','Rio de Janeiro','São Gonçalo','São João de Meriti','Teresópolis','Três Rios','Valença','Volta Redonda'],
  'Rio Grande do Norte': ['Acari','Açu','Borborema','Caicó','Ceará-Mirim','Cerro Corá','Currais Novos','Florânia','Jundiaí do Sul','Lagoa Nova','Macaíba','Maxaranguape','Monte Alegre','Mossoró','Natal','Nova Cruz','Parelhas','Parnamirim','Santana do Matos','São Gonçalo do Amarante','São José de Mipibu','São Paulo do Potengi','Touros','Vera Cruz'],
  'Rio Grande do Sul': ['Alvorada','Bagé','Bento Gonçalves','Bragança Paulista','Cachoeira do Sul','Cachoeirinha','Canela','Canoas','Caxias do Sul','Dois Irmãos','Erechim','Gramado','Gravataí','Ijuí','Lajeado','Nova Prata','Novo Hamburgo','Passo Fundo','Pelotas','Porto Alegre','Rio Grande','Santa Cruz do Sul','Santa Maria','Santa Rosa','Sapucaia do Sul','São Leopoldo','Uruguaiana','Veranópolis','Viamão'],
  'Rondônia': ['Ariquemes','Cacoal','Candeias do Jamari','Castanheiras','Espigão d\'Oeste','Guajará-Mirim','Jaru','Ji-Paraná','Mirante da Serra','Nova União','Ouro Preto do Oeste','Pimenta Bueno','Porto Velho','Rolim de Moura','São Francisco do Guaporé','Vilhena'],
  'Roraima': ['Alto Alegre','Amajari','Boa Vista','Bonfim','Cantá','Caracaraí','Mucajaí','Normandia','Pacaraima','Rorainópolis'],
  'Santa Catarina': ['Angelina','Araranguá','Balneário Camboriú','Balneário Piçarras','Blumenau','Brusque','Chapecó','Criciúma','Florianópolis','Forquilhinha','Freguesia do Ribeirão da Ilha','Gaspar','Indaial','Itajaí','Içara','Jaraguá do Sul','Joinville','Lages','Leoberto Leal','Major Gercino','Maracajá','Meleiro','Navegantes','Nova Canaã do Norte','Nova Trento','Nova Veneza','Palhoça','Pedro Régis','Penha','Sangão','Siderópolis','São Bento do Sul','São José','Tijucas','Timbó','Trombudo Central','Tubarão','Urussanga','Águas Mornas'],
  'São Paulo': ['Araraquara','Assis','Avaré','Batatais','Bauru','Botucatu','Campinas','Carapicuíba','Catanduva','Diadema','Franco da Rocha','Guarulhos','Itaquaquecetuba','Jaú','Jundiaí','Limeira','Lins','Marília','Mauá','Mirassol','Mogi das Cruzes','Osasco','Ourinhos','Piracicaba','Praia Grande','Presidente Epitácio','Presidente Prudente','Registro','Ribeirão Preto','Santo André','Santos','Sorocaba','Suzano','São Bernardo do Campo','São Carlos','São José do Rio Preto','São José dos Campos','São Paulo','São Vicente','Taubaté','Votuporanga'],
  'Sergipe': ['Aracaju','Boquim','Capela','Estância','Itabaiana','Lagarto','Nossa Senhora do Socorro','Poço Redondo','Propriá','Riachão do Dantas','Santa Rosa de Lima','Simão Dias','São Cristóvão','Tobias Barreto','Umbaúba'],
  'Tocantins': ['Araguanã','Araguaína','Babaçulândia','Colinas do Tocantins','Dianópolis','Goiatins','Guaraí','Gurupi','Itaguatins','Jatobá','Lagoa da Confusão','Miracema do Tocantins','Novo Acordo','Palmas','Paraíso do Tocantins','Pium','Porto Nacional','Santa Terezinha do Tocantins','Tocantinópolis']
};

// Custom Select Component
function CustomSelect({ value, onChange, options, placeholder, id }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); setSearch(''); }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const filtered = options.filter((opt) =>
    String(opt).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="custom-select" ref={wrapperRef}>
      <button
        id={id}
        type="button"
        className={`custom-select-trigger${value ? ' has-value' : ''}`}
        onClick={() => { setOpen(!open); setSearch(''); }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{value || placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="custom-select-dropdown" role="listbox" id={`${id || 'select'}-listbox`}>
          <div className="custom-select-search-wrap">
            <input
              type="text"
              className="custom-select-search"
              placeholder="Buscar..."
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveIndex(0); }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
                else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
                else if (e.key === 'Enter') {
                  e.preventDefault();
                  const opt = filtered[activeIndex];
                  if (opt !== undefined) { onChange(opt); setOpen(false); setSearch(''); }
                }
              }}
              role="combobox"
              aria-expanded={open}
              aria-controls={`${id || 'select'}-listbox`}
              aria-activedescendant={filtered.length > 0 ? `${id || 'select'}-opt-${activeIndex}` : undefined}
              autoFocus
            />
          </div>
          <div className="custom-select-options">
            {filtered.length === 0 ? (
              <div className="custom-select-empty">Nenhum resultado</div>
            ) : (
              filtered.map((opt, i) => (
                <button
                  key={opt}
                  id={`${id || 'select'}-opt-${i}`}
                  type="button"
                  className={`custom-select-option${opt === value ? ' selected' : ''}${i === activeIndex ? ' active' : ''}`}
                  onClick={() => { onChange(opt); setOpen(false); setSearch(''); }}
                  onMouseEnter={() => setActiveIndex(i)}
                  role="option"
                  aria-selected={opt === value}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Address Lookup Component
function AddressLookup({ onSelect, estado, cidade }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const doSearch = async (q) => {
    const requestId = ++requestIdRef.current;
    const digits = digitsOnly(q, 8);
    if (digits.length === 8) {
      setLoading(true);
      const addr = await lookupCEP(digits);
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
      if (addr) {
        // formulários trabalham com o nome do estado (select); o storage guarda UF
        onSelect({ ...addr, estado: estadoFromUf(addr.estado) });
        setQuery('');
        setOpen(false);
        setResults([]);
      }
      return;
    }
    if (q.length >= 3 && estado && cidade) {
      setLoading(true);
      // ViaCEP exige a UF (2 letras) — o form guarda o nome do estado
      const addrs = await searchAddressByStreet(ufFromEstado(estado), cidade, q);
      if (requestId !== requestIdRef.current) return;
      setLoading(false);
      if (addrs.length > 0) {
        setResults(addrs);
        setOpen(true);
      } else {
        setResults([]);
      }
      return;
    }
    setResults([]);
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.replace(/\D/g, '').length === 8) {
      doSearch(val);
    } else if (val.length >= 3) {
      debounceRef.current = setTimeout(() => doSearch(val), 500);
    } else {
      setResults([]);
      setOpen(false);
    }
  };

  const handleSelect = (addr) => {
    onSelect({ ...addr, estado: estadoFromUf(addr.estado) });
    setQuery('');
    setOpen(false);
    setResults([]);
  };

  return (
    <div className="address-lookup" ref={wrapperRef}>
      <div className="address-lookup-input-wrap">
        {Icons.search}
        <input
          type="text"
          className="address-lookup-input"
          placeholder="Buscar por CEP ou nome da rua..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Buscar endereço por CEP ou nome da rua"
        />
        {loading && <span className="address-lookup-spinner" />}
      </div>
      {open && results.length > 0 && (
        <div className="address-lookup-dropdown">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              className="address-lookup-option"
              onClick={() => handleSelect(r)}
            >
              <span className="address-lookup-cep">{r.cep}</span>
              <span className="address-lookup-street">{r.rua}{r.bairro ? `, ${r.bairro}` : ''}</span>
              <span className="address-lookup-city">{r.cidade}/{r.estado}</span>
            </button>
          ))}
        </div>
      )}
      {open && query.length >= 3 && results.length === 0 && !loading && (
        <div className="address-lookup-dropdown">
          <div className="address-lookup-empty">Nenhum resultado encontrado</div>
        </div>
      )}
    </div>
  );
}

// Toast
function Toast({ message, onDone }) {
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; });
  // O timer depende só da mensagem — re-renders do App não o reiniciam (o toast sempre fecha)
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current && onDoneRef.current(), 2400);
    return () => clearTimeout(t);
  }, [message]);
  return <div className="toast" role="status">{message}</div>;
}

// Confirm Dialog
function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  const cancelRef = useRef(null);
  useEffect(() => { cancelRef.current && cancelRef.current.focus(); }, []);
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div className="dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title" id="dialog-title">{title}</div>
        <div className="dialog-text">{message}</div>
        <div className="dialog-actions">
          <button ref={cancelRef} className="btn btn-secondary btn-sm" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger btn-sm" onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  );
}

// DatePicker
const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const WEEKDAYS_PT = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];

function DatePicker({ value, onChange, id, label }) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) { const [y,m] = value.split('-'); return new Date(+y, +m - 1, 1); }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  });
  const [viewMode, setViewMode] = useState('days'); // 'days' | 'months' | 'years'
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (value) { const [y,m] = value.split('-'); setViewDate(new Date(+y, +m - 1, 1)); }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) { setOpen(false); setViewMode('days'); }
    };
    const handleKey = (e) => { if (e.key === 'Escape') { setOpen(false); setViewMode('days'); triggerRef.current?.focus(); } };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay + 6) % 7;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const days = [];
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startOffset - 1; i >= 0; i--) days.push({ day: prevMonthDays - i, other: true, date: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    days.push({ day: d, other: false, date: ds });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) days.push({ day: d, other: true, date: null });

  const navigate = (dir) => {
    setViewDate(new Date(year, month + dir, 1));
  };

  const selectDay = (dateStr) => {
    if (!dateStr) return;
    onChange(dateStr);
    setOpen(false);
    setViewMode('days');
    triggerRef.current?.focus();
  };

  const selectMonth = (m) => {
    setViewDate(new Date(year, m, 1));
    setViewMode('days');
  };

  const selectYear = (y) => {
    setViewDate(new Date(y, month, 1));
    setViewMode('months');
  };

  const clear = (e) => {
    e.stopPropagation();
    onChange('');
    triggerRef.current?.focus();
  };

  const displayText = value ? formatDate(value) : 'Selecione uma data';

  // Grade de anos paginada (12 por página, ancorada no ano em exibição);
  // as setas movem viewDate ±12 e, portanto, mudam a página da grade.
  const gridBase = viewDate.getFullYear();
  const yearStart = Math.floor(gridBase / 12) * 12;
  const yearEnd = yearStart + 11;
  const years = [];
  for (let y = yearStart; y <= yearEnd; y++) years.push(y);

  return (
    <div className="datepicker-wrapper" ref={wrapperRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`datepicker-trigger${value ? ' has-value' : ''}`}
        onClick={() => { setOpen(!open); setViewMode('days'); }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label}
      >
        {Icons.calendar}
        <span>{displayText}</span>
      </button>
      <button
        type="button"
        className={`datepicker-clear${value ? ' has-value' : ''}`}
        onClick={clear}
        tabIndex={value ? 0 : -1}
        aria-label="Limpar data"
      >
        {Icons.x}
      </button>
      {open && (
        <div className="datepicker-dropdown" role="dialog" aria-label="Calendário">
          {viewMode === 'days' && (
            <>
              <div className="datepicker-nav">
                <div className="datepicker-nav-btns">
                  <button type="button" className="datepicker-nav-btn" onClick={() => navigate(-1)} aria-label="Mês anterior">
                    {Icons.chevronLeft}
                  </button>
                </div>
                <div className="datepicker-nav-label">
                  <button type="button" className="dp-label-btn" onClick={() => setViewMode('months')} aria-label="Selecionar mês">
                    {MONTHS_PT[month]}
                  </button>
                  <span className="dp-label-sep">de</span>
                  <button type="button" className="dp-label-btn" onClick={() => setViewMode('years')} aria-label="Selecionar ano">
                    {year}
                  </button>
                </div>
                <div className="datepicker-nav-btns">
                  <button type="button" className="datepicker-nav-btn" onClick={() => navigate(1)} aria-label="Próximo mês">
                    {Icons.chevronRight}
                  </button>
                </div>
              </div>
              <div className="datepicker-weekdays">
                {WEEKDAYS_PT.map(w => <span key={w} className="datepicker-weekday">{w}</span>)}
              </div>
              <div className="datepicker-days">
                {days.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`datepicker-day${d.other ? ' other-month' : ''}${d.date === todayStr ? ' today' : ''}${d.date === value ? ' selected' : ''}`}
                    onClick={() => d.date && selectDay(d.date)}
                    disabled={d.other}
                    tabIndex={d.other ? -1 : 0}
                    aria-label={d.date ? formatDate(d.date) : undefined}
                  >
                    {d.day}
                  </button>
                ))}
              </div>
            </>
          )}

          {viewMode === 'months' && (
            <>
              <div className="datepicker-nav">
                <div className="datepicker-nav-btns">
                  <button type="button" className="datepicker-nav-btn" onClick={() => setViewDate(new Date(year - 1, month, 1))} aria-label="Ano anterior">
                    {Icons.chevronLeft}
                  </button>
                </div>
                <button type="button" className="dp-label-btn dp-label-strong" onClick={() => setViewMode('years')} aria-label="Selecionar ano">
                  {year}
                </button>
                <div className="datepicker-nav-btns">
                  <button type="button" className="datepicker-nav-btn" onClick={() => setViewDate(new Date(year + 1, month, 1))} aria-label="Próximo ano">
                    {Icons.chevronRight}
                  </button>
                </div>
              </div>
              <div className="dp-month-grid">
                {MONTHS_PT.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    className={`dp-month-cell${i === month && year === today.getFullYear() ? ' current' : ''}`}
                    onClick={() => selectMonth(i)}
                  >
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </>
          )}

          {viewMode === 'years' && (
            <>
              <div className="datepicker-nav">
                <div className="datepicker-nav-btns">
                  <button type="button" className="datepicker-nav-btn" onClick={() => setViewDate(new Date(year - 12, month, 1))} aria-label="Anterior">
                    {Icons.chevronLeft}
                  </button>
                </div>
                <span className="dp-label-btn dp-label-static">
                  {yearStart} – {yearEnd}
                </span>
                <div className="datepicker-nav-btns">
                  <button type="button" className="datepicker-nav-btn" onClick={() => setViewDate(new Date(year + 12, month, 1))} aria-label="Próximo">
                    {Icons.chevronRight}
                  </button>
                </div>
              </div>
              <div className="dp-year-grid">
                {years.map(y => (
                  <button
                    key={y}
                    type="button"
                    className={`dp-year-cell${y === today.getFullYear() ? ' current' : ''}`}
                    onClick={() => selectYear(y)}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
