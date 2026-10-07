'use client';

import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface MayaAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  showGlow?: boolean;
  showStatus?: boolean;
  className?: string;
  imageSrc?: string;
}

export const MayaAvatar: React.FC<MayaAvatarProps> = ({
  size = 'md',
  showGlow = true,
  showStatus = false,
  className = '',
  imageSrc = '/brand/maya.png',
}) => {
  const sizeMap = {
    xs: { wrapper: 'w-7 h-7', ring: 'p-[1.5px]', dot: 'w-1.5 h-1.5' },
    sm: { wrapper: 'w-9 h-9', ring: 'p-[2px]', dot: 'w-2 h-2' },
    md: { wrapper: 'w-12 h-12', ring: 'p-[2px]', dot: 'w-2.5 h-2.5' },
    lg: { wrapper: 'w-20 h-20', ring: 'p-[3px]', dot: 'w-3 h-3' },
    hero: { wrapper: 'w-64 h-64 sm:w-72 sm:h-72', ring: 'p-[4px]', dot: 'w-4 h-4' },
  };

  const currentSize = sizeMap[size];

  if (size === 'hero') {
    return (
      <div className={`relative flex flex-col items-center justify-center ${className}`}>
        {/* Glow Aura - Fampal style deep colorful blur */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 via-violet-500/30 to-blue-500/30 rounded-full blur-[80px] animate-pulse pointer-events-none -z-10" style={{ animationDuration: '4s' }} />

        {/* Central Avatar Frame - Glassmorphic */}
        <div className={`relative ${currentSize.wrapper} rounded-[3rem] bg-white/20 p-2 shadow-[0_20px_50px_-10px_rgba(139,92,246,0.2)] backdrop-blur-2xl border border-white/50`}>
          <div className="h-full w-full rounded-[2.5rem] bg-gradient-to-b from-white via-amber-50/40 to-violet-50/60 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
            
            {/* Mascot Image */}
            <div className="relative z-10 flex flex-col items-center text-center mt-4">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center transform transition-transform duration-500 hover:scale-110 drop-shadow-2xl">
                <img
                  src={imageSrc}
                  alt="Maya — Acente Akıllı Asistanı"
                  className="w-full h-full object-contain [image-rendering:pixelated]"
                />
              </div>

              <div className="mt-4 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white shadow-sm inline-flex items-center gap-2">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight font-display">MAYA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Badge floating */}
        <div className="absolute -top-6 -right-6 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 transform rotate-12">
          <BrainCircuit className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-xs uppercase tracking-wider">Yapay Zekâ</span>
        </div>

        {/* Status Badge */}
        {showStatus && (
          <div className="absolute -bottom-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white shadow-xl border border-slate-100 text-xs font-bold text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>Portföyünüz İzleniyor</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${currentSize.wrapper} ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-[6px] pointer-events-none" />
      )}
      <div className={`relative ${currentSize.wrapper} rounded-full bg-gradient-to-tr from-amber-400 via-violet-500 to-blue-500 ${currentSize.ring} shadow-xs`}>
        <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden border border-white/60 p-0.5">
          <img
            src={imageSrc}
            alt="Maya"
            className="w-full h-full object-contain [image-rendering:pixelated]"
          />
        </div>
      </div>
      {showStatus && (
        <span className={`absolute bottom-0 right-0 ${currentSize.dot} rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20`} />
      )}
    </div>
  );
};

export default MayaAvatar;
