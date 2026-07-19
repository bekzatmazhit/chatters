import { useState } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, 
  ResponsiveContainer, Tooltip as RechartsTooltip, Cell, LabelList 
} from 'recharts';
import { Globe, Crosshair, BarChart3, Info } from 'lucide-react';
import { useBrands } from '../BrandContext';

export default function CombinedMarketView() {
  const { activeBrand } = useBrands();
  const brandName = activeBrand?.name || 'Наш Бренд';
  const [loading, setLoading] = useState(false);

  // Magic Quadrant Data (X: Vision / Sentiment, Y: Market Presence / SOV)
  const quadrantData = [
    { name: brandName, x: 75, y: 80, z: 120, type: 'brand' }, // Leader
    { name: activeBrand?.competitors?.[0] || 'Competitor A', x: 85, y: 40, z: 100, type: 'competitor' }, // Visionary
    { name: activeBrand?.competitors?.[1] || 'Competitor B', x: 30, y: 70, z: 80, type: 'competitor' }, // Challenger
    { name: activeBrand?.competitors?.[2] || 'Competitor C', x: 40, y: 30, z: 60, type: 'competitor' }, // Niche
    { name: 'Competitor D', x: 60, y: 65, z: 90, type: 'competitor' }, 
  ];

  // Heatmap Data (Brands vs LLMs)
  const llms = ['ChatGPT-4o', 'Claude 3.5', 'Gemini 1.5', 'Perplexity'];
  const heatmapData = quadrantData.map(brand => {
    // Generate pseudo-random percentages for heatmap
    const base = brand.type === 'brand' ? 25 : 15;
    return {
      name: brand.name,
      isBrand: brand.type === 'brand',
      scores: llms.map((llm, idx) => {
        const score = Math.min(100, Math.max(0, base + Math.floor(Math.random() * 40) - 10 + (brand.x / 4)));
        return score;
      })
    };
  });

  // Calculate Heatmap Color based on score (0-100)
  const getHeatmapColor = (score) => {
    if (score >= 40) return 'bg-positive text-white border-positive/80';
    if (score >= 25) return 'bg-positive/60 text-white border-positive/80';
    if (score >= 15) return 'bg-positive/30 text-positive border-positive/50';
    return 'bg-surface-border text-content-primary 
