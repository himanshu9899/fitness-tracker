import React from 'react';
import { Flame, Dumbbell } from 'lucide-react';

const Logo = ({ size = 'md', showText = true, className = '' }) => {
  // Size classes map
  const containerSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const flameSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const dumbbellSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Badge Icon Container */}
      <div className={`relative ${containerSizes[size]} bg-gradient-to-tr from-cyan-500/25 via-purple-500/20 to-emerald-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/15 backdrop-blur-md group hover:border-cyan-400 transition-all duration-300`}>
        {/* Glow ambient circle */}
        <div className="absolute inset-0 bg-cyan-400/20 rounded-xl blur-sm group-hover:blur-md transition-all"></div>
        
        {/* Flame Icon with Dumbbell Badge Overlay */}
        <div className="relative flex items-center justify-center">
          <Flame className={`${flameSizes[size]} text-amber-400 animate-pulse`} />
          <Dumbbell className={`${dumbbellSizes[size]} text-cyan-300 absolute -bottom-1 -right-1.5 drop-shadow-md transform -rotate-12`} />
        </div>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 bg-clip-text text-transparent ${textSizes[size]}`}>
            AuraFit
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
