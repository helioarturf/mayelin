# Instalação Local Offline - Jardim Escola da Mayelin

Este guia explica como instalar e utilizar o portal em modo offline localmente.

## Pré-requisitos

- Node.js e npm instalados
- Navegador moderno (Chrome, Edge, Firefox)

## Instalação

### 1. Instalar dependências
```bash
npm install
```

### 2. Gerar build de produção
```bash
npm run build
```

### 3. Servir localmente
```bash
npm run preview:local
```
Ou alternativamente:
```bash
npx serve dist -l 8080
```

### 4. Aceder à aplicação
Abra o navegador em [http://localhost:8080](http://localhost:8080)

## Instalar como PWA (Aplicação Desktop/Móvel)

### No Chrome/Edge (Desktop)
1. Abra a aplicação no navegador
2. Clique no ícone "Instalar" (+) na barra de endereços
3. Clique em "Instalar"
4. A aplicação abrirá em modo standalone

### No Chrome (Android)
1. Abra a aplicação
2. Menu (⋮) > "Adicionar ao ecrã inicial"
3. Confirme a instalação

### No Safari (iOS)
1. Abra a aplicação
2. Botão Partilhar > "Adicionar ao Ecrã Principal"
3. Confirme

## Modo Offline

Após a primeira visita com ligação à internet:
- A aplicação ficará disponível offline
- Dados já carregados serão guardados localmente (IndexedDB)
- Alterações feitas offline irão para fila de sincronização
- Quando voltar online, serão sincronizadas automaticamente
- Um indicador aparecerá no canto inferior direito

## Funcionalidades Offline

- ✅ Visualização do portal
- ✅ Consulta de alunos e turmas
- ✅ Visualização de faturas
- ✅ Consulta de anúncios
- ✅ Registos diários já carregados
- ✅ Autorizações de recolha
- ⏳ Criação de novos registos (guardados em fila para sincronização)

## Troubleshooting

### App não instala
- Verifique se está a servir via HTTP(S) (não file://)
- Certifique-se que o Service Worker está registado (DevTools > Application > Service Workers)
- Verifique se o manifest está carregado

### Dados não aparecem offline
- Visite a aplicação pelo menos uma vez com internet
- Verifique IndexedDB em DevTools > Application > IndexedDB > MayelinPortalDB
- Limpe cache e recarregue se necessário

### Resetar dados locais
```javascript
// No console do navegador
indexedDB.deleteDatabase('MayelinPortalDB');
localStorage.clear();
location.reload();
```

## Suporte

Para mais informações, consulte o plano de implementação em `IMPLEMENTACAO_OFFLINE.md`
