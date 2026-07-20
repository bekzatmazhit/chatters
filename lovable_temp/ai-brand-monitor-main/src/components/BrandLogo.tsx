/**
 * BrandLogo — shows a company logo via Google Favicon API.
 * Falls back to a styled monogram if the favicon fails to load.
 *
 * Props:
 *   name     — brand/company name used for monogram + aria-label
 *   domain   — optional root domain (e.g. "mixpanel.com") for favicon fetch
 *   className — forwarded to the root element
 *   size     — pixel size passed to the img (default 16)
 */

import { useState } from "react";

type Props = {
  name: string;
  domain?: string;
  className?: string;
  size?: number;
};

// Derive a root domain from a full URL or hostname string
function rootDomain(raw: string): string {
  try {
    const url = raw.includes("://") ? raw : `https://${raw}`;
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return raw;
  }
}

// Pick a deterministic muted color from the brand name
const PALETTE = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];
function brandColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function Monogram({
  name,
  className,
  size,
}: {
  name: string;
  className?: string;
  size: number;
}) {
  const initials = name
    .split(/[\s\-_/]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const color = brandColor(name);
  const fontSize = Math.max(8, Math.round(size * 0.5));

  return (
    <span
      aria-label={name}
      className={`inline-flex items-center justify-center rounded-sm font-bold select-none shrink-0 ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: `${color}22`,
        border: `1px solid ${color}55`,
        color,
        fontSize,
        lineHeight: 1,
      }}
    >
      {initials}
    </span>
  );
}

export default function BrandLogo({ name, domain, className, size = 16 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!domain || failed) {
    return <Monogram name={name} className={className} size={size} />;
  }

  const host = rootDomain(domain);
  const src = `https://www.google.com/s2/favicons?sz=32&domain=${host}`;

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`rounded-sm object-contain shrink-0 ${className ?? ""}`}
      onError={() => setFailed(true)}
      style={{ width: size, height: size }}
    />
  );
}
