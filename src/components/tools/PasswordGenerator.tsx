import React, { useState } from 'react';
import { Copy, RotateCcw, RefreshCw } from 'lucide-react';
import { generatePassword } from '../../utils/textProcessing';
import { useClipboard } from '../../hooks/useClipboard';

export const PasswordGenerator: React.FC = () => {
  const [options, setOptions] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false
  });
  const [password, setPassword] = useState('');
  const { copy, copied } = useClipboard();

  const generateNewPassword = () => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
  };

  const handleCopy = () => {
    copy(password);
  };

  const handleClear = () => {
    setPassword('');
  };

  const updateOption = (key: keyof typeof options, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const getStrengthLevel = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLevel = getStrengthLevel(password);
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strengthLevel];
  const strengthColor = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600', 'text-green-700'][strengthLevel];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Password Generator</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate secure passwords with customizable options</p>
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
              disabled={!password}
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
          {/* Password Display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Generated Password
              </label>
              <button
                onClick={generateNewPassword}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Generate
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                value={password}
                readOnly
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-lg"
                placeholder="Click 'Generate' to create a password"
              />
              {password && (
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {password && (
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Strength:</span>
                  <span className={`font-medium ${strengthColor}`}>
                    {strengthText}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Length: {password.length}
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Options</h3>
            
            <div className="space-y-4">
              {/* Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Length: {options.length}
                </label>
                <input
                  type="range"
                  min="4"
                  max="128"
                  value={options.length}
                  onChange={(e) => updateOption('length', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>4</span>
                  <span>128</span>
                </div>
              </div>

              {/* Character Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeUppercase}
                    onChange={(e) => updateOption('includeUppercase', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Uppercase Letters (A-Z)
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeLowercase}
                    onChange={(e) => updateOption('includeLowercase', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Lowercase Letters (a-z)
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeNumbers}
                    onChange={(e) => updateOption('includeNumbers', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Numbers (0-9)
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeSymbols}
                    onChange={(e) => updateOption('includeSymbols', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Symbols (!@#$%^&*)
                  </span>
                </label>

                <label className="flex items-center space-x-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={(e) => updateOption('excludeSimilar', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Exclude Similar Characters (i, l, 1, L, o, 0, O)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Password Security Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use at least 12 characters for better security</li>
              <li>• Include a mix of uppercase, lowercase, numbers, and symbols</li>
              <li>• Don't use personal information or common words</li>
              <li>• Use a unique password for each account</li>
              <li>• Consider using a password manager</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};