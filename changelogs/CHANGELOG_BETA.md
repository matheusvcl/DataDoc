## [v0.2.2-beta] - 12/10/2026

### Adicionado

- Re-verificação automática de atualização a cada 15 minutos: o popup aparece sozinho assim que o release termina, mesmo com o app aberto desde antes

### Corrigido

- Atualização só é anunciada quando o workflow do release termina por completo — o `latest.json` do updater passou a ser publicado pelo CI apenas no fim, com instalador e assinatura já prontos (elimina o popup cedo e o "Erro ao baixar atualização" causado pela assinatura provisória no manifesto)
- Download que ficava falhando para sempre depois de um erro: o app re-verifica e descarta a assinatura congelada da checagem anterior, então o próximo clique em "Baixar Atualização" usa dados frescos
- Popup de atualização não reabre sozinho para uma versão que já foi adiada em "Depois"

### Melhorado

- Binário do aplicativo compilado como `DataDoc.exe` em vez de `app.exe`
