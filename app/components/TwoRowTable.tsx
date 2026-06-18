'use client';

import { Fragment, type ReactNode } from 'react';

export type TwoRowTableColumn<T> = {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
};

type TwoRowTableProps<T> = {
  columns: TwoRowTableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  getRowKey: (item: T) => string;
  className?: string;
  secondRowContent: (item: T) => ReactNode;
  secondRowLabel?: string;
};

export function TwoRowTable<T>({
  columns,
  data,
  emptyMessage = 'No data available',
  getRowKey,
  className = '',
  secondRowContent,
  secondRowLabel,
}: TwoRowTableProps<T>) {
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
        <table className="w-full">
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
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((item) => (
              <Fragment key={getRowKey(item)}>
                <tr>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 ${column.className || ''}`}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
                <tr className="bg-slate-50/50">
                  <td colSpan={columns.length} className="px-6 py-3">
                    {secondRowLabel ? (
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider mr-2">
                            {secondRowLabel}:
                          </span>
                          {secondRowContent(item)}
                        </div>
                      </div>
                    ) : (
                      secondRowContent(item)
                    )}
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
