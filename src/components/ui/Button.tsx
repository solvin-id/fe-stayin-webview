import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'action' | 'outline' | 'ghost' | 'success' | 'whatsapp';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-white hover:bg-primary-hover': variant === 'primary',
          'bg-action text-white shadow-md shadow-action/20 hover:bg-action-hover':
            variant === 'action',
          'bg-whatsapp text-white shadow-md shadow-whatsapp/20 hover:bg-whatsapp-hover':
            variant === 'whatsapp',
          'border border-primary/40 bg-white text-primary hover:bg-primary-surface':
            variant === 'outline',
          'text-slate-600 hover:bg-slate-100': variant === 'ghost',
          'bg-emerald-600 text-white hover:bg-emerald-700': variant === 'success',
          'min-h-[44px] px-3 text-xs': size === 'sm',
          'min-h-[44px] px-4 text-sm': size === 'md',
          'min-h-[52px] px-6 text-base': size === 'lg',
        },
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : null}
      {children}
    </button>
  )
);

Button.displayName = 'Button';
