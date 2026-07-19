import React from 'react';
import { cn } from '@/lib/utils';
import { IconChevronDown } from '@tabler/icons-react';

interface FilterPillProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string | number }[];
  icon?: React.ReactNode;
}

export function FilterPill({ options, className, icon, ...props }: FilterPillProps) {
  return (
    <div className={cn("relative inline-flex items-center group", className)}>
      {/* Optional leading icon */}
      {icon && (
        <div className="absolute left-3 pointer-events-none text-content-tertiary group-hover:text-content-secondary transition-colors">
          {icon}
        </div>
      )}
      
      <select 
        className={cn(
          "appearance-none bg-surface-card border border-border text-content-primary text-[13px] font-medium rounded-pill transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent hover:border-content-muted hover:bg-surface-hover",
          icon ? "pl-9" : "pl-4",
          "pr-10 py-1.5 h-8"
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Trailing chevron */}
      <div className="absolute right-3 pointer-events-none text-content-tertiary group-hover:text-content-secondary transition-colors">
        <IconChevronDown size={16} stroke={1.5} />
      </div>
    </div>
  );
}
