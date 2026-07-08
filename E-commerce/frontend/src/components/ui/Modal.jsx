import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} p-6`}>
          {(title || onClose) && (
            <div className="flex items-center justify-between mb-4">
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}