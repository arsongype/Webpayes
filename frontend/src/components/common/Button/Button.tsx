import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: ReactNode;
}

const variantClasses = {
  primary: 'bg-cyan-500 text-white hover:bg-cyan-400',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600',
  danger: 'bg-red-500 text-white hover:bg-red-400',
};

const Button = ({ variant = 'primary', isLoading, children, className = '', ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition disabled:opacity-70 ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
