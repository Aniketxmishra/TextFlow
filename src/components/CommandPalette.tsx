import React, { useState, useEffect, useRef } from 'react';
import { Search, Command } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useKeyboard } from '../hooks/useKeyboard';

export const CommandPalette: React.FC = () => {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredTools = state.tools.filter(tool =>
    tool.name.toLowerCase().includes(query.toLowerCase()) ||
    tool.description.toLowerCase().includes(query.toLowerCase()) ||
    tool.category.toLowerCase().includes(query.toLowerCase())
  );

  useKeyboard('k', () => {
    dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
  }, [dispatch]);

  useEffect(() => {
    if (state.commandPaletteOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state.commandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredTools.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredTools.length) % filteredTools.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredTools[selectedIndex]) {
          dispatch({ type: 'OPEN_TOOL', toolId: filteredTools[selectedIndex].id });
          dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
          setQuery('');
        }
        break;
      case 'Escape':
        dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
        setQuery('');
        break;
    }
  };

  const handleToolSelect = (toolId: string) => {
    dispatch({ type: 'OPEN_TOOL', toolId });
    dispatch({ type: 'TOGGLE_COMMAND_PALETTE' });
    setQuery('');
  };

  if (!state.commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-[10vh] z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-lg text-gray-900 dark:text-white placeholder-gray-500"
          />
          <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
              <Command className="w-3 h-3" />
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">K</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {filteredTools.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              No tools found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {filteredTools.map((tool, index) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">{tool.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{tool.description}</div>
                  </div>
                  {tool.shortcut && (
                    <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
                      {tool.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};