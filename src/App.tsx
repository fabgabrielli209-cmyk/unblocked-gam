/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { GamesView } from './components/GamesView';
import { AppsView } from './components/AppsView';
import { SettingsView } from './components/SettingsView';
import { GamePlayerView } from './components/GamePlayerView';
import { RetroArcadeCanvas } from './components/RetroArcadeCanvas';
import { ProxyBrowserView } from './components/ProxyBrowserView';
import { LearningDisguiseView } from './components/LearningDisguiseView';
import { Footer } from './components/Footer';
import { BookmarksModal, DisableAdsModal } from './components/Modals';
import { GameItem, AppItem, UserSettings, ThemeItem } from './types';
import { ALL_THEMES, ALL_CLOAKS } from './data';
import { GAM3_FAVICON_SVG } from './components/Gam3Logo';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'Midnight',
  cloak: 'Default',
  customTitle: 'gam-3 - Unblocked Games & Web Hub',
  customFavicon: GAM3_FAVICON_SVG,
  panicKey: 'Escape',
  panicUrl: 'https://classroom.google.com',
  searchEngine: 'Google',
  backgroundPattern: 'dots',
  navScale: 1.0,
  itemsPerPage: 30,
  arcadeScanlines: true,
  arcadeBezel: true,
  firstVisitDisguise: true,
};

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<'home' | 'games' | 'apps' | 'settings' | 'arcade' | 'player' | 'proxy'>('home');
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [proxyInitialUrl, setProxyInitialUrl] = useState<string>('https://google.com');

  // Modals
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isDisableAdsOpen, setIsDisableAdsOpen] = useState(false);

  // First-visit disguise state: shows Google Classroom on initial visit, unlocks when reloaded!
  const [isDisguised, setIsDisguised] = useState<boolean>(() => {
    // If panic was explicitly triggered
    if (sessionStorage.getItem('gam3_panic_active') === 'true') {
      return true;
    }

    // Check if the user has already unlocked this session
    const alreadyUnlocked = sessionStorage.getItem('gam3_unlocked') === 'true';
    if (alreadyUnlocked) {
      return false;
    }

    // Detect if the page was loaded via a browser reload (F5 / reload button)
    let isReload = false;
    try {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries.length > 0) {
        isReload = (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
      } else if (window.performance && (window.performance as any).navigation) {
        isReload = (window.performance as any).navigation.type === 1;
      }
    } catch {}

    const hasSeenFirstTime = sessionStorage.getItem('gam3_seen_learning_once') === 'true';

    // If page was reloaded or visited for a second time, unlock gam-3!
    if (isReload || hasSeenFirstTime) {
      sessionStorage.setItem('gam3_unlocked', 'true');
      return false;
    }

    // Initial visit: mark seen once and show learning disguise
    sessionStorage.setItem('gam3_seen_learning_once', 'true');
    return true;
  });

  // Settings State
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('gam3_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch {}
    }
    return DEFAULT_SETTINGS;
  });

  // Favorites / Bookmarks State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('gam3_favorites');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return ['BasketBros.io', 'Retro Bowl', '1v1.lol', 'Cookie Clicker'];
  });

  // Current Theme Config
  const activeTheme = useMemo<ThemeItem>(() => {
    const found = ALL_THEMES.find(t => t.option.toLowerCase() === settings.theme.toLowerCase());
    return found || ALL_THEMES[0];
  }, [settings.theme]);

  // Update Settings Helper
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('gam3_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle Favorite Helper
  const handleToggleFavorite = (gameName: string) => {
    setFavorites(prev => {
      const exists = prev.includes(gameName);
      const updated = exists ? prev.filter(n => n !== gameName) : [...prev, gameName];
      localStorage.setItem('gam3_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Sync Tab Cloaking (Title and Favicon)
  useEffect(() => {
    if (isDisguised && settings.firstVisitDisguise !== false) {
      document.title = 'Classes - Google Classroom';
      let iconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
      if (iconLink) {
        iconLink.href = 'https://ssl.gstatic.com/classroom/favicon.png';
      }
      return;
    }

    // 1. Update Title
    if (settings.customTitle) {
      document.title = settings.customTitle;
    } else {
      document.title = 'gam-3 - Arcade & Games Hub';
    }

    // 2. Update Favicon
    let iconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.id = 'dynamic-favicon';
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    if (settings.customFavicon) {
      iconLink.href = settings.customFavicon;
    } else {
      iconLink.href = GAM3_FAVICON_SVG;
    }
  }, [settings.customTitle, settings.customFavicon, settings.cloak, isDisguised, settings.firstVisitDisguise]);

  // Global Panic Action: immediately locks into Google Classroom learning disguise & silences audio
  const triggerPanic = useCallback(() => {
    // Mute all audio/video media immediately
    try {
      document.querySelectorAll('audio, video').forEach(el => {
        try {
          (el as HTMLMediaElement).pause();
          (el as HTMLMediaElement).muted = true;
        } catch {}
      });
    } catch {}

    setIsDisguised(true);
    sessionStorage.setItem('gam3_panic_active', 'true');
    sessionStorage.removeItem('gam3_unlocked');

    // Instantly disguise tab title and favicon
    document.title = 'Classes - Google Classroom';
    let iconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
    if (iconLink) {
      iconLink.href = 'https://ssl.gstatic.com/classroom/favicon.png';
    }

    // Optionally attempt redirect in background if external URL configured
    const dest = settings.panicUrl || 'https://classroom.google.com';
    try {
      if (dest !== 'https://classroom.google.com') {
        window.open(dest, '_blank');
      }
    } catch {}
  }, [settings.panicUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (settings.panicKey && e.key.toLowerCase() === settings.panicKey.toLowerCase()) {
        triggerPanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.panicKey, triggerPanic]);

  // Stealth about:blank Popup Launcher
  const handleOpenAboutBlank = () => {
    try {
      const win = window.open('about:blank', '_blank');
      if (!win) {
        alert('Popup blocked! Please allow popups for about:blank stealth mode.');
        return;
      }
      const doc = win.document;
      doc.title = settings.customTitle || 'Classes';
      const iframe = doc.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.src = window.location.href;
      doc.body.style.margin = '0';
      doc.body.appendChild(iframe);
    } catch {
      window.open(window.location.href, '_blank');
    }
  };

  // Reset All Data
  const handleResetAll = () => {
    if (window.confirm('Reset all settings, favorites, and shortcuts to defaults?')) {
      localStorage.removeItem('gam3_settings');
      localStorage.removeItem('gam3_favorites');
      localStorage.removeItem('gam3_shortcuts');
      setSettings(DEFAULT_SETTINGS);
      setFavorites(['BasketBros.io', 'Retro Bowl', '1v1.lol', 'Cookie Clicker']);
      setCurrentView('home');
    }
  };

  // Handle Game Selection
  const handleSelectGame = (game: GameItem) => {
    setSelectedGame(game);
    setCurrentView('player');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle App Selection: Launches directly in the in-app Proxy Browser
  const handleSelectApp = (app: AppItem) => {
    if (app.url) {
      handleOpenProxy(app.url);
    }
  };

  // Handle Proxy Browser Launch
  const handleOpenProxy = (url?: string) => {
    if (url) setProxyInitialUrl(url);
    setCurrentView('proxy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Background Pattern CSS Generator
  const backgroundPatternStyle = useMemo(() => {
    const colorRgb = activeTheme?.value?.bgDesignColor || '66, 69, 73';
    switch (settings.backgroundPattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(circle, rgba(${colorRgb}, 0.12) 2px, transparent 1px)`,
          backgroundSize: '24px 24px',
        };
      case 'stripes':
        return {
          backgroundImage: `repeating-linear-gradient(45deg, rgba(${colorRgb}, 0.08), rgba(${colorRgb}, 0.08) 2px, transparent 2px, transparent 10px)`,
        };
      case 'grid':
        return {
          backgroundImage: `linear-gradient(to right, rgba(${colorRgb}, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(${colorRgb}, 0.1) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        };
      case 'none':
      default:
        return {};
    }
  }, [settings.backgroundPattern, activeTheme]);

  // If in learning disguise mode (first visit or panic triggered), render Google Classroom
  if (isDisguised && settings.firstVisitDisguise !== false) {
    return (
      <LearningDisguiseView
        onUnlock={() => {
          setIsDisguised(false);
          sessionStorage.setItem('gam3_unlocked', 'true');
          sessionStorage.removeItem('gam3_panic_active');
          document.title = settings.customTitle || 'gam-3 - Arcade & Games Hub';
          let iconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
          if (iconLink) iconLink.href = settings.customFavicon || GAM3_FAVICON_SVG;
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col font-sans transition-colors duration-300 relative text-white"
      style={{
        backgroundColor: activeTheme?.value?.bgColor || '#111827',
        ...backgroundPatternStyle,
      }}
    >
      {/* gam-3 Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        settings={settings}
        themeConfig={activeTheme}
        onPanicTrigger={triggerPanic}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full">
        {currentView === 'home' && (
          <HomeView
            onSelectGame={handleSelectGame}
            onSelectApp={handleSelectApp}
            onNavigate={(view) => setCurrentView(view)}
            settings={settings}
            themeConfig={activeTheme}
            onOpenAboutBlank={handleOpenAboutBlank}
            onOpenBookmarks={() => setIsBookmarksOpen(true)}
            onOpenProxy={handleOpenProxy}
          />
        )}

        {currentView === 'games' && (
          <GamesView
            onSelectGame={handleSelectGame}
            settings={settings}
            themeConfig={activeTheme}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {currentView === 'apps' && (
          <AppsView
            onSelectApp={handleSelectApp}
            settings={settings}
            themeConfig={activeTheme}
          />
        )}

        {currentView === 'arcade' && (
          <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold font-cyber text-sky-400">
                Retro Arcade Cabinet
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Authentic 8-bit sound synthesis, CRT scanlines, and retro neon canvas arcade games.
              </p>
            </div>
            <RetroArcadeCanvas
              scanlinesEnabled={settings.arcadeScanlines}
              onExit={() => setCurrentView('home')}
            />
          </div>
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            themeConfig={activeTheme}
            onOpenAboutBlank={handleOpenAboutBlank}
            onResetAll={handleResetAll}
            onPanicTrigger={triggerPanic}
          />
        )}

        {currentView === 'player' && selectedGame && (
          <GamePlayerView
            game={selectedGame}
            onBack={() => setCurrentView('games')}
            settings={settings}
            themeConfig={activeTheme}
            isFavorite={favorites.includes(selectedGame.appName)}
            onToggleFavorite={handleToggleFavorite}
            onPanicTrigger={triggerPanic}
          />
        )}

        {currentView === 'proxy' && (
          <ProxyBrowserView
            initialUrl={proxyInitialUrl}
            onClose={() => setCurrentView('home')}
            settings={settings}
            themeConfig={activeTheme}
            onOpenAboutBlank={handleOpenAboutBlank}
          />
        )}
      </main>

      {/* gam-3 Footer */}
      <Footer
        onOpenDisableAds={() => setIsDisableAdsOpen(true)}
        onOpenAboutBlank={handleOpenAboutBlank}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        themeConfig={activeTheme}
      />

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        favorites={favorites}
        onSelectGame={handleSelectGame}
        onRemoveFavorite={handleToggleFavorite}
        themeConfig={activeTheme}
      />

      {/* Disable Ads Modal */}
      <DisableAdsModal
        isOpen={isDisableAdsOpen}
        onClose={() => setIsDisableAdsOpen(false)}
        themeConfig={activeTheme}
      />
    </div>
  );
}
