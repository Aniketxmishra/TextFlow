import React, { useState } from 'react';
import { Copy, RotateCcw, ArrowUpDown } from 'lucide-react';
import { encodeBase64, decodeBase64, isValidBase64 } from '../../utils/crypto';
import { useClipboard } from '../../hooks/useClipboard';

export const Base64Encoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const { copy, copied } = useClipboard();

  const processText = (text: string) => {
    if (mode === 'encode') {
      return encodeBase64(text);
    } else {
      return decodeBase64(text);
    }
  };

  const output = processText(input);
  const isValidInput = mode === 'decode' ? isValidBase64(input) : true;

  const handleCopy = () => {
    copy(output);
  };

  const handleClear = () => {
    setInput('');
  };

  const switchMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Base64 Encoder/Decoder</h1>
            <p className="text-gray-600 dark:text-gray-400">Encode and decode Base64 strings</p>
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
              disabled={!output}
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
          {/* Mode Switch */}
          <div className="flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setMode('encode')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'encode'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Encode
              </button>
              <button
                onClick={switchMode}
                className="px-2 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'decode'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Decode
              </button>
            </div>
          </div>

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base64 string to decode...'}
              className={`w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                mode === 'decode' && input && !isValidInput
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {mode === 'decode' && input && !isValidInput && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Invalid Base64 string
              </p>
            )}
          </div>

          {/* Output */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === 'encode' ? 'Encoded Base64' : 'Decoded Text'}
            </label>
            <div className="relative">
              <textarea
                value={output}
                readOnly
                className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white resize-none font-mono text-sm"
              />
              {output && (
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              About Base64 Encoding
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format. 
              It's commonly used for encoding data in email, web applications, and other contexts where binary data 
              needs to be transmitted over text-based protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};