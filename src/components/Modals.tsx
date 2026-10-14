import React, { useState } from 'react';
import { X, Star, ExternalLink, Trash2, Check, Copy, Disc as DiscordIcon, ShieldCheck } from 'lucide-react';
import { GameItem, ThemeItem } from '../types';
import { ALL_GAMES } from '../data';
import { GAM3_FAVICON_SVG } from './Gam3Logo';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: string[];
  onSelectGame: (game: GameItem) => void;
  onRemoveFavorite: (gameName: string) => void;
  themeConfig?: ThemeItem;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  favorites,
  onSelectGame,
  onRemoveFavorite,
  themeConfig,
}) => {
  if (!isOpen) return null;

  const favoriteGames = ALL_GAMES.filter(g => favorites.includes(g.appName));

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col max-h-[85vh]"
        style={{ backgroundColor: themeConfig?.value?.settingsDropdownColor || '#162337' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Star className="text-amber-400 w-5 h-5 fill-amber-400" />
            <h3 className="text-base font-bold text-white font-cyber">
              Bookmarked Games ({favoriteGames.length})
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {favoriteGames.length > 0 ? (
            favoriteGames.map((game) => (
              <div
                key={game.appName}
                onClick={() => {
                  onSelectGame(game);
                  onClose();
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition cursor-pointer group"
              >
                <img
                  src={game.icon}
                  alt={game.appName}
                  className="w-10 h-10 rounded-lg object-cover bg-black/40"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = GAM3_FAVICON_SVG;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate group-hover:text-sky-400 transition">
                    {game.appName}
                  </div>
                  <div className="text-[11px] text-gray-400 truncate">{game.category}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(game.appName);
                  }}
                  title="Remove from bookmarks"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
              <Star size={36} className="text-gray-600 mb-2" />
              <p className="text-sm font-cyber">No bookmarked games yet</p>
              <p className="text-xs text-gray-500 mt-0.5">Click the star icon on any game card to bookmark it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface DisableAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeConfig?: ThemeItem;
}

export const DisableAdsModal: React.FC<DisableAdsModalProps> = ({
  isOpen,
  onClose,
  themeConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const discordUrl = 'https://discord.gg/ZBef7HnAeg';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(discordUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl p-5 border border-white/10 shadow-2xl"
        style={{ backgroundColor: themeConfig?.value?.settingsDropdownColor || '#162337' }}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-sky-400 w-5 h-5" />
            <h3 className="text-base font-bold text-white font-cyber">Ad-Free Experience</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>

        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Follow these quick steps to enable ad-free mode on gam-3:
        </p>

        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div className="text-xs text-gray-300 flex-1">
              Join the official gam-3 community Discord:
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={discordUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-sky-400 hover:underline font-mono truncate"
                >
                  discord.gg/ZBef7HnAeg
                </a>
                <button
                  onClick={handleCopy}
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-gray-200 text-[11px] font-cyber flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div className="text-xs text-gray-300">
              Check the <strong>#ad-free-keys</strong> channel for the weekly community unlock key.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div className="text-xs text-gray-300">
              Enjoy 100% clean, unblocked arcade gameplay with zero popups or trackers!
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-cyber font-bold shadow transition active:scale-95"
        >
          Got It, Thanks!
        </button>
      </div>
    </div>
  );
};
