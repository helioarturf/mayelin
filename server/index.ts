import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createDatabaseIfNotExists } from './config/database.js';
import { initializeSchema, seedInitialData } from './db/schema.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let dbReady = false;

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Mayelin API funcionando', dbReady });
});

app.get('/api/setup/status', async (_req, res) => {
  try {
    const { getPool } = await import('./config/database.js');
    const pool = getPool();
    const [rows] = await pool.query('SHOW TABLES');
    dbReady = true;
    res.json({ 
      status: 'ok', 
      tables: (rows as any[]).length,
      message: 'Base de dados configurada' 
    });
  } catch (error: any) {
    dbReady = false;
    res.status(503).json({ status: 'error', message: 'Base de dados não configurada', detail: error?.message });
  }
});

// Servir ficheiros estáticos do frontend
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Rota para SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  return res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).type('text/plain').send('Aplicação iniciada. Construa o frontend (dist/) ou faça deploy dos ficheiros estáticos.');
    }
  });
});

async function initDatabase() {
  try {
    console.log('📦 A verificar/criar base de dados MySQL...');
    await createDatabaseIfNotExists();
    console.log('📊 A inicializar schema...');
    await initializeSchema();
    console.log('🌱 A inserir dados iniciais...');
    await seedInitialData();
    dbReady = true;
    console.log('🎉 Base de dados MySQL pronta.');
  } catch (error) {
    dbReady = false;
    console.error('⚠️  Base de dados indisponível no arranque (a aplicação continuará acessível):', error);
  }
}

async function startServer() {
  console.log('🚀 Iniciando servidor Mayelin...');
  await initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Servidor a correr na porta ${PORT}`);
    console.log(`🌐 Aceda em: http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('❌ Erro fatal ao iniciar servidor:', error);
  // Keep process alive briefly for logs in managed environments
  setTimeout(() => process.exit(1), 1000);
});
