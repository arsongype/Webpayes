import { useState, useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastProps) => {
  const [visible, setVisible] = useState(true);

  const handleRemove = useCallback(() => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  }, [toast.id, onRemove]);

  const typeStyles = {
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
    error: 'border-rose-400/30 bg-rose-500/10 text-rose-600 dark:text-rose-200',
    warning: 'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200',
    info: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200',
  };

  return (
    <div
      className={`pointer-events-auto w-full max-w-sm rounded-xl border p-4 text-sm shadow-lg transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      } ${typeStyles[toast.type]}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex-shrink-0">
          {toast.type === 'success' && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
          {toast.type === 'error' && <div className="h-2 w-2 rounded-full bg-rose-500" />}
          {toast.type === 'warning' && <div className="h-2 w-2 rounded-full bg-amber-500" />}
          {toast.type === 'info' && <div className="h-2 w-2 rounded-full bg-cyan-500" />}
        </div>
        <div className="flex-1">
          {toast.title && <p className="font-semibold">{toast.title}</p>}
          <p className={toast.title ? "mt-0.5 opacity-90" : "font-medium"}>{toast.message}</p>
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 rounded-lg p-1 hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  setToasts: (toasts: Toast[]) => void;
}

export const ToastContainer = ({ toasts, setToasts }: ToastContainerProps) => {
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, [setToasts]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id, duration: toast.duration ?? 10000 };
    setToasts((prev) => [...prev, newToast]);

    if (newToast.duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  }, [setToasts]);

  useEffect(() => {
    (window as any).showToast = addToast;
  }, [addToast]);

  return (
    <>
      <div
        className={`fixed bottom-4 right-4 z-[100] flex flex-col gap-2 ${toasts.length === 0 ? 'pointer-events-none' : ''}`}
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </>
  );
};

export const useToast = () => {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    (window as any).showToast?.(toast);
  };
  return { addToast };
};

export default ToastContainer;
export type { Toast as ToastType2 };
export type { ReactNode };
