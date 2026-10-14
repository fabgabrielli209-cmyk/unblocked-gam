import React, { useState } from 'react';
import {
  Shield,
  Palette,
  Eye,
  Tv2,
  Trash2,
  Check,
  ExternalLink,
  Sliders,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';
import { UserSettings, ThemeItem, CloakItem, SearchEngineItem } from '../types';
import { ALL_THEMES, ALL_CLOAKS, ALL_ENGINES } from '../data';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  themeConfig?: ThemeItem;
  onOpenAboutBlank: () => void;
  onResetAll: () => void;
  onPanicTrigger: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  themeConfig,
  onOpenAboutBlank,
  onResetAll,
  onPanicTrigger,
}) => {
  const [activeTab, setActiveTab] = useState<'cloak' | 'theme' | 'panic' | 'display'>('cloak');
  const [saveToast, setSaveToast] = useState(false);

  const showSaved = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleCloakPreset = (cloak: CloakItem) => {
    onUpdateSettings({
      cloak: cloak.option,
      customTitle: cloak.value.tabName,
      customFavicon: cloak.value.tabIcon,
    });
    showSaved();
  };

  const handleCustomCloak = (title: string, icon: string) => {
    onUpdateSettings({
      cloak: 'Custom',
      customTitle: title,
      customFavicon: icon,
    });
    showSaved();
  };

  return (
    <div className="flex-1 flex flex-col w-full max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-cyber text-white">
            Settings & Cloaking
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Customize tab disguise, themes, emergency panic key, and arcade display
          </p>
        </div>

        {/* Saved Toast */}
        {saveToast && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-cyber animate-bounce">
            <Check size={14} /> Settings Saved
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 select-none overflow-x-auto">
        <button
          onClick={() => setActiveTab('cloak')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-cyber transition ${
            activeTab === 'cloak'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Eye size={16} /> Tab Cloaker
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-cyber transition ${
            activeTab === 'theme'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Palette size={16} /> Themes & Patterns
        </button>
        <button
          onClick={() => setActiveTab('panic')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-cyber transition ${
            activeTab === 'panic'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield size={16} /> Panic Button
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-cyber transition ${
            activeTab === 'display'
              ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders size={16} /> Display & Arcade
        </button>
      </div>

      {/* TAB 1: TAB CLOAKER */}
      {activeTab === 'cloak' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl p-5 border border-white/10"
            style={{ backgroundColor: themeConfig?.value?.settingsContainerColor || '#18283e' }}
          >
            <h3 className="text-sm font-bold text-white font-cyber mb-1">Preset Cloaks</h3>
            <p className="text-xs text-gray-400 mb-4">
              Instantly disguise this tab's name and icon to look like educational or search services.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ALL_CLOAKS.map((c) => {
                const isSelected = settings.cloak === c.option;

                return (
                  <div
                    key={c.option}
                    onClick={() => handleCloakPreset(c)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition cursor-pointer select-none ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-400 text-white'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-300'
                    }`}
                  >
                    <img
                      src={c.value.tabIcon}
                      alt={c.option}
                      className="w-5 h-5 rounded object-contain shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = 'https://www.google.com/favicon.ico';
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{c.option}</div>
                      <div className="text-[10px] text-gray-400 truncate">{c.value.tabName}</div>
                    </div>
                    {isSelected && <Check size={14} className="text-sky-400 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Cloak */}
          <div
            className="rounded-2xl p-5 border border-white/10"
            style={{ backgroundColor: themeConfig?.value?.settingsContainerColor || '#18283e' }}
          >
            <h3 className="text-sm font-bold text-white font-cyber mb-1">Custom Cloak</h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter any custom website title and favicon image URL.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tab Title</label>
                <input
                  type="text"
                  value={settings.customTitle}
                  onChange={(e) => handleCustomCloak(e.target.value, settings.customFavicon)}
                  placeholder="e.g. My Drive - Google Drive"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Favicon URL</label>
                <input
                  type="text"
                  value={settings.customFavicon}
                  onChange={(e) => handleCustomCloak(settings.customTitle, e.target.value)}
                  placeholder="https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Stealth Mode (about:blank) */}
          <div
            className="rounded-2xl p-5 border border-sky-500/20 bg-gradient-to-r from-sky-950/40 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <h3 className="text-sm font-bold text-sky-300 font-cyber">about:blank Stealth Window</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Launches gam-3 inside a clean about:blank popup. Browsing history will only register "about:blank".
              </p>
            </div>
            <button
              onClick={onOpenAboutBlank}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold font-cyber shadow transition active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <ExternalLink size={14} /> Open about:blank
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: THEMES & PATTERNS */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl p-5 border border-white/10"
            style={{ backgroundColor: themeConfig?.value?.settingsContainerColor || '#18283e' }}
          >
            <h3 className="text-sm font-bold text-white font-cyber mb-1">Color Themes</h3>
            <p className="text-xs text-gray-400 mb-4">
              Select one of the 8 signature gam-3 themes.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {ALL_THEMES.map((th) => {
                const isSelected = settings.theme === th.option;

                return (
                  <div
                    key={th.option}
                    onClick={() => {
                      onUpdateSettings({ theme: th.option });
                      showSaved();
                    }}
                    className={`rounded-xl p-3.5 border transition cursor-pointer select-none flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-sky-400 ring-2 ring-sky-400/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{ backgroundColor: th.value.bgColor }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-cyber text-white">
                        {th.option}
                      </span>
                      {isSelected && <Check size={14} className="text-sky-400" />}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30"
                        style={{ backgroundColor: th.value.settingsContainerColor }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30"
                        style={{ backgroundColor: th.value.navItemActive }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30"
                        style={{ backgroundColor: th.value.switchEnabledColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Background Patterns */}
          <div
            className="rounded-2xl p-5 border border-white/10"
            style={{ backgroundColor: themeConfig?.value?.settingsContainerColor || '#18283e' }}
          >
            <h3 className="text-sm font-bold text-white font-cyber mb-1">Background Pattern</h3>
            <p className="text-xs text-gray-400 mb-4">
              Choose the geometric matrix style rendered behind the games.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['dots', 'stripes', 'grid', 'none'] as const).map((pat) => {
                const isSelected = settings.backgroundPattern === pat;
                return (
                  <button
                    key={pat}
                    onClick={() => {
                      onUpdateSettings({ backgroundPattern: pat });
                      showSaved();
                    }}
                    className={`py-3 px-4 rounded-xl text-xs font-cyber capitalize border transition ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-400 border-sky-400 font-bold'
                        : 'bg-white/5 hover:bg-white/10 border-white/5 text-gray-300'
                    }`}
                  >
                    {pat} Pattern
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PANIC BUTTON */}
      {activeTab === 'panic' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl p-5 border border-white/10"
            style={{ backgroundColor: themeConfig?.value?.settingsContainerColor || '#18283e' }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Shield className="text-red-400 w-5 h-5" />
              <h3 className="text-sm font-bold text-white font-cyber">Panic Key Settings</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              Pressing this key anywhere on the site will instantly redirect your browser to the URL below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Panic Trigger Key</label>
                <input
                  type="text"
                  value={settings.panicKey}
                  onChange={(e) => {
                    onUpdateSettings({ panicKey: e.target.value });
                    showSaved();
                  }}
                  placeholder="Escape"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono outline-none focus:border-red-500"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  Common keys: Escape, ], \, `, F2
                </span>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Redirect Destination URL</label>
                <input
                  type="text"
                  value={settings.panicUrl}
                  onChange={(e) => {
                    onUpdateSettings({ panicUrl: e.target.value });
                    showSaved();
                  }}
                  placeholder="https://classroom.google.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="space-y-4 mb-5">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">First-Visit Learning Disguise</div>
                  <div className="text-[11px] text-gray-400">
                    When visitors open the site, it looks like Google Classroom. Reloading the page unlocks the gam-3 game portal.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.firstVisitDisguise !== false}
                  onChange={(e) => {
                    onUpdateSettings({ firstVisitDisguise: e.target.checked });
                    showSaved();
                  }}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onPanicTrigger}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold font-cyber shadow transition active:scale-95 flex items-center gap-1.5"
              >
                <Shield size={14} /> Trigger Panic / Disguise Now
              </button>
              <span className="text-xs text-gray-400">
                Instantly converts the screen into the Google Classroom study disguise.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DISPLAY & ARCADE */}
      {activeTab === 'display' && (
        <div className="space-y-6">
          <div
            className="rounded-2xl p-5 border border-white/10"
            style={{ backgroundColor: themeConfig?.value?.settingsContainerColor || '#18283e' }}
          >
            <h3 className="text-sm font-bold text-white font-cyber mb-1">Arcade Container Defaults</h3>
            <p className="text-xs text-gray-400 mb-4">
              Customize retro CRT scanline effects and arcade frame geometry.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">CRT Scanlines by Default</div>
                  <div className="text-[11px] text-gray-400">Renders authentic retro monitor scanline overlay</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.arcadeScanlines}
                  onChange={(e) => {
                    onUpdateSettings({ arcadeScanlines: e.target.checked });
                    showSaved();
                  }}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">Games Per Page</div>
                  <div className="text-[11px] text-gray-400">Number of game cards loaded per catalog page</div>
                </div>
                <select
                  value={settings.itemsPerPage}
                  onChange={(e) => {
                    onUpdateSettings({ itemsPerPage: parseInt(e.target.value, 10) });
                    showSaved();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none cursor-pointer"
                >
                  <option value={20}>20 games</option>
                  <option value={30}>30 games</option>
                  <option value={40}>40 games</option>
                  <option value={60}>60 games</option>
                  <option value={100}>100 games</option>
                  <option value={10000}>All games</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <div className="text-xs font-semibold text-white">Navigation Scale</div>
                  <div className="text-[11px] text-gray-400">Scale factor of the top navigation bar</div>
                </div>
                <select
                  value={settings.navScale}
                  onChange={(e) => {
                    onUpdateSettings({ navScale: parseFloat(e.target.value) });
                    showSaved();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white outline-none cursor-pointer"
                >
                  <option value={0.8}>80% Compact</option>
                  <option value={0.9}>90%</option>
                  <option value={1.0}>100% Default</option>
                  <option value={1.1}>110%</option>
                  <option value={1.2}>120% Large</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset Factory Settings */}
          <div className="rounded-2xl p-5 border border-red-500/20 bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-red-300 font-cyber">Reset All Data</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Clear all favorites, shortcuts, and reset preferences back to default.
              </p>
            </div>
            <button
              onClick={onResetAll}
              className="px-4 py-2 rounded-xl bg-red-600/80 hover:bg-red-500 text-white text-xs font-semibold font-cyber shadow transition active:scale-95 flex items-center gap-1.5 shrink-0"
            >
              <Trash2 size={14} /> Reset Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
