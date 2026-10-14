import React, { useState, useMemo } from 'react';
import { Search, Plus, ExternalLink, Gamepad2, Tv2, Star, Sparkles, X, Globe } from 'lucide-react';
import { GameItem, AppItem, UserSettings, ThemeItem, QuickShortcut } from '../types';
import { ALL_GAMES, ALL_APPS } from '../data';
import { Gam3Logo, GAM3_FAVICON_SVG } from './Gam3Logo';

interface HomeViewProps {
  onSelectGame: (game: GameItem) => void;
  onSelectApp: (app: AppItem) => void;
  onNavigate: (view: 'home' | 'games' | 'apps' | 'settings' | 'arcade' | 'proxy') => void;
  settings: UserSettings;
  themeConfig?: ThemeItem;
  onOpenAboutBlank: () => void;
  onOpenBookmarks: () => void;
  onOpenProxy: (url?: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectGame,
  onSelectApp,
  onNavigate,
  settings,
  themeConfig,
  onOpenAboutBlank,
  onOpenBookmarks,
  onOpenProxy,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shortcuts, setShortcuts] = useState<QuickShortcut[]>(() => {
    const saved = localStorage.getItem('gam3_shortcuts');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return [
      { name: 'Google', icon: 'https://www.google.com/favicon.ico', link: 'https://google.com' },
      { name: 'Desmos', icon: 'https://www.desmos.com/favicon.ico', link: 'https://www.desmos.com/calculator' },
      { name: 'Discord', icon: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png', link: 'https://discord.gg/ZBef7HnAeg' },
      { name: 'GitHub', icon: 'https://github.githubassets.com/favicons/favicon.svg', link: 'https://github.com' },
    ];
  });

  const [isAddShortcutOpen, setIsAddShortcutOpen] = useState(false);
  const [newShortcutName, setNewShortcutName] = useState('');
  const [newShortcutUrl, setNewShortcutUrl] = useState('');

  // Search filtering for Omnibar autocomplete
  const searchResults = useMemo<{ games: GameItem[]; apps: AppItem[] }>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { games: [], apps: [] };

    const matchedGames = ALL_GAMES.filter(g =>
      g.appName.toLowerCase().includes(q) || g.desc.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedApps = ALL_APPS.filter(a =>
      a.appName.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)
    ).slice(0, 3);

    return { games: matchedGames, apps: matchedApps };
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    // Check if it exactly matches a game
    const exactGame = ALL_GAMES.find(g => g.appName.toLowerCase() === q.toLowerCase());
    if (exactGame) {
      onSelectGame(exactGame);
      return;
    }

    // Launch in in-app proxy browser!
    onOpenProxy(q);
  };

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShortcutName || !newShortcutUrl) return;

    let validUrl = newShortcutUrl.trim();
    if (!validUrl.startsWith('http')) validUrl = `https://${validUrl}`;

    let iconUrl = '';
    try {
      const parsed = new URL(validUrl);
      iconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
    } catch {
      iconUrl = 'https://www.google.com/favicon.ico';
    }

    const updated = [...shortcuts, { name: newShortcutName, icon: iconUrl, link: validUrl }];
    setShortcuts(updated);
    localStorage.setItem('gam3_shortcuts', JSON.stringify(updated));
    setNewShortcutName('');
    setNewShortcutUrl('');
    setIsAddShortcutOpen(false);
  };

  const removeShortcut = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = shortcuts.filter((_, i) => i !== idx);
    setShortcuts(updated);
    localStorage.setItem('gam3_shortcuts', JSON.stringify(updated));
  };

  // Popular showcase games
  const popularGames = useMemo(() => {
    return ALL_GAMES.filter(g =>
      ['BasketBros.io', 'Retro Bowl', '1v1.lol', 'Slope Ball', 'Cookie Clicker', 'Geometry Dash', 'Crossy Road', 'Chrome Dino'].includes(g.appName)
    ).slice(0, 8);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 sm:py-14 w-full max-w-5xl mx-auto">
      {/* Hero Logo */}
      <div className="flex flex-col items-center mb-8 text-center select-none" onClick={() => onNavigate('arcade')}>
        <Gam3Logo size="lg" showSubtitle={true} />
      </div>

      {/* Omnibar Search Box */}
      <div className="relative w-full max-w-2xl mb-8 z-30">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all shadow-xl backdrop-blur-md"
            style={{
              backgroundColor: themeConfig?.value?.settingsSearchBar || '#18283e',
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 600+ games, apps, or type a URL..."
              className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-gray-400 outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white transition active:scale-95"
            >
              Launch
            </button>
          </div>
        </form>

        {/* Autocomplete Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-white/10 p-2 shadow-2xl z-50 backdrop-blur-xl divide-y divide-white/5"
            style={{ backgroundColor: themeConfig?.value?.settingsDropdownColor || '#162337' }}
          >
            {/* Matching Games */}
            {searchResults.games.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[11px] font-cyber font-semibold text-sky-400 tracking-wider">
                  GAMES ({searchResults.games.length})
                </div>
                {searchResults.games.map((g) => (
                  <div
                    key={g.appName}
                    onClick={() => {
                      onSelectGame(g);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition"
                  >
                    <img
                      src={g.icon}
                      alt={g.appName}
                      className="w-8 h-8 rounded-lg object-cover bg-black/40"
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{g.appName}</div>
                      <div className="text-[11px] text-gray-400 truncate">{g.desc} • {g.category}</div>
                    </div>
                    <span className="text-xs text-sky-400 font-cyber">Play →</span>
                  </div>
                ))}
              </div>
            )}

            {/* Matching Apps */}
            {searchResults.apps.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[11px] font-cyber font-semibold text-emerald-400 tracking-wider">
                  APPS ({searchResults.apps.length})
                </div>
                {searchResults.apps.map((a) => (
                  <div
                    key={a.appName}
                    onClick={() => {
                      onSelectApp(a);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 cursor-pointer transition"
                  >
                    <img
                      src={a.icon}
                      alt={a.appName}
                      className="w-8 h-8 rounded-lg object-cover bg-black/40"
                      onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{a.appName}</div>
                      <div className="text-[11px] text-gray-400 truncate">{a.desc}</div>
                    </div>
                    <span className="text-xs text-emerald-400 font-cyber">Open →</span>
                  </div>
                ))}
              </div>
            )}

            {searchResults.games.length === 0 && searchResults.apps.length === 0 && (
              <div className="px-4 py-3 text-xs text-gray-400 text-center">
                Press Enter to search the web for "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Shortcuts Bar */}
      <div className="w-full max-w-2xl flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-10">
        {shortcuts.map((sc, idx) => (
          <div
            key={idx}
            onClick={() => onOpenProxy(sc.link)}
            className="group relative flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition transform hover:-translate-y-0.5 cursor-pointer shadow-sm select-none"
          >
            <img
              src={sc.icon}
              alt={sc.name}
              className="w-5 h-5 rounded object-contain"
              onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
            />
            <span className="text-xs sm:text-sm font-medium text-gray-200">{sc.name}</span>
            <button
              onClick={(e) => removeShortcut(idx, e)}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition p-0.5"
              title="Remove shortcut"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Add Shortcut Button */}
        <button
          onClick={() => setIsAddShortcutOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-white/40 text-gray-400 hover:text-white transition text-xs sm:text-sm"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Featured Retro Arcade Banner */}
      <div
        onClick={() => onNavigate('arcade')}
        className="w-full rounded-2xl p-5 mb-10 border border-sky-500/30 bg-gradient-to-r from-sky-950/60 via-[#111827] to-purple-950/40 hover:border-sky-400/60 transition cursor-pointer group shadow-xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 group-hover:scale-110 transition">
              <Tv2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-arcade text-sky-400 text-xs sm:text-sm tracking-wider">
                  RETRO ARCADE ENVIRONMENT
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-cyber bg-pink-500/20 text-pink-400 border border-pink-500/30">
                  NEW
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Authentic CRT scanlines, 8-bit sound synthesis, Cyber Snake, Neon Breakout & Space 1984.
              </p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-cyber text-xs sm:text-sm font-bold shadow-lg transition active:scale-95 shrink-0">
            Launch Arcade →
          </button>
        </div>
      </div>

      {/* Popular Games Showcase */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-cyber">Trending Games</h2>
          </div>
          <button
            onClick={() => onNavigate('games')}
            className="text-xs text-sky-400 hover:text-sky-300 font-cyber transition"
          >
            View All 600+ Games →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {popularGames.map((game) => (
            <div
              key={game.appName}
              onClick={() => onSelectGame(game)}
              className="group relative rounded-2xl p-3 border border-white/5 hover:border-sky-500/40 bg-white/[0.03] hover:bg-white/[0.07] transition transform hover:-translate-y-1 cursor-pointer flex flex-col shadow-md overflow-hidden"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2.5 bg-black/40">
                <img
                  src={game.icon}
                  alt={game.appName}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback avatar
                    (e.currentTarget as HTMLImageElement).src = GAM3_FAVICON_SVG;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                  <span className="text-[11px] font-cyber text-sky-300 font-bold">PLAY NOW ▶</span>
                </div>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-sky-400 transition">
                {game.appName}
              </h3>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">{game.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Shortcut Modal */}
      {isAddShortcutOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-md rounded-2xl p-5 border border-white/10 shadow-2xl"
            style={{ backgroundColor: themeConfig?.value?.settingsDropdownColor || '#162337' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white font-cyber">Add Quick Shortcut</h3>
              <button onClick={() => setIsAddShortcutOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddShortcut} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Shortcut Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. YouTube"
                  value={newShortcutName}
                  onChange={(e) => setNewShortcutName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">URL</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. youtube.com"
                  value={newShortcutUrl}
                  onChange={(e) => setNewShortcutUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddShortcutOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow"
                >
                  Save Shortcut
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
