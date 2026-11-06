# Deploy no cPanel com MySQL Automático

## Pré-requisitos
- Conta cPanel com acesso a "Setup Node.js App"
- Acesso a MySQL Databases

## Passo 1: Upload dos ficheiros
1. Compacte toda a pasta do projeto (exceto node_modules)
2. Faça upload do zip para o cPanel via File Manager
3. Extraia no diretório desejado (ex: public_html ou subdiretório)

## Passo 2: Configurar Node.js App
1. No cPanel, vá a "Setup Node.js App" > "Create Application"
2. Node.js version: 18.x ou superior
3. Application mode: Production
4. Application root: caminho da pasta extraída
5. Application URL: domínio/subdomínio
6. Application startup file: `dist-server/index.js`
7. Clique em "Create"

## Passo 3: Configurar variáveis de ambiente
No painel da Node.js App, adicione as seguintes variáveis:

```env
DB_HOST=localhost
DB_USER=seu_utilizador_mysql
DB_PASSWORD=sua_password_mysql
DB_NAME=mayelin_db
DB_PORT=3306
JWT_SECRET=gere_uma_chave_segura_aqui
PORT=3001
NODE_ENV=production
FACTPLUS_API_KEY=6adb32d2abda1de3c6b0053000a3b601
FACTPLUS_API_URL=https://api.factplus.co.ao
```

**Nota:** O script cria automaticamente a base de dados `DB_NAME` se não existir, usando as credenciais fornecidas.

## Passo 4: Instalar dependências e build
No terminal do cPanel ou via SSH:

```bash
npm install
npm run build
```

Ou use o botão "Run NPM Install" no painel Node.js App.

## Passo 5: Iniciar aplicação
Clique em "Start App" no painel Node.js App.

## Verificação

- Aceda ao seu domínio - deve mostrar o site
- Teste API: `https://seu-dominio.com/api/health`
- Teste setup: `https://seu-dominio.com/api/setup/status`
- Login admin: `admin@mayelin.ao` / `admin123` (altere após primeiro login)

## Funcionalidades Automáticas

✅ Criação automática da base de dados MySQL
✅ Criação automática de todas as tabelas
✅ Inserção automática do utilizador admin
✅ Servir frontend + API num único servidor (`dist/` + `dist-server/index.js`)

> **Importante:** Não inclua um `.htaccess` personalizado no deploy do app Node.js. O cPanel (Passenger/Setup Node.js App) gere o `.htaccess` automaticamente; sobrescrevê-lo pode causar **503/erro de acesso**.

## Troubleshooting

### Erro 503 (Service Unavailable) após apontar DNS para cPanel
1. **Setup Node.js App** → confirme que a aplicação existe, está em **Started/Running** e tem:
   - Application root: `repositories/mayelin` (ou o caminho real)
   - Startup file: `dist-server/index.js`
   - Node.js: 18.x ou 20.x
2. **Run NPM Install** (ou `npm install --legacy-peer-deps` no terminal do app) — `dist-server/index.js` depende de `express`, `mysql2`, `cors`, `dotenv`, etc. em `node_modules`.
3. **Restaurar `.htaccess` gerido pelo Passenger**: se o `.htaccess` da pasta da aplicação foi sobrescrito por deploy, o Passenger pode parar de funcionar. Em *Setup Node.js App*, faça **Stop App** → edite/guarde as definições (ou **Restart**) para o cPanel regenerar o `.htaccess`, ou apague o `.htaccess` manual e reinicie a app.
4. Verifique os **logs** em *Setup Node.js App → Log* e os *Error Logs* do Apache/cPanel.
5. Teste direto: `https://www.mayelin.ao/api/health` (deve responder JSON quando a app Node está ativa).

### Erro de ligação à BD
A app deve continuar acessível mesmo sem BD (responde em `/api/health` com `dbReady:false`). Verifique as credenciais MySQL em "MySQL Databases" e as variáveis de ambiente.

### App não inicia
Verifique logs em "Setup Node.js App" > "Log file" e confirme que `dist-server/index.js` e `dist/index.html` existem no Application root.
