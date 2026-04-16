import { useState, useEffect, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { NotificationContext } from '../contexts/NotificationContext';

export default function DesktopNotifications() {
  const { notifications } = useContext(NotificationContext);
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const visibleNotifications = notifications.filter(n => !dismissedIds.has(n.id));

  const handleDismiss = (id) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'success': return 'bg-emerald-50 border-emerald-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="hidden md:flex fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex-col gap-3 max-w-md pointer-events-none">
      {visibleNotifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-start gap-3 p-4 rounded-lg border ${getColor(notif.type)} shadow-lg pointer-events-auto animate-in slide-in-from-bottom duration-300`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notif.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{notif.message}</p>
          </div>
          <button
            onClick={() => handleDismiss(notif.id)}
            className="flex-shrink-0 ml-2 p-1 hover:bg-black/10 rounded transition-colors"
            title="Tutup"
          >
            <X className="h-4 w-4 text-gray-600 hover:text-gray-900" />
          </button>
        </div>
      ))}
    </div>
  );
}
