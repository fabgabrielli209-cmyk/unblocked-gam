import React from 'react';
import { LayoutGrid, Gamepad2, Settings, ShieldAlert, Sparkles, Tv2, Globe } from 'lucide-react';
import { UserSettings, ThemeItem } from '../types';
import { Gam3Logo } from './Gam3Logo';

interface NavbarProps {
  currentView: 'home' | 'games' | 'apps' | 'settings' | 'arcade' | 'player' | 'proxy';
  onNavigate: (view: 'home' | 'games' | 'apps' | 'settings' | 'arcade' | 'proxy') => void;
  settings: UserSettings;
  themeConfig?: ThemeItem;
  onPanicTrigger: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  settings,
  themeConfig,
  onPanicTrigger,
}) => {
  const activeColor = themeConfig?.value?.navItemActive || '#c1d4f1';
  const scale = settings.navScale || 1.0;

  const navItems = [
    { id: 'proxy', label: 'Proxy', icon: Globe, view: 'proxy' as const },
    { id: 'apps', label: 'Apps', icon: LayoutGrid, view: 'apps' as const },
    { id: 'games', label: 'Games', icon: Gamepad2, view: 'games' as const },
    { id: 'arcade', label: 'Retro Arcade', icon: Tv2, view: 'arcade' as const },
    { id: 'settings', label: 'Settings', icon: Settings, view: 'settings' as const },
  ];

  return (
    <nav
      className="w-full flex items-center justify-between px-4 sm:px-8 border-b border-white/5 transition-all z-40 select-none backdrop-blur-md sticky top-0"
      style={{
        height: `${Math.round(68 * scale)}px`,
        backgroundColor: themeConfig?.value?.barColor || '#09121e',
      }}
    >
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 transition transform hover:scale-105 active:scale-95 group focus:outline-none"
          title="Return to Home"
        >
          <Gam3Logo size="sm" />
        </button>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center gap-1 sm:gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'font-semibold shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
              style={{
                color: isActive ? activeColor : undefined,
                boxShadow: isActive ? `inset 0 -2px 0 0 ${activeColor}` : undefined,
                fontSize: `${Math.round(14 * scale)}px`,
              }}
            >
              <Icon size={Math.round(16 * scale)} color={isActive ? activeColor : undefined} />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Emergency Panic Button */}
        <button
          onClick={onPanicTrigger}
          title={`Panic Key (${settings.panicKey}) - Redirect immediately`}
          className="flex items-center gap-1 ml-2 px-2.5 py-1 text-xs rounded-md bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition active:scale-90"
        >
          <ShieldAlert size={14} className="text-red-400" />
          <span className="hidden md:inline font-mono text-[11px]">PANIC</span>
        </button>
      </div>
    </nav>
  );
};
