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
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mayelin API funcionando' });
});

app.get('/api/setup/status', async (req, res) => {
  try {
    const { getPool } = await import('./config/database.js');
    const pool = getPool();
    const [rows] = await pool.query('SHOW TABLES');
    res.json({ 
      status: 'ok', 
      tables: (rows as any[]).length,
      message: 'Base de dados configurada' 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Base de dados não configurada' });
  }
});

// Servir ficheiros estáticos do frontend
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Rota para SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

async function startServer() {
  try {
    console.log('🚀 Iniciando servidor Mayelin...');
    console.log('📦 A verificar/criar base de dados MySQL...');
    
    await createDatabaseIfNotExists();
    console.log('📊 A inicializar schema...');
    
    await initializeSchema();
    console.log('🌱 A inserir dados iniciais...');
    
    await seedInitialData();
    
    app.listen(PORT, () => {
      console.log(`✅ Servidor a correr na porta ${PORT}`);
      console.log(`🌐 Aceda em: http://localhost:${PORT}`);
      console.log('🎉 Deploy completo - Base de dados MySQL criada automaticamente!');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
