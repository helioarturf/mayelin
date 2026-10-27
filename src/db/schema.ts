import Dexie, { Table } from 'dexie';
import { Student, Invoice, SchoolAnnouncement, DailyLogItem, PickupAuthorization } from '../types';

export interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  entity: 'students' | 'invoices' | 'announcements' | 'dailyLogs' | 'pickupAuth';
  data: any;
  timestamp: number;
  synced: boolean;
}

export class MayelinDB extends Dexie {
  students!: Table<Student, string>;
  invoices!: Table<Invoice, string>;
  announcements!: Table<SchoolAnnouncement, string>;
  dailyLogs!: Table<DailyLogItem, string>;
  pickupAuth!: Table<PickupAuthorization, string>;
  syncQueue!: Table<SyncQueueItem, string>;

  constructor() {
    super('MayelinPortalDB');
    this.version(1).stores({
      students: 'id, name, classroom',
      invoices: 'id, invoiceNumber, studentId, status',
      announcements: 'id, date, target',
      dailyLogs: 'id, studentId, time',
      pickupAuth: 'id, status, createdAt',
      syncQueue: 'id, entity, timestamp, synced'
    });
  }
}

export const db = new MayelinDB();
