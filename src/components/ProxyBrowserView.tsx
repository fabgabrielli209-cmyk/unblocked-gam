import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Search,
  ExternalLink,
  Maximize,
  Minimize,
  Lock,
  Globe,
  X,
  Shield,
  Sliders,
  Tv2,
  Sparkles
} from 'lucide-react';
import { UserSettings, ThemeItem } from '../types';
import { ALL_ENGINES } from '../data';

interface ProxyBrowserViewProps {
  initialUrl?: string;
  onClose: () => void;
  settings: UserSettings;
  themeConfig?: ThemeItem;
  onOpenAboutBlank: () => void;
}

export const ProxyBrowserView: React.FC<ProxyBrowserViewProps> = ({
  initialUrl = 'https://google.com',
  onClose,
  settings,
  themeConfig,
  onOpenAboutBlank,
}) => {
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  // Default to 'proxy' so all sites route through the unblocking relay by default
  const [proxyMode, setProxyMode] = useState<'embed' | 'proxy' | 'engine'>('proxy');
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Opens the current URL in an about:blank stealth popup
  const handleStealthAboutBlank = (target?: string) => {
    const urlToOpen = target || currentUrl;
    try {
      const win = window.open('about:blank', '_blank');
      if (!win) {
        window.open(urlToOpen, '_blank');
        return;
      }
      const doc = win.document;
      doc.title = settings.customTitle || 'Classes';

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
      iframe.src = urlToOpen;
      doc.body.style.margin = '0';
      doc.body.appendChild(iframe);
    } catch {
      window.open(urlToOpen, '_blank');
    }
  };

  // Quick launch bookmark links
  const quickLinks = [
    { name: 'Google', url: 'https://google.com' },
    { name: 'DuckDuckGo', url: 'https://duckduckgo.com' },
    { name: 'Wikipedia', url: 'https://wikipedia.org' },
    { name: 'Neal.fun', url: 'https://neal.fun' },
    { name: 'Reddit', url: 'https://reddit.com' },
    { name: 'GitHub', url: 'https://github.com' },
  ];

  // Resolve target URL into either proxied endpoint or web link
  const resolveTargetUrl = (raw: string): string => {
    let clean = raw.trim();
    if (!clean) return 'https://google.com';

    // If search term (no protocol and has space or no dot)
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      if (clean.includes(' ') || !clean.includes('.')) {
        // Use user's selected search engine
        const engine = ALL_ENGINES.find(e => e.option.toLowerCase() === settings.searchEngine.toLowerCase());
        const base = engine ? engine.value.engine : 'https://www.google.com/search?q=';
        return `${base}${encodeURIComponent(clean)}`;
      }
      clean = `https://${clean}`;
    }

    return clean;
  };

  const navigateTo = (target: string) => {
    const resolved = resolveTargetUrl(target);
    setInputUrl(resolved);
    setCurrentUrl(resolved);
    setIsLoading(true);
    setIframeKey(k => k + 1);

    // Update history
    setHistory(prev => {
      const slice = prev.slice(0, historyIndex + 1);
      return [...slice, resolved];
    });
    setHistoryIndex(prev => prev + 1);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      const url = history[nextIdx];
      setInputUrl(url);
      setCurrentUrl(url);
      setIframeKey(k => k + 1);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      const url = history[nextIdx];
      setInputUrl(url);
      setCurrentUrl(url);
      setIframeKey(k => k + 1);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(k => k + 1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Determine iframe src based on mode
  const resolvedIframeSrc = React.useMemo(() => {
    if (proxyMode === 'proxy') {
      return `/api/proxy?url=${encodeURIComponent(currentUrl)}`;
    }
    return currentUrl;
  }, [currentUrl, proxyMode]);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col w-full h-full max-w-7xl mx-auto px-2 sm:px-4 py-3"
    >
      {/* Top Browser Navigation Chrome */}
      <div
        className="flex flex-col gap-2 p-2.5 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md mb-2"
        style={{ backgroundColor: themeConfig?.value?.settingsDropdownColor || '#162337' }}
      >
        {/* Row 1: Back, Forward, Reload, Address Bar, Actions */}
        <div className="flex items-center gap-2">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={historyIndex <= 0}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Forward Button */}
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Go Forward"
          >
            <ArrowRight size={16} />
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleReload}
            className={`p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition ${
              isLoading ? 'animate-spin text-sky-400' : ''
            }`}
            title="Reload"
          >
            <RotateCw size={15} />
          </button>

          {/* Address Bar */}
          <form onSubmit={handleFormSubmit} className="flex-1 flex items-center min-w-0">
            <div className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 focus-within:border-sky-500 transition shadow-inner">
              <Lock size={13} className="text-emerald-400 shrink-0" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Search web or enter URL..."
                className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder:text-gray-500 outline-none truncate font-mono"
              />
              {inputUrl && (
                <button
                  type="button"
                  onClick={() => setInputUrl('')}
                  className="text-gray-500 hover:text-white p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </form>

          {/* Proxy Mode Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px] font-cyber">
            <button
              onClick={() => { setProxyMode('proxy'); setIframeKey(k => k + 1); }}
              className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 ${
                proxyMode === 'proxy'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Server-side CORS Proxy Unblocker (Bypasses 'Refused to connect')"
            >
              <Sparkles size={12} className="text-purple-300" />
              <span>Proxy Relay</span>
            </button>
            <button
              onClick={() => { setProxyMode('embed'); setIframeKey(k => k + 1); }}
              className={`px-2.5 py-1 rounded-lg transition ${
                proxyMode === 'embed'
                  ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                  : 'text-gray-400 hover:text-white'
              }`}
              title="Direct Embed (May be blocked by sites with strict frame headers)"
            >
              Direct
            </button>
          </div>

          {/* Stealth about:blank Quick Button */}
          <button
            onClick={() => handleStealthAboutBlank(currentUrl)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-cyber transition"
            title="Open current site in clean about:blank window to bypass all frame blocks"
          >
            <Globe size={13} />
            <span className="hidden md:inline">Stealth</span>
          </button>

          {/* Open External */}
          <button
            onClick={() => window.open(currentUrl, '_blank')}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Open in new browser tab"
          >
            <ExternalLink size={15} />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />}
          </button>

          {/* Close Browser */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition"
            title="Close browser session"
          >
            <X size={16} />
          </button>
        </div>

        {/* Row 2: Quick Bookmark Hub */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 no-scrollbar text-xs font-cyber">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest pl-1">Bookmarks:</span>
          {quickLinks.map(ql => (
            <button
              key={ql.name}
              onClick={() => navigateTo(ql.url)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 whitespace-nowrap transition"
            >
              {ql.name}
            </button>
          ))}
          <button
            onClick={() => handleStealthAboutBlank(currentUrl)}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap transition ml-auto"
            title="Open current site in stealth about:blank window"
          >
            🚀 Open Current in about:blank
          </button>
        </div>

        {/* Unblocking Helper Notice Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] font-cyber text-purple-200">
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-purple-400 shrink-0" />
            <span>
              {proxyMode === 'proxy'
                ? 'Proxy Relay is active (stripping X-Frame-Options headers).'
                : 'Direct Mode active. Sites like Roblox block direct frames — switch to Proxy Relay!'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {proxyMode === 'embed' && (
              <button
                onClick={() => { setProxyMode('proxy'); setIframeKey(k => k + 1); }}
                className="underline text-sky-400 hover:text-sky-300 font-bold"
              >
                Switch to Proxy Relay
              </button>
            )}
            <button
              onClick={() => handleStealthAboutBlank(currentUrl)}
              className="px-2 py-0.5 rounded bg-emerald-500/30 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-500/40 font-bold"
            >
              Bypass via about:blank →
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Browser Viewport */}
      <div className="relative flex-1 w-full rounded-2xl overflow-hidden bg-black border-2 border-white/10 shadow-2xl flex flex-col min-h-[600px]">
        {/* Loading Bar */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-pink-500 to-sky-400 animate-pulse z-20" />
        )}

        <iframe
          key={iframeKey}
          src={resolvedIframeSrc}
          title="gam-3 Proxy Browser"
          onLoad={() => setIsLoading(false)}
          allow="autoplay; fullscreen; clipboard-read; clipboard-write; microphone; camera; geolocation"
          sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts"
          className="w-full h-full flex-1 border-0 block bg-white"
        />

        {/* Bottom Status / Mode Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0f1d] border-t border-white/5 text-[11px] text-gray-400 font-cyber">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-gray-300">
              Proxy Mode: {proxyMode === 'proxy' ? 'Relay Active' : 'Direct Embed'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="truncate max-w-xs">{currentUrl}</span>
            <span className="hidden sm:inline text-gray-600">•</span>
            <button
              onClick={() => {
                setProxyMode(m => m === 'embed' ? 'proxy' : 'embed');
                setIframeKey(k => k + 1);
              }}
              className="text-sky-400 hover:underline"
            >
              Switch to {proxyMode === 'embed' ? 'Proxy Relay' : 'Direct'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
