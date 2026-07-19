import { useI18n } from "@/lib/i18n";
import { LangSwitcher } from "./LangSwitcher";

export function Nav() {
  const { t } = useI18n();
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 px-6 md:px-10 py-5 flex items-center justify-between text-white/90">
      <a href="#top" className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo" />
        <span className="font-semibold tracking-tight">chatters</span>
      </a>
      <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
        <a href="#dashboard" className="hover:text-white transition">{t("nav.dashboard")}</a>
        <a href="#how" className="hover:text-white transition">{t("nav.how")}</a>
        <a href="#pricing" className="hover:text-white transition">{t("nav.pricing")}</a>
      </div>
      <div className="flex items-center gap-3">
        <LangSwitcher variant="dark" />
        <a
          href="#cta"
          className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition"
        >
          {t("nav.cta")}
        </a>
      </div>
    </nav>
  );
}
