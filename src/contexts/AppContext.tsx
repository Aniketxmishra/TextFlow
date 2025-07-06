import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Tool, Tab, ToolHistory, AppSettings } from '../types/tools';
import { toolsData } from '../data/toolsData';

interface AppState {
  tools: Tool[];
  tabs: Tab[];
  activeTabId: string | null;
  commandPaletteOpen: boolean;
  sidebarCollapsed: boolean;
  history: ToolHistory[];
  settings: AppSettings;
}

type AppAction = 
  | { type: 'TOGGLE_COMMAND_PALETTE' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'OPEN_TOOL'; toolId: string }
  | { type: 'CLOSE_TAB'; tabId: string }
  | { type: 'SET_ACTIVE_TAB'; tabId: string }
  | { type: 'ADD_TO_HISTORY'; toolId: string; data: any }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> }
  | { type: 'LOAD_SETTINGS'; settings: AppSettings };

const initialState: AppState = {
  tools: toolsData,
  tabs: [],
  activeTabId: null,
  commandPaletteOpen: false,
  sidebarCollapsed: false,
  history: [],
  settings: {
    theme: 'system',
    sidebarCollapsed: false,
    favoriteTools: [],
    recentTools: []
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'TOGGLE_COMMAND_PALETTE':
      return { ...state, commandPaletteOpen: !state.commandPaletteOpen };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    
    case 'OPEN_TOOL': {
      const tool = state.tools.find(t => t.id === action.toolId);
      if (!tool) return state;
      
      const existingTab = state.tabs.find(t => t.toolId === action.toolId);
      if (existingTab) {
        return { ...state, activeTabId: existingTab.id };
      }
      
      const newTab: Tab = {
        id: `tab-${Date.now()}-${Math.random()}`,
        toolId: action.toolId,
        title: tool.name,
        isActive: true
      };
      
      return {
        ...state,
        tabs: [...state.tabs.map(t => ({ ...t, isActive: false })), newTab],
        activeTabId: newTab.id
      };
    }
    
    case 'CLOSE_TAB': {
      const remainingTabs = state.tabs.filter(t => t.id !== action.tabId);
      let newActiveTabId = state.activeTabId;
      
      if (state.activeTabId === action.tabId) {
        newActiveTabId = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null;
      }
      
      return {
        ...state,
        tabs: remainingTabs,
        activeTabId: newActiveTabId
      };
    }
    
    case 'SET_ACTIVE_TAB':
      return {
        ...state,
        tabs: state.tabs.map(t => ({ ...t, isActive: t.id === action.tabId })),
        activeTabId: action.tabId
      };
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        history: [
          { toolId: action.toolId, timestamp: Date.now(), data: action.data },
          ...state.history.slice(0, 99)
        ]
      };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings }
      };
    
    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: action.settings
      };
    
    default:
      return state;
  }
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedSettings = localStorage.getItem('textflow-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'LOAD_SETTINGS', settings });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('textflow-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};