import { useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { NotificationContext } from './notificationContextStore';
import notificationService from '../services/notificationService';
import type { NotificationDTO, NotificationType } from '../types/notification.types';
import { useAuth } from '../hooks/useAuth';

interface NotificationWithMeta extends NotificationDTO {
  read?: boolean;
}

type ToastType = 'success' | 'error' | 'warning' | 'info';

const TYPE_MAP: Record<NotificationType, ToastType> = {
  TRANSACTION: 'success',
  PAYMENT: 'success',
  PAYMENT_RECEIVED: 'success',
  SYSTEM: 'info',
  ALERT: 'warning',
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationWithMeta[]>([]);
  const [lastReadAt, setLastReadAt] = useState<number>(() => Date.now());
  const shownIds = useRef<Set<string>>(new Set());
  const { isAuthenticated } = useAuth();
  const refreshRef = useRef<() => void>(() => {});

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const data = await notificationService.list();
      setNotifications(data);
      for (const n of data) {
        if (!shownIds.current.has(n.id) && !n.read) {
          shownIds.current.add(n.id);
          const toastType = TYPE_MAP[n.type as NotificationType] ?? 'info';
          if (typeof window !== 'undefined' && (window as unknown as { showToast?: (t: { type: ToastType; title: string; message: string; duration: number }) => void }).showToast) {
            (window as unknown as { showToast?: (t: { type: ToastType; title: string; message: string; duration: number }) => void }).showToast?.({
              type: toastType,
              title: n.subject,
              message: n.body,
              duration: 6000,
            });
          }
        }
      }

      if (shownIds.current.size > 100) {
        const ids = data.slice(0, 50).map((n) => n.id);
        shownIds.current = new Set(ids);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshRef.current = refresh;
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = setInterval(() => {
      refreshRef.current();
    }, 15000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshRef.current();
  }, [isAuthenticated]);

  const unreadCount = notifications.filter((n) => !n.read && n.createdAt && new Date(n.createdAt).getTime() > lastReadAt).length;

  const markAllRead = useCallback(async (): Promise<void> => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setLastReadAt(Date.now());
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, refresh, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
