import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-graphite border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-white/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo" />
          <span className="font-semibold text-white/70">chatters</span>
          <span className="font-mono-tabular text-xs ml-3">{t("footer.demo")}</span>
        </div>
        <div className="flex gap-6 font-mono-tabular text-xs">
          <a href="#dashboard" className="hover:text-white/70">{t("nav.dashboard").toLowerCase()}</a>
          <a href="#how" className="hover:text-white/70">{t("nav.how").toLowerCase()}</a>
          <a href="#pricing" className="hover:text-white/70">{t("nav.pricing").toLowerCase()}</a>
        </div>
        <div className="font-mono-tabular text-xs">© 2026 chatters.io</div>
      </div>
    </footer>
  );
}
