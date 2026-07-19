import React from 'react';
import { Settings, BarChart2, MessageSquare, Database, Briefcase } from 'lucide-react';

const IntegrationLogos: Record<string, string> = {
  slack: '/slack.webp',
  telegram: '/Telegram_Messenger.png',
};

const IntegrationFallbacks: Record<string, any> = {
  slack: MessageSquare,
  telegram: MessageSquare,
  'google-search-console': BarChart2,
  'jira-software': Briefcase,
  'hubspot-crm': Database,
};

interface IntegrationIconProps {
  integration: string;
  size?: number;
  className?: string;
}

export function IntegrationIcon({ integration, size = 24, className = '' }: IntegrationIconProps) {
  const normalizedKey = integration.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const logoPath = IntegrationLogos[normalizedKey];

  if (logoPath) {
    return (
      <img 
        src={logoPath} 
        alt={`${integration} logo`} 
        width={size} 
        height={size} 
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback to lucide icon if logo doesn't exist
  const FallbackIcon = IntegrationFallbacks[normalizedKey] || Settings;
  
  return (
    <div 
      className={`bg-surface border border-border flex items-center justify-center rounded-md ${className}`}
      style={{ width: size, height: size }}
    >
      <FallbackIcon size={Math.round(size * 0.6)} className="text-content-secondary" />
    </div>
  );
}
