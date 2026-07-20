/**
 * ScanProgressModal
 * 
 * Shows real-time progress of scan jobs
 * Displays: queued, running, done, failed counts
 * Updates via realtime subscription
 */

import React, { useEffect } from 'react';
import { X, CheckCircle2, XCircle, RefreshCw, Clock } from 'lucide-react';
import { ModelIcon } from './ui/ModelIcon';
import type { ScanProgress, ScanJobStatus } from '@/hooks/useScanJobs';

interface ScanProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ScanProgress;
  jobs: ScanJobStatus[];
  onSubscribe: (jobIds: string[]) => () => void;
}

export function ScanProgressModal({
  isOpen,
  onClose,
  progress,
  jobs,
  onSubscribe,
}: ScanProgressModalProps) {
  // Subscribe to realtime updates
  useEffect(() => {
    if (!isOpen || jobs.length === 0) return;

    const jobIds = jobs.map((j) => j.id);
    const unsubscribe = onSubscribe(jobIds);

    return unsubscribe;
  }, [isOpen, jobs, onSubscribe]);

  // Auto-close when all jobs are done
  useEffect(() => {
    if (progress.total > 0 && progress.done + progress.failed === progress.total) {
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [progress, onClose]);

  if (!isOpen) return null;

  const percentComplete = progress.total > 0
    ? Math.round(((progress.done + progress.failed) / progress.total) * 100)
    : 0;

  const isComplete = percentComplete === 100;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-[#fbfbfd]">
          <div>
            <h2 className="text-[16px] font-bold text-[#111827] lowercase">
              {isComplete ? 'проверка завершена' : 'выполняется проверка'}
            </h2>
            <p className="text-[12px] text-content-secondary lowercase mt-0.5">
              {progress.done + progress.failed} из {progress.total} задач
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-content-tertiary hover:text-[#111827] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between text-[13px] font-medium mb-2">
            <span className="text-content-secondary lowercase">прогресс</span>
            <span className="text-[#111827] font-mono">{percentComplete}%</span>
          </div>
          <div className="w-full h-2 bg-[#fbfbfd] rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
              style={{ width: `${percentComplete}%` }}
            />
          </div>

          {/* Status Counts */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="flex flex-col items-center p-2 rounded-lg bg-[#fbfbfd] border border-border/50">
              <Clock className="w-4 h-4 text-content-tertiary mb-1" />
              <div className="text-[18px] font-bold font-mono text-content-secondary">
                {progress.queued}
              </div>
              <div className="text-[10px] text-content-muted uppercase tracking-wide">
                в очереди
              </div>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-blue-50 border border-blue-200">
              <RefreshCw className="w-4 h-4 text-blue-600 mb-1 animate-spin" />
              <div className="text-[18px] font-bold font-mono text-blue-700">
                {progress.running}
              </div>
              <div className="text-[10px] text-blue-600 uppercase tracking-wide">
                выполняется
              </div>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-[#E1F5EE] border border-[#0F6E56]/20">
              <CheckCircle2 className="w-4 h-4 text-[#0F6E56] mb-1" />
              <div className="text-[18px] font-bold font-mono text-[#0F6E56]">
                {progress.done}
              </div>
              <div className="text-[10px] text-[#0F6E56] uppercase tracking-wide">
                готово
              </div>
            </div>

            <div className="flex flex-col items-center p-2 rounded-lg bg-[#FCEBEB] border border-[#A32D2D]/20">
              <XCircle className="w-4 h-4 text-[#A32D2D] mb-1" />
              <div className="text-[18px] font-bold font-mono text-[#A32D2D]">
                {progress.failed}
              </div>
              <div className="text-[10px] text-[#A32D2D] uppercase tracking-wide">
                ошибки
              </div>
            </div>
          </div>
        </div>

        {/* Job List */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4">
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  job.status === 'done'
                    ? 'bg-[#E1F5EE] border-[#0F6E56]/20'
                    : job.status === 'failed'
                    ? 'bg-[#FCEBEB] border-[#A32D2D]/20'
                    : job.status === 'running'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-[#fbfbfd] border-border/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ModelIcon model={job.ai_model} size={16} />
                  <span className="text-[13px] font-medium text-[#111827] capitalize">
                    {job.ai_model === 'chatgpt' ? 'ChatGPT' : job.ai_model}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {job.status === 'queued' && (
                    <span className="text-[11px] text-content-tertiary font-mono lowercase">
                      в очереди
                    </span>
                  )}
                  {job.status === 'running' && (
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  )}
                  {job.status === 'done' && (
                    <CheckCircle2 className="w-4 h-4 text-[#0F6E56]" />
                  )}
                  {job.status === 'failed' && (
                    <XCircle className="w-4 h-4 text-[#A32D2D]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        {isComplete && (
          <div className="p-4 border-t border-border bg-[#fbfbfd] text-center">
            <p className="text-[13px] text-content-secondary lowercase">
              {progress.failed > 0
                ? `проверка завершена с ${progress.failed} ошибками`
                : `все ${progress.done} задач выполнены успешно`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
