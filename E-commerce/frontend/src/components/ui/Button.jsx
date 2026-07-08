import { twMerge } from 'tailwind-merge'

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  isLoading = false,
  loading = false,
  fullWidth = false,
  disabled,
  ...props
}) {
  const busy = isLoading || loading

  const baseStyle =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <button
      className={twMerge(
        baseStyle,
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || busy}
      {...props}
    >
      {busy ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Chargement...
        </>
      ) : (
        children
      )}
    </button>
  )
}
