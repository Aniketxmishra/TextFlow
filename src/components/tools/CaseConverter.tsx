import React, { useState } from 'react';
import { Copy, RotateCcw } from 'lucide-react';
import { convertCase } from '../../utils/textProcessing';
import { useClipboard } from '../../hooks/useClipboard';

const caseTypes = [
  { id: 'uppercase', label: 'UPPERCASE' },
  { id: 'lowercase', label: 'lowercase' },
  { id: 'title', label: 'Title Case' },
  { id: 'sentence', label: 'Sentence case' },
  { id: 'camel', label: 'camelCase' },
  { id: 'pascal', label: 'PascalCase' },
  { id: 'snake', label: 'snake_case' },
  { id: 'kebab', label: 'kebab-case' }
];

export const CaseConverter: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedCase, setSelectedCase] = useState('uppercase');
  const { copy, copied } = useClipboard();

  const convertedText = convertCase(text, selectedCase);

  const handleCopy = () => {
    copy(convertedText);
  };

  const handleClear = () => {
    setText('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Case Converter</h1>
            <p className="text-gray-600 dark:text-gray-400">Convert text between different cases</p>
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
              disabled={!convertedText}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4 mr-2 inline" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Input Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to convert..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Case Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Case Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {caseTypes.map((caseType) => (
                <button
                  key={caseType.id}
                  onClick={() => setSelectedCase(caseType.id)}
                  className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                    selectedCase === caseType.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {caseType.label}
                </button>
              ))}
            </div>
          </div>

          {/* Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Converted Text
            </label>
            <div className="relative">
              <textarea
                value={convertedText}
                readOnly
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              />
              {convertedText && (
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};