import React, { useState, useMemo } from 'react';
import { Copy, RotateCcw, ArrowUpDown, AlertCircle, CheckCircle } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

type EncodingType = 'base64' | 'url' | 'html' | 'unicode' | 'hex' | 'binary' | 'utf8';

interface EncodingOption {
  id: EncodingType;
  name: string;
  description: string;
}

const encodingOptions: EncodingOption[] = [
  { id: 'base64', name: 'Base64', description: 'Binary-to-text encoding scheme' },
  { id: 'url', name: 'URL Encoding', description: 'Percent-encoding for URLs' },
  { id: 'html', name: 'HTML Entities', description: 'HTML character entities' },
  { id: 'unicode', name: 'Unicode Escape', description: 'Unicode escape sequences' },
  { id: 'hex', name: 'Hexadecimal', description: 'Hexadecimal representation' },
  { id: 'binary', name: 'Binary', description: 'Binary representation' },
  { id: 'utf8', name: 'UTF-8 Bytes', description: 'UTF-8 byte representation' }
];

export const EncodingConverter: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [inputEncoding, setInputEncoding] = useState<EncodingType>('utf8');
  const [outputEncoding, setOutputEncoding] = useState<EncodingType>('base64');
  const [error, setError] = useState<string>('');
  const { copy, copied } = useClipboard();

  const convertedText = useMemo(() => {
    if (!inputText.trim()) return '';
    
    try {
      setError('');
      
      // First decode from input encoding to UTF-8
      let decodedText: string;
      
      switch (inputEncoding) {
        case 'utf8':
          decodedText = inputText;
          break;
        case 'base64':
          decodedText = decodeBase64(inputText);
          break;
        case 'url':
          decodedText = decodeURIComponent(inputText);
          break;
        case 'html':
          decodedText = decodeHtmlEntities(inputText);
          break;
        case 'unicode':
          decodedText = decodeUnicodeEscape(inputText);
          break;
        case 'hex':
          decodedText = decodeHex(inputText);
          break;
        case 'binary':
          decodedText = decodeBinary(inputText);
          break;
        default:
          throw new Error('Unsupported input encoding');
      }
      
      // Then encode to output encoding
      switch (outputEncoding) {
        case 'utf8':
          return decodedText;
        case 'base64':
          return encodeBase64(decodedText);
        case 'url':
          return encodeURIComponent(decodedText);
        case 'html':
          return encodeHtmlEntities(decodedText);
        case 'unicode':
          return encodeUnicodeEscape(decodedText);
        case 'hex':
          return encodeHex(decodedText);
        case 'binary':
          return encodeBinary(decodedText);
        default:
          throw new Error('Unsupported output encoding');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion error';
      setError(errorMessage);
      return '';
    }
  }, [inputText, inputEncoding, outputEncoding]);

  // Encoding functions
  const encodeBase64 = (text: string): string => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      throw new Error('Invalid characters for Base64 encoding');
    }
  };

  const decodeBase64 = (text: string): string => {
    try {
      return decodeURIComponent(escape(atob(text.replace(/\s/g, ''))));
    } catch (error) {
      throw new Error('Invalid Base64 string');
    }
  };

  const encodeHtmlEntities = (text: string): string => {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    
    return text.replace(/[&<>"'\/]/g, (char) => entityMap[char]);
  };

  const decodeHtmlEntities = (text: string): string => {
    const entityMap: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x2F;': '/',
      '&nbsp;': ' '
    };
    
    return text.replace(/&[#\w]+;/g, (entity) => {
      if (entityMap[entity]) {
        return entityMap[entity];
      }
      
      // Handle numeric entities
      if (entity.startsWith('&#x')) {
        const hex = entity.slice(3, -1);
        const code = parseInt(hex, 16);
        return String.fromCharCode(code);
      } else if (entity.startsWith('&#')) {
        const decimal = entity.slice(2, -1);
        const code = parseInt(decimal, 10);
        return String.fromCharCode(code);
      }
      
      return entity;
    });
  };

  const encodeUnicodeEscape = (text: string): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code > 127) {
        return '\\u' + code.toString(16).padStart(4, '0');
      }
      return char;
    }).join('');
  };

  const decodeUnicodeEscape = (text: string): string => {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });
  };

  const encodeHex = (text: string): string => {
    return Array.from(new TextEncoder().encode(text))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(' ');
  };

  const decodeHex = (text: string): string => {
    const hexBytes = text.replace(/\s/g, '').match(/.{1,2}/g);
    if (!hexBytes) throw new Error('Invalid hex string');
    
    const bytes = hexBytes.map(hex => {
      const byte = parseInt(hex, 16);
      if (isNaN(byte)) throw new Error('Invalid hex character');
      return byte;
    });
    
    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  const encodeBinary = (text: string): string => {
    return Array.from(new TextEncoder().encode(text))
      .map(byte => byte.toString(2).padStart(8, '0'))
      .join(' ');
  };

  const decodeBinary = (text: string): string => {
    const binaryBytes = text.replace(/\s/g, '').match(/.{1,8}/g);
    if (!binaryBytes) throw new Error('Invalid binary string');
    
    const bytes = binaryBytes.map(binary => {
      const byte = parseInt(binary, 2);
      if (isNaN(byte)) throw new Error('Invalid binary character');
      return byte;
    });
    
    return new TextDecoder().decode(new Uint8Array(bytes));
  };

  const handleSwapEncodings = () => {
    const tempEncoding = inputEncoding;
    setInputEncoding(outputEncoding);
    setOutputEncoding(tempEncoding);
    setInputText(convertedText);
  };

  const handleCopyInput = () => copy(inputText);
  const handleCopyOutput = () => copy(convertedText);

  const handleClear = () => {
    setInputText('');
    setError('');
  };

  const loadSample = () => {
    const samples = {
      utf8: 'Hello, World! 🌍 This is a sample text with émojis and spëcial characters.',
      base64: 'SGVsbG8sIFdvcmxkISA=',
      url: 'Hello%2C%20World%21%20%F0%9F%8C%8D',
      html: 'Hello, World! &lt;script&gt;alert(&quot;test&quot;);&lt;/script&gt;',
      unicode: 'Hello, World! \\u1F30D',
      hex: '48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21',
      binary: '01001000 01100101 01101100 01101100 01101111'
    };
    
    setInputText(samples[inputEncoding]);
  };

  const getEncodingInfo = (encoding: EncodingType): string => {
    const info = {
      utf8: 'Standard Unicode text encoding',
      base64: 'Binary-to-text encoding using 64 characters',
      url: 'Percent-encoding for safe URL transmission',
      html: 'HTML character entity encoding',
      unicode: 'Unicode escape sequences (\\uXXXX)',
      hex: 'Hexadecimal byte representation',
      binary: 'Binary byte representation (8-bit)'
    };
    
    return info[encoding];
  };

  const inputLength = inputText.length;
  const outputLength = convertedText.length;
  const compressionRatio = inputLength > 0 ? (outputLength / inputLength).toFixed(2) : '0';

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Text Encoding Converter</h1>
            <p className="text-gray-600 dark:text-gray-400">Convert between different text encodings and formats</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadSample}
              className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Load Sample
            </button>
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
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Encoding Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Encoding Conversion</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Encoding
                </label>
                <select
                  value={inputEncoding}
                  onChange={(e) => setInputEncoding(e.target.value as EncodingType)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {encodingOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {getEncodingInfo(inputEncoding)}
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwapEncodings}
                  className="p-3 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Swap input and output encodings"
                >
                  <ArrowUpDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Output Encoding
                </label>
                <select
                  value={outputEncoding}
                  onChange={(e) => setOutputEncoding(e.target.value as EncodingType)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {encodingOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {getEncodingInfo(outputEncoding)}
                </p>
              </div>
            </div>
          </div>

          {/* Conversion Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Input ({encodingOptions.find(o => o.id === inputEncoding)?.name})
                  </h3>
                  {inputText && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {inputLength} chars
                  </span>
                  <button
                    onClick={handleCopyInput}
                    disabled={!inputText}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1 inline" />
                    Copy
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Enter text in ${encodingOptions.find(o => o.id === inputEncoding)?.name} format...`}
                className="w-full h-96 p-4 border-none outline-none resize-none bg-transparent text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>

            {/* Output */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Output ({encodingOptions.find(o => o.id === outputEncoding)?.name})
                  </h3>
                  {error ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : convertedText ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : null}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {outputLength} chars
                  </span>
                  <button
                    onClick={handleCopyOutput}
                    disabled={!convertedText}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1 inline" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="h-96 p-4 overflow-y-auto">
                {error ? (
                  <div className="text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    {error}
                  </div>
                ) : convertedText ? (
                  <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap break-all">
                    {convertedText}
                  </pre>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 italic">
                    Converted text will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          {inputText && convertedText && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversion Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inputLength}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Input Length</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{outputLength}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Output Length</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{compressionRatio}x</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Size Ratio</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${outputLength > inputLength ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {outputLength > inputLength ? '+' : ''}{((outputLength - inputLength) / inputLength * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Size Change</div>
                </div>
              </div>
            </div>
          )}

          {/* Encoding Reference */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Encoding Reference</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {encodingOptions.map((option) => (
                <div key={option.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{option.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{option.description}</p>
                  <div className="text-xs font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
                    {option.id === 'utf8' && 'Hello, World!'}
                    {option.id === 'base64' && 'SGVsbG8sIFdvcmxkIQ=='}
                    {option.id === 'url' && 'Hello%2C%20World%21'}
                    {option.id === 'html' && 'Hello, World!'}
                    {option.id === 'unicode' && 'Hello, World!'}
                    {option.id === 'hex' && '48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21'}
                    {option.id === 'binary' && '01001000 01100101 01101100...'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-300 mb-2">
              Encoding Tips
            </h3>
            <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
              <li>• Base64 is commonly used for encoding binary data in text formats</li>
              <li>• URL encoding is essential for safely transmitting data in URLs</li>
              <li>• HTML entities prevent XSS attacks and display special characters</li>
              <li>• Unicode escapes allow representing any character in ASCII-safe format</li>
              <li>• Hex and binary representations are useful for debugging and analysis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};