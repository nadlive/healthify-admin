'use client';

import { type SelectHTMLAttributes, type ReactNode } from 'react';

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: SelectOption[];
  error?: string;
};

export function Select({
  label,
  options,
  error,
  className = '',
  id,
  ...rest
}: SelectProps) {
  const selectId = id || `select-${crypto.randomUUID().substring(0, 9)}`;

  return (
    <div>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-[#380b52] focus:outline-none focus:ring-1 focus:ring-[#380b52] ${
          error ? 'border-red-300' : ''
        } ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
