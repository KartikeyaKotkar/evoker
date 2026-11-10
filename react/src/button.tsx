'use client';
import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useReducedMotion } from './motion.js';
import { cx } from './style-utils.js';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  endIcon?: ReactNode;
}
export function buttonClassName({ variant = 'primary', size = 'md', className }: Pick<ButtonProps, 'variant' | 'size' | 'className'> = {}) {
  return cx('evoker-button', `evoker-button--${variant}`, `evoker-button--${size}`, className);
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button({ variant = 'primary', size = 'md', loading = false, endIcon, disabled, className, children, type = 'button', ...props }, ref) {
  const reduced = useReducedMotion();
  return <button {...props} ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} data-reduced-motion={reduced}
    data-loading={loading || undefined} data-slot="button" className={buttonClassName({ variant, size, className })}>
    {loading && <span className="evoker-spinner" aria-hidden="true" />}<span>{children}</span>{endIcon && <span aria-hidden="true">{endIcon}</span>}
  </button>;
});
