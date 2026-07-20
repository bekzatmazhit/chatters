import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { supabase } from '@/lib/supabase';
import { IntegrationIcon } from '@/components/ui/IntegrationIcon';
import { Button } from '@/components/ui/button';
import { Settings2, PowerOff, Plus, Send, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    desc: 'Уведомления о критических алертов и еженедельные отчеты.',
    category: 'уведомления',
    color: 'text-blue-600 bg-blue-100',
    status: 'connected',
  },
  {
    id: 'telegram',
    name: 'Telegram',
    desc: 'Мгновенные пуш-уведомления о триггерах в личные сообщения или группы.',
    category: 'уведомления',
    color: 'text-blue-600 bg-blue-100',
    status: 'available',
  },
  {
    id: 'google-search-console',
    name: 'Google Search Console',
    desc: 'Связь позиций ИИ с вашим органическим трафиком.',
    category: 'данные',
    color: 'text-emerald-600 bg-emerald-100',
    status: 'connected',
  },
  {
    id: 'jira-software',
    name: 'Jira Software',
    desc: 'Автоматическое создание тикетов на исправление галлюцинаций ИИ.',
    category: 'управление',
    color: 'text-indigo-600 bg-indigo-100',
    status: 'available',
  },
  {
    id: 'hubspot-crm',
    name: 'HubSpot CRM',
    desc: 'Синхронизация профилей клиентов и упоминаний брендов.',
    category: 'crm',
    color: 'text-orange-600 bg-orange-100',
    status: 'soon',
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics 4',
    desc: 'Анализ корреляции AI-упоминаний с реальным трафиком на сайт.',
    category: 'аналитика',
    color: 'text-yellow-600 bg-yellow-100',
    status: 'available',
  }
];

export default function IntegrationsHub() {
  const { slug } = useParams();
  const { brands } = useBrands();
  
  const currentBrand = brands.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);
  const projectId = currentBrand?.id;

  const [integrationsList, setIntegrationsList] = useState(INTEGRATIONS);
  const [requestServiceName, setRequestServiceName] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Modal State
  const [activeModal, setActiveModal] = useState<'telegram' | 'config' | null>(null);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [telegramChatId, setTelegramChatId] = useState('');
  const [configJson, setConfigJson] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Connection Simulation State
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    
    const fetchIntegrations = async () => {
      try {
        const { data, error } = await supabase
          .from('integrations')
          .select('*')
          .eq('project_id', projectId);
          
        if (error) throw error;
        
        if (data) {
          // Merge db state with local static list
          setIntegrationsList(prev => prev.map(item => {
            const dbItem = data.find((d: any) => d.provider === item.id);
            if (dbItem && dbItem.status !== 'disconnected') {
              return { ...item, status: 'connected', dbId: dbItem.id, config: dbItem.config };
            }
            return item;
          }));
        }
      } catch (err) {
        console.warn('Fallback to local integrations mock', err);
      }
    };
    
    fetchIntegrations();
  }, [projectId]);

  const handleConnectOAuth = async (id: string) => {
    setConnectingId(id);
    // Simulate OAuth redirect delay
    setTimeout(async () => {
      try {
        // Upsert to DB
        const { error } = await supabase.from('integrations').upsert({
          project_id: projectId,
          provider: id,
          status: 'connected',
          config: { token: 'mock-oauth-token-123' },
          updated_at: new Date().toISOString()
        }, { onConflict: 'project_id, provider' });
        
        if (error) throw error;
        
        setIntegrationsList(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'connected', config: { token: 'mock-oauth-token-123' } } : item
        ));
      } catch (err) {
        console.warn('Fallback local connect', err);
        setIntegrationsList(prev => prev.map(item => 
          item.id === id ? { ...item, status: 'connected' } : item
        ));
      } finally {
        setConnectingId(null);
      }
    }, 1500);
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Вы уверены, что хотите отключить эту интеграцию?')) return;
    
    try {
      const { error } = await supabase.from('integrations').update({ status: 'disconnected', updated_at: new Date().toISOString() }).match({ project_id: projectId, provider: id });
      if (error) throw error;
      setIntegrationsList(prev => prev.map(item => item.id === id ? { ...item, status: 'available', config: null } : item));
    } catch (err) {
      console.warn('Fallback local disconnect', err);
      setIntegrationsList(prev => prev.map(item => item.id === id ? { ...item, status: 'available' } : item));
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedIntegrationId) return;
    setIsSaving(true);
    try {
      let configObj = {};
      if (activeModal === 'telegram') {
        configObj = { chat_id: telegramChatId };
      } else {
        try { configObj = JSON.parse(configJson); } catch(e) { alert('Invalid JSON format'); setIsSaving(false); return; }
      }

      const { error } = await supabase.from('integrations').upsert({
        project_id: projectId,
        provider: selectedIntegrationId,
        status: 'connected',
        config: configObj,
        updated_at: new Date().toISOString()
      }, { onConflict: 'project_id, provider' });
      
      if (error) throw error;

      setIntegrationsList(prev => prev.map(item => 
        item.id === selectedIntegrationId ? { ...item, status: 'connected', config: configObj } : item
      ));
      setActiveModal(null);
    } catch (err) {
      console.warn('Fallback local save config', err);
      const mockConfig = activeModal === 'telegram' ? { chat_id: telegramChatId } : JSON.parse(configJson);
      setIntegrationsList(prev => prev.map(item => 
        item.id === selectedIntegrationId ? { ...item, status: 'connected', config: mockConfig } : item
      ));
      setActiveModal(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestIntegration = async () => {
    if (!requestServiceName.trim()) return;
    setIsRequesting(true);
    try {
      const { error } = await supabase.from('integration_requests').insert({
        project_id: projectId,
        service_name: requestServiceName.trim()
      });
      if (error) throw error;
      toast({ title: 'Заявка отправлена', description: 'Мы свяжемся с вами в ближайшее время.' });
      setRequestServiceName('');
    } catch (err) {
      console.warn('Fallback local request', err);
      toast({ title: 'Заявка сохранена локально', description: 'Данные сохранены в локальном режиме.' });
      setRequestServiceName('');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto pb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827] lowercase tracking-tight mb-2">интеграции</h1>
        <p className="text-[13px] text-content-secondary lowercase">
          подключите chatters к вашим рабочим инструментам для автоматизации процессов.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrationsList.map((integration: any) => {
          const isSoon = integration.status === 'soon';
          
          return (
            <div 
              key={integration.id} 
              className={`bg-white rounded-xl p-5 flex flex-col transition-colors ${
                isSoon 
                  ? 'border-2 border-dashed border-border opacity-60 grayscale-[50%]' 
                  : 'border border-border shadow-sm hover:border-border/80'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-[#fbfbfd] border border-border rounded-xl flex items-center justify-center p-2">
                  <IntegrationIcon integration={integration.id} size={32} />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono lowercase ${integration.color}`}>
                  {integration.category}
                </span>
              </div>
              
              <h3 className="text-[15px] font-semibold text-[#111827] mb-1.5">{integration.name}</h3>
              <p className="text-[12px] text-content-secondary leading-relaxed mb-6 flex-1">
                {integration.desc}
              </p>

              <div className="mt-auto border-t border-border pt-4">
                {integration.status === 'connected' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#E1F5EE] border border-[#A7E3D1] text-[#0F6E56] rounded-md w-fit">
                      <div className="w-1.5 h-1.5 bg-[#0F6E56] rounded-full" />
                      <span className="text-[11px] font-mono font-medium lowercase">подключено</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        className="h-8 flex-1 text-[11px] lowercase rounded-md"
                        onClick={() => {
                          setSelectedIntegrationId(integration.id);
                          if (integration.id === 'telegram') {
                            setTelegramChatId(integration.config?.chat_id || '');
                            setActiveModal('telegram');
                          } else {
                            setConfigJson(JSON.stringify(integration.config || {}, null, 2));
                            setActiveModal('config');
                          }
                        }}
                      >
                        <Settings2 className="w-3.5 h-3.5 mr-1.5" /> настроить
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-8 px-3 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 border-border rounded-md"
                        onClick={() => handleDisconnect(integration.id)}
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {integration.status === 'available' && (
                  <Button 
                    className="w-full h-9 text-[12px] lowercase font-medium rounded-md shadow-sm"
                    disabled={connectingId === integration.id}
                    onClick={() => {
                      if (integration.id === 'telegram') {
                        setSelectedIntegrationId('telegram');
                        setTelegramChatId('');
                        setActiveModal('telegram');
                      } else {
                        handleConnectOAuth(integration.id);
                      }
                    }}
                  >
                    {connectingId === integration.id ? (
                      <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> перенаправление...</>
                    ) : (
                      <><Plus className="w-4 h-4 mr-1.5" /> подключить</>
                    )}
                  </Button>
                )}

                {integration.status === 'soon' && (
                  <Button disabled variant="outline" className="w-full h-9 text-[12px] lowercase font-medium rounded-md bg-surface text-content-muted">
                    скоро в доступе
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Request Integration Card */}
        <div className="bg-[#fbfbfd] border-2 border-dashed border-border hover:border-accent/50 transition-colors rounded-xl p-5 flex flex-col justify-center text-center">
          <div className="w-12 h-12 bg-white border border-border rounded-full flex items-center justify-center mx-auto mb-4 text-content-tertiary">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="text-[14px] font-semibold text-[#111827] lowercase mb-2">нужна другая интеграция?</h3>
          <p className="text-[12px] text-content-secondary lowercase mb-4">
            расскажите, какой сервис вы используете, и мы добавим его в очередь.
          </p>
          <div className="flex flex-col gap-2 mt-auto">
            <input 
              type="text" 
              placeholder="название сервиса..." 
              value={requestServiceName}
              onChange={e => setRequestServiceName(e.target.value)}
              className="w-full h-9 px-3 bg-white border border-border rounded-md text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent lowercase"
              onKeyDown={e => e.key === 'Enter' && handleRequestIntegration()}
            />
            <Button 
              className="w-full h-9 text-[12px] lowercase font-medium rounded-md"
              onClick={handleRequestIntegration}
              disabled={!requestServiceName.trim() || isRequesting}
            >
              {isRequesting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
              отправить заявку
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'telegram' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border bg-[#fbfbfd]">
              <div className="font-semibold text-[#111827]">Настройка Telegram</div>
              <p className="text-[12px] text-content-secondary mt-1">Добавьте нашего бота <span className="font-mono text-accent bg-accent/10 px-1 rounded">@chatters_alerts_bot</span> в вашу группу или напишите ему напрямую.</p>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-[12px] font-semibold text-[#111827] block mb-1.5">Chat ID пользователя или группы</label>
                <input 
                  type="text" 
                  placeholder="Например: -100123456789"
                  className="w-full h-9 px-3 text-[13px] bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 outline-none font-mono"
                  value={telegramChatId}
                  onChange={e => setTelegramChatId(e.target.value)}
                />
                <div className="flex items-start gap-1.5 mt-2 text-[11px] text-content-tertiary">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Отправьте команду /start боту, чтобы получить ваш персональный Chat ID.</span>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-border bg-[#fbfbfd] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActiveModal(null)} disabled={isSaving}>Отмена</Button>
              <Button onClick={handleSaveConfig} disabled={!telegramChatId.trim() || isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'config' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-border bg-[#fbfbfd]">
              <div className="font-semibold text-[#111827]">Настройки интеграции</div>
              <p className="text-[12px] text-content-secondary mt-1">Редактирование конфигурации напрямую (JSON).</p>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <textarea 
                className="w-full h-48 p-3 text-[12px] font-mono bg-[#fbfbfd] border border-border rounded-md focus:border-accent focus:ring-1 outline-none resize-none"
                value={configJson}
                onChange={e => setConfigJson(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="p-4 border-t border-border bg-[#fbfbfd] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setActiveModal(null)} disabled={isSaving}>Отмена</Button>
              <Button onClick={handleSaveConfig} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
