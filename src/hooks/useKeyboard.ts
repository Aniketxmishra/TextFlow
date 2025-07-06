import { useEffect } from 'react';

export const useKeyboard = (key: string, callback: () => void, deps: any[] = []) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, deps);
};

export const useKeyboardShortcut = (
  keys: string[],
  callback: () => void,
  deps: any[] = []
) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys = [];
      if (event.ctrlKey) pressedKeys.push('ctrl');
      if (event.shiftKey) pressedKeys.push('shift');
      if (event.altKey) pressedKeys.push('alt');
      if (event.metaKey) pressedKeys.push('meta');
      
      const key = event.key.toLowerCase();
      if (!['control', 'shift', 'alt', 'meta'].includes(key)) {
        pressedKeys.push(key);
      }

      const keysMatch = keys.every(k => pressedKeys.includes(k.toLowerCase()));
      if (keysMatch && pressedKeys.length === keys.length) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, deps);
};