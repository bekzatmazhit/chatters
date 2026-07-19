import { useI18n } from "@/lib/i18n";
import { Radar, Zap, TrendingUp } from "lucide-react";

const ICONS = [Radar, Zap, TrendingUp];

export function How() {
  const { t } = useI18n();
  const STEPS = [
    { n: "01", t: t("how.s1.t"), d: t("how.s1.d") },
    { n: "02", t: t("how.s2.t"), d: t("how.s2.d") },
    { n: "03", t: t("how.s3.t"), d: t("how.s3.d") },
  ];
  return (
    <section id="how" className="bg-bg border-t border-surface-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono-tabular text-content-muted uppercase tracking-wider mb-3">
            {t("how.tag")}
          </div>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-content-primary">{t("how.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-surface-border rounded-xl overflow-hidden border border-surface-border">
          {STEPS.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <div key={s.n} className="bg-bg p-8 hover:bg-panel transition-colors duration-200 group">
                <div className="flex items-start justify-between mb-6">
                  <div className="font-mono-tabular text-sm text-content-muted">{s.n}</div>
                  <div className="w-8 h-8 rounded-md bg-surface border border-surface-border flex items-center justify-center text-content-muted group-hover:text-accent group-hover:border-accent/30 transition-colors">
                    <Icon size={15} />
                  </div>
                </div>
                <div className="text-xl text-content-primary font-medium tracking-tight">{s.t}</div>
                <p className="mt-3 text-content-secondary leading-relaxed text-sm">{s.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

