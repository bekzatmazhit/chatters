import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { ArrowRight, ChevronDown, BarChart2, BellRing, Palette, Building, Briefcase } from "lucide-react";

export function Nav({ onLoginClick }: { onLoginClick?: () => void }) {
  const { t } = useI18n();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const PRODUCTS = [
    { id: 'sov', name: 'SOV', desc: 'SOV', icon: BarChart2 },
    { id: 'alerts', name: 'Alerts', desc: 'Alerts', icon: BellRing },
    { id: 'whitelabel', name: 'White-label', desc: 'White-label', icon: Palette },
  ];

  const SOLUTIONS = [
    { id: 'agencies', name: 'Agencies', desc: 'Agencies', icon: Briefcase },
    { id: 'brands', name: 'Brands', desc: 'Brands', icon: Building },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 z-50 pt-6 px-4 flex justify-center w-full pointer-events-none">
      <nav className="bg-panel/80 backdrop-blur-xl border border-surface-border rounded-full pl-6 pr-3 py-2.5 flex items-center gap-12 text-content-primary shadow-2xl pointer-events-auto">
        <a href="#top" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-all bg-gray-900">
             <img src="/logo.png" alt="chatters logo" className="w-4 h-4 object-contain brightness-0 invert" />
          </div>
          <span className="font-semibold tracking-tight text-[15px] lowercase">chatters</span>
        </a>
        <div className="hidden lg:flex items-center gap-6 text-[13px] text-content-secondary font-medium">
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-3">
            <button onClick={onLoginClick} className="inline-flex items-center text-[13px] font-semibold text-content-secondary hover:text-content-primary transition-colors px-3 py-2.5">Login</button>
          </div>
        </div>
      </nav>
    </div>
  );
}
