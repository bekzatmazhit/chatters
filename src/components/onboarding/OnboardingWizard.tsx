import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/ui/TagInput';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { Loader2, ArrowLeft, X, Check, Sparkles } from 'lucide-react';

const AVAILABLE_MODELS = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];

export default function OnboardingWizard({ 
  isModal = false, 
  onClose 
}: { 
  isModal?: boolean; 
  onClose?: () => void;
} = {}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form Data
  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [queries, setQueries] = useState<string[]>([]);
  const [selectedModels, setSelectedModels] = useState<string[]>(['ChatGPT', 'Claude']);

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);
  const [logoFetchFailed, setLogoFetchFailed] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    // Prevent accidental closing
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (step < 4) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step]);

  const tryLoadImage = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error('Failed to load'));
      img.src = url;
    });
  };

  const fetchLogo = async (domainToFetch: string) => {
    setIsFetchingLogo(true);
    setLogoFetchFailed(false);
    setLogoUrl(null);
    setLogoFile(null);

    const cleanDomain = domainToFetch.replace(/^https?:\/\//, '').split('/')[0];
    
    try {
      const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms));
      
      const clearbitUrl = `https://logo.clearbit.com/${cleanDomain}`;
      const googleUrl = `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`;
      
      try {
        const url = await Promise.race([tryLoadImage(clearbitUrl), timeout(3000)]);
        setLogoUrl(url as string);
      } catch (e) {
        const url = await Promise.race([tryLoadImage(googleUrl), timeout(3000)]);
        setLogoUrl(url as string);
      }
    } catch (e) {
      setLogoFetchFailed(true);
    } finally {
      setIsFetchingLogo(false);
    }
  };

  useEffect(() => {
    if (!domain.trim() || !domain.includes('.')) {
      setLogoUrl(null);
      setLogoFetchFailed(false);
      return;
    }

    const handler = setTimeout(() => {
      fetchLogo(domain);
    }, 800);

    return () => clearTimeout(handler);
  }, [domain]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Файл слишком большой (макс. 2МБ)');
        return;
      }
      setLogoFile(file);
      setLogoUrl(URL.createObjectURL(file));
      setLogoFetchFailed(false);
    }
  };

  const handleClose = () => {
    if (step < 4) {
      if (window.confirm('Прогресс не сохранится. Вы уверены, что хотите прервать настройку?')) {
        if (isModal && onClose) onClose();
        else navigate('/workspace');
      }
    } else {
      if (isModal && onClose) onClose();
      else navigate('/workspace');
    }
  };

  const simulateAnalysis = (callback: () => void) => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      callback();
    }, 1500 + Math.random() * 500);
  };

  const nextStep = () => {
    if (step === 1) {
      simulateAnalysis(() => {
        setCompetitors(['Конкурент 1', 'Конкурент 2', 'Конкурент 3']); // Fake data
        setStep(2);
      });
    } else if (step === 2) {
      simulateAnalysis(() => {
        setQueries(['купить ' + brandName, 'альтернативы ' + brandName, 'лучшие решения в ' + domain, 'отзывы ' + brandName, 'обзор ' + brandName]);
        setStep(3);
      });
    } else {
      setStep((s) => s + 1);
    }
  };

  const prevStep = () => setStep((s) => s - 1);

  const handleFinish = async () => {
    setLoading(true);
    setSubmitError(null);
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) {
        throw new Error('Пользователь не найден. Пожалуйста, войдите заново.');
      }

      // 1. Получаем workspace_id
      let { data: workspaceData, error: wsError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('owner_id', userId)
        .single();
      
      let workspaceId = workspaceData?.id;

      if (!workspaceId) {
        console.warn('Воркспейс не найден, пытаемся создать дефолтный...');
        const { data: newWs, error: newWsError } = await supabase
          .from('workspaces')
          .insert([{ name: brandName || 'Мой воркспейс', owner_id: userId }])
          .select('id')
          .single();
          
        if (newWsError || !newWs) {
          console.error('Ошибка создания воркспейса:', newWsError);
          // В крайнем случае, если таблицы workspaces нет или RLS мешает,
          // можно попробовать отправить project без workspace_id, 
          // но это зависит от схемы БД.
          throw new Error('Не удалось найти или создать воркспейс для текущего пользователя. ' + (newWsError?.message || wsError?.message || ''));
        }
        workspaceId = newWs.id;
      }

      let finalLogoUrl = logoUrl;
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Date.now()}-logo.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-logos')
          .upload(fileName, logoFile);
          
        if (!uploadError && uploadData) {
          const { data } = supabase.storage.from('brand-logos').getPublicUrl(uploadData.path);
          finalLogoUrl = data.publicUrl;
        } else if (uploadError) {
           console.error('Ошибка загрузки логотипа:', uploadError);
           // Пропускаем ошибку логотипа, чтобы не блокировать процесс
        }
      } else if (logoUrl && !logoUrl.startsWith('blob:')) {
        finalLogoUrl = logoUrl;
      } else {
        finalLogoUrl = null;
      }

      // 2. Создаем проект
      const { error: projectError } = await supabase.from('projects').insert([
        {
          name: brandName,
          domain: domain,
          logo_url: finalLogoUrl,
          color: '#10b981', // default color
          workspace_id: workspaceId,
          user_id: userId,
          tracked_ai_models: selectedModels,
          competitors: competitors,
          tracked_prompts: queries
        }
      ]);

      if (projectError) {
        throw new Error(`Ошибка при сохранении проекта: ${projectError.message}`);
      }
      
      const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      navigate(`/workspace/${slug}/overview`);
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setSubmitError(err.message || 'Произошла неизвестная ошибка при сохранении.');
    } finally {
      setLoading(false);
    }
  };

  const toggleModel = (m: string) => {
    if (selectedModels.includes(m)) {
      setSelectedModels(selectedModels.filter(x => x !== m));
    } else {
      setSelectedModels([...selectedModels, m]);
    }
  };

  return (
    <div className={isModal ? "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6" : "flex min-h-screen bg-[#fbfbfd] font-sans text-content-primary selection:bg-accent/20"}>
      {/* Left Form Area */}
      <div className={isModal ? "w-full max-w-[600px]" : "flex w-full flex-col justify-center px-4 py-8 sm:px-6 lg:w-1/2 lg:px-8"}>
        <div className={isModal ? "mx-auto w-full" : "mx-auto w-full max-w-[560px]"}>
          <div className="relative flex w-full flex-col rounded-xl border border-border bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            
            {/* Header */}
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step ? 'w-6 bg-accent' : i < step ? 'w-2 bg-accent/30' : 'w-2 bg-border'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 font-mono text-[11px] font-medium text-content-muted">
                  шаг {step} из 4
                </span>
              </div>
              <button onClick={handleClose} className="rounded-md p-1.5 text-content-muted hover:bg-surface-hover hover:text-content-primary transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[calc(100vh-200px)] lg:max-h-[600px]">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Расскажите о бренде</h2>
                  <p className="mt-2 text-[14px] text-content-secondary mb-8">
                    Мы настроим мониторинг на основе названия вашего продукта и его домена.
                  </p>
                  
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111827]">Название бренда / продукта</label>
                      <input
                        type="text"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        placeholder="Например, Chatters"
                        className="h-11 w-full rounded-md border border-border bg-[#fbfbfd] px-3 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111827]">Домен сайта</label>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 shrink-0 rounded-full border-[0.5px] border-border bg-[#fbfbfd] shadow-sm flex items-center justify-center overflow-hidden relative">
                          {isFetchingLogo ? (
                            <Loader2 className="w-4 h-4 animate-spin text-accent" />
                          ) : logoUrl ? (
                            <img src={logoUrl} alt="Логотип" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-[15px] font-bold text-content-muted uppercase">
                              {brandName ? brandName.substring(0, 1) : 'B'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="chatters.ai"
                            className="h-11 w-full rounded-md border border-border bg-[#fbfbfd] px-3 text-[14px] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                          />
                        </div>
                      </div>

                      {domain && !isFetchingLogo && (
                        <div className="mt-2 flex items-center gap-2 pl-14">
                          {logoUrl && !logoFetchFailed ? (
                            <span className="text-[11px] text-[#0F6E56] flex items-center gap-1 font-medium lowercase">
                              <Check className="w-3 h-3" /> логотип найден
                            </span>
                          ) : logoFetchFailed ? (
                            <span className="text-[11px] text-content-secondary lowercase">логотип не найден</span>
                          ) : null}
                          
                          {(logoUrl || logoFetchFailed) && (
                            <label className="text-[11px] text-accent font-medium hover:underline cursor-pointer lowercase ml-2">
                              {logoFetchFailed ? 'загрузить логотип' : 'загрузить свой'}
                              <input type="file" accept=".png,.jpg,.jpeg,.svg" className="hidden" onChange={handleFileUpload} />
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Главные конкуренты</h2>
                  <p className="mt-2 text-[14px] text-content-secondary mb-6">
                    С кем вас обычно сравнивают клиенты? Мы добавили несколько предложений на основе вашего домена.
                  </p>
                  
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 mb-6 relative">
                    <div className="absolute top-0 right-0 rounded-bl-lg rounded-tr-lg bg-accent/10 px-2 py-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent" />
                      <span className="text-[10px] font-medium text-accent uppercase tracking-wider">Предложено автоматически</span>
                    </div>
                    <label className="mb-2 block text-sm font-medium text-[#111827] mt-2">Конкуренты</label>
                    <TagInput tags={competitors} onChange={setCompetitors} placeholder="Добавьте конкурента" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Ключевые запросы</h2>
                  <p className="mt-2 text-[14px] text-content-secondary mb-6">
                    Что спрашивают ваши клиенты у AI? Мы сгенерировали стартовый набор поисковых интентов.
                  </p>
                  
                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 mb-6 relative">
                    <div className="absolute top-0 right-0 rounded-bl-lg rounded-tr-lg bg-accent/10 px-2 py-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-accent" />
                      <span className="text-[10px] font-medium text-accent uppercase tracking-wider">Сгенерировано AI</span>
                    </div>
                    <label className="mb-2 block text-sm font-medium text-[#111827] mt-2">Поисковые запросы</label>
                    <TagInput tags={queries} onChange={setQueries} placeholder="Добавьте запрос" />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-bold tracking-tight text-[#111827]">Выберите AI-модели</h2>
                  <p className="mt-2 text-[14px] text-content-secondary mb-6">
                    Какие нейросети вы хотите отслеживать для бренда {brandName}?
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {AVAILABLE_MODELS.map((model) => {
                      const isSelected = selectedModels.includes(model);
                      return (
                        <button
                          key={model}
                          onClick={() => toggleModel(model)}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-accent/50'
                          }`}
                        >
                          <ModelIcon model={model} size={40} className="mb-3 shadow-sm" />
                          <span className="text-[14px] font-semibold text-[#111827]">{model}</span>
                          
                          <div className={`mt-3 flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected ? 'border-accent bg-accent text-white' : 'border-content-muted bg-transparent'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Area */}
            <div className="flex shrink-0 flex-col border-t border-border bg-surface px-6 py-4">
              {submitError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-[13px] font-medium text-red-600">
                  {submitError}
                </div>
              )}
              <div className="flex h-10 items-center justify-between">
                {step > 1 ? (
                  <Button variant="outline" onClick={prevStep} disabled={isSimulating || loading} className="h-10 px-4 text-[13px] rounded-full lowercase font-medium bg-white">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    назад
                  </Button>
                ) : (
                  <div></div> // Spacer
                )}

                {step < 4 ? (
                  <Button
                    onClick={nextStep}
                    disabled={isSimulating || (step === 1 && (!brandName.trim() || !domain.trim()))}
                    className="h-10 px-6 text-[14px] rounded-full lowercase font-semibold"
                  >
                    {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isSimulating ? 'анализ...' : 'далее'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinish}
                    disabled={loading || selectedModels.length === 0}
                    className="h-10 px-6 text-[14px] rounded-full lowercase font-semibold"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    перейти в дашборд
                  </Button>
                )}
              </div>
            </div>
            
            {/* Simulating Overlay */}
            {isSimulating && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm animate-in fade-in">
                <Loader2 className="h-8 w-8 animate-spin text-accent mb-4" />
                <div className="text-[15px] font-medium text-[#111827]">
                  {step === 1 ? 'Анализ конкурентов...' : 'Сбор ключевых запросов...'}
                </div>
                <div className="text-[13px] text-content-secondary mt-1">
                  Это займёт пару секунд
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Image Area */}
      {!isModal && (
        <div className="hidden lg:block lg:w-1/2 relative bg-[#0b0d12]">
          <img
            src="/auth-bg.jpg"
            alt="Chatters AI visibility platform"
            className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-lighten"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0d12] via-[#0b0d12]/20 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-16 text-white">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
              Настройте рабочее пространство
            </h2>
            <p className="text-lg text-white/70 max-w-[500px]">
              Мы проанализируем ваш бренд и поможем автоматически подобрать ключевые поисковые интенты и конкурентов для мониторинга.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
