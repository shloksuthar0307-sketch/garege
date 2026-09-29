import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSyncStore } from '../store/useSyncStore';

export function ConnectionStatus() {
  const { isOnline, setOnlineStatus, queue, removeFromQueue } = useSyncStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  useEffect(() => {
    if (isOnline && queue.length > 0 && !isSyncing) {
      processQueue();
    }
  }, [isOnline, queue.length]);

  const processQueue = async () => {
    if (queue.length === 0) return;
    setIsSyncing(true);
    
    // Process queue items one by one
    for (const req of queue) {
      try {
        // In a real app we would use fetch with req.url, req.method, req.body
        // e.g. await fetch(req.url, { method: req.method, body: JSON.stringify(req.body) })
        console.log('Syncing offline request:', req);
        await new Promise(resolve => setTimeout(resolve, 500)); // simulate network delay
        removeFromQueue(req.id);
      } catch (err) {
        console.error('Failed to sync request:', err);
        // Leave in queue to try later
      }
    }
    
    setIsSyncing(false);
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 3000);
  };

  if (isOnline && queue.length === 0 && !syncSuccess && !isSyncing) {
    return null; // hide when online and no pending queue
  }

  return (
    <div className={`flex items-center gap-2 px-3 h-12 rounded-xl border font-medium text-sm transition-all ${
      !isOnline 
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' 
        : syncSuccess
          ? 'bg-[#35D07F]/10 border-[#35D07F]/30 text-[#35D07F]'
          : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
    }`}>
      {!isOnline ? (
        <>
          <WifiOff size={16} />
          <span>Offline mode</span>
          {queue.length > 0 && (
            <span className="ml-2 bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] font-bold">
              {queue.length} pending
            </span>
          )}
        </>
      ) : isSyncing ? (
        <>
          <RefreshCw size={16} className="animate-spin" />
          <span>Syncing {queue.length} items...</span>
        </>
      ) : syncSuccess ? (
        <>
          <CheckCircle2 size={16} />
          <span>Sync complete</span>
        </>
      ) : (
        <>
          <Wifi size={16} />
          <span>Online</span>
          {queue.length > 0 && (
            <button 
              onClick={processQueue}
              className="ml-2 flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw size={14} /> Sync {queue.length}
            </button>
          )}
        </>
      )}
    </div>
  );
}

