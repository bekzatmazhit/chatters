import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const PRESETS = ['#7c3aed', '#2563eb', '#10b981', '#f59e0b', '#ec4899'];
const DEFAULT_COLOR = '#7c3aed';

export default function ColorPicker({ color, onChange }) {
  const [hex, setHex] = useState(color || DEFAULT_COLOR);

  useEffect(() => {
    setHex(color || DEFAULT_COLOR);
  }, [color]);

  const handleHexChange = (e) => {
    const val = e.target.value;
    setHex(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onChange(val);
    }
  };

  const applyColor = (c) => {
    setHex(c);
    onChange(c);
  };

  const resetColor = () => applyColor(DEFAULT_COLOR);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Hex Input & Swatch */}
        <div className="flex items-center gap-2 bg-surface border border-surface-border rounded-lg p-1 pr-3">
          <input 
            type="color" 
            value={hex}
            onChange={(e) => applyColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
          />
          <input 
            type="text" 
            value={hex}
            onChange={handleHexChange}
            className="w-20 bg-transparent text-[13px] font-mono text-content-primary outline-none uppercase"
            maxLength={7}
          />
        </div>

        {/* Presets */}
        <div className="flex gap-2 items-center">
          <div className="h-6 w-px bg-surface-border mx-2"></div>
          {PRESETS.map(preset => (
            <button
              key={preset}
              onClick={() => applyColor(preset)}
              className="w-6 h-6 rounded-full border border-surface-border shadow-sm hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-bg"
              style={{ backgroundColor: preset }}
            />
          ))}
          <button 

