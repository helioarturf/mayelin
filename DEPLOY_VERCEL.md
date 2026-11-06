# Deploy na Vercel (importante)

Este projeto é **full-stack** (frontend Vite/React em `dist/` + backend Express + MySQL em `dist-server/`).

## Limitação
A Vercel **não executa** este backend como está (`app.listen()` + MySQL persistente). Por isso:
- `http(s)://*.vercel.app` / domínios apontados à Vercel servem apenas o **frontend estático** (com `vercel.json`).
- As rotas `/api/*` **não funcionarão** na Vercel sem reescrever a API como Serverless Functions e usar uma base de dados compatível.

## Recomendado para mayelin.ao
Hospedar o backend+frontend no **cPanel/Node.js App** (ver `DEPLOY_CPANEL.md` / `CPANEL_DEPLOY_AUTO.md`) e apontar o DNS de `mayelin.ao` e `www.mayelin.ao` para o servidor cPanel.

## Erro 503 em `www.mayelin.ao`
Se `www.mayelin.ao` estiver configurado na Vercel mas o deployment falhar/incompatível, o domínio pode devolver 503. Verifique:
1. **Vercel → Project → Domains**: `www.mayelin.ao` está adicionado e com estado válido?
2. **DNS**: `www` deve apontar para o destino correto:
   - para cPanel: registo `CNAME`/`A` para o host do cPanel (não para `cname.vercel-dns.com`), ou
   - para Vercel (apenas frontend): `CNAME www -> cname.vercel-dns.com` e deploy funcional.
3. **Vercel → Deployments**: o último deploy está “Ready”? Se falhou, abra os logs (muitas vezes build/saída incorreta para este tipo de app).
4. Se usar **apenas frontend na Vercel**, defina `VITE_`/variáveis necessárias e aponte a app para uma API externa; caso contrário, use o deploy cPanel completo.
