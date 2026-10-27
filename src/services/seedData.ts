import { db } from '../db/schema';
import { INITIAL_STUDENTS } from '../data/mockData';
import { INITIAL_INVOICES } from '../utils/invoiceUtils';

export async function seedDatabase() {
  try {
    const studentsCount = await db.students.count();
    if (studentsCount === 0) {
      await db.students.bulkPut(INITIAL_STUDENTS);
      console.log('Alunos iniciais carregados na BD local');
    }

    const invoicesCount = await db.invoices.count();
    if (invoicesCount === 0) {
      await db.invoices.bulkPut(INITIAL_INVOICES);
      console.log('Faturas iniciais carregadas na BD local');
    }
  } catch (error) {
    console.error('Erro ao popular BD local:', error);
  }
}
