import { dataService } from './dataService';

class SyncManager {
  private isSyncing = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('Conexão restaurada - iniciando sincronização');
        this.sync();
      });
    }
  }

  async sync() {
    if (this.isSyncing || !navigator.onLine) return;
    
    this.isSyncing = true;
    try {
      const pendingItems = await dataService.getPendingSyncItems();
      console.log(`${pendingItems.length} itens pendentes para sincronizar`);
      
      for (const item of pendingItems) {
        try {
          // Simular sincronização - em produção seria envio para API
          await new Promise(resolve => setTimeout(resolve, 100));
          await dataService.markAsSynced(item.id);
          console.log(`Item ${item.id} sincronizado`);
        } catch (error) {
          console.error(`Erro ao sincronizar item ${item.id}:`, error);
        }
      }
      
      await dataService.clearSyncedItems();
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async checkPending() {
    const items = await dataService.getPendingSyncItems();
    return items.length;
  }
}

export const syncManager = new SyncManager();
