import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { ModelIcon } from './ui/ModelIcon';
import { supabase } from '../lib/supabase';
import { Loader2, AlertTriangle } from 'lucide-react';

const MODEL_OPTIONS = [
  { id: 'chatgpt', label: 'ChatGPT', description: 'OpenAI GPT-4/3.5' },
  { id: 'claude', label: 'Claude', description: 'Anthropic AI' },
  { id: 'gemini', label: 'Gemini', description: 'Google AI' },
  { id: 'perplexity', label: 'Perplexity', description: 'Perplexity Search AI' },
];

export type ScanLaunchOptions = {
  project_id?: string;
  workspace_id?: string;
  project_ids?: string[];
  prompt_ids?: string[];
  model_ids?: string[];
  persona_ids?: string[];
};

interface ScanConfigModalProps {
  isOpen: boolean;
  scope: 'project' | 'workspace';
  projectId?: string;
  workspaceId?: string;
  projectName?: string;
  onClose: () => void;
  onConfirm: (options: ScanLaunchOptions) => Promise<void>;
}

export function ScanConfigModal({
  isOpen,
  scope,
  projectId,
  workspaceId,
  projectName,
  onClose,
  onConfirm,
}: ScanConfigModalProps) {
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [prompts, setPrompts] = useState<Array<{ id: string; prompt_text: string; ai_models?: string[]; project_id?: string }>>([]);
  const [personas, setPersonas] = useState<Array<{ id: string; name: string; project_id?: string }>>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let workspaceProjectIds: string[] = [];

        if (scope === 'workspace' && workspaceId) {
          const { data: workspaceProjects, error: projectsError } = await supabase
            .from('projects')
            .select('id,name')
            .eq('workspace_id', workspaceId)
            .eq('is_active', true);

          if (!projectsError && workspaceProjects) {
            workspaceProjectIds = workspaceProjects.map((project) => ({ id: project.id, name: project.name }));
            if (active) {
              setProjects(workspaceProjectIds);
              setSelectedProjectIds(workspaceProjectIds.map((project) => project.id));
            }
          }
        }

        const promptQuery = supabase
          .from('tracked_prompts')
          .select('id,prompt_text,ai_models,project_id')
          .eq('is_active', true);

        if (scope === 'project' && projectId) {
          promptQuery.eq('project_id', projectId);
        } else if (scope === 'workspace' && workspaceProjectIds.length > 0) {
          promptQuery.in('project_id', workspaceProjectIds.map((project) => project.id));
        }

        const [promptResult, personaResult] = await Promise.all([
          promptQuery,
          supabase
            .from('personas')
            .select('id,name,project_id')
            .eq('is_active', true)
            .then((result) => result)
            .catch(() => ({ data: [], error: null })),
        ]);

        if (promptResult.error) {
          console.warn('Could not load tracked prompts:', promptResult.error.message);
        }

        if (active) {
          if (promptResult.data) {
            setPrompts(promptResult.data);
            setSelectedPromptIds(promptResult.data.map((prompt) => prompt.id));
          }

          if (!personaResult.error && personaResult.data) {
            const filteredPersonas = personaResult.data.filter((persona) => {
              if (scope === 'project' && projectId) return persona.project_id === projectId;
              if (scope === 'workspace' && workspaceProjectIds.length > 0) {
                return workspaceProjectIds.some((project) => project.id === persona.project_id);
              }
              return true;
            });
            setPersonas(filteredPersonas);
          }

          const allModels = new Set<string>();
          promptResult.data?.forEach((prompt) => prompt.ai_models?.forEach((model) => allModels.add(model)));
          const defaultModels = allModels.size > 0 ? Array.from(allModels) : MODEL_OPTIONS.map((option) => option.id);
          setSelectedModelIds(defaultModels);
        }
      } catch (err) {
        console.error('Failed to load scan configuration:', err);
        if (active) {
          setError('Не удалось загрузить параметры сканирования. Попробуйте ещё раз.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [isOpen, projectId, scope, workspaceId]);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  const availableModelIds = useMemo(() => {
    const modelSet = new Set<string>();
    prompts.forEach((prompt) => prompt.ai_models?.forEach((model) => modelSet.add(model)));
    if (modelSet.size === 0) {
      MODEL_OPTIONS.forEach((option) => modelSet.add(option.id));
    }
    return Array.from(modelSet);
  }, [prompts]);

  const projectCount = scope === 'project' ? 1 : selectedProjectIds.length;
  const promptCount = selectedPromptIds.length > 0 ? selectedPromptIds.length : prompts.length;
  const modelCount = selectedModelIds.length;
  const personaCount = selectedPersonaIds.length > 0 ? selectedPersonaIds.length : 1;
  const estimatedJobs = projectCount * promptCount * modelCount * personaCount;

  const handleProjectToggle = (projectIdToToggle: string) => {
    setSelectedProjectIds((current) =>
      current.includes(projectIdToToggle)
        ? current.filter((id) => id !== projectIdToToggle)
        : [...current, projectIdToToggle]
    );
  };

  const handlePromptToggle = (promptId: string) => {
    setSelectedPromptIds((current) =>
      current.includes(promptId) ? current.filter((id) => id !== promptId) : [...current, promptId]
    );
  };

  const handleModelToggle = (modelId: string) => {
    setSelectedModelIds((current) =>
      current.includes(modelId) ? current.filter((id) => id !== modelId) : [...current, modelId]
    );
  };

  const handlePersonaToggle = (personaId: string) => {
    setSelectedPersonaIds((current) =>
      current.includes(personaId) ? current.filter((id) => id !== personaId) : [...current, personaId]
    );
  };

  const handleSubmit = async () => {
    if (loading) return;
    if (scope === 'workspace' && selectedProjectIds.length === 0) {
      setError('Выберите хотя бы один проект для проверки.');
      return;
    }

    if (selectedModelIds.length === 0) {
      setError('Выберите хотя бы одну модель.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const options: ScanLaunchOptions = {
        prompt_ids: selectedPromptIds.length > 0 ? selectedPromptIds : undefined,
        model_ids: selectedModelIds.length > 0 ? selectedModelIds : undefined,
        persona_ids: selectedPersonaIds.length > 0 ? selectedPersonaIds : undefined,
      };

      if (scope === 'project' && projectId) {
        options.project_id = projectId;
      }

      if (scope === 'workspace' && workspaceId) {
        if (selectedProjectIds.length > 0 && selectedProjectIds.length !== projects.length) {
          options.project_ids = selectedProjectIds;
        } else {
          options.workspace_id = workspaceId;
        }
      }

      await onConfirm(options);
    } catch (err) {
      console.error('Scan configuration submit failed:', err);
      setError('Не удалось запустить проверку. Попробуйте снова.');
    } finally {
      setSubmitting(false);
    }
  };

  const projectLabel = projectName || 'текущий проект';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Настройка запуска проверки</DialogTitle>
          <DialogDescription className="mt-1 text-[13px] text-content-secondary">
            {scope === 'project'
              ? `Проверка будет выполнена для проекта «${projectLabel}». Выберите параметры запуска.`
              : 'Проверка будет выполнена по выбранным проектам рабочего пространства. Вы можете указать фильтры моделей, промптов и персонажей.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="inline-block mr-2 align-middle" /> {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-border p-8">
              <Loader2 className="h-5 w-5 animate-spin text-content-secondary" />
              <span className="text-sm text-content-secondary">Загружаем настройки...</span>
            </div>
          ) : (
            <>
              {scope === 'workspace' && (
                <section className="space-y-3 rounded-xl border border-border bg-[#fafafa] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#111827]">Проекты</h3>
                      <p className="text-[12px] text-content-secondary">Выберите, для каких проектов запускать проверку.</p>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-content-secondary">{projects.length} проектов</span>
                  </div>

                  {projects.length === 0 ? (
                    <p className="text-sm text-content-secondary">Не удалось загрузить проекты. Повторите попытку позже.</p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {projects.map((project) => (
                        <label key={project.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-[13px] transition-colors hover:border-accent">
                          <Checkbox
                            checked={selectedProjectIds.includes(project.id)}
                            onCheckedChange={() => handleProjectToggle(project.id)}
                          />
                          <span className="font-medium text-[#111827]">{project.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </section>
              )}

              <section className="space-y-3 rounded-xl border border-border bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Модели</h3>
                    <p className="text-[12px] text-content-secondary">Фильтр по моделям, которые будут запущены.</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-content-secondary">{availableModelIds.length} вариантов</span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {availableModelIds.map((modelId) => {
                    const option = MODEL_OPTIONS.find((item) => item.id === modelId) ?? { id: modelId, label: modelId, description: '' };
                    return (
                      <label key={modelId} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-3 py-3 transition-colors hover:border-accent">
                        <Checkbox
                          checked={selectedModelIds.includes(modelId)}
                          onCheckedChange={() => handleModelToggle(modelId)}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <ModelIcon model={modelId} size={16} />
                            <span className="text-sm font-semibold text-[#111827]">{option.label}</span>
                          </div>
                          <p className="text-[12px] text-content-secondary mt-1">{option.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3 rounded-xl border border-border bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Промпты</h3>
                    <p className="text-[12px] text-content-secondary">Укажите, какие запросы включить в проверку.</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-content-secondary">{prompts.length} доступно</span>
                </div>

                {prompts.length === 0 ? (
                  <p className="text-sm text-content-secondary">Автоматически будут использованы все активные промпты.</p>
                ) : (
                  <div className="grid gap-2 max-h-56 overflow-auto px-1 py-1">
                    {prompts.map((prompt) => (
                      <label key={prompt.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-white px-3 py-3 transition-colors hover:border-accent">
                        <Checkbox
                          checked={selectedPromptIds.includes(prompt.id)}
                          onCheckedChange={() => handlePromptToggle(prompt.id)}
                        />
                        <div>
                          <p className="text-sm text-[#111827]">{prompt.prompt_text}</p>
                          {prompt.project_id && scope === 'workspace' && (
                            <p className="text-[11px] text-content-secondary mt-1">Проект: {projects.find((project) => project.id === prompt.project_id)?.name || prompt.project_id}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-3 rounded-xl border border-border bg-[#fafafa] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">Персонажи</h3>
                    <p className="text-[12px] text-content-secondary">Дополнительный фильтр. Если не выбран, будет выполняться проверка без персонажей.</p>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.18em] text-content-secondary">{personas.length} доступно</span>
                </div>

                {personas.length === 0 ? (
                  <p className="text-sm text-content-secondary">Персонажи не найдены или ещё не добавлены.</p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {personas.map((persona) => (
                      <label key={persona.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 transition-colors hover:border-accent">
                        <Checkbox
                          checked={selectedPersonaIds.includes(persona.id)}
                          onCheckedChange={() => handlePersonaToggle(persona.id)}
                        />
                        <span className="text-sm text-[#111827]">{persona.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </section>

              <div className="rounded-xl border border-border bg-[#f8fafc] p-4 text-sm text-content-secondary">
                Выбрано примерно <span className="font-semibold text-[#111827]">{estimatedJobs}</span> задач для запуска.
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={loading || submitting}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={loading || submitting}>
            {submitting ? 'Запуск...' : `Запустить (${estimatedJobs} задач${selectedPersonaIds.length > 0 ? ` × ${selectedPersonaIds.length} персонажей` : ''})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
