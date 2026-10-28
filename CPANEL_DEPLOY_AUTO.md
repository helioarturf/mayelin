# Deploy no cPanel via GitHub com MySQL automático

## 1) Git Version Control
cPanel > Git Version Control > Create Repository
- Clone URL: https://github.com/helioarturf/mayelin.git
- Repository Path: repositories/mayelin
- Branch: main
- Deploy HEAD Commit: Sim

## 2) Setup Node.js App
cPanel > Setup Node.js App > Create Application
- Node.js version: 18.x ou 20.x
- Application mode: Production
- Application root: repositories/mayelin
- Application startup file: dist-server/index.js
- Application URL: mayelin.ao

## 3) Environment Variables
Adicione estas variáveis:

DB_HOST=localhost
DB_USER=SEU_UTILIZADOR_MYSQL
DB_PASSWORD=SUA_PASSWORD_MYS
DB_NAME=mayelin_db
DB_PORT=3306
JWT_SECRET=CHANGE_ME_TO_RANDOM_STRING
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=production
FACTPLUS_API_KEY=6adb32d2abda1de3c6b0053000a3b601
FACTPLUS_API_URL=https://api.factplus.co.ao
APP_URL=http://mayelin.ao

## 4) Deploy
Git Version Control > mayelin > Pull or Deploy > Deploy HEAD Commit
Setup Node.js App > Start/Restart App

## Funcionamento automático
Ao iniciar dist-server/index.js:
- Cria base de dados DB_NAME caso não exista
- Cria todas as tabelas automaticamente
- Cria utilizador admin (admin@mayelin.ao / admin123)
