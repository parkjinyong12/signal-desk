import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500': variant === 'primary',
          'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300': variant === 'secondary',
          'text-slate-600 hover:bg-slate-100 focus:ring-slate-300': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500': variant === 'danger',
        },
        {
          'px-2.5 py-1.5 text-xs': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
