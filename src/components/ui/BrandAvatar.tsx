import React from 'react';

interface BrandAvatarProps {
  project: {
    name: string;
    logo_url?: string;
    color?: string;
    [key: string]: any;
  };
  size?: number;
  className?: string;
}

export function BrandAvatar({ project, size = 32, className = '' }: BrandAvatarProps) {
  const fontSize = size * 0.4;
  
  if (project.logo_url) {
    return (
      <img 
        src={project.logo_url} 
        alt={project.name}
        className={`rounded-full object-cover border-[0.5px] border-border shadow-sm shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const initials = project.name ? project.name.substring(0, 2).toUpperCase() : 'B';
  // Use color or default to something based on name if no color provided
  const hash = project.name ? project.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const hue = hash % 360;
  const bgColor = project.color || `hsl(${hue}, 70%, 50%)`;

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold text-white shadow-sm border-[0.5px] border-border/50 uppercase shrink-0 ${className}`}
      style={{ width: size, height: size, backgroundColor: bgColor, fontSize }}
    >
      {initials}
    </div>
  );
}
