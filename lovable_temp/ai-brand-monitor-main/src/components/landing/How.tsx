import { useI18n } from "@/lib/i18n";

export function How() {
  const { t } = useI18n();
  const STEPS = [
    { n: "01", t: t("how.s1.t"), d: t("how.s1.d") },
    { n: "02", t: t("how.s2.t"), d: t("how.s2.d") },
    { n: "03", t: t("how.s3.t"), d: t("how.s3.d") },
  ];
  return (
    <section id="how" className="bg-graphite border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono-tabular text-white/40 uppercase tracking-wider mb-3">
            {t("how.tag")}
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{t("how.title")}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-graphite p-8">
              <div className="font-mono-tabular text-sm text-indigo-soft">{s.n}</div>
              <div className="mt-6 text-xl text-white font-semibold tracking-tight">{s.t}</div>
              <p className="mt-3 text-white/60 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
