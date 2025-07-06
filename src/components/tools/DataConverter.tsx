import React, { useState, useMemo } from 'react';
import { Copy, RotateCcw, Download, AlertCircle, CheckCircle, ArrowUpDown } from 'lucide-react';
import Papa from 'papaparse';
import { useClipboard } from '../../hooks/useClipboard';

type DataFormat = 'csv' | 'json' | 'xml';

interface ConversionError {
  message: string;
  line?: number;
}

export const DataConverter: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [inputFormat, setInputFormat] = useState<DataFormat>('csv');
  const [outputFormat, setOutputFormat] = useState<DataFormat>('json');
  const [filename, setFilename] = useState('data');
  const [csvOptions, setCsvOptions] = useState({
    delimiter: ',',
    hasHeader: true,
    skipEmptyLines: true
  });
  const [jsonOptions, setJsonOptions] = useState({
    indent: 2,
    sortKeys: false
  });
  const [xmlOptions, setXmlOptions] = useState({
    rootElement: 'root',
    itemElement: 'item',
    indent: 2
  });
  const [error, setError] = useState<ConversionError | null>(null);
  const { copy, copied } = useClipboard();

  const convertedData = useMemo(() => {
    if (!inputData.trim()) return '';
    
    try {
      setError(null);
      
      // Parse input data
      let parsedData: any;
      
      switch (inputFormat) {
        case 'csv':
          const csvResult = Papa.parse(inputData, {
            delimiter: csvOptions.delimiter,
            header: csvOptions.hasHeader,
            skipEmptyLines: csvOptions.skipEmptyLines,
            transformHeader: (header) => header.trim(),
            transform: (value) => value.trim()
          });
          
          if (csvResult.errors.length > 0) {
            throw new Error(`CSV parsing error: ${csvResult.errors[0].message}`);
          }
          
          parsedData = csvResult.data;
          break;
          
        case 'json':
          parsedData = JSON.parse(inputData);
          break;
          
        case 'xml':
          parsedData = parseXmlToJson(inputData);
          break;
          
        default:
          throw new Error('Unsupported input format');
      }
      
      // Convert to output format
      switch (outputFormat) {
        case 'csv':
          return convertToCsv(parsedData);
          
        case 'json':
          return JSON.stringify(parsedData, jsonOptions.sortKeys ? Object.keys(parsedData).sort() : null, jsonOptions.indent);
          
        case 'xml':
          return convertToXml(parsedData, xmlOptions);
          
        default:
          throw new Error('Unsupported output format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown conversion error';
      setError({ message: errorMessage });
      return '';
    }
  }, [inputData, inputFormat, outputFormat, csvOptions, jsonOptions, xmlOptions]);

  const convertToCsv = (data: any): string => {
    if (!Array.isArray(data)) {
      throw new Error('Data must be an array for CSV conversion');
    }
    
    return Papa.unparse(data, {
      delimiter: csvOptions.delimiter,
      header: csvOptions.hasHeader
    });
  };

  const convertToXml = (data: any, options: typeof xmlOptions): string => {
    const escapeXml = (str: string): string => {
      return str.replace(/[<>&'"]/g, (char) => {
        switch (char) {
          case '<': return '&lt;';
          case '>': return '&gt;';
          case '&': return '&amp;';
          case "'": return '&apos;';
          case '"': return '&quot;';
          default: return char;
        }
      });
    };

    const indent = ' '.repeat(options.indent);
    
    const convertValue = (value: any, level: number = 0): string => {
      const currentIndent = indent.repeat(level);
      const nextIndent = indent.repeat(level + 1);
      
      if (Array.isArray(value)) {
        return value.map(item => 
          `${currentIndent}<${options.itemElement}>\n${convertValue(item, level + 1)}\n${currentIndent}</${options.itemElement}>`
        ).join('\n');
      } else if (typeof value === 'object' && value !== null) {
        return Object.entries(value).map(([key, val]) => {
          const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
          if (typeof val === 'object' && val !== null) {
            return `${nextIndent}<${safeKey}>\n${convertValue(val, level + 2)}\n${nextIndent}</${safeKey}>`;
          } else {
            return `${nextIndent}<${safeKey}>${escapeXml(String(val))}</${safeKey}>`;
          }
        }).join('\n');
      } else {
        return `${currentIndent}${escapeXml(String(value))}`;
      }
    };

    return `<?xml version="1.0" encoding="UTF-8"?>\n<${options.rootElement}>\n${convertValue(data, 1)}\n</${options.rootElement}>`;
  };

  const parseXmlToJson = (xmlString: string): any => {
    // Simple XML to JSON parser (for basic XML structures)
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid XML format');
    }
    
    const xmlToJson = (node: Element): any => {
      const result: any = {};
      
      // Handle attributes
      if (node.attributes.length > 0) {
        result['@attributes'] = {};
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          result['@attributes'][attr.name] = attr.value;
        }
      }
      
      // Handle child nodes
      if (node.children.length > 0) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          const childName = child.tagName;
          const childValue = xmlToJson(child);
          
          if (result[childName]) {
            if (!Array.isArray(result[childName])) {
              result[childName] = [result[childName]];
            }
            result[childName].push(childValue);
          } else {
            result[childName] = childValue;
          }
        }
      } else {
        // Handle text content
        const textContent = node.textContent?.trim();
        if (textContent) {
          return textContent;
        }
      }
      
      return Object.keys(result).length > 0 ? result : null;
    };
    
    return xmlToJson(xmlDoc.documentElement);
  };

  const handleSwapFormats = () => {
    const tempFormat = inputFormat;
    setInputFormat(outputFormat);
    setOutputFormat(tempFormat);
    setInputData(convertedData);
  };

  const handleCopyInput = () => copy(inputData);
  const handleCopyOutput = () => copy(convertedData);

  const handleDownload = () => {
    if (!convertedData) return;
    
    const mimeTypes = {
      csv: 'text/csv',
      json: 'application/json',
      xml: 'application/xml'
    };
    
    const blob = new Blob([convertedData], { type: mimeTypes[outputFormat] });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'data'}.${outputFormat}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setInputData('');
    setFilename('data');
    setError(null);
  };

  const loadSampleData = () => {
    const samples = {
      csv: `name,age,city,country
John Doe,30,New York,USA
Jane Smith,25,London,UK
Bob Johnson,35,Toronto,Canada
Alice Brown,28,Sydney,Australia`,
      json: `[
  {
    "name": "John Doe",
    "age": 30,
    "city": "New York",
    "country": "USA"
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "city": "London",
    "country": "UK"
  },
  {
    "name": "Bob Johnson",
    "age": 35,
    "city": "Toronto",
    "country": "Canada"
  }
]`,
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<people>
  <person>
    <name>John Doe</name>
    <age>30</age>
    <city>New York</city>
    <country>USA</country>
  </person>
  <person>
    <name>Jane Smith</name>
    <age>25</age>
    <city>London</city>
    <country>UK</country>
  </person>
</people>`
    };
    
    setInputData(samples[inputFormat]);
  };

  const getFileExtension = (format: DataFormat): string => {
    return format;
  };

  const recordCount = useMemo(() => {
    if (!convertedData) return 0;
    
    try {
      switch (outputFormat) {
        case 'json':
          const jsonData = JSON.parse(convertedData);
          return Array.isArray(jsonData) ? jsonData.length : 1;
        case 'csv':
          return convertedData.split('\n').filter(line => line.trim()).length - (csvOptions.hasHeader ? 1 : 0);
        case 'xml':
          const matches = convertedData.match(/<item>/g);
          return matches ? matches.length : 1;
        default:
          return 0;
      }
    } catch {
      return 0;
    }
  }, [convertedData, outputFormat, csvOptions.hasHeader]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Format Converter</h1>
            <p className="text-gray-600 dark:text-gray-400">Convert between CSV, JSON, and XML formats with validation</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadSampleData}
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
            <button
              onClick={handleDownload}
              disabled={!convertedData}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Format Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversion Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Input Format
                </label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value as DataFormat)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                </select>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleSwapFormats}
                  className="p-3 bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Swap input and output formats"
                >
                  <ArrowUpDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as DataFormat)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                  <option value="xml">XML</option>
                </select>
              </div>
            </div>

            {/* Format-specific options */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CSV Options */}
              {(inputFormat === 'csv' || outputFormat === 'csv') && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">CSV Options</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Delimiter</label>
                      <select
                        value={csvOptions.delimiter}
                        onChange={(e) => setCsvOptions(prev => ({ ...prev, delimiter: e.target.value }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value=",">Comma (,)</option>
                        <option value=";">Semicolon (;)</option>
                        <option value="\t">Tab</option>
                        <option value="|">Pipe (|)</option>
                      </select>
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={csvOptions.hasHeader}
                        onChange={(e) => setCsvOptions(prev => ({ ...prev, hasHeader: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Has Header Row</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={csvOptions.skipEmptyLines}
                        onChange={(e) => setCsvOptions(prev => ({ ...prev, skipEmptyLines: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Skip Empty Lines</span>
                    </label>
                  </div>
                </div>
              )}

              {/* JSON Options */}
              {outputFormat === 'json' && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">JSON Options</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                        Indentation: {jsonOptions.indent} spaces
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        value={jsonOptions.indent}
                        onChange={(e) => setJsonOptions(prev => ({ ...prev, indent: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                    </div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={jsonOptions.sortKeys}
                        onChange={(e) => setJsonOptions(prev => ({ ...prev, sortKeys: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Sort Keys</span>
                    </label>
                  </div>
                </div>
              )}

              {/* XML Options */}
              {outputFormat === 'xml' && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">XML Options</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Root Element</label>
                      <input
                        type="text"
                        value={xmlOptions.rootElement}
                        onChange={(e) => setXmlOptions(prev => ({ ...prev, rootElement: e.target.value }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Item Element</label>
                      <input
                        type="text"
                        value={xmlOptions.itemElement}
                        onChange={(e) => setXmlOptions(prev => ({ ...prev, itemElement: e.target.value }))}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Filename */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Output Filename
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="data"
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <span className="text-gray-500 dark:text-gray-400">.{getFileExtension(outputFormat)}</span>
              </div>
            </div>
          </div>

          {/* Conversion Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Input ({inputFormat.toUpperCase()})
                </h3>
                <button
                  onClick={handleCopyInput}
                  disabled={!inputData}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Copy className="w-4 h-4 mr-1 inline" />
                  Copy
                </button>
              </div>
              <textarea
                value={inputData}
                onChange={(e) => setInputData(e.target.value)}
                placeholder={`Enter your ${inputFormat.toUpperCase()} data here...`}
                className="w-full h-96 p-4 border-none outline-none resize-none bg-transparent text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>

            {/* Output */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Output ({outputFormat.toUpperCase()})
                  </h3>
                  {error ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : convertedData ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : null}
                </div>
                <div className="flex items-center space-x-2">
                  {convertedData && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {recordCount} record{recordCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    onClick={handleCopyOutput}
                    disabled={!convertedData}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1 inline" />
                    Copy
                  </button>
                </div>
              </div>
              <div className="h-96 p-4 overflow-y-auto">
                {error ? (
                  <div className="text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    {error.message}
                  </div>
                ) : convertedData ? (
                  <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                    {convertedData}
                  </pre>
                ) : (
                  <div className="text-gray-500 dark:text-gray-400 italic">
                    Converted data will appear here...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Format Information */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2">
              Supported Formats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-800 dark:text-indigo-200">
              <div>
                <p><strong>CSV:</strong> Comma-separated values with customizable delimiters</p>
                <p>• Supports headers and various separators</p>
                <p>• Handles quoted fields and escaping</p>
              </div>
              <div>
                <p><strong>JSON:</strong> JavaScript Object Notation</p>
                <p>• Arrays and objects supported</p>
                <p>• Configurable indentation and key sorting</p>
              </div>
              <div>
                <p><strong>XML:</strong> Extensible Markup Language</p>
                <p>• Customizable root and item elements</p>
                <p>• Handles attributes and nested structures</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};