import { useContext } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { NotificationContext } from '../contexts/NotificationContext';

const icons = {
  success: <CheckCircle2 className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
};

const bgClasses = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  error: 'bg-red-50 border-red-200 text-red-900',
  info: 'bg-blue-50 border-blue-200 text-blue-900',
};

const iconColors = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-blue-600',
};

export function ToastContainer() {
  const { toastNotifications, removeNotification } = useContext(NotificationContext);

  return (
    <div className="fixed top-4 right-4 md:bottom-6 md:top-auto z-50 space-y-3 md:p-6 p-4 max-w-md md:max-w-none">
      {toastNotifications.map((notif) => (
        <div
          key={notif.id}
          className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 ${bgClasses[notif.type]}`}
        >
          <div className={iconColors[notif.type]}>
            {icons[notif.type]}
          </div>
          <div className="flex-1 text-sm font-medium">
            {notif.message}
          </div>
          <button
            onClick={() => removeNotification(notif.id)}
            className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}
