'use client';

import React from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';

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
    xs: {
      wrapper: 'w-7 h-7',
      inner: 'w-6 h-6',
      icon: 'w-3.5 h-3.5',
      ring: 'p-[1.5px]',
      dot: 'w-1.5 h-1.5',
    },
    sm: {
      wrapper: 'w-9 h-9',
      inner: 'w-8 h-8',
      icon: 'w-4 h-4',
      ring: 'p-[2px]',
      dot: 'w-2 h-2',
    },
    md: {
      wrapper: 'w-12 h-12',
      inner: 'w-[42px] h-[42px]',
      icon: 'w-5 h-5',
      ring: 'p-[2px]',
      dot: 'w-2.5 h-2.5',
    },
    lg: {
      wrapper: 'w-20 h-20',
      inner: 'w-[72px] h-[72px]',
      icon: 'w-8 h-8',
      ring: 'p-[3px]',
      dot: 'w-3 h-3',
    },
    hero: {
      wrapper: 'w-64 h-64 sm:w-72 sm:h-72',
      inner: 'w-[244px] h-[244px] sm:w-[272px] sm:h-[272px]',
      icon: 'w-20 h-20',
      ring: 'p-[4px]',
      dot: 'w-4 h-4',
    },
  };

  const currentSize = sizeMap[size];

  if (size === 'hero') {
    return (
      <div className={`relative flex flex-col items-center justify-center ${className}`}>
        {/* Glow Aura */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-violet-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse pointer-events-none -z-10" />

        {/* Ana Dairesel Avatar Taşıyıcı */}
        <div className={`relative ${currentSize.wrapper} rounded-full bg-gradient-to-tr from-amber-400 via-violet-500 to-blue-500 ${currentSize.ring} shadow-[0_15px_40px_-10px_rgba(139,92,246,0.35)] animate-pulse`}>
          <div className="h-full w-full rounded-full bg-gradient-to-b from-white via-amber-50/40 to-violet-50/60 flex flex-col items-center justify-center relative overflow-hidden border border-white/80 backdrop-blur-xl p-4">
            
            {/* Maya Maskot Görseli */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center rounded-2xl bg-white/70 shadow-sm border border-amber-200/50 p-2 transform transition-transform duration-500 hover:scale-105">
                <img
                  src={imageSrc}
                  alt="Maya — Acente Akıllı Asistanı"
                  className="w-full h-full object-contain [image-rendering:pixelated]"
                />
                
                {/* Minik AI rozeti */}
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-white shadow-md border border-violet-100 flex items-center gap-1 text-[11px] font-bold text-violet-700">
                  <BrainCircuit className="w-3 h-3 text-violet-600" />
                  <span>AI</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-display flex items-center justify-center gap-1.5">
                  <span>MAYA</span>
                  <span className="text-amber-500 text-sm">🐝</span>
                </div>
                <div className="text-xs font-semibold text-violet-700 tracking-wide">
                  Akıllı Acente Asistanı
                </div>
              </div>
            </div>

            {/* İç halka */}
            <div className="absolute inset-0 rounded-full border border-amber-400/20 pointer-events-none" />
          </div>
        </div>

        {/* Canlı Durum Rozeti */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-md border border-slate-200/80 text-xs font-medium text-slate-700">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-900">Çevrimiçi</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600">Portföyünüzü İzliyor</span>
        </div>
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
