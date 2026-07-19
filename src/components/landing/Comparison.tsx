import { X, Check } from "lucide-react";

const ROWS = [
  {
    feature: " Z U  Q! U! Q  V ChatGPT / Claude / Gemini",
    us: true,
    sem: false,
    brand: false,
  },
  {
    feature: " _ U пїЅ Q!  Q!  пїЅ! пїЅ  пїЅ пїЅ    U!  пїЅ! пїЅ!&  пїЅ пїЅ",
    us: true,
    sem: false,
    brand: false,
  },
  {
    feature: " R  пїЅ пїЅ Q пїЅ  T U  T!S! пїЅ ! U    AI- !9 пїЅ пїЅ!! пїЅ",
    us: true,
    sem: false,
    brand: true,
  },
  {
    feature: " ^ U  пїЅ пїЅ!
  U!!!
 !S W U X Q  пїЅ  Q ",
    us: true,
    sem: false,
    brand: false,
  },
  {
    feature: "AIO-! пїЅ T U X пїЅ  пїЅ пїЅ!  Q Q  пїЅ пїЅ! ! U!! пїЅ",
    us: true,
    sem: false,
    brand: false,
  },
  {
    feature: "API  пїЅ U!!!S W  T  пїЅ пїЅ  !9 X",
    us: true,
    sem: true,
    brand: false,
  },
];

export function Comparison() {
  return (
    <section className="bg-bg border-t border-surface-border">
      <div className="max-w-5xl mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-2xl mb-14">
          <div className="text-xs font-mono-tabular text-content-muted uppercase tracking-wider mb-3">
            /03 пїЅ  ! пїЅ   пїЅ  Q пїЅ
          </div>
          <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-content-primary">
              пїЅ!! пїЅ X Chatters,{" "}
            <span className="text-content-secondary"> пїЅ   пїЅ  W! Q !9!! !9 пїЅ  Q !!!!S X пїЅ !!9?</span>
          </h2>
        </div>

        <div className="rounded-xl border border-surface-border overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 bg-panel border-b border-surface-border">
            <div className="px-5 py-3 text-[11px] font-mono-tabular text-content-muted uppercase tracking-wider">
               пїЅ!S  T!  Q!
            </div>
            <div className="px-4 py-3 text-center">
              <div className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-[12px] font-semibold text-content-primary">Chatters</span>
              </div>
            </div>
            <div className="px-4 py-3 text-center">
              <span className="text-[12px] font-medium text-content-muted">SEMrush / Ahrefs</span>
            </div>
            <div className="px-4 py-3 text-center">
              <span className="text-[12px] font-medium text-content-muted">Brand24</span>
            </div>
          </div>

          {/* Rows */}
          {ROWS.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-4 border-b border-surface-border last:border-0 hover:bg-panel/50 transition-colors ${
                i % 2 === 0 ? "" : "bg-surface/30"
              }`}
            >
              <div className="px-5 py-4 text-[13px] text-content-secondary">{row.feature}</div>
              <div className="px-4 py-4 flex justify-center items-center">
                <Check size={15} className="text-positive" strokeWidth={2.5} />
              </div>
              <div className="px-4 py-4 flex justify-center items-center">
                {row.sem ? (
                  <Check size={15} className="text-content-muted" strokeWidth={2.5} />
                ) : (
                  <X size={15} className="text-content-muted opacity-40" strokeWidth={2} />
                )}
              </div>
              <div className="px-4 py-4 flex justify-center items-center">
                {row.brand ? (
                  <Check size={15} className="text-content-muted" strokeWidth={2.5} />
                ) : (
                  <X size={15} className="text-content-muted opacity-40" strokeWidth={2} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


