import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { NotificationContext } from './notificationContextStore';
import notificationService from '../services/notificationService';
import type { NotificationDTO } from '../types/notification.types';
import { useAuth } from '../hooks/useAuth';

interface NotificationWithMeta extends NotificationDTO {
  read?: boolean;
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationWithMeta[]>([]);
  const [lastReadAt, setLastReadAt] = useState<number>(Date.now());
  const shownIds = useRef<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();

  const refresh = useCallback(async () => {
    try {
      const data = await notificationService.list();
      setNotifications(data);
      data.forEach((n: NotificationDTO) => {
        if (!shownIds.current.has(n.id) && !n.read) {
          shownIds.current.add(n.id);
          if (typeof window !== 'undefined' && (window as any).showToast) {
            const typeMap: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
              TRANSACTION: 'success',
              PAYMENT: 'success',
              PAYMENT_RECEIVED: 'success',
              SYSTEM: 'info',
            };
            (window as any).showToast({
              type: typeMap[n.type] ?? 'info',
              title: n.subject,
              message: n.body,
              duration: 6000,
            });
          }
        }
      });

      // Cleanup old IDs (keep last 100)
      if (shownIds.current.size > 100) {
        const ids = data.slice(0, 50).map((n) => n.id);
        shownIds.current = new Set(ids);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    refresh();
    const timer = setInterval(refresh, 15000);
    return () => clearInterval(timer);
  }, [refresh, isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read && new Date(n.createdAt).getTime() > lastReadAt).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setLastReadAt(Date.now());
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
