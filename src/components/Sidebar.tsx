import React from 'react';
import { 
  Type, Hash, Search, GitCompare, Braces, Binary, Key, QrCode, 
  Shield, FileText, Palette, Calculator, DollarSign, Clock, 
  Percent, Receipt, Menu, X, Star, History, Settings, Moon, Sun
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { ToolCategory } from '../types/tools';

const iconMap: Record<string, React.ComponentType<any>> = {
  Type, Hash, Search, GitCompare, Braces, Binary, Key, QrCode,
  Shield, FileText, Palette, Calculator, DollarSign, Clock,
  Percent, Receipt, Menu, X, Star, History, Settings, Moon, Sun
};

const categoryConfig: Record<ToolCategory, { label: string; icon: string; color: string }> = {
  text: { label: 'Text Tools', icon: 'Type', color: 'text-blue-600 dark:text-blue-400' },
  developer: { label: 'Developer', icon: 'Braces', color: 'text-emerald-600 dark:text-emerald-400' },
  generator: { label: 'Generators', icon: 'Shield', color: 'text-purple-600 dark:text-purple-400' },
  converter: { label: 'Converters', icon: 'Calculator', color: 'text-orange-600 dark:text-orange-400' },
  calculator: { label: 'Calculators', icon: 'Percent', color: 'text-rose-600 dark:text-rose-400' }
};

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useApp();
  const { theme, setTheme, isDark } = useTheme();
  
  const groupedTools = state.tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, typeof state.tools>);

  const handleToolClick = (toolId: string) => {
    dispatch({ type: 'OPEN_TOOL', toolId });
  };

  const toggleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <div className={`h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
      state.sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!state.sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Type className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TextFlow Pro</span>
            </div>
          )}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {state.sidebarCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {Object.entries(groupedTools).map(([category, tools]) => {
            const config = categoryConfig[category as ToolCategory];
            const CategoryIcon = iconMap[config.icon];
            
            return (
              <div key={category}>
                {!state.sidebarCollapsed && (
                  <div className="flex items-center space-x-2 mb-3">
                    <CategoryIcon className={`w-5 h-5 ${config.color}`} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {config.label}
                    </span>
                  </div>
                )}
                
                <div className="space-y-1">
                  {tools.map((tool) => {
                    const ToolIcon = iconMap[tool.icon];
                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleToolClick(tool.id)}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                        title={state.sidebarCollapsed ? tool.name : ''}
                      >
                        <ToolIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                        {!state.sidebarCollapsed && (
                          <div className="flex-1 text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {tool.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {tool.description}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} theme`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {!state.sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <History className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};