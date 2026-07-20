/**
 * RescanPromptModal
 *
 * Smart-trigger dialog shown after the user changes their brand presence
 * (marks an AIO task complete, adds/edits a Brand Fact). Suggests an
 * ad-hoc scan to verify the change landed in web-connected models
 * (Perplexity, ChatGPT Search).
 *
 * Styling matches ScanProgressModal: fixed overlay + white rounded card.
 */

import { useEffect } from 'react';
import { Play, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type RescanScope = 'aio_task' | 'fact_update';

interface RescanPromptModalProps {
  isOpen: boolean;
  /** Number of related prompts that would be scanned. */
  relatedPromptCount: number;
  /** True while the scan is being enqueued. */
  isLaunching?: boolean;
  onRunScan: () => void;
  onDismiss: () => void;
}

export function RescanPromptModal({
  isOpen,
  relatedPromptCount,
  isLaunching = false,
  onRunScan,
  onDismiss,
}: RescanPromptModalProps) {
  // Lock body scroll while open (small nicety; harmless if already locked).
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-[16px] font-bold text-[#111827]">Изменения сохранены!</h2>
        </div>

        {/* Body */}
        <div className="px-6 pb-5">
          <p className="text-[13px] text-content-secondary leading-relaxed">
            Моделям с доступом в интернет (Perplexity, ChatGPT Search) может
            потребоваться время на индексацию. Хотите запустить внеплановое
            сканирование связанных запросов прямо сейчас, чтобы проверить
            результат?
          </p>
          {relatedPromptCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#fbfbfd] border border-border text-[11px] font-mono text-content-tertiary lowercase">
              <Clock className="w-3 h-3" />
              будет проверено запросов: {relatedPromptCount}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#fbfbfd] border-t border-border flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={onDismiss}
            disabled={isLaunching}
            className="h-9 px-4 text-[13px] lowercase"
          >
            Подождать по расписанию
          </Button>
          <Button
            onClick={onRunScan}
            disabled={isLaunching}
            className="h-9 px-4 text-[13px] lowercase"
          >
            {isLaunching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                запуск...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2 fill-current" />
                Запустить скан
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
