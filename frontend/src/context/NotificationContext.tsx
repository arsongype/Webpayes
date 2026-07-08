import { useContext } from 'react';
import type { ReactNode } from 'react';
import { createContext, useState, useCallback } from 'react';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationContextValue {
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 shadow-lg backdrop-blur ${
                notification.type === 'success'
                  ? 'border-emerald-400/30 bg-emerald-500/20 text-emerald-200'
                  : notification.type === 'error'
                  ? 'border-red-400/30 bg-red-500/20 text-red-200'
                  : 'border-cyan-400/30 bg-cyan-500/20 text-cyan-200'
              }`}
            >
              <p className="text-sm">{notification.message}</p>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-lg leading-none opacity-70 hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};