import React, { useState, useEffect } from 'react';
import { Copy, RotateCcw, Key } from 'lucide-react';
import { generateHash } from '../../utils/crypto';
import { useClipboard } from '../../hooks/useClipboard';

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256';

export const HashGenerator: React.FC = () => {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>({
    'MD5': '',
    'SHA-1': '',
    'SHA-256': ''
  });
  const { copy, copied } = useClipboard();

  useEffect(() => {
    if (input.trim()) {
      generateAllHashes(input);
    } else {
      setHashes({ 'MD5': '', 'SHA-1': '', 'SHA-256': '' });
    }
  }, [input]);

  const generateAllHashes = async (text: string) => {
    const newHashes: Record<HashAlgorithm, string> = {
      'MD5': '',
      'SHA-1': '',
      'SHA-256': ''
    };

    try {
      const algorithms: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256'];
      await Promise.all(
        algorithms.map(async (algo) => {
          try {
            newHashes[algo] = await generateHash(text, algo);
          } catch (error) {
            newHashes[algo] = 'Error generating hash';
          }
        })
      );
      setHashes(newHashes);
    } catch (error) {
      console.error('Error generating hashes:', error);
    }
  };

  const handleCopy = (hash: string) => {
    copy(hash);
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hash Generator</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate MD5, SHA-1, and SHA-256 hashes</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Text to Hash
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to generate hashes..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          {/* Hash Results */}
          <div className="space-y-4">
            {Object.entries(hashes).map(([algo, hash]) => (
              <div key={algo} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{algo}</span>
                  </div>
                  {hash && (
                    <button
                      onClick={() => handleCopy(hash)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1 inline" />
                      Copy
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 font-mono text-sm">
                  {hash || (
                    <span className="text-gray-500 dark:text-gray-400">
                      Hash will appear here when you enter text
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-2">
              Hash Algorithm Information
            </h3>
            <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <p><strong>MD5:</strong> 128-bit hash (32 hex characters) - Fast but not cryptographically secure</p>
              <p><strong>SHA-1:</strong> 160-bit hash (40 hex characters) - Deprecated for security applications</p>
              <p><strong>SHA-256:</strong> 256-bit hash (64 hex characters) - Secure and recommended for most uses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};