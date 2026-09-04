import { useCallback } from 'react';
import type { Toast } from './ToastContainer';

type WindowWithToast = Window & { showToast?: (toast: Omit<Toast, 'id'>) => void };

export const useToast = () => {
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    (window as unknown as WindowWithToast).showToast?.(toast);
  }, []);
  return { addToast };
};
