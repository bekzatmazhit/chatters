import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react';

interface SparklineData {
  value: number;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    label?: string; // e.g. "%" or "vs last month"
    direction?: 'up' | 'down' | 'neutral'; // If not provided, inferred from value > 0
  };
  sparklineData?: SparklineData[];
  className?: string;
}

export function MetricCard({ label, value, trend, sparklineData, className }: MetricCardProps) {
  // Infer trend direction if not explicitly provided
  const direction = trend?.direction || (trend ? (trend.value > 0 ? 'up' : trend.value < 0 ? 'down' : 'neutral') : 'neutral');
  
  const isPositive = direction === 'up';
  const isNegative = direction === 'down';
  
  // Badge variant
  const badgeVariant = isPositive ? 'success' : isNegative ? 'danger' : 'neutral';
  const TrendIcon = isPositive ? IconTrendingUp : isNegative ? IconTrendingDown : IconMinus;

  // Simple SVG Sparkline generation
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;
    
    const min = Math.min(...sparklineData.map(d => d.value));
    const max = Math.max(...sparklineData.map(d => d.value));
    const range = max - min || 1;
    
    const width = 100;
    const height = 30;
    
    const points = sparklineData.map((d, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const y = height - ((d.value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    const strokeColor = isPositive ? 'var(--color-success)' : isNegative ? 'var(--color-danger)' : 'var(--color-text-muted)';
    const fillGradientId = `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="mt-4 h-[30px] w-full relative">
        <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={points}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="vector-non-scaling-stroke"
          />
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill={`url(#${fillGradientId})`}
            className="opacity-50"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className={cn("panel p-5 flex flex-col relative overflow-hidden", className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1 z-10">
          <span className="text-[13px] font-normal normal-case text-content-secondary leading-none">
            {label}
          </span>
          <span className="text-[28px] md:text-[32px] font-medium text-content-primary leading-tight tabular-nums mt-1">
            {value}
          </span>
        </div>
        
        {trend && (
          <Badge variant={badgeVariant} className="flex items-center gap-1 z-10">
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(trend.value)}{trend.label || '%'}</span>
          </Badge>
        )}
      </div>
      
      {renderSparkline()}
    </div>
  );
}
