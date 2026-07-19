import React from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  className?: string;
  onRowClick?: (item: T) => void;
  emptyState?: React.ReactNode;
}

export function DataTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  className,
  onRowClick,
  emptyState = <div className="p-8 text-center text-content-secondary">Нет данных</div>
}: DataTableProps<T>) {
  
  if (!data || data.length === 0) {
    return (
      <div className={cn("panel overflow-hidden", className)}>
        {emptyState}
      </div>
    );
  }

  return (
    <div className={cn("panel overflow-hidden", className)}>
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-[13px] border-collapse">
          <thead>
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className={cn(
                    "py-3 px-4 font-medium text-content-secondary whitespace-nowrap",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr 
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "group transition-colors",
                  // Only hairline border-top between rows (not on the first row to avoid double border with header, though header has no border usually, let's put border on all except first)
                  i > 0 && "border-t-[0.5px] border-border",
                  onRowClick && "cursor-pointer hover:bg-surface-hover"
                )}
              >
                {columns.map((col) => (
                  <td 
                    key={col.key} 
                    className={cn(
                      "py-[9px] px-4 text-content-primary align-middle",
                      col.className
                    )}
                  >
                    {col.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
