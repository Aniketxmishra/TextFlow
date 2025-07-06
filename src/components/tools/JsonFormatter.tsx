import React, { useState } from 'react';
import { Copy, RotateCcw, Check, X } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

export const JsonFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [formatted, setFormatted] = useState('');
  const [error, setError] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const { copy, copied } = useClipboard();

  const formatJson = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, indentSize);
      setFormatted(formatted);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
      setFormatted('');
    }
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      formatJson(value);
    } else {
      setFormatted('');
      setError('');
    }
  };

  const handleCopy = () => {
    copy(formatted);
  };

  const handleClear = () => {
    setInput('');
    setFormatted('');
    setError('');
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setFormatted(minified);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const isValid = !error && input.trim() && formatted;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">JSON Formatter</h1>
            <p className="text-gray-600 dark:text-gray-400">Format, validate, and minify JSON data</p>
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
              disabled={!formatted}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4 mr-2 inline" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Controls */}
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Indent Size:
                </label>
                <select
                  value={indentSize}
                  onChange={(e) => {
                    const size = parseInt(e.target.value);
                    setIndentSize(size);
                    if (input.trim()) {
                      formatJson(input);
                    }
                  }}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={2}>2 spaces</option>
                  <option value={4}>4 spaces</option>
                  <option value={8}>8 spaces</option>
                </select>
              </div>
              
              <button
                onClick={minifyJson}
                disabled={!input.trim()}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Minify
              </button>
            </div>

            <div className="flex items-center space-x-2">
              {isValid && (
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <Check className="w-4 h-4 mr-1" />
                  <span className="text-sm">Valid JSON</span>
                </div>
              )}
              {error && (
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <X className="w-4 h-4 mr-1" />
                  <span className="text-sm">Invalid JSON</span>
                </div>
              )}
            </div>
          </div>

          {/* Input/Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Input JSON
              </label>
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Paste your JSON here..."
                className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
              />
            </div>

            {/* Output */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formatted JSON
              </label>
              <div className="relative">
                <textarea
                  value={formatted}
                  readOnly
                  className={`w-full h-96 p-3 border rounded-lg font-mono text-sm resize-none ${
                    error
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                  } text-gray-900 dark:text-white`}
                />
                {formatted && (
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
              {error && (
                <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-600 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};