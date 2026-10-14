import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  RefreshCw,
  Star,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Tv2,
  Sparkles,
  ShieldAlert,
  Gamepad2,
  Globe,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { GameItem, UserSettings, ThemeItem } from '../types';
import { resolveGameUrl } from '../data';
import { RetroArcadeCanvas } from './RetroArcadeCanvas';
import { LocalArcadeGames, LocalGameId, LOCAL_GAMES_METADATA } from './LocalArcadeGames';

interface GamePlayerViewProps {
  game: GameItem;
  onBack: () => void;
  settings: UserSettings;
  themeConfig?: ThemeItem;
  isFavorite: boolean;
  onToggleFavorite: (gameName: string) => void;
  onPanicTrigger: () => void;
}

export const GamePlayerView: React.FC<GamePlayerViewProps> = ({
  game,
  onBack,
  settings,
  themeConfig,
  isFavorite,
  onToggleFavorite,
  onPanicTrigger,
}) => {
  const gameUrl = resolveGameUrl(game);
  const isDirectLocal = gameUrl.startsWith('local:');
  const initialLocalId = isDirectLocal ? (gameUrl.replace('local:', '') as LocalGameId) : '2048';

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scanlines, setScanlines] = useState(settings.arcadeScanlines ?? true);
  const [useLocalEngine, setUseLocalEngine] = useState(isDirectLocal);
  const [selectedLocalGame, setSelectedLocalGame] = useState<LocalGameId>(initialLocalId);
  const isDirectEmbedFriendly = gameUrl.includes('github.io') || gameUrl.includes('githack.com') || gameUrl.includes('play2048.co') || gameUrl.includes('1v1-lol.cc');
  const [useProxyRelay, setUseProxyRelay] = useState(!isDirectEmbedFriendly);
  const [iframeKey, setIframeKey] = useState(0);
  const [theaterMode, setTheaterMode] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const resolvedSrc = useProxyRelay
    ? `/api/proxy?url=${encodeURIComponent(gameUrl)}`
    : gameUrl;

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleReload = () => {
    setIframeKey(k => k + 1);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(1.4, Math.max(0.7, +(prev + delta).toFixed(1))));
  };

  // Launch the current game inside a stealth about:blank window to bypass iframe restriction
  const handleStealthAboutBlank = () => {
    try {
      const win = window.open('about:blank', '_blank');
      if (!win) {
        window.open(gameUrl, '_blank');
        return;
      }
      const doc = win.document;
      doc.title = settings.customTitle || 'Google Docs';

      if (settings.customFavicon) {
        const link = doc.createElement('link');
        link.rel = 'icon';
        link.href = settings.customFavicon;
        doc.head.appendChild(link);
      }

      const iframe = doc.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.width = '100vw';
      iframe.style.height = '100vh';
      iframe.style.border = 'none';
      iframe.src = gameUrl;
      doc.body.style.margin = '0';
      doc.body.appendChild(iframe);
    } catch {
      window.open(gameUrl, '_blank');
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex-1 flex flex-col w-full mx-auto transition-all ${
        theaterMode ? 'max-w-full px-2' : 'max-w-6xl px-4'
      } py-4`}
    >
      {/* Top Game Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 px-3 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-md">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-cyber transition"
          >
            <ArrowLeft size={14} /> Library
          </button>

          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-white font-cyber truncate max-w-[180px] sm:max-w-xs">
              {useLocalEngine ? LOCAL_GAMES_METADATA[selectedLocalGame]?.name || game.appName : game.appName}
            </h2>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-cyber bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {useLocalEngine ? '100% Local (Unblockable)' : game.category}
            </span>
          </div>
        </div>

        {/* Right: Tools & Mode Selectors */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Guaranteed Local Mode Toggle */}
          <button
            onClick={() => setUseLocalEngine(l => !l)}
            title={useLocalEngine ? 'Switch to External Web Player' : 'Switch to Local Offline Arcade (Never Blocked)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-cyber transition ${
              useLocalEngine
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                : 'bg-white/5 text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            <ShieldCheck size={14} className={useLocalEngine ? 'text-white' : 'text-emerald-400'} />
            <span className="hidden sm:inline">
              {useLocalEngine ? 'Local Engine (Active)' : 'Local Engine'}
            </span>
          </button>

          {/* Favorite Toggle */}
          <button
            onClick={() => onToggleFavorite(game.appName)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-2 rounded-xl transition ${
              isFavorite
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => setScanlines(s => !s)}
            title={scanlines ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-cyber transition ${
              scanlines
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tv2 size={15} />
            <span className="hidden md:inline">CRT {scanlines ? 'ON' : 'OFF'}</span>
          </button>

          {/* Server Relay Mode Toggle */}
          {!useLocalEngine && (
            <button
              onClick={() => { setUseProxyRelay(r => !r); setIframeKey(k => k + 1); }}
              title={useProxyRelay ? 'Server Relay Active: Routes through backend to bypass FortiGuard domain blocks & frame headers' : 'Direct Embed Active'}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-cyber transition ${
                useProxyRelay
                  ? 'bg-purple-600/40 text-purple-200 border border-purple-500/50 shadow-sm'
                  : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Sparkles size={13} className={useProxyRelay ? 'text-purple-300' : 'text-gray-400'} />
              <span className="hidden sm:inline">{useProxyRelay ? 'Relay ON' : 'Direct'}</span>
            </button>
          )}

          {/* Stealth about:blank Quick Button */}
          {!useLocalEngine && (
            <button
              onClick={handleStealthAboutBlank}
              title="Open game in clean about:blank window to bypass FortiGuard/iframe blocking"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-cyber transition"
            >
              <Globe size={13} />
              <span className="hidden lg:inline">Stealth Window</span>
            </button>
          )}

          {/* Reload */}
          {!useLocalEngine && (
            <button
              onClick={handleReload}
              title="Reload game frame"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <RefreshCw size={15} />
            </button>
          )}

          {/* Open in new tab */}
          {!useLocalEngine && (
            <button
              onClick={() => window.open(gameUrl, '_blank')}
              title="Open external game link in new tab"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
            >
              <ExternalLink size={15} />
            </button>
          )}

          {/* Fullscreen */}
          <button
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            className="p-2 rounded-xl text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 transition"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* Network Filter & Refusal Unblocking Banner */}
      {!useLocalEngine && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-cyber text-emerald-200 mb-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
            <span>
              Network Filter Guard: If this external game shows "refused to connect", switch to the built-in Local Engine or open in Stealth Window!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseLocalEngine(true)}
              className="px-2 py-0.5 rounded bg-emerald-500/30 hover:bg-emerald-500/50 text-white font-bold transition"
            >
              ⚡ Switch to Local Engine
            </button>
            <button
              onClick={handleStealthAboutBlank}
              className="px-2 py-0.5 rounded bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 font-bold transition"
            >
              🚀 Stealth about:blank →
            </button>
          </div>
        </div>
      )}

      {/* Local Engine Game Selector Tabs when Local Mode is active */}
      {useLocalEngine && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2 no-scrollbar text-xs font-cyber">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider pl-1">
            Local Games:
          </span>
          {(['snake', '2048', 'breakout', 'space', 'flappy', 'dino', 'pong'] as LocalGameId[]).map(id => (
            <button
              key={id}
              onClick={() => setSelectedLocalGame(id)}
              className={`px-3 py-1 rounded-lg transition whitespace-nowrap ${
                selectedLocalGame === id
                  ? 'bg-emerald-500 text-white font-bold shadow'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              {LOCAL_GAMES_METADATA[id]?.name || id}
            </button>
          ))}
        </div>
      )}

      {/* Retro Arcade Bezel Environment with Centered Game Screen */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center rounded-3xl bg-gradient-to-b from-[#182338] via-[#0d1424] to-[#070b14] p-3 sm:p-6 border-4 border-[#334155]/80 shadow-2xl arcade-bezel-shadow overflow-hidden min-h-[520px]">
        
        {/* Subtle Cabinet Top Light Bar */}
        <div className="w-full max-w-2xl h-1.5 rounded-full bg-gradient-to-r from-transparent via-sky-400/40 to-transparent mb-3" />

        {/* Centered Canvas / Game Board Area */}
        <div
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[78vh] rounded-2xl overflow-hidden bg-black border-2 border-[#1e293b] shadow-2xl flex items-center justify-center transition-transform"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {useLocalEngine ? (
            /* Local In-Browser Canvas Arcade Engine (Guaranteed Connect) */
            <div className="w-full h-full p-2 flex items-center justify-center">
              <LocalArcadeGames
                gameId={selectedLocalGame}
                scanlinesEnabled={scanlines}
              />
            </div>
          ) : (
            /* Web Game Embed */
            <iframe
              id="iframehtml5"
              key={iframeKey}
              src={resolvedSrc}
              title={game.appName}
              allow="autoplay; fullscreen; gamepad; focus-without-user-activation; clipboard-write; microphone; camera"
              sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-downloads"
              className="w-full h-full border-0 block bg-black"
            />
          )}

          {/* CRT Scanlines Overlay */}
          {scanlines && !useLocalEngine && (
            <div className="absolute inset-0 pointer-events-none crt-scanlines crt-flicker" />
          )}
        </div>

        {/* Cabinet Bottom Control Marquee */}
        <div className="w-full flex items-center justify-between mt-4 px-3 text-xs text-gray-400 font-cyber">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-gray-300">
              {useLocalEngine ? 'LOCAL RUNTIME ONLINE (ZERO EXTERNAL REQUESTS)' : 'ARCADE CABINET ONLINE'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-gray-500">
              Panic Key: <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">{settings.panicKey}</kbd>
            </span>
            <button
              onClick={() => setTheaterMode(t => !t)}
              className="hover:text-white transition"
            >
              {theaterMode ? 'Default View' : 'Theater View'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
