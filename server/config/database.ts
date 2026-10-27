import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '3306'),
};

let pool: mysql.Pool | null = null;

export async function createDatabaseIfNotExists() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || 'mayelin_db';
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de dados '${dbName}' verificada/criada com sucesso`);
    
    await connection.end();
    
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    
    return pool;
  } catch (error) {
    console.error('❌ Erro ao criar/verificar base de dados:', error);
    throw error;
  }
}

export function getPool() {
  if (!pool) {
    throw new Error('Pool de conexões não inicializado');
  }
  return pool;
}

export default { createDatabaseIfNotExists, getPool };
