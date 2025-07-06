import React from 'react';
import { X, Plus } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export const TabManager: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleTabClick = (tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', tabId });
  };

  const handleTabClose = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'CLOSE_TAB', tabId });
  };

  const handleNewTab = () => {
    dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
  };

  if (state.tabs.length === 0) {
    return (
      <div className="h-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center">
        <button
          onClick={handleNewTab}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Open a tool to get started</span>
        </button>
      </div>
    );
  }

  return (
    <div className="h-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center overflow-x-auto">
      <div className="flex items-center min-w-0">
        {state.tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`group relative flex items-center space-x-2 px-4 py-2 text-sm font-medium border-r border-gray-200 dark:border-gray-700 transition-colors ${
              tab.isActive 
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <span className="truncate max-w-32">{tab.title}</span>
            {tab.hasUnsavedChanges && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
            <button
              onClick={(e) => handleTabClose(tab.id, e)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        ))}
      </div>
      
      <button
        onClick={handleNewTab}
        className="flex items-center justify-center w-10 h-10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};