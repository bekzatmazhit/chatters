import { useI18n } from "@/lib/i18n";

export function Pricing() {
  const { t } = useI18n();
  const PLANS = [
    {
      name: t("price.starter"),
      price: "49",
      period: t("price.mo"),
      tag: t("price.starter.tag"),
      features: [
        t("price.starter.f1"),
        t("price.starter.f2"),
        t("price.starter.f3"),
        t("price.starter.f4"),
        t("price.starter.f5"),
      ],
      cta: t("price.trialCta"),
      highlight: false,
      priceIsNumber: true,
    },
    {
      name: t("price.growth"),
      price: "199",
      period: t("price.mo"),
      tag: t("price.growth.tag"),
      features: [
        t("price.growth.f1"),
        t("price.growth.f2"),
        t("price.growth.f3"),
        t("price.growth.f4"),
        t("price.growth.f5"),
        t("price.growth.f6"),
      ],
      cta: t("price.trialCta"),
      highlight: true,
      priceIsNumber: true,
    },
    {
      name: t("price.agency"),
      price: t("price.custom"),
      period: "",
      tag: t("price.agency.tag"),
      features: [
        t("price.agency.f1"),
        t("price.agency.f2"),
        t("price.agency.f3"),
        t("price.agency.f4"),
        t("price.agency.f5"),
      ],
      cta: t("price.salesCta"),
      highlight: false,
      priceIsNumber: false,
    },
  ];

  return (
    <section id="pricing" className="bg-background text-foreground border-t border-graphite-line/20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono-tabular text-muted-foreground uppercase tracking-wider mb-3">
            {t("price.tag")}
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t("price.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border p-7 flex flex-col ${
                p.highlight ? "border-indigo bg-indigo/[0.04] ring-1 ring-indigo/20" : "border-border bg-card"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-semibold">{p.name}</div>
                {p.highlight && (
                  <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-indigo bg-indigo/10 px-2 py-0.5 rounded">
                    {t("price.recommended")}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-mono-tabular text-4xl">
                  {p.priceIsNumber ? `$${p.price}` : p.price}
                </span>
                {p.period && <span className="text-sm text-muted-foreground font-mono-tabular">{p.period}</span>}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{p.tag}</div>

              <ul className="mt-6 space-y-3 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-indigo shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => document.getElementById("cta")?.scrollIntoView({ behavior: "smooth" })}
                className={`mt-7 w-full rounded-md py-2.5 text-sm font-medium transition ${
                  p.highlight
                    ? "bg-indigo text-white hover:bg-indigo/90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
