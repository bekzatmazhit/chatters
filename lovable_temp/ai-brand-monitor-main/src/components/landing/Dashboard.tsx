import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";

export function Dashboard() {
  const { t } = useI18n();

  const SHARE = [
    { name: t("dash.yourBrand"), share: 34, color: "var(--indigo)", you: true },
    { name: `${t("dash.competitor")} A`, share: 26, color: "oklch(0.55 0.02 260)" },
    { name: `${t("dash.competitor")} B`, share: 18, color: "oklch(0.65 0.02 260)" },
    { name: `${t("dash.competitor")} C`, share: 12, color: "oklch(0.75 0.015 260)" },
    { name: t("dash.others"), share: 10, color: "oklch(0.85 0.01 260)" },
  ];

  const RUNS = [
    { query: t("dash.run1"), mentioned: true, position: 1, sentiment: 0.78, sources: 4, model: "gpt-4o" },
    { query: t("dash.run2"), mentioned: true, position: 2, sentiment: 0.51, sources: 3, model: "claude-3.5" },
    { query: t("dash.run3"), mentioned: true, position: 1, sentiment: 0.9, sources: 5, model: "perplexity" },
    { query: t("dash.run4"), mentioned: false, position: null, sentiment: 0, sources: 0, model: "gemini-2" },
    { query: t("dash.run5"), mentioned: true, position: 3, sentiment: 0.22, sources: 6, model: "gpt-4o" },
    { query: t("dash.run6"), mentioned: false, position: null, sentiment: 0, sources: 0, model: "claude-3.5" },
  ];

  const SOURCE_GAP = [
    { domain: "producthunt.com", citations: 42, note: t("dash.gap.note.chatgpt_perplexity") },
    { domain: "news.ycombinator.com", citations: 31, note: t("dash.gap.note.claude_perplexity") },
    { domain: "reddit.com/r/marketing", citations: 28, note: t("dash.gap.note.all") },
    { domain: "g2.com/categories/seo", citations: 24, note: t("dash.gap.note.chatgpt_gemini") },
  ];

  return (
    <section id="dashboard" className="bg-background text-foreground border-t border-graphite-line/20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono-tabular text-muted-foreground uppercase tracking-wider mb-3">
            {t("dash.tag")}
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t("dash.title")}</h2>
          <p className="mt-3 text-muted-foreground text-lg">{t("dash.sub")}</p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5">
          <Panel className="col-span-12" title={t("dash.sov")} subtitle={t("dash.sovSub")}>
            <ShareOfVoice items={SHARE} />
          </Panel>

          <Panel className="col-span-12 lg:col-span-8" title={t("dash.runs")} subtitle={t("dash.runsSub")}>
            <RunsTable runs={RUNS} />
          </Panel>

          <Panel className="col-span-12 lg:col-span-4" title={t("dash.trend")} subtitle={t("dash.trendSub")}>
            <Trend />
          </Panel>

          <Panel className="col-span-12" title={t("dash.gap")} subtitle={t("dash.gapSub")}>
            <SourceGap items={SOURCE_GAP} />
          </Panel>
        </div>
      </div>
    </section>
  );
}

function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl bg-card border border-border ${className}`}>
      <div className="px-5 py-3 border-b border-border flex items-baseline justify-between">
        <div className="font-mono-tabular text-xs uppercase tracking-wider text-foreground">{title}</div>
        {subtitle && <div className="font-mono-tabular text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

type Brand = { name: string; share: number; color: string; you?: boolean };

function ShareOfVoice({ items }: { items: Brand[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.4 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div className="flex h-14 w-full rounded-md overflow-hidden border border-border">
        {items.map((b, i) => (
          <div
            key={b.name}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className="relative flex items-center justify-center transition-[width,opacity] duration-1000 ease-out cursor-default"
            style={{
              width: visible ? `${b.share}%` : "0%",
              background: b.color,
              opacity: hover === null || hover === i ? 1 : 0.55,
            }}
          >
            {b.share >= 12 && (
              <span className={`font-mono-tabular text-xs ${b.you ? "text-white" : "text-foreground/70"}`}>
                {b.share}%
              </span>
            )}
            {hover === i && (
              <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-graphite text-white text-xs px-2.5 py-1.5 rounded-md font-mono-tabular shadow-lg z-10">
                {b.name} · {b.share}%
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        {items.map((b) => (
          <div key={b.name} className="flex items-center gap-2 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
            <span className={b.you ? "text-foreground font-medium" : ""}>{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

type Run = {
  query: string;
  mentioned: boolean;
  position: number | null;
  sentiment: number;
  sources: number;
  model: string;
};

function RunsTable({ runs }: { runs: Run[] }) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto -mx-5 px-5">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left font-mono-tabular text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
            <th className="pb-2 pr-4 font-normal">{t("dash.col.query")}</th>
            <th className="pb-2 pr-4 font-normal">{t("dash.col.model")}</th>
            <th className="pb-2 pr-4 font-normal">{t("dash.col.mentioned")}</th>
            <th className="pb-2 pr-4 font-normal">{t("dash.col.pos")}</th>
            <th className="pb-2 pr-4 font-normal">{t("dash.col.sentiment")}</th>
            <th className="pb-2 font-normal">{t("dash.col.src")}</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-muted/50">
              <td className="py-3 pr-4 max-w-[280px] truncate">{r.query}</td>
              <td className="py-3 pr-4 font-mono-tabular text-xs text-muted-foreground">{r.model}</td>
              <td className="py-3 pr-4">
                {r.mentioned ? (
                  <span className="inline-flex items-center gap-1.5 text-positive font-mono-tabular text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-positive" />
                    {t("dash.yes")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground font-mono-tabular text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                    {t("dash.no")}
                  </span>
                )}
              </td>
              <td className="py-3 pr-4 font-mono-tabular">{r.position ? `#${r.position}` : "—"}</td>
              <td className="py-3 pr-4 font-mono-tabular">
                {r.mentioned ? (
                  <span
                    className={
                      r.sentiment > 0.5 ? "text-positive" : r.sentiment > 0.2 ? "text-foreground" : "text-negative"
                    }
                  >
                    {r.sentiment > 0 ? "+" : ""}
                    {r.sentiment.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="py-3 font-mono-tabular text-muted-foreground">{r.sources || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TREND = [12, 14, 13, 16, 15, 18, 22, 20, 24, 26, 25, 28, 30, 27, 31, 34, 33, 36, 40, 38, 42, 45, 43, 48, 52, 50, 55, 58, 61, 64];

function Trend() {
  const { t } = useI18n();
  const max = Math.max(...TREND);
  const min = Math.min(...TREND);
  const w = 300;
  const h = 120;
  const step = w / (TREND.length - 1);
  const points = TREND.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${h} ${points} ${w},${h}`;
  const last = TREND[TREND.length - 1];
  const first = TREND[0];
  const delta = (((last - first) / first) * 100).toFixed(0);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="font-mono-tabular text-3xl">{last}</div>
          <div className="text-xs text-muted-foreground">{t("dash.mentionsToday")}</div>
        </div>
        <div className="font-mono-tabular text-sm text-positive">+{delta}%</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-24">
        <defs>
          <linearGradient id="tgrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--indigo)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--indigo)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#tgrad)" />
        <polyline points={points} fill="none" stroke="var(--indigo)" strokeWidth="1.75" />
      </svg>
      <div className="flex justify-between text-[10px] font-mono-tabular text-muted-foreground mt-1">
        <span>{t("dash.30dAgo")}</span>
        <span>{t("dash.today")}</span>
      </div>
    </div>
  );
}

function SourceGap({ items }: { items: { domain: string; citations: number; note: string }[] }) {
  const { t } = useI18n();
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((s) => (
        <div
          key={s.domain}
          className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
        >
          <div>
            <div className="font-mono-tabular text-sm">{s.domain}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.note}</div>
          </div>
          <div className="text-right">
            <div className="font-mono-tabular text-lg">{s.citations}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t("dash.citations")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
