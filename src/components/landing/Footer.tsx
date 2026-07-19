import { useI18n } from "@/lib/i18n";
import { LangSwitcher } from "./LangSwitcher";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-bg border-t border-surface-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md flex items-center justify-center transition-all bg-gray-900 grayscale opacity-80">
            <img src="/logo.png" alt="chatters logo" className="w-3.5 h-3.5 object-contain brightness-0 invert" />
          </div>
          <span className="font-semibold text-content-primary text-[15px]">chatters</span>
          <span className="font-mono-tabular text-xs text-content-muted ml-2">{t("footer.demo")}</span>
        </div>
        <div className="flex gap-6 font-mono-tabular text-xs text-content-muted">
          <a href="#dashboard" className="hover:text-content-secondary transition-colors">{t("nav.dashboard").toLowerCase()}</a>
          <a href="#how" className="hover:text-content-secondary transition-colors">{t("nav.how").toLowerCase()}</a>
          <a href="#pricing" className="hover:text-content-secondary transition-colors">{t("nav.pricing").toLowerCase()}</a>
        </div>
        <div className="flex items-center gap-4">
          <LangSwitcher variant="dark" />
          <div className="font-mono-tabular text-xs text-content-muted">пїЅ 2026 chatters.io</div>
        </div>
      </div>
    </footer>
  );
}


