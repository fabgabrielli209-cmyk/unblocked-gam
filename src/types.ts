export interface GameItem {
  appName: string;
  desc: string;
  icon: string;
  url: string | string[];
  category: string;
  disabled?: boolean;
  local?: boolean;
}

export interface AppItem {
  appName: string;
  desc: string;
  icon: string;
  url: string;
  disabled?: boolean;
}

export interface ThemeValue {
  theme: string;
  type: string;
  settingsContainerColor: string;
  navItemActive: string;
  settingsSearchBar: string;
  settingsPanelItemBackgroundColor: string;
  settingsDropdownColor: string;
  siteTextColor: string;
  bgDesignColor: string;
  glowWrapperColor: string;
  switchColor: string;
  switchEnabledColor: string;
  bgColor: string;
  quickModalBgColor: string;
  paginationTextColor: string;
  paginationBorderColor: string;
  paginationBgColor: string;
  paginationSelectedColor: string;
  themeName: string;
  tabColor: string;
  tabOutline: string;
  barColor: string;
  tabBarColor: string;
  omninputColor: string;
  menuColor: string;
}

export interface ThemeItem {
  option: string;
  value: ThemeValue;
}

export interface CloakItem {
  option: string;
  value: {
    tabName: string;
    tabIcon: string;
  };
}

export interface SearchEngineItem {
  option: string;
  value: {
    engineName: string;
    engine: string;
    engineIcon?: string;
  };
}

export interface QuickShortcut {
  name: string;
  icon: string;
  link: string;
}

export interface UserSettings {
  theme: string;
  cloak: string;
  customTitle: string;
  customFavicon: string;
  panicKey: string;
  panicUrl: string;
  searchEngine: string;
  backgroundPattern: 'dots' | 'stripes' | 'grid' | 'none';
  navScale: number;
  itemsPerPage: number;
  arcadeScanlines: boolean;
  arcadeBezel: boolean;
  firstVisitDisguise?: boolean;
}
