import React, { useState } from 'react';
import { Outlet, useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { useBrands } from '../BrandContext';
import { BrandAvatar } from '@/components/ui/BrandAvatar';
import { 
  LayoutDashboard, Play, BarChart2, Zap, Activity, Grid, Settings, 
  ChevronDown, ChevronRight, Search, HelpCircle, Download, Bell, 
  ArrowLeft, Loader2, Sparkles, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScanButton } from '@/components/ScanButton';
import { ExportReportModal } from '@/components/workspace/QuickActions';
import { DataChatWindow } from '@/components/views/DataChatWindow';
import { Toaster } from '@/components/ui/Toaster';

export default function BrandDashboardLayout() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { brands } = useBrands();
  
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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
        { name: 'персонажи', path: 'personas' },
        { name: 'сравнение', path: 'compare' },
        { name: 'рынок', path: 'market' }
      ]
    },
    { 
      name: 'оптимизация', 
      path: 'optimization', 
      icon: Zap,
      subItems: [
        { name: 'симулятор', path: 'simulator', pro: true },
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
    { name: 'интеграции', path: 'integrations', icon: Grid }
  ];

  const bottomNavItems = [
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
    [...navItems, ...bottomNavItems].forEach(item => {
      if (item.subItems && isItemActive(item.path)) {
        initialState[item.path] = true;
      }
    });
    return initialState;
  });

  const toggleSection = (path: string) => {
    setExpandedSections(prev => {
      if (prev[path]) return {}; // Collapse if already open
      return { [path]: true }; // Open new, collapse others
    });
  };

  // Helper to get current section name for breadcrumbs
  const currentSectionName = [...navItems, ...bottomNavItems].find(item => isItemActive(item.path))?.name || 'сводка';

  const scanMode = import.meta.env.VITE_SCAN_MODE?.toLowerCase() || 'live';
  const isMockMode = scanMode === 'mock';


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
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar flex flex-col justify-between">
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
                        // Navigate to first subItem
                        if (!isExpanded && item.subItems && item.subItems.length > 0) {
                          navigate(`/workspace/${slug}/${item.path}/${item.subItems[0].path}`);
                        }
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
          
          <nav className="space-y-0.5 mt-8">
            {/* Promo Banner */}
            <div className="mx-0 mb-3 overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
              <img
                src="/adbanner.png"
                alt="Акция chatters"
                className="w-full h-auto object-cover"
              />
            </div>

            {bottomNavItems.map((item) => {
              const active = isItemActive(item.path);
              const hasSubItems = !!item.subItems;
              const isExpanded = expandedSections[item.path];

              return (
                <div key={item.path}>
                  {hasSubItems ? (
                    <button 
                      onClick={() => {
                        toggleSection(item.path);
                        // Navigate to first subItem
                        if (!isExpanded && item.subItems && item.subItems.length > 0) {
                          navigate(`/workspace/${slug}/${item.path}/${item.subItems[0].path}`);
                        }
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
        <div className="shrink-0">
          <div className="p-4 border-t border-border">
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

            <ScanButton
              projectId={currentBrand.id}
              projectName={currentBrand.name}
              configScope="project"
              label="запустить проверку"
              variant="primary"
              className="h-8 px-4 rounded-full text-[12px] lowercase font-semibold shadow-sm"
            />

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

      {/* Floating Action Button for AI Data Chat */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-accent-hover transition-all flex items-center justify-center z-30 group ${isChatOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100 duration-300'}`}
        title="Спроси свои данные (AI Copilot)"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      </button>

      <DataChatWindow 
        projectId={currentBrand?.id} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

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
