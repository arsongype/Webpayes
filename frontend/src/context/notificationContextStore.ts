import { createContext } from 'react';

interface NotificationItem {
  id: string;
  recipient: string;
  subject: string;
  body: string;
  type: string;
  status: string;
  createdAt?: string;
  read?: boolean;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);
