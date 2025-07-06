import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppProvider } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { TabManager } from './components/TabManager';
import { ToolContainer } from './components/ToolContainer';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <TabManager />
            <ToolContainer />
          </div>
          <CommandPalette />
        </div>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;