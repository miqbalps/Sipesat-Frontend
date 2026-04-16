import { X, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { drawerNotifications, removeNotification, clearAllNotifications } = useContext(NotificationContext);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer from bottom - same on all screens */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 rounded-t-2xl p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Notifikasi</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {drawerNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Info className="h-12 w-12 opacity-20 mb-3" />
              <p className="text-sm">Tidak ada notifikasi</p>
            </div>
          ) : (
            drawerNotifications.map((notif) => {
              let IconComponent = Info;
              let bgColor = 'bg-blue-50 border-blue-200';
              let textColor = 'text-blue-700';

              if (notif.type === 'success') {
                IconComponent = CheckCircle2;
                bgColor = 'bg-emerald-50 border-emerald-200';
                textColor = 'text-emerald-700';
              } else if (notif.type === 'error') {
                IconComponent = AlertCircle;
                bgColor = 'bg-red-50 border-red-200';
                textColor = 'text-red-700';
              }

              return (
                <div 
                  key={notif.id} 
                  className={`flex items-start gap-3 p-3 rounded-lg border ${bgColor}`}
                >
                  <IconComponent className={`h-5 w-5 flex-shrink-0 mt-0.5 ${textColor}`} />
                  <div className="flex-1">
                    <p className={`text-sm ${textColor}`}>{notif.message}</p>
                    {notif.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.timestamp).toLocaleTimeString('id-ID')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeNotification(notif.id)}
                    className="p-1 hover:bg-black/10 rounded transition-colors flex-shrink-0"
                    title="Hapus"
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {drawerNotifications.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex gap-2">
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={onClose}
            >
              Tutup
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={clearAllNotifications}
              title="Hapus semua"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
