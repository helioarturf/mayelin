# Deploy na Vercel — Jardim Escola da Mayelin

O projeto funciona na Vercel com o frontend React/Vite em `dist/` e a API Express como Serverless Function em `/api/index.ts`, ligada ao **Supabase** e à **API FactPlus**.

## Variáveis de Ambiente na Vercel (Settings → Environment Variables)
Configure as seguintes variáveis sem prefixo `VITE_`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_JWKS_URL`
- `SESSION_SECRET` (string aleatória segura com 32+ caracteres; obrigatória na Vercel para manter sessões válidas entre chamadas serverless)
- `FACTPLUS_API_URL` (`https://api.factplus.co.ao`)
- `FACTPLUS_API_KEY` (chave API da FactPlus)

## Rotas
- `/api/(.*)` é encaminhado para `/api/index.ts` via `vercel.json`.
- As restantes rotas da aplicação (ex.: `/` e `/portal`) carregam `/index.html`.
- Após alterar variáveis de ambiente na Vercel, execute sempre um **Redeploy**.
