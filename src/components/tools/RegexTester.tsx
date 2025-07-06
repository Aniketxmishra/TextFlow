import React, { useState, useEffect, useMemo } from 'react';
import { Copy, RotateCcw, AlertCircle, CheckCircle, Hash } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface Match {
  match: string;
  index: number;
  groups: string[];
  namedGroups?: Record<string, string>;
}

interface RegexFlags {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  dotAll: boolean;
  unicode: boolean;
  sticky: boolean;
}

const samplePatterns = [
  { name: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: 'Matches email addresses' },
  { name: 'Phone Number (US)', pattern: '\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})', description: 'Matches US phone numbers' },
  { name: 'URL', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', description: 'Matches HTTP/HTTPS URLs' },
  { name: 'IPv4 Address', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', description: 'Matches IPv4 addresses' },
  { name: 'Date (MM/DD/YYYY)', pattern: '\\b(0?[1-9]|1[0-2])\\/(0?[1-9]|[12][0-9]|3[01])\\/(19|20)\\d\\d\\b', description: 'Matches dates in MM/DD/YYYY format' },
  { name: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', description: 'Matches hex color codes' },
  { name: 'Credit Card', pattern: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\\b', description: 'Matches major credit card formats' },
  { name: 'HTML Tag', pattern: '<\\/?([a-zA-Z][a-zA-Z0-9]*)(\\s[^>]*)?>', description: 'Matches HTML tags' },
  { name: 'Word Boundaries', pattern: '\\b\\w+\\b', description: 'Matches whole words' },
  { name: 'Digits Only', pattern: '\\d+', description: 'Matches sequences of digits' }
];

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [flags, setFlags] = useState<RegexFlags>({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  });
  const [error, setError] = useState('');
  const { copy, copied } = useClipboard();

  const regex = useMemo(() => {
    if (!pattern) return null;
    
    try {
      const flagString = Object.entries(flags)
        .filter(([_, enabled]) => enabled)
        .map(([flag]) => {
          switch (flag) {
            case 'global': return 'g';
            case 'ignoreCase': return 'i';
            case 'multiline': return 'm';
            case 'dotAll': return 's';
            case 'unicode': return 'u';
            case 'sticky': return 'y';
            default: return '';
          }
        })
        .join('');
      
      const regexObj = new RegExp(pattern, flagString);
      setError('');
      return regexObj;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid regex pattern');
      return null;
    }
  }, [pattern, flags]);

  const matches = useMemo(() => {
    if (!regex || !testText) return [];
    
    const results: Match[] = [];
    let match;
    
    if (flags.global) {
      while ((match = regex.exec(testText)) !== null) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups
        });
        
        // Prevent infinite loop on zero-length matches
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      match = regex.exec(testText);
      if (match) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups
        });
      }
    }
    
    return results;
  }, [regex, testText, flags.global]);

  const highlightedText = useMemo(() => {
    if (!testText || matches.length === 0) return testText;
    
    const parts = [];
    let lastIndex = 0;
    
    matches.forEach((match, matchIndex) => {
      // Add text before match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {testText.slice(lastIndex, match.index)}
          </span>
        );
      }
      
      // Add highlighted match
      const colorClass = `bg-yellow-200 dark:bg-yellow-800 border-l-4 border-yellow-500`;
      parts.push(
        <span
          key={`match-${matchIndex}`}
          className={colorClass}
          title={`Match ${matchIndex + 1}: "${match.match}"`}
        >
          {match.match}
        </span>
      );
      
      lastIndex = match.index + match.match.length;
    });
    
    // Add remaining text
    if (lastIndex < testText.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {testText.slice(lastIndex)}
        </span>
      );
    }
    
    return parts;
  }, [testText, matches]);

  const handleFlagToggle = (flag: keyof RegexFlags) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleSampleSelect = (samplePattern: string) => {
    setPattern(samplePattern);
  };

  const handleCopyPattern = () => {
    copy(pattern);
  };

  const handleCopyMatches = () => {
    const matchText = matches.map((match, index) => 
      `Match ${index + 1}: "${match.match}" at position ${match.index}`
    ).join('\n');
    copy(matchText);
  };

  const handleClear = () => {
    setPattern('');
    setTestText('');
    setError('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Regex Tester</h1>
            <p className="text-gray-600 dark:text-gray-400">Test and debug regular expressions with real-time matching</p>
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
              onClick={handleCopyPattern}
              disabled={!pattern}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Copy className="w-4 h-4 mr-2 inline" />
              {copied ? 'Copied!' : 'Copy Pattern'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Pattern Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Regular Expression</h3>
            
            {/* Sample Patterns */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Samples
              </label>
              <select
                onChange={(e) => handleSampleSelect(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value=""
              >
                <option value="">Select a sample pattern...</option>
                {samplePatterns.map((sample, index) => (
                  <option key={index} value={sample.pattern}>
                    {sample.name} - {sample.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Pattern Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pattern
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="Enter your regex pattern..."
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono ${
                    error ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {error ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : pattern && regex ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : null}
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            {/* Flags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Flags
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(flags).map(([flag, enabled]) => (
                  <button
                    key={flag}
                    onClick={() => handleFlagToggle(flag as keyof RegexFlags)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      enabled
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    title={getFlagDescription(flag)}
                  >
                    {getFlagLabel(flag)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Text and Results */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Test Text */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Text</h3>
                <textarea
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  placeholder="Enter text to test against your regex pattern..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none mb-4"
                />
                
                {/* Highlighted Results */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Highlighted Matches
                  </h4>
                  <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-32 font-mono text-sm whitespace-pre-wrap">
                    {testText ? highlightedText : (
                      <span className="text-gray-500 dark:text-gray-400">
                        Matches will be highlighted here...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="space-y-6">
              {/* Match Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <Hash className="w-5 h-5 inline mr-2" />
                  Match Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Matches:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{matches.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pattern Valid:</span>
                    <span className={`font-medium ${regex ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {regex ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {matches.length > 0 && (
                    <button
                      onClick={handleCopyMatches}
                      className="w-full mt-3 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1 inline" />
                      Copy Matches
                    </button>
                  )}
                </div>
              </div>

              {/* Match Details */}
              {matches.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Match Details</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {matches.map((match, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            Match {index + 1}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Position {match.index}
                          </span>
                        </div>
                        <div className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border">
                          "{match.match}"
                        </div>
                        {match.groups.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Groups:</span>
                            <div className="mt-1 space-y-1">
                              {match.groups.map((group, groupIndex) => (
                                <div key={groupIndex} className="text-xs">
                                  <span className="text-gray-500 dark:text-gray-400">Group {groupIndex + 1}:</span>
                                  <span className="ml-2 font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">
                                    "{group || '(empty)'}"
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {match.namedGroups && Object.keys(match.namedGroups).length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Named Groups:</span>
                            <div className="mt-1 space-y-1">
                              {Object.entries(match.namedGroups).map(([name, value]) => (
                                <div key={name} className="text-xs">
                                  <span className="text-gray-500 dark:text-gray-400">{name}:</span>
                                  <span className="ml-2 font-mono bg-purple-100 dark:bg-purple-900 px-1 rounded">
                                    "{value}"
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2">
              Regex Quick Reference
            </h3>
            <div className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">.</code> - Matches any character except newline</p>
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">*</code> - Matches 0 or more of the preceding element</p>
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">+</code> - Matches 1 or more of the preceding element</p>
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">?</code> - Matches 0 or 1 of the preceding element</p>
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">\d</code> - Matches any digit (0-9)</p>
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">\w</code> - Matches any word character (a-z, A-Z, 0-9, _)</p>
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">\s</code> - Matches any whitespace character</p>
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">^</code> - Matches start of string</p>
              <p>• <code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">$</code> - Matches end of string</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function getFlagLabel(flag: string): string {
  switch (flag) {
    case 'global': return 'g';
    case 'ignoreCase': return 'i';
    case 'multiline': return 'm';
    case 'dotAll': return 's';
    case 'unicode': return 'u';
    case 'sticky': return 'y';
    default: return flag;
  }
}

function getFlagDescription(flag: string): string {
  switch (flag) {
    case 'global': return 'Global - Find all matches rather than stopping after the first match';
    case 'ignoreCase': return 'Ignore Case - Case insensitive matching';
    case 'multiline': return 'Multiline - ^ and $ match start/end of line, not just start/end of string';
    case 'dotAll': return 'Dot All - . matches newline characters';
    case 'unicode': return 'Unicode - Enable full unicode matching';
    case 'sticky': return 'Sticky - Matches only from the index indicated by lastIndex';
    default: return flag;
  }
}