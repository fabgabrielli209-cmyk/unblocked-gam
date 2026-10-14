import React from 'react';

interface Gam3LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const GAM3_FAVICON_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="14" fill="#090d16"/>
  <rect x="2" y="2" width="60" height="60" rx="12" stroke="#38bdf8" stroke-width="2" stroke-opacity="0.6"/>
  <path d="M16 26C16 22.6863 18.6863 20 22 20H42C45.3137 20 48 22.6863 48 26V36C48 39.3137 45.3137 42 42 42H22C18.6863 42 16 39.3137 16 36V26Z" fill="#1e293b"/>
  <circle cx="25" cy="31" r="3" fill="#38bdf8"/>
  <circle cx="39" cy="28" r="2.5" fill="#f43f5e"/>
  <circle cx="43" cy="34" r="2.5" fill="#eab308"/>
  <text x="32" y="55" font-family="sans-serif" font-weight="900" font-size="12" fill="#38bdf8" text-anchor="middle">GAM-3</text>
</svg>
`)}`;

export const Gam3Logo: React.FC<Gam3LogoProps> = ({ size = 'md', showSubtitle = false }) => {
  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2 select-none group">
        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#38bdf8]/50 flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:border-[#38bdf8] transition">
          <span className="font-arcade text-[11px] text-[#38bdf8] font-bold tracking-tighter">G3</span>
        </div>
        <div className="flex flex-col">
          <span className="font-cyber font-black tracking-tight text-lg text-white leading-none">
            gam<span className="text-[#38bdf8]">-3</span>
          </span>
        </div>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className="flex flex-col items-center select-none group cursor-pointer">
        {/* Large Neon Arcade Emblem */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-sky-500/20 via-pink-500/20 to-purple-500/20 blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
          <div className="relative px-7 py-4 rounded-3xl bg-gradient-to-b from-[#1e293b] via-[#111827] to-[#090d16] border-2 border-sky-400/60 shadow-2xl flex items-center gap-4 group-hover:border-sky-400 transition transform group-hover:scale-105 duration-300">
            {/* Retro Pixel D-pad Icon */}
            <div className="w-12 h-12 rounded-2xl bg-black/50 border border-sky-500/40 flex items-center justify-center shadow-inner">
              <span className="font-arcade text-sky-400 text-sm font-bold">▲</span>
            </div>
            {/* Big Brand Text */}
            <div className="flex flex-col items-start">
              <span className="font-arcade text-2xl sm:text-3xl text-white tracking-widest font-black flex items-center gap-1">
                GAM<span className="text-sky-400">-3</span>
              </span>
              <span className="text-[10px] font-cyber text-pink-400 font-bold tracking-widest uppercase">
                Arcade & Game Portal
              </span>
            </div>
          </div>
        </div>

        {showSubtitle && (
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mt-1 text-center font-cyber">
            Explore over 600 unblocked titles, retro arcade emulation, and customizable cloaking.
          </p>
        )}
      </div>
    );
  }

  // Default 'md'
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] border border-[#38bdf8]/50 flex items-center justify-center shadow-lg shadow-sky-500/20">
        <span className="font-arcade text-xs text-[#38bdf8] font-bold">G3</span>
      </div>
      <span className="font-cyber font-black tracking-tight text-xl text-white">
        gam<span className="text-[#38bdf8]">-3</span>
      </span>
    </div>
  );
};
