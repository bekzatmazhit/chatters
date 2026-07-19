import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { ArrowRight } from "lucide-react";
import ASCIIText from "./ASCIIText";

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
    <section id="cta" className="relative bg-panel border-t border-surface-border overflow-hidden">
      
      {/* ASCII Text Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-[0.15] mix-blend-screen">
        <ASCIIText
          text="chatters"
          enableWaves={true}
          asciiFontSize={10}
          textFontSize={300}
        />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-10 py-24 md:py-32 text-center">
        <div className="text-xs font-mono-tabular text-content-muted uppercase tracking-wider mb-4">
          {t("cta.tag")}
        </div>
        <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-content-primary leading-tight">{t("cta.title")}</h2>
        <p className="mt-4 text-content-secondary text-lg leading-relaxed max-w-xl mx-auto">{t("cta.sub")}</p>

        {!sent ? (
          <form onSubmit={submit} className="mt-10 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("cta.placeholder")}
              className="flex-1 bg-bg border border-surface-border text-content-primary placeholder:text-content-muted rounded-md px-4 py-3 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 bg-content-primary text-bg font-medium rounded-md px-6 py-3 text-sm hover:bg-content-primary/90 transition whitespace-nowrap"
            >
              {t("cta.button")}
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </form>
        ) : (
          <div className="mt-10 max-w-md mx-auto rounded-md border border-positive/30 bg-positive/5 px-5 py-4 text-left rise-in">
            <div className="flex items-center gap-2 text-positive font-mono-tabular text-xs uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-positive" />
              {t("cta.received")}
            </div>
            <div className="mt-2 text-content-primary text-sm">{t("cta.thanks")}</div>
          </div>
        )}

        <div className="mt-6 font-mono-tabular text-xs text-content-muted">{t("cta.footnote")}</div>
      </div>
    </section>
  );
}


