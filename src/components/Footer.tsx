import React from 'react';
import { Heart, Disc as DiscordIcon, Bookmark, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';
import { ThemeItem } from '../types';

interface FooterProps {
  onOpenDisableAds: () => void;
  onOpenAboutBlank: () => void;
  onOpenBookmarks: () => void;
  themeConfig?: ThemeItem;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenDisableAds,
  onOpenAboutBlank,
  onOpenBookmarks,
  themeConfig,
}) => {
  const textColor = themeConfig?.value?.siteTextColor || '#a0b0c8';

  return (
    <footer
      className="w-full mt-auto py-4 px-4 sm:px-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-cyber select-none"
      style={{ color: textColor }}
    >
      {/* Left side links */}
      <div className="flex items-center gap-3">
        <a
          href="https://ko-fi.com/I3I81MF4CH"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-white transition"
        >
          <Heart size={14} className="text-pink-500 fill-pink-500" />
          <span>Support Us</span>
        </a>

        <span className="text-gray-600">•</span>

        <button
          onClick={onOpenDisableAds}
          className="flex items-center gap-1.5 hover:text-white transition"
        >
          <ShieldCheck size={14} className="text-sky-400" />
          <span>Disable Ads</span>
        </button>
      </div>

      {/* Right side links */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenAboutBlank}
          className="hover:text-white transition"
          title="Open in stealth about:blank popup"
        >
          about:blank
        </button>

        <span className="text-gray-600">•</span>

        <a
          href="https://discord.gg/ZBef7HnAeg"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 hover:text-white transition"
        >
          <span>Discord</span>
        </a>

        <span className="text-gray-600">•</span>

        <button
          onClick={onOpenBookmarks}
          className="flex items-center gap-1.5 hover:text-white transition"
        >
          <Bookmark size={14} className="text-amber-400" />
          <span>Bookmarks</span>
        </button>
      </div>
    </footer>
  );
};
