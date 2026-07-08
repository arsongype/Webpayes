import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    closeButtonRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined}>
      <div className="w-full max-w-lg rounded-4xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {title && <h3 id="modal-title" className="mb-4 text-xl font-semibold text-white">{title}</h3>}
        {children}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-slate-800 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default Modal;
