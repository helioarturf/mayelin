import { db } from '../db/schema';

/**
 * Inicializa a base de dados local sem dados demo.
 * Em produção os dados devem vir do backend/MySQL.
 */
export async function seedDatabase() {
  try {
    // Garante que as tabelas existem no IndexedDB (Dexie cria automaticamente)
    await db.students.count();
    await db.invoices.count();
    await db.announcements.count();
    await db.dailyLogs.count();
    await db.pickupAuth.count();
  } catch (error) {
    console.error('Erro ao inicializar BD local:', error);
  }
}
