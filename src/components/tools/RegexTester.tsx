import React, { useState, useEffect, useMemo } from 'react';
import { Copy, RotateCcw, AlertCircle, CheckCircle, Hash, Replace, Info, Zap } from 'lucide-react';
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

interface PatternSample {
  name: string;
  pattern: string;
  description: string;
  sampleText: string;
  replacement?: string;
}

const samplePatterns: PatternSample[] = [
  {
    name: 'Email Address',
    pattern: '([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})',
    description: 'Matches email addresses with capture groups for username, domain, and TLD',
    sampleText: 'Contact us at support@example.com or sales@company.org for more information. You can also reach admin@test.co.uk',
    replacement: 'Email: $1 at domain $2.$3'
  },
  {
    name: 'Phone Number (US)',
    pattern: '\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})',
    description: 'Matches US phone numbers with area code, exchange, and number groups',
    sampleText: 'Call us at (555) 123-4567 or 555.987.6543. Emergency: 911, Office: 555-555-0123',
    replacement: '($1) $2-$3'
  },
  {
    name: 'URL/Website',
    pattern: '(https?):\\/\\/(www\\.)?([a-zA-Z0-9.-]+)\\.([a-zA-Z]{2,})([\\/\\w\\.-]*)*\\/?',
    description: 'Matches HTTP/HTTPS URLs with protocol, subdomain, domain, TLD, and path groups',
    sampleText: 'Visit https://www.example.com/page or http://subdomain.test.org/path/to/resource for more info',
    replacement: 'Link: $3.$4 (protocol: $1)'
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    description: 'Matches IPv4 addresses with validation for each octet',
    sampleText: 'Server IPs: 192.168.1.1, 10.0.0.1, 172.16.254.1, and invalid: 999.999.999.999',
    replacement: 'IP: $1.$2.$3.$4'
  },
  {
    name: 'Date (MM/DD/YYYY)',
    pattern: '\\b(0?[1-9]|1[0-2])\\/(0?[1-9]|[12][0-9]|3[01])\\/(19|20)(\\d\\d)\\b',
    description: 'Matches dates in MM/DD/YYYY format with month, day, century, and year groups',
    sampleText: 'Important dates: 12/25/2023, 1/1/2024, 07/04/1776, and invalid: 13/32/2023',
    replacement: '$1/$2/$3$4 (Month: $1, Day: $2, Year: $3$4)'
  },
  {
    name: 'Date (YYYY-MM-DD)',
    pattern: '\\b(19|20)(\\d\\d)-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])\\b',
    description: 'Matches ISO date format with century, year, month, and day groups',
    sampleText: 'ISO dates: 2023-12-25, 2024-01-01, 1776-07-04, and invalid: 2023-13-32',
    replacement: '$1$2-$3-$4 (Year: $1$2, Month: $3, Day: $4)'
  },
  {
    name: 'Hex Color Code',
    pattern: '#([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})|#([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])',
    description: 'Matches hex color codes in both 6-digit and 3-digit formats',
    sampleText: 'Colors: #FF5733, #3498db, #2ecc71, #f39c12, #9b59b6, short: #f00, #0f0, #00f',
    replacement: 'Color: R=$1$4, G=$2$5, B=$3$6'
  },
  {
    name: 'Credit Card Number',
    pattern: '\\b(4[0-9]{3}|5[1-5][0-9]{2}|3[47][0-9]{2})([\\s-]?)([0-9]{4})\\2([0-9]{4})\\2([0-9]{4})\\b',
    description: 'Matches major credit card formats (Visa, MasterCard, Amex) with grouping',
    sampleText: 'Cards: 4532-1234-5678-9012, 5555 5555 5555 4444, 378282246310005, invalid: 1234-5678-9012-3456',
    replacement: 'Card: ****-****-****-$5 (Type: $1)'
  },
  {
    name: 'HTML Tag',
    pattern: '<\\/?([a-zA-Z][a-zA-Z0-9]*)(\\s[^>]*)?>',
    description: 'Matches HTML tags with tag name and attributes groups',
    sampleText: '<div class="container"><p id="text">Hello <strong>world</strong>!</p></div><br/><img src="image.jpg" alt="test">',
    replacement: 'Tag: $1 with attributes: $2'
  },
  {
    name: 'Social Security Number',
    pattern: '\\b([0-9]{3})-?([0-9]{2})-?([0-9]{4})\\b',
    description: 'Matches SSN format with area, group, and serial number groups',
    sampleText: 'SSNs: 123-45-6789, 987654321, 555-12-3456 (test numbers only)',
    replacement: '***-**-$3'
  },
  {
    name: 'Time (12-hour)',
    pattern: '\\b(1[0-2]|0?[1-9]):([0-5][0-9])\\s?(AM|PM|am|pm)\\b',
    description: 'Matches 12-hour time format with hour, minute, and AM/PM groups',
    sampleText: 'Meeting times: 9:30 AM, 2:45 PM, 11:59 pm, 12:00 AM, invalid: 13:30 PM',
    replacement: '$1:$2 $3 (Hour: $1, Minute: $2, Period: $3)'
  },
  {
    name: 'MAC Address',
    pattern: '\\b([0-9A-Fa-f]{2})[:-]([0-9A-Fa-f]{2})[:-]([0-9A-Fa-f]{2})[:-]([0-9A-Fa-f]{2})[:-]([0-9A-Fa-f]{2})[:-]([0-9A-Fa-f]{2})\\b',
    description: 'Matches MAC addresses with each octet as a separate group',
    sampleText: 'Network devices: 00:1B:44:11:3A:B7, AA-BB-CC-DD-EE-FF, 12:34:56:78:9A:BC',
    replacement: '$1:$2:$3:$4:$5:$6'
  }
];

const groupColors = [
  'bg-red-200 dark:bg-red-800 border-red-500',
  'bg-blue-200 dark:bg-blue-800 border-blue-500',
  'bg-green-200 dark:bg-green-800 border-green-500',
  'bg-purple-200 dark:bg-purple-800 border-purple-500',
  'bg-orange-200 dark:bg-orange-800 border-orange-500',
  'bg-pink-200 dark:bg-pink-800 border-pink-500',
  'bg-indigo-200 dark:bg-indigo-800 border-indigo-500',
  'bg-teal-200 dark:bg-teal-800 border-teal-500'
];

export const RegexTester: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [testText, setTestText] = useState('');
  const [replacement, setReplacement] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [flags, setFlags] = useState<RegexFlags>({
    global: true,
    ignoreCase: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  });
  const [error, setError] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
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
    const regexCopy = new RegExp(regex.source, regex.flags);
    
    if (flags.global) {
      while ((match = regexCopy.exec(testText)) !== null) {
        results.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups
        });
        
        if (match.index === regexCopy.lastIndex) {
          regexCopy.lastIndex++;
        }
      }
    } else {
      match = regexCopy.exec(testText);
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

  const replacedText = useMemo(() => {
    if (!regex || !testText || !replacement) return '';
    
    try {
      return testText.replace(regex, replacement);
    } catch (err) {
      return 'Error in replacement string';
    }
  }, [regex, testText, replacement]);

  const highlightedText = useMemo(() => {
    if (!testText || matches.length === 0) return testText;
    
    const parts = [];
    let lastIndex = 0;
    
    matches.forEach((match, matchIndex) => {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {testText.slice(lastIndex, match.index)}
          </span>
        );
      }
      
      // Highlight the full match
      parts.push(
        <span
          key={`match-${matchIndex}`}
          className="bg-yellow-200 dark:bg-yellow-800 border-l-4 border-yellow-500 relative"
          title={`Match ${matchIndex + 1}: "${match.match}"`}
        >
          {match.match}
        </span>
      );
      
      lastIndex = match.index + match.match.length;
    });
    
    if (lastIndex < testText.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {testText.slice(lastIndex)}
        </span>
      );
    }
    
    return parts;
  }, [testText, matches]);

  const explainPattern = (pattern: string): string[] => {
    const explanations = [];
    
    if (pattern.includes('\\d')) explanations.push('\\d matches any digit (0-9)');
    if (pattern.includes('\\w')) explanations.push('\\w matches any word character (a-z, A-Z, 0-9, _)');
    if (pattern.includes('\\s')) explanations.push('\\s matches any whitespace character');
    if (pattern.includes('^')) explanations.push('^ matches the start of the string');
    if (pattern.includes('$')) explanations.push('$ matches the end of the string');
    if (pattern.includes('*')) explanations.push('* matches 0 or more of the preceding element');
    if (pattern.includes('+')) explanations.push('+ matches 1 or more of the preceding element');
    if (pattern.includes('?')) explanations.push('? matches 0 or 1 of the preceding element');
    if (pattern.includes('.')) explanations.push('. matches any character except newline');
    if (pattern.includes('|')) explanations.push('| acts as OR operator');
    if (pattern.includes('\\b')) explanations.push('\\b matches word boundaries');
    if (pattern.includes('[')) explanations.push('[] defines a character class');
    if (pattern.includes('(')) explanations.push('() creates capture groups');
    if (pattern.includes('{')) explanations.push('{} specifies exact repetition counts');
    
    return explanations;
  };

  const handleFlagToggle = (flag: keyof RegexFlags) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleSampleSelect = (sample: PatternSample) => {
    setPattern(sample.pattern);
    setTestText(sample.sampleText);
    if (sample.replacement) {
      setReplacement(sample.replacement);
      setShowReplace(true);
    }
  };

  const handleQuickInsert = (patternPart: string) => {
    setPattern(prev => prev + patternPart);
  };

  const handleCopyPattern = () => copy(pattern);
  const handleCopyMatches = () => {
    const matchText = matches.map((match, index) => 
      `Match ${index + 1}: "${match.match}" at position ${match.index}`
    ).join('\n');
    copy(matchText);
  };
  const handleCopyReplaced = () => copy(replacedText);

  const handleClear = () => {
    setPattern('');
    setTestText('');
    setReplacement('');
    setError('');
    setShowReplace(false);
  };

  const quickPatterns = [
    { label: '\\d', desc: 'Digit' },
    { label: '\\w', desc: 'Word char' },
    { label: '\\s', desc: 'Whitespace' },
    { label: '.', desc: 'Any char' },
    { label: '*', desc: '0 or more' },
    { label: '+', desc: '1 or more' },
    { label: '?', desc: '0 or 1' },
    { label: '^', desc: 'Start' },
    { label: '$', desc: 'End' },
    { label: '\\b', desc: 'Word boundary' },
    { label: '[a-z]', desc: 'Lowercase' },
    { label: '[A-Z]', desc: 'Uppercase' },
    { label: '[0-9]', desc: 'Digits' },
    { label: '()', desc: 'Group' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Regex Tester</h1>
            <p className="text-gray-600 dark:text-gray-400">Test, debug, and replace with regular expressions</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowReplace(!showReplace)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showReplace 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Replace className="w-4 h-4 mr-2 inline" />
              Replace
            </button>
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
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Pattern Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Regular Expression</h3>
            
            {/* Sample Patterns */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sample Patterns with Test Data
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {samplePatterns.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleSelect(sample)}
                    className="p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{sample.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sample.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Insert Buttons */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Insert
              </label>
              <div className="flex flex-wrap gap-2">
                {quickPatterns.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickInsert(item.label)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                    title={item.desc}
                  >
                    <code className="font-mono">{item.label}</code>
                  </button>
                ))}
              </div>
            </div>

            {/* Pattern Input */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pattern
                </label>
                <button
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  <Info className="w-4 h-4 inline mr-1" />
                  {showExplanation ? 'Hide' : 'Explain'}
                </button>
              </div>
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
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
              
              {/* Pattern Explanation */}
              {showExplanation && pattern && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Pattern Explanation:</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    {explainPattern(pattern).map((explanation, index) => (
                      <li key={index}>• {explanation}</li>
                    ))}
                  </ul>
                </div>
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

          {/* Replace Section */}
          {showReplace && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <Replace className="w-5 h-5 inline mr-2" />
                Find & Replace
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Replacement String
                  </label>
                  <input
                    type="text"
                    value={replacement}
                    onChange={(e) => setReplacement(e.target.value)}
                    placeholder="Use $1, $2, etc. for capture groups"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use $1, $2, etc. to reference capture groups
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Replacement Preview
                    </label>
                    {replacedText && (
                      <button
                        onClick={handleCopyReplaced}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                      >
                        <Copy className="w-4 h-4 inline mr-1" />
                        Copy
                      </button>
                    )}
                  </div>
                  <div className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 min-h-12 font-mono text-sm">
                    {replacedText || (
                      <span className="text-gray-500 dark:text-gray-400">
                        Replacement result will appear here...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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

              {/* Capture Groups Table */}
              {matches.length > 0 && matches.some(m => m.groups.length > 0) && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capture Groups</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 text-gray-600 dark:text-gray-400">Match</th>
                          {matches[0]?.groups.map((_, index) => (
                            <th key={index} className="text-left py-2 text-gray-600 dark:text-gray-400">
                              Group {index + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {matches.map((match, matchIndex) => (
                          <tr key={matchIndex} className="border-b border-gray-100 dark:border-gray-700">
                            <td className="py-2 font-medium">{matchIndex + 1}</td>
                            {match.groups.map((group, groupIndex) => (
                              <td key={groupIndex} className="py-2">
                                <span className={`px-2 py-1 rounded text-xs font-mono border-l-2 ${groupColors[groupIndex % groupColors.length]}`}>
                                  {group || '(empty)'}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
                                  <span className={`ml-2 px-2 py-1 rounded font-mono text-xs border-l-2 ${groupColors[groupIndex % groupColors.length]}`}>
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
              <Zap className="w-4 h-4 inline mr-1" />
              Regex Quick Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-indigo-800 dark:text-indigo-200">
              <div>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">.</code> - Any character except newline</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">*</code> - 0 or more repetitions</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">+</code> - 1 or more repetitions</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">?</code> - 0 or 1 repetition</p>
              </div>
              <div>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">\d</code> - Any digit (0-9)</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">\w</code> - Word character (a-z, A-Z, 0-9, _)</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">\s</code> - Whitespace character</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">\b</code> - Word boundary</p>
              </div>
              <div>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">^</code> - Start of string</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">$</code> - End of string</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">()</code> - Capture group</p>
                <p><code className="bg-indigo-100 dark:bg-indigo-800 px-1 rounded">[]</code> - Character class</p>
              </div>
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