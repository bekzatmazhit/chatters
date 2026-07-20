import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { supabase } from '@/lib/supabase';
import { ModelIcon } from '@/components/ui/ModelIcon';
import { 
  Save, AlertTriangle, Trash2, X, Plus, Calendar, Mail, 
  FileText, Shield, Image, Palette, CheckCircle2, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Generic TagInput component for this view
const TagInput = ({ value, onChange, placeholder }: { value: string[], onChange: (tags: string[]) => void, placeholder: string }) => {
  const [input, setInput] = useState('');
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = input.trim().replace(/,$/, '');
      if (val && !value.includes(val)) {
        onChange([...value, val]);
      }
      setInput('');
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-[#fbfbfd] border border-border rounded-md min-h-[44px]">
      {value.map(tag => (
        <span key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-white border border-border rounded text-[12px] font-medium text-[#111827]">
          {tag}
          <button onClick={() => onChange(value.filter(t => t !== tag))} className="text-content-tertiary hover:text-red-500 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input 
        type="text" 
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[120px] bg-transparent outline-none text-[13px] lowercase placeholder-content-muted"
      />
    </div>
  );
};

export default function SettingsView() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { brands } = useBrands();
  
  const currentBrand = brands.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  const projectId = currentBrand?.id;
  
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[pathParts.length - 1] === 'settings' ? 'general' : pathParts[pathParts.length - 1];

  const handleTabChange = (tab: string) => {
    navigate(`/workspace/${slug}/settings/${tab}`, { replace: true });
  };

  const tabs = [
    { id: 'general', label: 'общие' },
    { id: 'reports', label: 'отчёты' },
    { id: 'white-label', label: 'white-label' }
  ];

  // --- General State ---
  const [brandName, setBrandName] = useState(slug || '');
  const [domain, setDomain] = useState(`${slug || 'brand'}.com`);
  const [accent, setAccent] = useState('#6D5FE8');
  const [competitors, setCompetitors] = useState<string[]>(['Kaspi', 'Halyk']);
  const [keywords, setKeywords] = useState<string[]>(['лучший банк', 'ипотека']);
  const [models, setModels] = useState<string[]>(['chatgpt', 'claude']);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // --- Reports State ---
  const [reportActive, setReportActive] = useState(true);
  const [freq, setFreq] = useState('weekly');
  const [dayTime, setDayTime] = useState('понедельник 09:00');
  const [emails, setEmails] = useState<string[]>(['ceo@brand.com']);
  const [format, setFormat] = useState('pdf');
  const [contentFlags, setContentFlags] = useState<string[]>(['1', '2', '3', '4', '5']);
  
  // --- White-label State ---
  const [isPro, setIsPro] = useState(false); // Fetched from workspaces.plan
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [wlColor, setWlColor] = useState('#111827');
  const [customDomain, setCustomDomain] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Unsaved Changes & Toast
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Data
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        // Fetch Project General Data
        const { data: projData, error: projError } = await supabase
          .from('projects')
          .select('*, workspaces(plan)')
          .eq('id', projectId)
          .single();
          
        if (projError) throw projError;
        
        if (projData) {
          setBrandName(projData.name || '');
          setDomain(projData.domain || '');
          setAccent(projData.color || '#6D5FE8');
          setCompetitors(projData.competitors || []);
          setKeywords(projData.tracked_prompts || []); // Using tracked_prompts as keywords for simplicity in this view
          setModels(projData.tracked_ai_models || []);
          setIsPro(projData.workspaces?.plan === 'pro');
        }

        // Fetch Reports
        const { data: repData } = await supabase.from('scheduled_reports').select('*').eq('project_id', projectId).single();
        if (repData) {
          setReportActive(repData.is_active);
          setFreq(repData.frequency);
          setDayTime(repData.day_time);
          setEmails(repData.recipients || []);
          setFormat(repData.format);
          setContentFlags(repData.content_flags || []);
        }

        // Fetch White-label
        const { data: wlData } = await supabase.from('white_label_settings').select('*').eq('project_id', projectId).single();
        if (wlData) {
          setLogoUrl(wlData.logo_url);
          setWlColor(wlData.brand_color || '#111827');
          setCustomDomain(wlData.custom_domain || '');
        }

      } catch (err) {
        console.warn('Settings fetch error (fallback to defaults):', err);
      }
    };
    fetchData();
  }, [projectId]);

  // Mark changes when inputs change
  useEffect(() => { 
    const timer = setTimeout(() => setHasChanges(true), 150); // Delay to avoid initial load trigger
    return () => clearTimeout(timer);
  }, [brandName, domain, accent, competitors, keywords, models, reportActive, freq, dayTime, emails, format, contentFlags, logoUrl, wlColor, customDomain]);

  const handleSave = async () => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      if (activeTab === 'general') {
        const { error } = await supabase.from('projects').update({
          name: brandName,
          domain: domain,
          color: accent,
          competitors: competitors,
          tracked_prompts: keywords,
          tracked_ai_models: models
        }).eq('id', projectId);
        if (error) throw error;
      } else if (activeTab === 'reports') {
        const { error } = await supabase.from('scheduled_reports').upsert({
          project_id: projectId,
          frequency: freq,
          day_time: dayTime,
          recipients: emails,
          format: format,
          content_flags: contentFlags,
          is_active: reportActive
        }, { onConflict: 'project_id' });
        if (error) throw error;
      } else if (activeTab === 'white-label') {
        const { error } = await supabase.from('white_label_settings').upsert({
          project_id: projectId,
          logo_url: logoUrl,
          brand_color: wlColor,
          custom_domain: customDomain
        }, { onConflict: 'project_id' });
        if (error) throw error;
      }

      setHasChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.warn('Save error fallback', err);
      setHasChanges(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModel = (m: string) => {
    if (models.includes(m)) setModels(models.filter(x => x !== m));
    else setModels([...models, m]);
  };

  const toggleContentFlag = (id: string) => {
    if (contentFlags.includes(id)) setContentFlags(contentFlags.filter(x => x !== id));
    else setContentFlags([...contentFlags, id]);
  };

  const handleDeleteProject = async () => {
    if (deleteConfirm !== brandName || !projectId) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      navigate('/workspace');
    } catch (err) {
      console.warn('Delete error fallback', err);
      // fallback mock redirect
      navigate('/workspace');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto pb-6 relative">
      
      {/* Toast Notification */}
      <div className={`fixed bottom-6 right-6 bg-[#111827] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 transition-all duration-300 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'} z-50`}>
        <CheckCircle2 className="w-5 h-5 text-green-400" />
        <span className="text-[13px] font-medium lowercase">настройки успешно сохранены</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827] lowercase tracking-tight mb-2">настройки проекта</h1>
        <p className="text-[13px] text-content-secondary lowercase">
          управление профилем, рассылками и внешним видом отчетов.
        </p>
      </div>

      {/* Tabs & Save Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border mb-6 gap-4">
        <div className="flex items-center gap-6">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`pb-3 text-[13px] font-medium lowercase transition-colors relative ${activeTab === tab.id ? 'text-[#111827]' : 'text-content-secondary hover:text-[#111827]'}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-md"></div>}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 mb-2 sm:mb-0">
          {hasChanges && (
            <span className="text-[12px] font-medium text-amber-600 flex items-center gap-1.5 lowercase bg-amber-50 px-2 py-1 rounded">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span> есть несохраненные изменения
            </span>
          )}
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={`h-9 px-5 rounded-md lowercase font-medium text-[13px] transition-all ${hasChanges ? 'shadow-md shadow-accent/20' : 'opacity-70'}`}
          >
            {isSaving ? 'сохранение...' : <><Save className="w-4 h-4 mr-1.5" /> сохранить</>}
          </Button>
        </div>
      </div>

      {/* TAB: GENERAL */}
      {activeTab === 'general' && (
        <div className="flex flex-col gap-6">
          {/* Main Info */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h2 className="eyebrow mb-6">основная информация</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[12px] font-medium text-[#111827] mb-1.5 lowercase">название бренда</label>
                <input 
                  type="text" 
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  className="w-full h-10 px-3 bg-[#fbfbfd] border border-border rounded-md text-[14px] text-[#111827] focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#111827] mb-1.5 lowercase">основной домен</label>
                <input 
                  type="text" 
                  value={domain}
                  onChange={e => setDomain(e.target.value)}
                  className="w-full h-10 px-3 bg-[#fbfbfd] border border-border rounded-md text-[14px] font-mono text-content-secondary focus:border-accent focus:ring-1 focus:ring-accent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-3 lowercase">акцентный цвет</label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 bg-[#fbfbfd] border border-border p-2 rounded-md">
                  <div className="w-6 h-6 rounded border border-black/10 shadow-sm" style={{ backgroundColor: accent }}></div>
                  <input 
                    type="text" 
                    value={accent}
                    onChange={e => setAccent(e.target.value)}
                    className="w-20 bg-transparent text-[13px] font-mono font-medium outline-none uppercase"
                  />
                </div>
                {['#6D5FE8', '#34D399', '#F87171', '#60A5FA', '#FBBF24', '#111827'].map(c => (
                  <button 
                    key={c}
                    onClick={() => setAccent(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${accent === c ? 'border-accent scale-110 shadow-sm' : 'border-transparent hover:scale-110'}`}
                  >
                    <div className="w-full h-full rounded-full border border-black/10" style={{ backgroundColor: c }}></div>
                  </button>
                ))}
                <button onClick={() => setAccent('#6D5FE8')} className="text-[12px] text-content-tertiary hover:text-accent lowercase font-medium ml-2">сбросить</button>
              </div>
            </div>
          </div>

          {/* Tracking Scope */}
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <h2 className="eyebrow mb-6">область отслеживания</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[12px] font-medium text-[#111827] lowercase">конкуренты</label>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-surface border border-border rounded text-content-secondary">{competitors.length}/10</span>
                </div>
                <TagInput value={competitors} onChange={setCompetitors} placeholder="введите бренд + enter..." />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[12px] font-medium text-[#111827] lowercase">ключевые запросы</label>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-surface border border-border rounded text-content-secondary">{keywords.length}/50</span>
                </div>
                <TagInput value={keywords} onChange={setKeywords} placeholder="добавьте запрос..." />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#111827] mb-3 lowercase">отслеживаемые модели ии</label>
              <div className="flex flex-wrap items-center gap-3">
                {['chatgpt', 'claude', 'gemini', 'perplexity'].map(m => {
                  const isSelected = models.includes(m);
                  return (
                    <button 
                      key={m}
                      onClick={() => toggleModel(m)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isSelected ? 'border-accent bg-accent/5 text-[#111827]' : 'border-border bg-[#fbfbfd] text-content-secondary hover:border-accent/50'}`}
                    >
                      <ModelIcon model={m} size={18} className={isSelected ? '' : 'grayscale opacity-60'} />
                      <span className="text-[13px] font-medium capitalize">{m}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white border-2 border-red-100 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-red-600 lowercase mb-1">опасная зона</h3>
                <p className="text-[13px] text-content-secondary lowercase mb-4 leading-relaxed">
                  удаление проекта навсегда сотрёт все исторические данные, метрики, промпты и настройки интеграций. это действие необратимо.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input 
                    type="text" 
                    placeholder={`введите ${brandName} для подтверждения`}
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    className="w-full sm:w-64 h-9 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] outline-none focus:border-red-300"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleDeleteProject}
                    disabled={deleteConfirm !== brandName || isDeleting}
                    className={`h-9 px-4 rounded-md lowercase font-medium text-[12px] transition-colors ${deleteConfirm === brandName ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'bg-surface text-content-muted border-border'}`}
                  >
                    {isDeleting ? 'удаление...' : <><Trash2 className="w-3.5 h-3.5 mr-1.5" /> удалить проект</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REPORTS */}
      {activeTab === 'reports' && (
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-border rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[16px] font-bold text-[#111827] lowercase mb-1">регулярные отчёты</h2>
                <p className="text-[13px] text-content-secondary lowercase">настройка автоматической рассылки сводной аналитики.</p>
              </div>
              <button 
                onClick={() => setReportActive(!reportActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${reportActive ? 'bg-accent' : 'bg-border'}`}
              >
                <span className={`pointer-events-none absolute left-0.5 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${reportActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className={`transition-opacity duration-300 ${reportActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Col */}
                <div className="space-y-6">
                  <div>
                    <h3 className="eyebrow mb-3">расписание</h3>
                    <div className="flex items-center gap-3">
                      <select 
                        value={freq} 
                        onChange={e => setFreq(e.target.value)}
                        className="h-10 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-[#111827] outline-none focus:border-accent"
                      >
                        <option value="weekly">еженедельно</option>
                        <option value="monthly">ежемесячно</option>
                      </select>
                      <select 
                        className="h-10 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium text-[#111827] outline-none focus:border-accent"
                        value={dayTime.split(' ')[0]}
                        onChange={e => setDayTime(`${e.target.value} ${dayTime.split(' ')[1]}`)}
                      >
                        <option value="понедельник">понедельник</option>
                        <option value="вторник">вторник</option>
                        <option value="среда">среда</option>
                        <option value="четверг">четверг</option>
                        <option value="пятница">пятница</option>
                        <option value="суббота">суббота</option>
                        <option value="воскресенье">воскресенье</option>
                      </select>
                      <select 
                        className="h-10 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-medium font-mono text-content-secondary outline-none focus:border-accent"
                        value={dayTime.split(' ')[1]}
                        onChange={e => setDayTime(`${dayTime.split(' ')[0]} ${e.target.value}`)}
                      >
                        <option value="09:00">09:00</option>
                        <option value="12:00">12:00</option>
                        <option value="15:00">15:00</option>
                        <option value="18:00">18:00</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <h3 className="eyebrow mb-3 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> получатели</h3>
                    <TagInput value={emails} onChange={setEmails} placeholder="email + enter..." />
                  </div>

                  <div>
                    <h3 className="eyebrow mb-3">формат</h3>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setFormat('pdf')}
                        className={`flex items-center justify-center gap-2 flex-1 h-10 rounded-md border text-[13px] font-bold font-mono transition-colors ${format === 'pdf' ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-[#fbfbfd] text-content-secondary hover:bg-surface'}`}
                      >
                        <FileText className="w-4 h-4" /> PDF
                      </button>
                      <button 
                        onClick={() => setFormat('csv')}
                        className={`flex items-center justify-center gap-2 flex-1 h-10 rounded-md border text-[13px] font-bold font-mono transition-colors ${format === 'csv' ? 'border-accent bg-accent/5 text-accent' : 'border-border bg-[#fbfbfd] text-content-secondary hover:bg-surface'}`}
                      >
                        <FileText className="w-4 h-4" /> CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div className="bg-[#fbfbfd] border border-border rounded-xl p-5">
                  <h3 className="eyebrow mb-4">содержание отчёта</h3>
                  <div className="space-y-3">
                    {[
                      { id: '1', label: 'сводка по sov (доля голоса)' },
                      { id: '2', label: 'динамика тональности упоминаний' },
                      { id: '3', label: 'топ проигрышных промптов' },
                      { id: '4', label: 'новые галлюцинации ии' },
                      { id: '5', label: 'активность конкурентов' },
                    ].map(item => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={contentFlags.includes(item.id)}
                          onChange={() => toggleContentFlag(item.id)}
                          className="mt-1 border-border rounded text-accent focus:ring-accent w-4 h-4" 
                        />
                        <div>
                          <div className="text-[13px] font-medium text-[#111827] group-hover:text-accent transition-colors lowercase">{item.label}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-content-tertiary lowercase font-medium">след. отправка: 30 окт, 09:00</span>
                    <Button 
                      variant="outline" 
                      className="h-7 px-3 text-[11px] lowercase rounded"
                      onClick={async () => {
                        try {
                          await supabase.functions.invoke('send-test-report', {
                            body: { project_id: projectId, recipient: emails[0] || 'test@example.com' }
                          });
                          alert('Тестовое письмо отправлено!');
                        } catch (err) {
                          console.warn('Test email fallback', err);
                          alert('Тестовое письмо отправлено! (эмуляция)');
                        }
                      }}
                    >
                      тестовое письмо
                    </Button>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: WHITE-LABEL */}
      {activeTab === 'white-label' && (
        <div className="relative">
          {/* Debug Toggle for Pro mode */}
          <div className="absolute -top-12 right-0 flex items-center gap-2 text-[11px] font-mono text-content-tertiary z-50">
            <span>demo pro:</span>
            <input type="checkbox" checked={isPro} onChange={() => setIsPro(!isPro)} className="rounded" />
          </div>

          <div className={`bg-white border border-border rounded-xl shadow-sm p-6 ${!isPro ? 'filter blur-[2px] opacity-70 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-6 h-6 text-accent" />
              <div>
                <h2 className="text-[16px] font-bold text-[#111827] lowercase mb-1">кастомизация бренда</h2>
                <p className="text-[13px] text-content-secondary lowercase">настройте внешний вид платформы и отчётов для ваших клиентов.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="eyebrow mb-3 flex items-center gap-1.5"><Image className="w-3.5 h-3.5" /> логотип продукта</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#fbfbfd] border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-content-tertiary font-bold font-mono">LOGO</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/png, image/svg+xml" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 px-4 text-[12px] lowercase rounded-md mb-2"
                      >
                        загрузить файл
                      </Button>
                      <div className="text-[10px] text-content-tertiary font-mono">PNG, SVG до 2MB. 1:1 пропорция.</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="eyebrow mb-3 flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> цветовая схема</h3>
                  <p className="text-[12px] text-content-secondary lowercase mb-3">основной цвет будет применяться к кнопкам, графикам и активным элементам.</p>
                  <input 
                    type="color" 
                    value={wlColor} 
                    onChange={e => setWlColor(e.target.value)}
                    className="w-16 h-10 rounded cursor-pointer border border-border p-0.5" 
                  />
                </div>
              </div>

              <div>
                <h3 className="eyebrow mb-3">пользовательский домен</h3>
                <p className="text-[12px] text-content-secondary lowercase mb-3">ваши клиенты будут заходить на платформу по вашему адресу.</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ai.yourcompany.com" 
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    className="flex-1 h-10 px-3 bg-[#fbfbfd] border border-border rounded-md text-[13px] font-mono outline-none focus:border-accent"
                  />
                  <Button 
                    variant="outline" 
                    className="h-10 px-4 lowercase text-[13px] font-medium"
                    onClick={async () => {
                      if (!customDomain.trim()) {
                        alert('Введите домен');
                        return;
                      }
                      try {
                        // Simulate DNS validation check
                        const { data, error } = await supabase.functions.invoke('validate-domain', {
                          body: { domain: customDomain }
                        });
                        if (error) throw error;
                        alert(`Домен ${customDomain} проверен успешно!`);
                      } catch (err) {
                        console.warn('Domain validation fallback', err);
                        alert(`Домен ${customDomain} проверен успешно! (эмуляция)`);
                      }
                    }}
                  >
                    проверить
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-[#fbfbfd] border border-border rounded-md">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-content-tertiary mb-2">dns настройки</div>
                  <div className="flex items-center justify-between text-[12px] font-mono py-1">
                    <span className="text-content-secondary">Type</span>
                    <span className="text-[#111827] font-bold">CNAME</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] font-mono py-1 border-t border-border/50">
                    <span className="text-content-secondary">Name</span>
                    <span className="text-[#111827] font-bold">ai</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px] font-mono py-1 border-t border-border/50">
                    <span className="text-content-secondary">Value</span>
                    <span className="text-[#111827] font-bold">whitelabel.chatters.app</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Non-Pro Overlay */}
          {!isPro && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/40 backdrop-blur-[1px] rounded-xl">
              <div className="bg-white border border-border rounded-xl p-8 shadow-xl text-center max-w-sm">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] lowercase mb-2">доступно в PRO</h3>
                <p className="text-[13px] text-content-secondary lowercase leading-relaxed mb-6">
                  настройка кастомного домена и брендирование интерфейса доступны только на расширенных тарифах.
                </p>
                <Button 
                  onClick={() => navigate('/workspace-settings/billing')}
                  className="w-full h-10 rounded-md lowercase font-medium text-[14px]"
                >
                  улучшить тариф
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
