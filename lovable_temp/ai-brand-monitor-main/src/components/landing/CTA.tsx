import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";

export function CTA() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSent(true);
  };

  return (
    <section id="cta" className="bg-graphite border-t border-white/5">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-24 md:py-32 text-center">
        <div className="text-xs font-mono-tabular text-white/40 uppercase tracking-wider mb-3">
          {t("cta.tag")}
        </div>
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white">{t("cta.title")}</h2>
        <p className="mt-4 text-white/60 text-lg">{t("cta.sub")}</p>

        {!sent ? (
          <form onSubmit={submit} className="mt-10 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("cta.placeholder")}
              className="flex-1 bg-graphite-soft border border-white/10 text-white placeholder:text-white/30 rounded-md px-4 py-3 font-mono-tabular text-sm focus:outline-none focus:border-indigo focus:ring-1 focus:ring-indigo transition"
            />
            <button
              type="submit"
              className="bg-indigo text-white font-medium rounded-md px-5 py-3 text-sm hover:bg-indigo/90 transition"
            >
              {t("cta.button")}
            </button>
          </form>
        ) : (
          <div className="mt-10 max-w-md mx-auto rounded-md border border-positive/30 bg-positive/5 px-5 py-4 text-left rise-in">
            <div className="flex items-center gap-2 text-positive font-mono-tabular text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-positive" />
              {t("cta.received")}
            </div>
            <div className="mt-2 text-white">{t("cta.thanks")}</div>
          </div>
        )}

        <div className="mt-6 font-mono-tabular text-xs text-white/40">{t("cta.footnote")}</div>
      </div>
    </section>
  );
}
