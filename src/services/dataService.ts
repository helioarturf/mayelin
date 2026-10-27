import { db } from '../db/schema';
import { Student, Invoice, SchoolAnnouncement, DailyLogItem, PickupAuthorization } from '../types';

class DataService {
  // Students
  async getAllStudents(): Promise<Student[]> {
    try {
      const students = await db.students.toArray();
      if (students.length === 0) return [];
      return students;
    } catch (error) {
      console.error('Erro ao obter alunos:', error);
      return [];
    }
  }

  async saveStudent(student: Student): Promise<void> {
    try {
      await db.students.put(student);
      await this.addToSyncQueue('create', 'students', student);
    } catch (error) {
      console.error('Erro ao guardar aluno:', error);
    }
  }

  async saveStudents(students: Student[]): Promise<void> {
    try {
      await db.students.bulkPut(students);
    } catch (error) {
      console.error('Erro ao guardar alunos:', error);
    }
  }

  // Invoices
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      return await db.invoices.toArray();
    } catch (error) {
      console.error('Erro ao obter faturas:', error);
      return [];
    }
  }

  async saveInvoice(invoice: Invoice): Promise<void> {
    try {
      await db.invoices.put(invoice);
      await this.addToSyncQueue('create', 'invoices', invoice);
    } catch (error) {
      console.error('Erro ao guardar fatura:', error);
    }
  }

  async saveInvoices(invoices: Invoice[]): Promise<void> {
    try {
      await db.invoices.bulkPut(invoices);
    } catch (error) {
      console.error('Erro ao guardar faturas:', error);
    }
  }

  async updateInvoiceStatus(invoiceId: string, status: Invoice['status'], paidAt?: string): Promise<void> {
    try {
      const invoice = await db.invoices.get(invoiceId);
      if (invoice) {
        await db.invoices.put({ ...invoice, status, paidAt });
        await this.addToSyncQueue('update', 'invoices', { invoiceId, status, paidAt });
      }
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error);
    }
  }

  // Announcements
  async getAllAnnouncements(): Promise<SchoolAnnouncement[]> {
    try {
      return await db.announcements.toArray();
    } catch (error) {
      console.error('Erro ao obter anúncios:', error);
      return [];
    }
  }

  async saveAnnouncements(announcements: SchoolAnnouncement[]): Promise<void> {
    try {
      await db.announcements.bulkPut(announcements);
    } catch (error) {
      console.error('Erro ao guardar anúncios:', error);
    }
  }

  // Daily Logs
  async getDailyLogs(studentId: string): Promise<DailyLogItem[]> {
    try {
      return await db.dailyLogs.where('studentId').equals(studentId).toArray();
    } catch (error) {
      console.error('Erro ao obter registos diários:', error);
      return [];
    }
  }

  async saveDailyLog(studentId: string, log: DailyLogItem): Promise<void> {
    try {
      await db.dailyLogs.put({ ...log, studentId } as any);
      await this.addToSyncQueue('create', 'dailyLogs', { studentId, log });
    } catch (error) {
      console.error('Erro ao guardar registo diário:', error);
    }
  }

  // Pickup Authorization
  async getPickupAuthorizations(): Promise<PickupAuthorization[]> {
    try {
      return await db.pickupAuth.toArray();
    } catch (error) {
      console.error('Erro ao obter autorizações:', error);
      return [];
    }
  }

  async savePickupAuthorization(auth: PickupAuthorization): Promise<void> {
    try {
      await db.pickupAuth.put(auth);
      await this.addToSyncQueue('create', 'pickupAuth', auth);
    } catch (error) {
      console.error('Erro ao guardar autorização:', error);
    }
  }

  // Sync Queue
  async addToSyncQueue(action: 'create' | 'update' | 'delete', entity: string, data: any): Promise<void> {
    try {
      const item = {
        id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        entity: entity as any,
        data,
        timestamp: Date.now(),
        synced: false
      };
      await db.syncQueue.add(item);
    } catch (error) {
      console.error('Erro ao adicionar à fila de sincronização:', error);
    }
  }

  async getPendingSyncItems() {
    try {
      return await db.syncQueue.where('synced').equals(0).toArray();
    } catch (error) {
      console.error('Erro ao obter itens pendentes:', error);
      return [];
    }
  }

  async markAsSynced(id: string): Promise<void> {
    try {
      await db.syncQueue.update(id, { synced: true });
    } catch (error) {
      console.error('Erro ao marcar como sincronizado:', error);
    }
  }

  async clearSyncedItems(): Promise<void> {
    try {
      await db.syncQueue.where('synced').equals(1).delete();
    } catch (error) {
      console.error('Erro ao limpar itens sincronizados:', error);
    }
  }
}

export const dataService = new DataService();
