import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  connectTimeout: 10000,
};

let pool: mysql.Pool | null = null;
let lastError: string | null = null;

export function getLastDbError() {
  return lastError;
}

export async function createDatabaseIfNotExists() {
  const dbName = process.env.DB_NAME || 'mayelin_db';
  try {
    // Tenta criar a BD (pode falhar em hosting partilhado sem privilégio CREATE)
    try {
      const connection = await mysql.createConnection(baseConfig);
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      await connection.end();
      console.log(`✅ Base de dados '${dbName}' verificada/criada com sucesso`);
    } catch (e: any) {
      console.warn(`⚠️  Não foi possível criar/verificar BD '${dbName}' (pode já existir ou faltar privilégio CREATE): ${e?.message}`);
      // Continua - tenta ligar diretamente à BD
    }

    pool = mysql.createPool({
      ...baseConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Testa a ligação
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();

    lastError = null;
    console.log(`✅ Ligação à base de dados '${dbName}' estabelecida`);
    return pool;
  } catch (error: any) {
    lastError = error?.message || String(error);
    pool = null;
    console.error('❌ Erro ao ligar à base de dados:', lastError);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error(lastError ? `Pool de conexões não inicializado: ${lastError}` : 'Pool de conexões não inicializado');
  }
  return pool;
}

export function hasPool() {
  return !!pool;
}

export default { createDatabaseIfNotExists, getPool, getLastDbError, hasPool };
