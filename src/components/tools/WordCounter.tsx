import React, { useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { countWords } from '../../utils/textProcessing';
import { useClipboard } from '../../hooks/useClipboard';

export const WordCounter: React.FC = () => {
  const [text, setText] = useState('');
  const { copy, copied } = useClipboard();

  const stats = countWords(text);

  const handleCopy = () => {
    const statsText = `Words: ${stats.words}\nCharacters: ${stats.characters}\nCharacters (no spaces): ${stats.charactersNoSpaces}\nLines: ${stats.lines}\nParagraphs: ${stats.paragraphs}`;
    copy(statsText);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Word Counter</h1>
            <p className="text-gray-600 dark:text-gray-400">Count words, characters, and lines in your text</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Clear
            </button>
            <button
              onClick={handleCopy}
              disabled={!text}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4 mr-2 inline" />
              {copied ? 'Copied!' : 'Copy Stats'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text to Analyze
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter or paste your text here..."
              className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.words.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Words</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.characters.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.charactersNoSpaces.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Chars (no spaces)</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {stats.lines.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lines</div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {stats.paragraphs.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Paragraphs</div>
            </div>
          </div>

          {/* Additional Stats */}
          {text && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Additional Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Average words per sentence:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {stats.words > 0 ? Math.round((stats.words / Math.max(text.split(/[.!?]+/).length - 1, 1)) * 100) / 100 : 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Average characters per word:</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {stats.words > 0 ? Math.round((stats.charactersNoSpaces / stats.words) * 100) / 100 : 0}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Reading time (avg):</span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {Math.ceil(stats.words / 200)} min
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};