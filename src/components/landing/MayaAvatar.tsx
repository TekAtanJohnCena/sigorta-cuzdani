'use client';

import React from 'react';

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
      wrapper: 'w-8 h-8',
      img: 'w-7 h-7',
      dot: 'w-2 h-2',
    },
    sm: {
      wrapper: 'w-10 h-10',
      img: 'w-9 h-9',
      dot: 'w-2.5 h-2.5',
    },
    md: {
      wrapper: 'w-12 h-12',
      img: 'w-11 h-11',
      dot: 'w-2.5 h-2.5',
    },
    lg: {
      wrapper: 'w-20 h-20',
      img: 'w-18 h-18',
      dot: 'w-3.5 h-3.5',
    },
    hero: {
      wrapper: 'w-72 h-72 sm:w-80 sm:h-80',
      img: 'w-64 h-64 sm:w-72 sm:h-72',
      dot: 'w-4 h-4',
    },
  };

  const currentSize = sizeMap[size];

  // Hero boyutu
  if (size === 'hero') {
    return (
      <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
        {showGlow && (
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 via-yellow-300/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
        )}

        <div className="relative z-10 flex flex-col items-center">
          <img
            src={imageSrc}
            alt="Maya — Acente Akıllı Asistanı"
            className="w-64 h-64 sm:w-72 sm:h-72 object-contain drop-shadow-[0_20px_35px_rgba(245,158,11,0.25)] transition-transform duration-500 hover:scale-105"
          />
          <div className="w-44 h-4 bg-slate-900/10 rounded-[100%] blur-sm -mt-2" />
        </div>

        {showStatus && (
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white shadow-md border border-slate-200/80 text-xs font-semibold text-slate-700">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-slate-900 font-bold">Maya Devrede</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-600 font-medium">Acente Asistanınız</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${currentSize.wrapper} ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-[4px] pointer-events-none" />
      )}

      <div className="relative w-full h-full rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 p-[1.5px] shadow-xs flex items-center justify-center overflow-hidden">
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-0.5">
          <img
            src={imageSrc}
            alt="Maya"
            className="w-full h-full object-contain"
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
