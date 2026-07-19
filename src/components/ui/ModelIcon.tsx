import React from 'react';
import { cn } from '@/lib/utils';

export const ModelLogos: Record<string, string> = {
  chatgpt: '/chatgpt.png',
  claude: '/claude.png',
  gemini: '/gemini.png',
  perplexity: '/perplexity.png',
};

type ModelIconProps = {
  model: string;
  size?: number;
  className?: string;
};

export function ModelIcon({ model, size = 20, className }: ModelIconProps) {
  const normalizeModelName = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('gpt')) return 'chatgpt';
    if (lowerName.includes('claude')) return 'claude';
    if (lowerName.includes('gemini')) return 'gemini';
    if (lowerName.includes('perplexity')) return 'perplexity';
    return lowerName;
  };

  const normalized = normalizeModelName(model);
  const logoUrl = ModelLogos[normalized];

  if (!logoUrl) {
    // Fallback: neutral gray circle with the first letter
    const firstLetter = model ? model.charAt(0).toUpperCase() : '?';
    console.warn(`TODO: добавить логотип ${model}, файл не найден в /public`);
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-surface-hover text-content-primary font-medium',
          className
        )}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.5) }}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${model} logo`}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
      style={{ width: size, height: size }}
    />
  );
}
