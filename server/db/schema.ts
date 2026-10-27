import { getPool } from '../config/database.js';

export async function initializeSchema() {
  const pool = getPool();
  
  try {
    // Tabela de utilizadores
    await pool.query(`
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

    // Tabela de alunos
    await pool.query(`
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

    // Tabela de registos diários
    await pool.query(`
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

    // Tabela de faturas
    await pool.query(`
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

    // Tabela de anúncios
    await pool.query(`
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

    // Tabela de autorizações de recolha
    await pool.query(`
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

    // Tabela de agendamentos de visitas
    await pool.query(`
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

    console.log('✅ Schema da base de dados inicializado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar schema:', error);
    throw error;
  }
}

export async function seedInitialData() {
  const pool = getPool();
  const bcrypt = await import('bcryptjs');
  
  try {
    // Verificar se já existem utilizadores
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    if ((users as any)[0].count > 0) {
      console.log('ℹ️ Dados iniciais já existem');
      return;
    }

    // Criar utilizador admin padrão
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`,
      ['admin-001', 'Administrador', 'admin@mayelin.ao', hashedPassword, 'admin']
    );

    console.log('✅ Dados iniciais inseridos (admin@mayelin.ao / admin123)');
  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
  }
}
