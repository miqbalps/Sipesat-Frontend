import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toastNotifications, setToastNotifications] = useState([]); // auto-dismiss
  const [drawerNotifications, setDrawerNotifications] = useState([]); // manual dismiss
  
  // Combine untuk compatibility dengan component yang expect notifications array
  const notifications = [...toastNotifications, ...drawerNotifications];

  const addNotification = useCallback((message, type = 'info', options = {}) => {
    const id = Date.now();
    const {
      duration = 4000, // default 4 detik untuk toast (auto-dismiss)
      showInDrawer = true // juga tampil di drawer
    } = options;
    
    const newNotification = { 
      id, 
      message, 
      type, 
      timestamp: new Date().toISOString()
    };
    
    // Tambah ke toast (akan auto-dismiss)
    setToastNotifications((prev) => [...prev, newNotification]);
    
    // Tambah ke drawer jika showInDrawer=true (permanent sampai manual hapus)
    if (showInDrawer) {
      setDrawerNotifications((prev) => [...prev, newNotification]);
    }
    
    // Toast: auto-dismiss setelah duration
    if (duration > 0) {
      setTimeout(() => {
        setToastNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    // Hapus dari toast
    setToastNotifications((prev) => prev.filter((n) => n.id !== id));
    // Hapus dari drawer
    setDrawerNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setToastNotifications([]);
    setDrawerNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      toastNotifications,
      drawerNotifications,
      addNotification, 
      removeNotification, 
      clearAllNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
