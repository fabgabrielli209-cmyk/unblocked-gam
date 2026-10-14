import React, { useState, useMemo } from 'react';
import { Search, Star, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Gamepad2 } from 'lucide-react';
import { GameItem, UserSettings, ThemeItem } from '../types';
import { ALL_GAMES, CATEGORIES, CategoryType } from '../data';
import { GAM3_FAVICON_SVG } from './Gam3Logo';

interface GamesViewProps {
  onSelectGame: (game: GameItem) => void;
  settings: UserSettings;
  themeConfig?: ThemeItem;
  favorites: string[];
  onToggleFavorite: (gameName: string) => void;
}

export const GamesView: React.FC<GamesViewProps> = ({
  onSelectGame,
  settings,
  themeConfig,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'alpha' | 'cat' | 'fav'>('alpha');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = settings.itemsPerPage || 30;

  // Filtered and sorted games
  const filteredGames = useMemo(() => {
    let list = ALL_GAMES;

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(g => g.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(g =>
        g.appName.toLowerCase().includes(q) ||
        g.desc.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
      );
    }

    // Sort
    return [...list].sort((a, b) => {
      if (sortBy === 'fav') {
        const aFav = favorites.includes(a.appName);
        const bFav = favorites.includes(b.appName);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
      }
      if (sortBy === 'cat') {
        return a.category.localeCompare(b.category) || a.appName.localeCompare(b.appName);
      }
      return a.appName.localeCompare(b.appName);
    });
  }, [selectedCategory, searchQuery, sortBy, favorites]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredGames.length / itemsPerPage));
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredGames.slice(start, start + itemsPerPage);
  }, [filteredGames, currentPage, itemsPerPage]);

  const handleCategorySelect = (cat: CategoryType) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-4 py-6 sm:py-8">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-sky-400 w-6 h-6" />
            <h1 className="text-xl sm:text-2xl font-bold font-cyber text-white">
              Game Library
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Showing {filteredGames.length} of {ALL_GAMES.length} unblocked games
          </p>
        </div>

        {/* Search Bar & Sort */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/10 shadow-sm w-full sm:w-72"
            style={{ backgroundColor: themeConfig?.value?.settingsSearchBar || '#18283e' }}
          >
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={`Search ${ALL_GAMES.length} games...`}
              className="bg-transparent text-sm text-white placeholder:text-gray-400 outline-none w-full"
            />
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-white/10 text-xs sm:text-sm text-gray-200 outline-none cursor-pointer"
            style={{ backgroundColor: themeConfig?.value?.settingsDropdownColor || '#162337' }}
          >
            <option value="alpha">A-Z</option>
            <option value="cat">Category</option>
            <option value="fav">Favorites</option>
          </select>
        </div>
      </div>

      {/* Categories Tabs Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none no-scrollbar select-none">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-cyber tracking-wider whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Games Grid */}
      {paginatedGames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {paginatedGames.map((game) => {
            const isFav = favorites.includes(game.appName);

            return (
              <div
                key={game.appName}
                onClick={() => onSelectGame(game)}
                className="group relative rounded-2xl p-3 border border-white/5 hover:border-sky-500/50 bg-white/[0.03] hover:bg-white/[0.08] transition transform hover:-translate-y-1 cursor-pointer flex flex-col shadow-sm overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-black/40">
                  <img
                    src={game.icon}
                    alt={game.appName}
                    loading="lazy"
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = GAM3_FAVICON_SVG;
                    }}
                  />

                  {/* Favorite star toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(game.appName);
                    }}
                    title={isFav ? 'Remove favorite' : 'Add to favorites'}
                    className={`absolute top-1.5 right-1.5 p-1 rounded-full transition backdrop-blur-md ${
                      isFav
                        ? 'bg-amber-500/80 text-white'
                        : 'bg-black/40 text-gray-400 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <Star size={12} fill={isFav ? 'currentColor' : 'none'} />
                  </button>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2 pointer-events-none">
                    <span className="text-[10px] font-cyber text-sky-400 font-bold">PLAY ▶</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-sky-400 transition">
                    {game.appName}
                  </h3>
                  {typeof game.url === 'string' && game.url.startsWith('local:') && (
                    <span className="shrink-0 px-1.5 py-0.2 rounded text-[9px] font-cyber bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Local
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-0.5">
                  <span className="truncate">{game.desc || game.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Gamepad2 size={48} className="text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-gray-300 font-cyber">No games found</h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            Try searching for another term or selecting "All" categories.
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-auto py-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-1 font-cyber text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40">
              {currentPage}
            </span>
            <span className="text-gray-500">/</span>
            <span className="text-gray-400">{totalPages}</span>
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-gray-300"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
