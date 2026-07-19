import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightColor?: string;
}

export function SpotlightCard({ 
  children, 
  className, 
  spotlightColor = "rgba(109, 95, 232, 0.15)", // Default accent glow
  ...props 
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || isFocused || prefersReducedMotion) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    if (prefersReducedMotion) return;
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    if (prefersReducedMotion) return;
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    if (prefersReducedMotion) return;
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    if (prefersReducedMotion) return;
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "panel relative overflow-hidden flex flex-col p-6 transition-colors border-border group",
        className
      )}
      {...props}
    >
      {/* The Glow */}
      {!prefersReducedMotion && (
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-card opacity-0 transition-opacity duration-300 z-0"
          animate={{ opacity }}
          style={{
            background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 40%)`,
          }}
        />
      )}
      
      {/* Content wrapper to ensure z-index above glow */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
}
