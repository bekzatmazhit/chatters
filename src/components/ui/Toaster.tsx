/**
 * Toaster — renders the global toast queue.
 *
 * Mount once near the root of the authenticated layout. Reads from the
 * singleton store in use-toast.ts so that toast() calls from any hook
 * instance (ScanButton, rescan triggers, etc.) show up here.
 *
 * Styling matches the app's tokens: surface card, accent left-border, and
 * a red border for the destructive variant.
 */

import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const destructive = t.variant === 'destructive';
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto bg-white border rounded-xl shadow-lg p-3 pr-9 flex items-start gap-2.5 relative',
              'animate-in fade-in slide-in-from-bottom-2 duration-200',
              destructive ? 'border-[#A32D2D]/30' : 'border-accent/30',
            )}
            role="status"
          >
            <div className="mt-0.5 shrink-0">
              {destructive ? (
                <AlertCircle className="w-4 h-4 text-[#A32D2D]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#0F6E56]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[#111827]">
                {t.title}
              </div>
              {t.description && (
                <div className="text-[12px] text-content-secondary mt-0.5 leading-snug">
                  {t.description}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="absolute top-2 right-2 text-content-tertiary hover:text-[#111827] transition-colors"
              aria-label="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
