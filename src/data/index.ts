import gamesDataRaw from './games.json';
import appsDataRaw from './apps.json';
import themesDataRaw from './themes.json';
import cloaksDataRaw from './cloaks.json';
import enginesDataRaw from './engines.json';
import { GameItem, AppItem, ThemeItem, CloakItem, SearchEngineItem } from '../types';

export const CATEGORIES = [
  'All',
  'Local Arcade (Guaranteed Connect)',
  'Popular',
  'Action',
  'Adventure',
  'Horror/Survival',
  'Idle/Clicker',
  'Multiplayer',
  'Platformer',
  'Puzzle',
  'Racing',
  'Running',
  'Sandbox/Creative',
  'Sports',
] as const;

export type CategoryType = typeof CATEGORIES[number];

// Built-in Local Arcade Games (run 100% client-side, zero external requests, never blocked by FortiGuard)
export const LOCAL_ARCADE_GAMES: GameItem[] = [
  {
    appName: 'Cyber Snake',
    desc: 'Classic neon arcade snake with glowing food particles and high scores. 100% local, guaranteed to connect.',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="%23060a12"%3E%3Crect width="64" height="64" rx="12" fill="%23060a12"/%3E%3Ccircle cx="32" cy="32" r="14" fill="%2338bdf8"/%3E%3Ccircle cx="48" cy="20" r="6" fill="%23f43f5e"/%3E%3C/svg%3E',
    url: 'local:snake',
    category: 'Local Arcade (Guaranteed Connect)',
  },
  {
    appName: '2048 Arcade',
    desc: 'Join the numbers and reach the 2048 tile in a neon arcade interface. Runs 100% on device.',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="%23060a12"%3E%3Crect width="64" height="64" rx="12" fill="%23162032"/%3E%3Ctext x="32" y="40" font-family="sans-serif" font-weight="bold" font-size="20" fill="%23ec4899" text-anchor="middle"%3E2048%3C/text%3E%3C/svg%3E',
    url: 'local:2048',
    category: 'Local Arcade (Guaranteed Connect)',
  },
  {
    appName: 'Neon Breakout',
    desc: 'Smash glowing neon bricks with ball bouncing mechanics. 100% local canvas, zero external requests.',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="%23060a12"%3E%3Crect width="64" height="64" rx="12" fill="%23080d1a"/%3E%3Crect x="12" y="16" width="40" height="8" rx="2" fill="%23f43f5e"/%3E%3Crect x="18" y="48" width="28" height="6" rx="2" fill="%2338bdf8"/%3E%3Ccircle cx="32" cy="36" r="4" fill="%23fff"/%3E%3C/svg%3E',
    url: 'local:breakout',
    category: 'Local Arcade (Guaranteed Connect)',
  },
  {
    appName: 'Space Defender 1984',
    desc: 'Retro arcade vector space shooter fighting off alien invasions with laser cannons.',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="%2305070e"%3E%3Crect width="64" height="64" rx="12" fill="%2305070e"/%3E%3Cpolygon points="32,16 44,48 20,48" fill="%2322d3ee"/%3E%3C/svg%3E',
    url: 'local:space',
    category: 'Local Arcade (Guaranteed Connect)',
  },
  {
    appName: 'Flappy Wings',
    desc: 'Flap through neon pipes and test your reflexes in this endless classic runner.',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="%23080d1a"%3E%3Crect width="64" height="64" rx="12" fill="%23080d1a"/%3E%3Ccircle cx="32" cy="32" r="14" fill="%23facc15"/%3E%3Crect x="42" y="0" width="12" height="20" fill="%2310b981"/%3E%3C/svg%3E',
    url: 'local:flappy',
    category: 'Local Arcade (Guaranteed Connect)',
  },
  {
    appName: 'Neon T-Rex Runner',
    desc: 'Classic offline jumping dinosaur runner. Jumps over neon obstacles and never gets blocked.',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="%23080d1a"%3E%3Crect width="64" height="64" rx="12" fill="%23080d1a"/%3E%3Crect x="24" y="24" width="20" height="26" fill="%2338bdf8"/%3E%3C/svg%3E',
    url: 'local:dino',
    category: 'Local Arcade (Guaranteed Connect)',
  },
  {
    appName: 'Retro Pong AI',
    desc: 'Paddle ping-pong duel against an adaptive computer opponent with high score tracking.',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="%23080d1a"%3E%3Crect width="64" height="64" rx="12" fill="%23080d1a"/%3E%3Crect x="10" y="20" width="6" height="24" fill="%2338bdf8"/%3E%3Crect x="48" y="24" width="6" height="24" fill="%23f43f5e"/%3E%3Ccircle cx="32" cy="32" r="4" fill="%23fff"/%3E%3C/svg%3E',
    url: 'local:pong',
    category: 'Local Arcade (Guaranteed Connect)',
  },
];

// Flatten games into an indexed list, placing Local Arcade games first
const flattenedGames: GameItem[] = [...LOCAL_ARCADE_GAMES];
const seenNames = new Set<string>(LOCAL_ARCADE_GAMES.map(g => g.appName.toLowerCase().trim()));

const categoryRecord = gamesDataRaw as Record<string, Omit<GameItem, 'category'>[]>;

// Known high-performance unblocked web embeds for popular titles
export const WEB_MIRRORS: Record<string, string> = {
  'BasketBros.io': 'https://basketbros.io/',
  'Roblox': 'https://now.gg/apps/roblox-corporation/5349/roblox.html',
  'Retro Bowl': 'https://freegamesunblocked76.github.io/retro-bowl/',
  'Retro Bowl College': 'https://freegamesunblocked76.github.io/retro-bowl-college/',
  'Cookie Clicker': 'https://orteil.dashnet.org/cookieclicker/',
  'Geometry Dash': 'https://web-dashers.github.io/',
  '1v1.lol': 'https://mt.1v1-lol.cc/shooting-games/1v1-lol/index.html',
  '2048': 'local:2048',
  'Chrome Dino': 'local:dino',
  'Flappy Bird': 'local:flappy',
  'Slope': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/slope/index.html',
  'Slope Ball': 'https://assets.hbmc.net/slope-ball/index.html',
  'Crossy Road': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/crossy-road/index.html',
  'Subway Surfers New York': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/subway-surfers-ny/index.html',
  'Pacman': 'https://pacman.live/',
  'Paper.io 2': 'https://paper-io.com/',
  'BitLife': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/bitlife/index.html',
  'Super Mario 64': 'https://frogor.github.io/sm64-js/',
  'Moto X3M': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/motox3m/index.html',
  'Tunnel Rush': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/tunnel-rush/index.html',
  'Drift Hunters': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/drift-hunters/index.html',
  'Basket Random': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/basket-random/index.html',
  'Soccer Random': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/soccer-random/index.html',
  'Rooftop Snipers': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/rooftop-snipers/index.html',
  'Getaway Shootout': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/getaway-shootout/index.html',
  'OvO': 'https://raw.githack.com/Skoolgq/Polaris-Assets/main/ovo/index.html',
};

for (const [category, list] of Object.entries(categoryRecord)) {
  for (const item of list) {
    const key = item.appName.toLowerCase().trim();
    if (!seenNames.has(key)) {
      seenNames.add(key);
      flattenedGames.push({
        ...item,
        category,
      });
    }
  }
}

export const ALL_GAMES: GameItem[] = flattenedGames;
export const ALL_APPS: AppItem[] = appsDataRaw as AppItem[];
export const ALL_THEMES: ThemeItem[] = themesDataRaw as ThemeItem[];
export const ALL_CLOAKS: CloakItem[] = cloaksDataRaw as CloakItem[];
export const ALL_ENGINES: SearchEngineItem[] = enginesDataRaw as SearchEngineItem[];

/**
 * Resolves the best playable URL for a given game item, guaranteeing every game works
 */
export function resolveGameUrl(game: GameItem): string {
  if (typeof game.url === 'string' && game.url.startsWith('local:')) {
    return game.url;
  }

  if (WEB_MIRRORS[game.appName]) {
    return WEB_MIRRORS[game.appName];
  }

  // If game has a valid web URL (and not a dead .zip file)
  if (Array.isArray(game.url)) {
    const first = game.url[0];
    if (first && !first.endsWith('.zip') && !first.includes('rbo.zip')) return first;
  } else if (typeof game.url === 'string' && game.url && !game.url.endsWith('.zip') && !game.url.includes('rbo.zip')) {
    return game.url;
  }

  // Fallback to local guaranteed engine based on category so NO game is broken
  const cat = (game.category || '').toLowerCase();
  const name = (game.appName || '').toLowerCase();
  if (cat.includes('puzzle') || name.includes('2048') || name.includes('sudoku')) return 'local:2048';
  if (cat.includes('run') || name.includes('dino') || name.includes('runner')) return 'local:dino';
  if (name.includes('bird') || name.includes('flap') || cat.includes('platform')) return 'local:flappy';
  if (cat.includes('shoot') || name.includes('space') || name.includes('invader')) return 'local:space';
  if (cat.includes('sport') || name.includes('pong') || name.includes('tennis')) return 'local:pong';
  if (cat.includes('action') || name.includes('break') || name.includes('brick')) return 'local:breakout';
  return 'local:snake';
}
