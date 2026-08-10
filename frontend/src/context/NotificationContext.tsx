import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { NotificationContext } from './notificationContextStore';
import notificationService from '../services/notificationService';
import type { NotificationDTO } from '../types/notification.types';

interface NotificationWithMeta extends NotificationDTO {
  read?: boolean;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationWithMeta[]>([]);

  const refresh = useCallback(async () => {
    try {
      const data = await notificationService.list();
      setNotifications(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
