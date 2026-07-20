/**
 * ScanButton
 * 
 * Reusable button to start a scan with progress modal
 * Can be used in: Dashboard, Hub, Runs page, Playground
 */

import React, { useState } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { useScanJobs } from '@/hooks/useScanJobs';
import { ScanProgressModal } from './ScanProgressModal';
import { useToast } from '@/hooks/use-toast';
import { ScanConfigModal, type ScanLaunchOptions } from './ScanConfigModal';

interface ScanButtonProps {
  projectId?: string;
  workspaceId?: string;
  promptIds?: string[];
  configScope?: 'project' | 'workspace';
  projectName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  label?: string;
  className?: string;
  onScanComplete?: () => void;
}

export function ScanButton({
  projectId,
  workspaceId,
  promptIds,
  configScope,
  projectName,
  variant = 'default',
  size = 'default',
  label = 'запустить проверку',
  className,
  onScanComplete,
}: ScanButtonProps) {
  const { toast } = useToast();
  const { jobs, progress, isScanning, error, startScan, subscribeToJobs, clearScan } = useScanJobs(projectId);
  const [showModal, setShowModal] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const scanMode = import.meta.env.VITE_SCAN_MODE?.toLowerCase() || 'live';
  const isMockMode = scanMode === 'mock';

  const handleStartScan = async (options?: ScanLaunchOptions) => {
    try {
      const result = await startScan({
        project_id: options?.project_id ?? projectId,
        workspace_id: options?.workspace_id ?? workspaceId,
        prompt_ids: options?.prompt_ids ?? promptIds,
        model_ids: options?.model_ids,
        persona_ids: options?.persona_ids,
        project_ids: options?.project_ids,
      });

      // Show modal
      setShowModal(true);

      // Show success toast
      toast({
        title: 'Проверка запущена',
        description: `Создано ${result.queued} задач${
          result.skipped > 0 ? `, пропущено ${result.skipped} (лимит квоты)` : ''
        }`,
      });
    } catch (err) {
      console.error('Failed to start scan:', err);
      
      toast({
        title: 'Ошибка запуска',
        description: err instanceof Error ? err.message : 'Не удалось запустить проверку',
        variant: 'destructive',
      });
    }
  };

  const handleOpenConfig = () => {
    setShowConfig(true);
  };

  const handleConfirmConfig = async (options: ScanLaunchOptions) => {
    setShowConfig(false);
    await handleStartScan(options);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    
    // Call completion callback
    if (onScanComplete && progress.total > 0 && progress.done + progress.failed === progress.total) {
      onScanComplete();
    }
    
    // Clear scan state after a delay
    setTimeout(() => {
      clearScan();
    }, 500);
  };

  return (
    <>
      <div className="flex flex-col items-start gap-2">
        <Button
          variant={variant}
          size={size}
          onClick={configScope ? handleOpenConfig : () => handleStartScan()}
          disabled={isScanning}
          className={className}
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              выполняется...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2 fill-current" />
              {label}
              {isMockMode ? ' (mock)' : ''}
            </>
          )}
        </Button>

        {isMockMode && (
          <p className="text-[10px] uppercase tracking-[0.12em] text-orange-600 font-semibold">
            Демонстрационный режим: MOCK
          </p>
        )}
      </div>

      <ScanProgressModal
        isOpen={showModal}
        onClose={handleCloseModal}
        progress={progress}
        jobs={jobs}
        onSubscribe={subscribeToJobs}
      />

      {configScope && (
        <ScanConfigModal
          isOpen={showConfig}
          scope={configScope}
          projectId={projectId}
          workspaceId={workspaceId}
          projectName={projectName}
          onClose={() => setShowConfig(false)}
          onConfirm={handleConfirmConfig}
        />
      )}
    </>
  );
}
