'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  isLoading?: boolean;
  loadingText?: ReactNode;
  label?: ReactNode;
};

export function Button({
  variant = 'primary',
  isLoading = false,
  loadingText = 'Working…',
  className = '',
  children,
  label,
  disabled,
  ...rest
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70';

  const variantClasses = {
    primary:
      'bg-[#380b52] text-white hover:bg-[#2c0840] disabled:!bg-slate-400 disabled:!text-slate-200 disabled:hover:!bg-slate-400 disabled:opacity-100',
    secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const displayContent = label || children;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled ?? isLoading}
      {...rest}
    >
      {isLoading ? loadingText : displayContent}
    </button>
  );
}
