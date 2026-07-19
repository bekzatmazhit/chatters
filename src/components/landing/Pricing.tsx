import { useI18n } from "@/lib/i18n";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Pricing() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const PLANS = [
    {
      id: "starter",
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
      id: "growth",
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
      id: "agency",
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
    <section id="pricing" className="bg-bg border-t border-surface-border">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono-tabular text-content-muted uppercase tracking-wider mb-3">
            {t("price.tag")}
          </div>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-content-primary">{t("price.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border p-7 flex flex-col transition-transform hover:-translate-y-0.5 ${
                p.highlight
                  ? "border-accent bg-accent/[0.04] ring-1 ring-accent/20"
                  : "border-surface-border bg-panel"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <div className="text-lg font-medium text-content-primary">{p.name}</div>
                {p.highlight && (
                  <div className="text-[10px] font-mono-tabular uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded">
                    {t("price.recommended")}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-mono-tabular text-4xl text-content-primary">
                  {p.priceIsNumber ? `$${p.price}` : p.price}
                </span>
                {p.period && <span className="text-sm text-content-secondary font-mono-tabular">{p.period}</span>}
              </div>
              <div className="text-sm text-content-secondary mt-1">{p.tag}</div>

              <div className="my-6 border-t border-surface-border" />

              <ul className="space-y-3 text-sm flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={13} className="mt-0.5 text-accent shrink-0" strokeWidth={2.5} />
                    <span className="text-content-secondary">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem("selectedPlan", p.id);
                  navigate(`/signup?plan=${p.id}`);
                }}
                className={`mt-7 w-full rounded-md py-2.5 text-sm font-medium transition-colors ${
                  p.highlight
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-surface hover:bg-surface-hover text-content-primary border border-surface-border"
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


