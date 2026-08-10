import { useEffect } from 'react';
import { useNotifications } from '../../context/useNotification';

const NotificationLoader = () => {
  const { refresh } = useNotifications();
  useEffect(() => {
    refresh();
  }, [refresh]);
  return null;
};

export default NotificationLoader;
