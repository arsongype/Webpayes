import { useEffect, useRef, memo } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = memo(({ isOpen, onClose, title, children }: ModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', handleKey);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div className="w-full max-w-lg rounded-4xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900">
        {title && <h3 id="modal-title" className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>}
        {children}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-100 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Fermer
        </button>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export default Modal;
