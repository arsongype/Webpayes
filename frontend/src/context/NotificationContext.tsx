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
  const [lastReadAt, setLastReadAt] = useState<number>(() => Date.now());
  const { isAuthenticated } = useAuth();
  const refreshRef = useRef<() => void>(() => {});

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const data = await notificationService.list();
      setNotifications(data);
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
