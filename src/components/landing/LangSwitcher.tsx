import { LANGS, useI18n } from "@/lib/i18n";

export function LangSwitcher({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { lang, setLang } = useI18n();
  const isDark = variant === "dark";
  return (
    <div
      className={`inline-flex items-center rounded-md p-0.5 border font-mono-tabular text-[11px] ${
        isDark ? "border-white/10 bg-white/5" : "border-border bg-muted"
      }`}
    >
      {LANGS.map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            className={`px-2 py-1 rounded transition ${
              active
                ? isDark
                  ? "bg-white/15 text-white"
                  : "bg-background text-foreground shadow-sm"
                : isDark
                  ? "text-white/50 hover:text-white/80"
                  : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}


