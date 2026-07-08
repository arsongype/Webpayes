import { twMerge } from 'tailwind-merge'

export default function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        )}
        <input
          className={twMerge(
            'w-full px-4 py-2.5 border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            Icon && 'pl-10',
            error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400',
            props.disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}
