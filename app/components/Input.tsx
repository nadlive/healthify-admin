'use client';

import { type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({
  label,
  error,
  className = '',
  id,
  ...rest
}: InputProps) {
  const inputId = id || `input-${crypto.randomUUID().substring(0, 9)}`;

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-[#380b52] focus:outline-none focus:ring-1 focus:ring-[#380b52] ${
          error ? 'border-red-300' : ''
        } ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
