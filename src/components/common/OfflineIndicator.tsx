import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useTranslation } from 'react-i18next';

const OfflineIndicator: React.FC = () => {
  const { isOnline, pendingActions } = useOfflineSync();
  const { t } = useTranslation();

  if (isOnline && pendingActions.length === 0) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
      isOnline ? 'bg-warning-100 text-warning-800' : 'bg-error-100 text-error-800'
    }`}>
      <div className="flex items-center space-x-2">
        {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span className="text-sm font-medium">
          {isOnline 
            ? `${pendingActions.length} ${t('common.pending')}` 
            : t('common.offline')
          }
        </span>
      </div>
    </div>
  );
};

export default OfflineIndicator;