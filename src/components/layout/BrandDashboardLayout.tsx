import React, { useState } from 'react';
import { Outlet, useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { BrandAvatar } from '@/components/ui/BrandAvatar';
import { 
  LayoutDashboard, Play, BarChart2, Zap, Activity, Grid, Settings, 
  ChevronDown, ChevronRight, Search, HelpCircle, Download, Bell, 
  ArrowLeft, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { ExportReportModal } from '@/components/workspace/QuickActions';

export default function BrandDashboardLayout() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { brands } = useBrands();
  
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Find current brand or mock it
  const currentBrand = brands.find(b => b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug) 
    || { id: 'mock', name: slug || 'Бренд', color: '#10b981' };

  const navItems = [
    { name: 'сводка', path: 'overview', icon: LayoutDashboard },
    { 
      name: 'прогоны', 
      path: 'runs', 
      icon: Play,
      subItems: [
        { name: 'история', path: 'history' },
        { name: 'ручной запуск', path: 'manual' }
      ]
    },
    { 
      name: 'аналитика', 
      path: 'analytics', 
      icon: BarChart2,
      subItems: [
        { name: 'по моделям', path: 'models' },
        { name: 'источники', path: 'sources' },
        { name: 'промпты', path: 'prompts' },
        { name: 'сравнение', path: 'compare' },
        { name: 'рынок', path: 'market' }
      ]
    },
    { 
      name: 'оптимизация', 
      path: 'optimization', 
      icon: Zap,
      subItems: [
        { name: 'план', path: 'plan' },
        { name: 'брифы', path: 'briefs' },
        { name: 'база фактов', path: 'facts' },
        { name: 'галлюцинации', path: 'hallucinations' }
      ]
    },
    { 
      name: 'мониторинг', 
      path: 'monitoring', 
      icon: Activity,
      subItems: [
        { name: 'триггеры', path: 'triggers' },
        { name: 'алерты', path: 'alerts' },
        { name: 'хронология', path: 'timeline' }
      ]
    },
    { name: 'интеграции', path: 'integrations', icon: Grid },
    { 
      name: 'настройки', 
      path: 'settings', 
      icon: Settings,
      subItems: [
        { name: 'общие', path: 'general' },
        { name: 'отчёты', path: 'reports' },
        { name: 'white-label', path: 'white-label', pro: true }
      ]
    }
  ];

  // Logic to expand the accordion if a child path is active
  const isItemActive = (path: string) => location.pathname.includes(`/workspace/${slug}/${path}`);
  
  // State for expanded accordions
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    navItems.forEach(item => {
      if (item.subItems && isItemActive(item.path)) {
        initialState[item.path] = true;
      }
    });
    return initialState;
  });

  const toggleSection = (path: string) => {
    setExpandedSections(prev => ({ ...prev, [path]: !prev[path] }));
  };

  // Helper to get current section name for breadcrumbs
  const currentSectionName = navItems.find(item => isItemActive(item.path))?.name || 'сводка';

  const handleRunProject = async () => {
    setIsRunning(true);
    try {
      const { error } = await supabase.functions.invoke('run-project-check', {
        body: { project_id: currentBrand.id }
      });
      if (error) throw error;
      alert('Проверка проекта успешно запущена');
    } catch (err) {
      console.error(err);
      alert('Запуск проверки пока недоступен (требуется деплой Edge Function).');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#fbfbfd] text-content-primary font-sans">
      
      {/* LEFT SIDEBAR (220px fixed) */}
      <aside className="w-[220px] shrink-0 border-r border-border bg-white flex flex-col z-20">
        
        {/* Brand Dropdown */}
        <div className="h-16 flex items-center px-4 border-b border-border relative">
          <button 
            className="flex w-full items-center justify-between rounded-lg hover:bg-[#fbfbfd] p-1.5 transition-colors -ml-1.5"
            onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
          >
            <div className="flex items-center gap-2.5">
              <BrandAvatar project={currentBrand} size={28} />
              <span className="font-semibold text-[14px] text-[#111827] truncate max-w-[110px] text-left">
                {currentBrand.name}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-content-muted transition-transform ${isBrandDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isBrandDropdownOpen && (
            <div className="absolute top-14 left-4 right-4 bg-white border border-border shadow-lg rounded-lg py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] font-bold text-content-tertiary uppercase tracking-wider">
                ваши проекты
              </div>
              {brands.map(b => (
                <button 
                  key={b.id} 
                  className="w-full px-3 py-2 text-[13px] text-left hover:bg-[#fbfbfd] text-[#111827] font-medium flex items-center gap-2"
                  onClick={() => {
                    setIsBrandDropdownOpen(false);
                    const currentPathRest = location.pathname.split(`/workspace/${slug}/`)[1] || 'overview';
                    navigate(`/workspace/${b.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${currentPathRest}`);
                  }}
                >
                  <BrandAvatar project={b} size={20} className="!rounded-sm" />
                  {b.name}
                </button>
              ))}
              <div className="h-px bg-border my-1"></div>
              <button 
                className="w-full px-3 py-2 text-[13px] text-left hover:bg-[#fbfbfd] text-accent font-medium flex items-center gap-2 lowercase"
                onClick={() => navigate('/workspace')}
              >
                <ArrowLeft className="w-4 h-4" /> все бренды
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active = isItemActive(item.path);
              const hasSubItems = !!item.subItems;
              const isExpanded = expandedSections[item.path];

              return (
                <div key={item.path}>
                  {hasSubItems ? (
                    <button 
                      onClick={() => {
                        toggleSection(item.path);
                        // Optional: Navigate to main path when clicked
                        // navigate(`/workspace/${slug}/${item.path}`); 
                      }}
                      className={`flex w-full items-center justify-between px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors lowercase ${
                        active ? 'bg-accent/10 text-accent' : 'text-content-secondary hover:bg-[#fbfbfd] hover:text-[#111827]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={`/workspace/${slug}/${item.path}`}
                      className={`flex w-full items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors lowercase ${
                        active ? 'bg-accent/10 text-accent' : 'text-content-secondary hover:bg-[#fbfbfd] hover:text-[#111827]'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  )}

                  {/* SubItems */}
                  {hasSubItems && isExpanded && (
                    <div className="mt-0.5 mb-1.5 pl-9 pr-2 space-y-0.5">
                      {item.subItems.map(sub => {
                        const subPath = `/workspace/${slug}/${item.path}/${sub.path}`;
                        const isSubActive = location.pathname === subPath || (active && !location.pathname.includes(sub.path) && sub.path === 'overview');
                        // Simple active check for sub-items
                        const isActiveReal = location.pathname.includes(sub.path);

                        return (
                          <Link
                            key={sub.path}
                            to={subPath}
                            className={`flex items-center justify-between w-full px-2 py-1.5 text-[12px] rounded-md transition-colors lowercase font-medium ${
                              isActiveReal ? 'text-[#111827] font-semibold bg-[#fbfbfd]' : 'text-content-muted hover:text-content-secondary'
                            }`}
                          >
                            <span>{sub.name}</span>
                            {sub.pro && (
                              <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-bold uppercase tracking-wider">pro</span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Block */}
        <div className="p-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#111827] flex items-center justify-center text-white text-[12px] font-bold uppercase">
              A
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-semibold text-[#111827] truncate">Alex Smith</div>
              <div className="text-[11px] text-content-tertiary truncate">alex@acme.corp</div>
            </div>
          </div>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-white flex items-center justify-between px-6 shrink-0 z-10 shadow-[0_1px_2px_rgb(0,0,0,0.02)]">
          {/* Breadcrumbs */}
          <div className="flex items-center text-[12px] font-medium lowercase tracking-wide text-content-muted">
            <span className="text-[#111827]">{currentBrand.name}</span>
            <span className="mx-2">/</span>
            <span className="text-accent font-semibold">{currentSectionName}</span>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#fbfbfd] text-content-muted hover:text-[#111827] transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button 
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[#fbfbfd] text-content-secondary hover:text-[#111827] transition-colors text-[12px] font-semibold lowercase"
              onClick={() => window.open('https://docs.chatters.ai', '_blank')}
            >
              <HelpCircle className="w-4 h-4" /> помощь
            </button>
            <button 
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[#fbfbfd] text-content-secondary hover:text-[#111827] transition-colors text-[12px] font-semibold lowercase"
              onClick={() => setShowExportModal(true)}
            >
              <Download className="w-4 h-4" /> экспорт
            </button>
            
            <div className="w-px h-4 bg-border mx-1"></div>

            <Button 
              className="h-8 px-4 rounded-full text-[12px] lowercase font-semibold shadow-sm"
              onClick={handleRunProject}
              disabled={isRunning}
            >
              {isRunning ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />}
              {isRunning ? 'выполняется...' : 'запуск'}
            </Button>

            <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#fbfbfd] text-content-muted hover:text-[#111827] transition-colors relative ml-1">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Content (Outlet) */}
        <main className="flex-1 overflow-auto bg-[#fbfbfd] p-6 relative">
          <Outlet />
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #D1D5DB; }
      `}} />

      <ExportReportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
    </div>
  );
}
