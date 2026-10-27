import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { syncManager } from '../services/syncManager';

export default function OfflineIndicator() {
  const isOnline = useNetworkStatus();
  const [pendingCount, setPendingCount] = React.useState(0);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    const checkPending = async () => {
      const count = await syncManager.checkPending();
      setPendingCount(count);
    };
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    await syncManager.sync();
    setSyncing(false);
    const count = await syncManager.checkPending();
    setPendingCount(count);
  };

  if (isOnline && pendingCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all ${
        isOnline
          ? 'bg-amber-100 text-amber-800 border border-amber-300'
          : 'bg-rose-100 text-rose-800 border border-rose-300'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>{pendingCount} item{pendingCount !== 1 ? 's' : ''} pendente{pendingCount !== 1 ? 's' : ''} de sincronização</span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="ml-2 p-1 rounded-lg hover:bg-amber-200 disabled:opacity-50"
            title="Sincronizar agora"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          </button>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Modo Offline - Dados guardados localmente</span>
        </>
      )}
    </div>
  );
}
