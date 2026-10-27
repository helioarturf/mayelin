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
✅ Servir frontend + API num único servidor
✅ Configuração via .htaccess para proxy reverso

## Troubleshooting

### Erro de ligação à BD
Verifique se as credenciais MySQL estão corretas. No cPanel pode criar utilizador MySQL em "MySQL Databases".

### App não inicia
Verifique logs em "Setup Node.js App" > "Log file"

### Porta já em uso
O cPanel atribui porta automaticamente, mas o código usa PORT da env
