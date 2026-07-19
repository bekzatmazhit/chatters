import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t, lang } = useI18n();

  const QUERY = t("hero.query");
  const RESPONSE_BEFORE = t("hero.respBefore");
  const BRAND = t("hero.brand");
  const RESPONSE_AFTER = t("hero.respAfter");
  const fullAnswer = RESPONSE_BEFORE + BRAND + RESPONSE_AFTER;

  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState<"typing" | "thinking" | "answering" | "done">("typing");
  const [answerChars, setAnswerChars] = useState(0);

  // reset on language change
  useEffect(() => {
    setTyped("");
    setAnswerChars(0);
    setPhase("typing");
  }, [lang]);

  useEffect(() => {
    if (phase !== "typing") return;
    if (typed.length >= QUERY.length) {
      const t = setTimeout(() => setPhase("thinking"), 500);
      return () => clearTimeout(t);
    }
    const tm = setTimeout(() => setTyped(QUERY.slice(0, typed.length + 1)), 55);
    return () => clearTimeout(tm);
  }, [typed, phase, QUERY]);

  useEffect(() => {
    if (phase !== "thinking") return;
    const tm = setTimeout(() => setPhase("answering"), 900);
    return () => clearTimeout(tm);
  }, [phase]);

  useEffect(() => {
    if (phase !== "answering") return;
    if (answerChars >= fullAnswer.length) {
      setPhase("done");
      return;
    }
    const tm = setTimeout(() => setAnswerChars((n) => Math.min(n + 3, fullAnswer.length)), 20);
    return () => clearTimeout(tm);
  }, [answerChars, phase, fullAnswer.length]);

  const renderAnswer = () => {
    const shown = fullAnswer.slice(0, answerChars);
    const brandStart = RESPONSE_BEFORE.length;
    const brandEnd = brandStart + BRAND.length;
    const before = shown.slice(0, Math.min(shown.length, brandStart));
    const brand = shown.slice(before.length, Math.min(shown.length, brandEnd));
    const after = shown.slice(brandEnd);
    return (
      <>
        <span>{before}</span>
        {brand && (
          <mark className="bg-indigo/25 text-white px-1 py-0.5 rounded-sm ring-1 ring-indigo/40">
            {brand}
          </mark>
        )}
        <span>{after}</span>
        {phase !== "done" && (
          <span className="inline-block w-[2px] h-4 bg-white/70 ml-0.5 align-[-2px] caret-blink" />
        )}
      </>
    );
  };

  return (
    <section id="top" className="relative bg-graphite-grid overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-graphite/40 via-graphite/70 to-graphite pointer-events-none" />
      <div className="relative">
        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono-tabular text-white/60 border border-white/10 rounded-full px-3 py-1 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-positive" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white leading-[1.05]">
              {t("hero.title1")}
              <span className="block text-white/50">{t("hero.title2")}</span>
            </h1>
            <p className="mt-6 text-lg text-white/60 max-w-xl">{t("hero.sub")}</p>
          </div>

          <div className="mt-14 md:mt-20 rounded-xl bg-graphite-soft/80 border border-white/10 backdrop-blur-sm shadow-2xl shadow-black/40">
            <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              </div>
              <span className="font-mono-tabular text-xs text-white/40 ml-2">query.prompt</span>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex items-start gap-3">
                <span className="font-mono-tabular text-xs text-white/40 mt-1">→</span>
                <div className="font-mono-tabular text-base md:text-lg text-white">
                  {typed}
                  {phase === "typing" && (
                    <span className="inline-block w-[2px] h-5 bg-white/80 ml-0.5 align-[-3px] caret-blink" />
                  )}
                </div>
              </div>

              {phase === "thinking" && (
                <div className="mt-6 flex items-center gap-2 text-xs text-white/40 font-mono-tabular">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo animate-pulse" />
                  {t("hero.thinking")}
                </div>
              )}

              {(phase === "answering" || phase === "done") && (
                <div className="mt-6 rise-in">
                  <div className="flex items-center gap-2 text-xs text-white/40 font-mono-tabular mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                    {t("hero.responseLabel")}
                  </div>
                  <p className="text-white/85 leading-relaxed font-mono-tabular text-[15px]">
                    {renderAnswer()}
                  </p>

                  {phase === "done" && (
                    <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs rise-in">
                      <Stat label={t("hero.stat.mentioned")} value={t("hero.stat.mentionedYes")} tone="positive" />
                      <Stat label={t("hero.stat.position")} value="#1" />
                      <Stat label={t("hero.stat.sentiment")} value="+0.72" tone="positive" />
                      <Stat label={t("hero.stat.sources")} value="4" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "positive" }) {
  return (
    <div>
      <div className="text-white/40 font-mono-tabular uppercase tracking-wider text-[10px]">{label}</div>
      <div
        className={`mt-1 font-mono-tabular text-lg ${
          tone === "positive" ? "text-positive" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
