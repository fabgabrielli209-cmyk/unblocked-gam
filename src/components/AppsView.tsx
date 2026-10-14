import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid, ExternalLink, Sparkles } from 'lucide-react';
import { AppItem, UserSettings, ThemeItem } from '../types';
import { ALL_APPS } from '../data';
import { GAM3_FAVICON_SVG } from './Gam3Logo';

interface AppsViewProps {
  onSelectApp: (app: AppItem) => void;
  settings: UserSettings;
  themeConfig?: ThemeItem;
}

export const AppsView: React.FC<AppsViewProps> = ({
  onSelectApp,
  settings,
  themeConfig,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ALL_APPS;
    return ALL_APPS.filter(a =>
      a.appName.toLowerCase().includes(q) ||
      (a.desc && a.desc.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="text-emerald-400 w-6 h-6" />
            <h1 className="text-xl sm:text-2xl font-bold font-cyber text-white">
              Web Apps & Tools
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Access {ALL_APPS.length} popular web apps, social hubs, and productivity tools
          </p>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 shadow-sm w-full sm:w-72"
          style={{ backgroundColor: themeConfig?.value?.settingsSearchBar || '#18283e' }}
        >
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${ALL_APPS.length} apps...`}
            className="bg-transparent text-sm text-white placeholder:text-gray-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Grid of Apps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filteredApps.map((app) => (
          <div
            key={app.appName}
            onClick={() => onSelectApp(app)}
            className="group relative rounded-2xl p-4 border border-white/5 hover:border-emerald-500/50 bg-white/[0.03] hover:bg-white/[0.08] transition transform hover:-translate-y-1 cursor-pointer flex flex-col shadow-sm"
          >
            <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-black/30 p-2 flex items-center justify-center">
              <img
                src={app.icon}
                alt={app.appName}
                className="w-16 h-16 object-contain transition duration-300 group-hover:scale-110"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = GAM3_FAVICON_SVG;
                }}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-emerald-400">
                <ExternalLink size={14} />
              </div>
            </div>

            <h3 className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition">
              {app.appName}
            </h3>
            <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-snug">
              {app.desc}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-cyber text-emerald-400 mt-2 opacity-80 group-hover:opacity-100">
              <Sparkles size={11} className="text-emerald-400" />
              <span>Proxy Launch</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
