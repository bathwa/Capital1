import { useState, useEffect } from 'react';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    const saved = localStorage.getItem('abathwa_pending_actions');
    if (saved) {
      setPendingActions(JSON.parse(saved));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = (type: string, data: any) => {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now()
    };

    const newActions = [...pendingActions, action];
    setPendingActions(newActions);
    localStorage.setItem('abathwa_pending_actions', JSON.stringify(newActions));
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    // Process pending actions
    for (const action of pendingActions) {
      try {
        // Process action based on type
        console.log('Syncing action:', action);
        // TODO: Implement actual sync logic
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }

    // Clear synced actions
    setPendingActions([]);
    localStorage.removeItem('abathwa_pending_actions');
  };

  useEffect(() => {
    if (isOnline) {
      syncPendingActions();
    }
  }, [isOnline]);

  return {
    isOnline,
    pendingActions,
    queueAction,
    syncPendingActions
  };
};