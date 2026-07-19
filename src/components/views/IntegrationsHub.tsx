import React from 'react';
import { IntegrationIcon } from '@/components/ui/IntegrationIcon';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Settings2, PowerOff, Plus, Send } from 'lucide-react';

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
];

export default function IntegrationsHub() {
  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto pb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111827] lowercase tracking-tight mb-2">интеграции</h1>
        <p className="text-[13px] text-content-secondary lowercase">
          подключите chatters к вашим рабочим инструментам для автоматизации процессов.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INTEGRATIONS.map(integration => {
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
                      <Button variant="outline" className="h-8 flex-1 text-[11px] lowercase rounded-md">
                        <Settings2 className="w-3.5 h-3.5 mr-1.5" /> настроить
                      </Button>
                      <Button variant="outline" className="h-8 px-3 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 border-border rounded-md">
                        <PowerOff className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {integration.status === 'available' && (
                  <Button className="w-full h-9 text-[12px] lowercase font-medium rounded-md shadow-sm">
                    <Plus className="w-4 h-4 mr-1.5" /> подключить
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
              className="w-full h-9 px-3 bg-white border border-border rounded-md text-[13px] focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent lowercase"
            />
            <Button className="w-full h-9 text-[12px] lowercase font-medium rounded-md">
              <Send className="w-3.5 h-3.5 mr-1.5" /> отправить заявку
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
