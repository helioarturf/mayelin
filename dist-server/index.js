var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/config/database.ts
var database_exports = {};
__export(database_exports, {
  createDatabaseIfNotExists: () => createDatabaseIfNotExists,
  default: () => database_default,
  getPool: () => getPool
});
import mysql from "mysql2/promise";
import dotenv from "dotenv";
async function createDatabaseIfNotExists() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const dbName = process.env.DB_NAME || "mayelin_db";
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`\u2705 Base de dados '${dbName}' verificada/criada com sucesso`);
    await connection.end();
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    return pool;
  } catch (error) {
    console.error("\u274C Erro ao criar/verificar base de dados:", error);
    throw error;
  }
}
function getPool() {
  if (!pool) {
    throw new Error("Pool de conex\xF5es n\xE3o inicializado");
  }
  return pool;
}
var dbConfig, pool, database_default;
var init_database = __esm({
  "server/config/database.ts"() {
    dotenv.config();
    dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "",
      password: process.env.DB_PASSWORD || "",
      port: parseInt(process.env.DB_PORT || "3306")
    };
    pool = null;
    database_default = { createDatabaseIfNotExists, getPool };
  }
});

// server/index.ts
init_database();
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// server/db/schema.ts
init_database();
async function initializeSchema() {
  const pool2 = getPool();
  try {
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'professor', 'educador', 'pais') NOT NULL DEFAULT 'pais',
        phone VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        classroom VARCHAR(100) NOT NULL,
        age VARCHAR(50),
        avatar_letter VARCHAR(10),
        status VARCHAR(50) DEFAULT 'Presente',
        responsible_name VARCHAR(255),
        teacher_name VARCHAR(255),
        allergies JSON,
        medications JSON,
        photos JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS daily_logs (
        id VARCHAR(36) PRIMARY KEY,
        student_id VARCHAR(36) NOT NULL,
        time VARCHAR(20),
        title VARCHAR(255),
        description TEXT,
        category ENUM('meal', 'nap', 'activity', 'hygiene', 'health'),
        icon VARCHAR(50),
        color_class VARCHAR(100),
        bg_class VARCHAR(100),
        log_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        INDEX idx_student_date (student_id, log_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id VARCHAR(36) PRIMARY KEY,
        document_type VARCHAR(10) NOT NULL,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        series VARCHAR(20),
        sequence_number INT,
        issue_date DATE NOT NULL,
        due_date DATE,
        student_id VARCHAR(36),
        student_name VARCHAR(255),
        classroom VARCHAR(100),
        guardian_name VARCHAR(255),
        guardian_nif VARCHAR(50),
        guardian_email VARCHAR(255),
        guardian_phone VARCHAR(50),
        guardian_address TEXT,
        items JSON,
        subtotal DECIMAL(15,2),
        total_discount DECIMAL(15,2) DEFAULT 0,
        tax_total DECIMAL(15,2) DEFAULT 0,
        total_amount DECIMAL(15,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Emitida',
        payment_method VARCHAR(100),
        payment_reference JSON,
        paid_at DATE,
        electronic JSON,
        agt_hash VARCHAR(10),
        agt_certificate_number VARCHAR(50),
        notes TEXT,
        referenced_invoice_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
        INDEX idx_invoice_number (invoice_number),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        date DATE NOT NULL,
        target ENUM('todos', 'pais', 'educadoras', 'professores') DEFAULT 'todos',
        priority ENUM('normal', 'importante', 'urgente') DEFAULT 'normal',
        author VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS pickup_authorizations (
        id VARCHAR(36) PRIMARY KEY,
        person_name VARCHAR(255) NOT NULL,
        relationship VARCHAR(100),
        document_id VARCHAR(50),
        phone VARCHAR(50),
        date DATE,
        time_limit VARCHAR(20),
        status ENUM('Aprovado', 'Pendente') DEFAULT 'Pendente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS visit_appointments (
        id VARCHAR(36) PRIMARY KEY,
        age_group VARCHAR(20),
        shift VARCHAR(20),
        parent_name VARCHAR(255),
        child_name VARCHAR(255),
        whatsapp VARCHAR(50),
        email VARCHAR(255),
        date DATE,
        time VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("\u2705 Schema da base de dados inicializado com sucesso");
  } catch (error) {
    console.error("\u274C Erro ao inicializar schema:", error);
    throw error;
  }
}
async function seedInitialData() {
  const pool2 = getPool();
  const bcrypt = await import("bcryptjs");
  try {
    const [users] = await pool2.query("SELECT COUNT(*) as count FROM users");
    if (users[0].count > 0) {
      console.log("\u2139\uFE0F Dados iniciais j\xE1 existem");
      return;
    }
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool2.query(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      ["admin-001", "Administrador", "admin@mayelin.ao", hashedPassword, "admin"]
    );
    console.log("\u2705 Dados iniciais inseridos (admin@mayelin.ao / admin123)");
  } catch (error) {
    console.error("\u274C Erro ao inserir dados iniciais:", error);
  }
}
async function resetDatabase() {
  const pool2 = getPool();
  const bcrypt = await import("bcryptjs");
  try {
    await pool2.query("SET FOREIGN_KEY_CHECKS = 0");
    const tables = [
      "daily_logs",
      "invoices",
      "announcements",
      "pickup_authorizations",
      "visit_appointments",
      "students",
      "users"
    ];
    for (const t of tables) {
      await pool2.query(`TRUNCATE TABLE \`${t}\``);
    }
    await pool2.query("SET FOREIGN_KEY_CHECKS = 1");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool2.query(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      ["admin-001", "Administrador", "admin@mayelin.ao", hashedPassword, "admin"]
    );
    console.log("\u2705 Base de dados zerada e admin recriado (admin@mayelin.ao / admin123)");
    return { ok: true, message: "Base de dados zerada com sucesso. Admin recriado." };
  } catch (error) {
    try {
      await pool2.query("SET FOREIGN_KEY_CHECKS = 1");
    } catch {
    }
    console.error("\u274C Erro ao zerar base de dados:", error);
    throw error;
  }
}

// server/index.ts
dotenv2.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = Number(process.env.PORT) || 3001;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var dbReady = false;
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Mayelin API funcionando", dbReady });
});
app.get("/api/setup/status", async (_req, res) => {
  try {
    const { getPool: getPool2 } = await Promise.resolve().then(() => (init_database(), database_exports));
    const pool2 = getPool2();
    const [rows] = await pool2.query("SHOW TABLES");
    dbReady = true;
    res.json({
      status: "ok",
      tables: rows.length,
      message: "Base de dados configurada"
    });
  } catch (error) {
    dbReady = false;
    res.status(503).json({ status: "error", message: "Base de dados n\xE3o configurada", detail: error?.message });
  }
});
app.post("/api/setup/reset", async (req, res) => {
  try {
    const secret = String(req.body?.secret || req.headers["x-reset-secret"] || "");
    const expected = process.env.DB_RESET_SECRET || process.env.JWT_SECRET || "mayelin_secret_key_change_in_production";
    if (!secret || secret !== expected) {
      return res.status(403).json({ status: "error", message: "N\xE3o autorizado. Forne\xE7a o secret correto." });
    }
    if (!dbReady) {
      await initDatabase();
    }
    const result = await resetDatabase();
    return res.json({ status: "ok", ...result });
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Erro ao zerar base de dados", detail: error?.message });
  }
});
var distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Rota n\xE3o encontrada" });
  }
  return res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      res.status(200).type("text/plain").send("Aplica\xE7\xE3o iniciada. Construa o frontend (dist/) ou fa\xE7a deploy dos ficheiros est\xE1ticos.");
    }
  });
});
async function initDatabase() {
  try {
    console.log("\u{1F4E6} A verificar/criar base de dados MySQL...");
    await createDatabaseIfNotExists();
    console.log("\u{1F4CA} A inicializar schema...");
    await initializeSchema();
    console.log("\u{1F331} A inserir dados iniciais...");
    await seedInitialData();
    dbReady = true;
    console.log("\u{1F389} Base de dados MySQL pronta.");
  } catch (error) {
    dbReady = false;
    console.error("\u26A0\uFE0F  Base de dados indispon\xEDvel no arranque (a aplica\xE7\xE3o continuar\xE1 acess\xEDvel):", error);
  }
}
async function startServer() {
  console.log("\u{1F680} Iniciando servidor Mayelin...");
  await initDatabase();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\u2705 Servidor a correr na porta ${PORT}`);
    console.log(`\u{1F310} Aceda em: http://localhost:${PORT}`);
  });
}
startServer().catch((error) => {
  console.error("\u274C Erro fatal ao iniciar servidor:", error);
  setTimeout(() => process.exit(1), 1e3);
});
