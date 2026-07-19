const COMPANIES = [
  "Ozon", "Kaspersky", "HeadHunter", "   пїЅ пїЅ T!  Z пїЅ! T пїЅ!", " R  Q! U", " ^ Q !
 T U!!",
  "VK Business", "Wildberries", "Sber Cloud", " Z ^  Digital", "Lamoda", "2  пїЅ ",
];

export function Logos() {
  // Duplicate for seamless loop
  const items = [...COMPANIES, ...COMPANIES];

  return (
    <div className="border-t border-b border-surface-border bg-panel overflow-hidden py-5 relative">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-panel to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-panel to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-12 logos-ticker w-max">
        {items.map((name, i) => (
          <div
            key={i}
            className="flex items-center gap-2 shrink-0 text-content-muted font-medium text-[13px] tracking-tight select-none"
          >
            <span className="w-1 h-1 rounded-full bg-surface-border" />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}


