'use client';

import { type ReactNode } from 'react';

export type TableColumn<T> = {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  getRowKey: (item: T) => string;
  className?: string;
  actions?: (item: T) => ReactNode;
};

export function Table<T>({
  columns,
  data,
  emptyMessage = 'No data available',
  getRowKey,
  className = '',
  actions,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((item) => (
              <tr key={getRowKey(item)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 ${column.className || ''}`}
                  >
                    {column.render
                      ? column.render(item)
                      : (item[column.key as keyof T] as ReactNode)}
                  </td>
                ))}
                {actions && <td className="px-6 py-4">{actions(item)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
