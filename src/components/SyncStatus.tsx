import React, { useEffect, useState } from 'react';
import { flushMutationQueue } from '../services/cloudSyncService';

/**
 * Simple sync status indicator showing online/offline state and allowing manual flush.
 */
export default function SyncStatus() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [flushing, setFlushing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFlush = async () => {
    setFlushing(true);
    try {
      await flushMutationQueue();
    } catch (e) {
      console.warn('Flush failed', e);
    } finally {
      setFlushing(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm p-2 rounded" style={{ background: online ? '#0a2f1e' : '#2f0a0a' }}>
      <span className="font-mono" title={online ? 'Online' : 'Offline'}>
        {online ? '⚡️ Online' : '🌙 Offline'}
      </span>
      {online && (
        <button
          onClick={handleFlush}
          disabled={flushing}
          className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs"
        >
          {flushing ? 'Flushing...' : 'Flush Queue'}
        </button>
      )}
    </div>
  );
}
