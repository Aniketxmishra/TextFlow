export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  shortcut?: string;
}

export type ToolCategory = 'text' | 'developer' | 'generator' | 'converter' | 'calculator';

export interface Tab {
  id: string;
  toolId: string;
  title: string;
  isActive: boolean;
  hasUnsavedChanges?: boolean;
}

export interface ToolHistory {
  toolId: string;
  timestamp: number;
  data: any;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  favoriteTools: string[];
  recentTools: string[];
}