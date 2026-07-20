/**
 * PromptFrequencySelect
 *
 * Compact dropdown for picking the per-prompt scan frequency.
 * Enforces the active workspace's tier: 'daily' is disabled on the Starter
 * tier with an upsell tooltip; higher tiers unlock it.
 *
 * Matches the inline-dropdown styling used elsewhere in AnalyticsView
 * (button + absolutely-positioned menu) so it blends with existing UI.
 */

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Clock, Lock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FREQUENCY_HINTS,
  FREQUENCY_LABELS,
  type Frequency,
  type Tier,
} from '@/hooks/useTier';
import { cn } from '@/lib/utils';

const ALL_FREQUENCIES: Frequency[] = ['daily', 'weekly', 'manual'];

interface PromptFrequencySelectProps {
  value: Frequency | null | undefined;
  tier: Tier;
  disabled?: boolean;
  className?: string;
  onChange: (next: Frequency) => void;
}

export function PromptFrequencySelect({
  value,
  tier,
  disabled = false,
  className,
  onChange,
}: PromptFrequencySelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape, matching the rest of the app's dropdowns.
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const current: Frequency = value ?? 'weekly';
  const currentLabel = FREQUENCY_LABELS[current];

  return (
    <TooltipProvider delayDuration={200}>
      <div ref={rootRef} className={cn('relative inline-block', className)}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={cn(
            'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-medium lowercase transition-colors',
            'bg-[#fbfbfd] border border-border text-content-secondary hover:text-[#111827] hover:border-accent/40',
            disabled && 'opacity-50 cursor-not-allowed hover:text-content-secondary hover:border-border',
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          {currentLabel}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {open && (
          <div className="absolute right-0 mt-1 w-64 bg-white border border-border rounded-lg shadow-xl z-50 py-1">
            {/* Priority hint */}
            <div className="px-3 py-2 mb-1 border-b border-border text-[10.5px] leading-relaxed text-content-tertiary lowercase">
              Топ-3-5 запросов — <span className="font-medium text-[#111827]">Ежедневно</span>,
              длинный хвост — <span className="font-medium text-[#111827]">Еженедельно</span>.
            </div>

            {ALL_FREQUENCIES.map((freq) => {
              const locked = !isFrequencyAllowed(freq, tier);
              const isActive = current === freq;

              const row = (
                <button
                  type="button"
                  key={freq}
                  disabled={locked}
                  onClick={() => {
                    if (locked) return;
                    onChange(freq);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-3 py-2 flex items-start gap-2 transition-colors',
                    locked
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:bg-[#fbfbfd]',
                    isActive && 'bg-accent/5',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-[12px] font-medium lowercase',
                          isActive ? 'text-accent' : 'text-[#111827]',
                        )}
                      >
                        {FREQUENCY_LABELS[freq]}
                      </span>
                      {locked && <Lock className="w-3 h-3 text-content-tertiary" />}
                    </div>
                    <div className="text-[10.5px] text-content-tertiary leading-snug mt-0.5">
                      {FREQUENCY_HINTS[freq]}
                    </div>
                  </div>
                </button>
              );

              if (locked) {
                return (
                  <Tooltip key={freq}>
                    <TooltipTrigger asChild>
                      {/* Tooltip wrapper needs a real DOM node that can receive hover. */}
                      <div>{row}</div>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]">
                      Доступно на тарифах Growth и Agency
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return row;
            })}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

function isFrequencyAllowed(freq: Frequency, tier: Tier): boolean {
  if (tier === 'starter') return freq !== 'daily';
  return true; // growth + agency: everything allowed
}
