import { useI18n } from "@/lib/i18n";

export function Problem() {
  const { t } = useI18n();
  return (
    <section className="bg-bg border-t border-surface-border">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="text-xs font-mono-tabular text-content-muted uppercase tracking-wider">
            {t("problem.tag")}
          </div>
          <div className="md:col-span-2">
            <p className="text-2xl md:text-3xl text-content-primary leading-snug tracking-tight">
              {t("problem.lead")}
              <span className="text-content-secondary">{t("problem.leadMuted")}</span>
            </p>
            <div className="mt-10 grid sm:grid-cols-3 gap-6 text-sm">
              <Fact n="63%" tx={t("problem.fact1")} />
              <Fact n="0" tx={t("problem.fact2")} />
              <Fact n="4/d" tx={t("problem.fact3")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Fact({ n, tx }: { n: string; tx: string }) {
  return (
    <div className="border-l border-surface-border pl-4">
      <div className="font-mono-tabular text-3xl text-content-primary">{n}</div>
      <div className="text-content-secondary mt-1">{tx}</div>
    </div>
  );
}


