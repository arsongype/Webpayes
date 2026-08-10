import api from './api';
import type { NotificationDTO } from '../types/notification.types';

export interface Notification extends NotificationDTO {
  read?: boolean;
}

export const notificationService = {
  list: async (): Promise<Notification[]> => {
    const resp = await api.get('/notifications');
    return resp.data as Notification[];
  },
};
export default notificationService;
