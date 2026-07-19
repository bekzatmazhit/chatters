import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import PixelBlast from "./PixelBlast";

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
          <span className="bg-indigo/30 text-[#818CF8] px-1.5 py-0.5 rounded-md border border-indigo/40 shadow-[0_0_10px_rgba(76,95,213,0.3)] font-semibold mx-0.5">
            {brand}
          </span>
        )}
        <span>{after}</span>
        {phase !== "done" && (
          <span className="inline-block w-[2px] h-4 bg-indigo ml-1 align-[-2px] caret-blink" />
        )}
      </>
    );
  };

  return (
    <section id="top" className="relative bg-bg overflow-hidden min-h-screen flex items-center border-b border-surface-border">
      
      {/* Pixel Blast Background */}
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-50 mix-blend-screen">
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color="#4C5FD5"
          patternScale={2}
          patternDensity={1.2}
          pixelSizeJitter={0.5}
          enableRipples
          rippleSpeed={0.4}
          rippleThickness={0.1}
          rippleIntensityScale={1.5}
          liquid={true}
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent={true}
        />
      </div>
      
      {/* Dynamic Background Effects - minimal grid */}
      <div className="absolute inset-0 bg-panel-grid opacity-20 mix-blend-overlay dark:opacity-40 z-0 pointer-events-none" />
      
      {/* Fade out to the bottom */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg pointer-events-none z-0" />
      
      <div className="relative z-10 w-full">
        <div className="max-w-6xl mx-auto px-6 md:px-10 pt-32 pb-24 md:pt-40 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
          
          <div className="max-w-xl z-10 relative">
            <div className="text-xs font-mono-tabular text-content-muted uppercase tracking-wider mb-6">
              /00 пїЅ {t("hero.badge")}
            </div>
            <h1 className="text-3xl md:text-[2.75rem] font-medium text-content-primary leading-[1.2] tracking-tight">
              {t("hero.title1")}{" "}
              <span className="text-content-secondary">{t("hero.title2")}</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-content-secondary leading-relaxed font-light">
              {t("hero.sub")}
            </p>
            
            <div className="mt-12 flex items-center gap-4">
              <Link to="/signup" className="bg-[#111827] text-white hover:bg-black font-medium px-6 py-3 rounded-full transition-colors lowercase">
                Начать бесплатно
              </Link>
              <a href="#workflow" className="bg-transparent hover:bg-black/5 text-[#111827] font-medium px-6 py-3 rounded-full border border-black/10 transition-colors lowercase">
                Смотреть демо
              </a>
            </div>

            {/* AI Models strip */}
            <div className="mt-10 pt-8 border-t border-surface-border">
              <div className="text-[10px] font-mono-tabular text-content-muted uppercase tracking-wider mb-3">
                  ОТСЛЕЖИВАЕМЫЕ МОДЕЛИ ИИ
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {["ChatGPT", "Claude", "Gemini", "Perplexity", "Grok"].map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface border border-surface-border text-content-secondary"
                  >
                    <AILogo model={name} className="w-3.5 h-3.5 object-contain opacity-70" />
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full mt-12 md:mt-0">
            {/* Main Terminal Window */}
            <div className="rounded-xl bg-panel border border-surface-border shadow-sm overflow-hidden relative">
              
              <div className="px-5 py-3 border-b border-surface-border flex items-center gap-3 bg-surface">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span className="font-mono-tabular text-xs text-content-muted ml-2">live-monitoring.exe</span>
              </div>

              <div className="p-6 md:p-8 min-h-[320px] flex flex-col">
                <div className="flex items-start gap-3">
                  <span className="font-mono-tabular text-sm text-accent mt-0.5">2\</span>
                  <div className="font-mono-tabular text-base md:text-lg text-content-primary">
                    {typed}
                    {phase === "typing" && (
                      <span className="inline-block w-[2px] h-5 bg-accent ml-1 align-[-3px] caret-blink" />
                    )}
                  </div>
                </div>

                {phase === "thinking" && (
                  <div className="mt-8 flex items-center gap-3 text-sm text-content-secondary font-mono-tabular">
                    <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    {t("hero.thinking")}
                  </div>
                )}

                {(phase === "answering" || phase === "done") && (
                  <div className="mt-8 rise-in flex-1">
                    <div className="flex items-center gap-2 text-xs text-content-secondary font-mono-tabular mb-4">
                      <AILogo model={name} className="w-3.5 h-3.5 object-contain opacity-70" />
                      {t("hero.responseLabel")}
                    </div>
                    <p className="text-content-primary leading-relaxed font-mono-tabular text-[15px] bg-surface p-4 rounded-lg border border-surface-border">
                      {renderAnswer()}
                    </p>

                    {phase === "done" && (
                      <div className="mt-6 pt-5 border-t border-surface-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs rise-in">
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
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "positive" }) {
  return (
    <div>
      <div className="text-content-secondary font-mono-tabular uppercase tracking-wider text-[10px]">{label}</div>
      <div
        className={`mt-1 font-mono-tabular text-lg ${
          tone === "positive" ? "text-positive" : "text-content-primary"
        }`}
      >
        {value}
      </div>
    </div>
  );
}



