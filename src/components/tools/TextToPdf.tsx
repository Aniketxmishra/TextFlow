import React, { useState } from 'react';
import { Copy, RotateCcw, Download, FileText, Settings } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useClipboard } from '../../hooks/useClipboard';

interface PdfOptions {
  fontSize: number;
  fontFamily: 'helvetica' | 'times' | 'courier';
  lineHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  pageSize: 'a4' | 'letter' | 'legal';
  orientation: 'portrait' | 'landscape';
  includeHeader: boolean;
  headerText: string;
  includeFooter: boolean;
  footerText: string;
  includePageNumbers: boolean;
}

export const TextToPdf: React.FC = () => {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('document');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState<PdfOptions>({
    fontSize: 12,
    fontFamily: 'helvetica',
    lineHeight: 1.5,
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
    pageSize: 'a4',
    orientation: 'portrait',
    includeHeader: false,
    headerText: '',
    includeFooter: false,
    footerText: '',
    includePageNumbers: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { copy, copied } = useClipboard();

  const generatePdf = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: options.orientation,
        unit: 'mm',
        format: options.pageSize
      });

      // Set font
      doc.setFont(options.fontFamily);
      doc.setFontSize(options.fontSize);

      // Get page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const textWidth = pageWidth - options.margins.left - options.margins.right;
      const textHeight = pageHeight - options.margins.top - options.margins.bottom;

      // Add header if enabled
      if (options.includeHeader && options.headerText) {
        doc.setFontSize(options.fontSize + 2);
        doc.text(options.headerText, options.margins.left, options.margins.top - 10);
        doc.setFontSize(options.fontSize);
      }

      // Split text into lines that fit the page width
      const lines = doc.splitTextToSize(text, textWidth);
      const lineHeight = options.fontSize * options.lineHeight * 0.352778; // Convert to mm

      let currentY = options.margins.top;
      let pageNumber = 1;

      for (let i = 0; i < lines.length; i++) {
        // Check if we need a new page
        if (currentY + lineHeight > pageHeight - options.margins.bottom) {
          // Add page number to current page
          if (options.includePageNumbers) {
            doc.setFontSize(10);
            doc.text(
              `Page ${pageNumber}`,
              pageWidth / 2,
              pageHeight - 10,
              { align: 'center' }
            );
            doc.setFontSize(options.fontSize);
          }

          // Add footer to current page
          if (options.includeFooter && options.footerText) {
            doc.setFontSize(options.fontSize - 2);
            doc.text(options.footerText, options.margins.left, pageHeight - 5);
            doc.setFontSize(options.fontSize);
          }

          doc.addPage();
          pageNumber++;
          currentY = options.margins.top;

          // Add header to new page
          if (options.includeHeader && options.headerText) {
            doc.setFontSize(options.fontSize + 2);
            doc.text(options.headerText, options.margins.left, options.margins.top - 10);
            doc.setFontSize(options.fontSize);
          }
        }

        doc.text(lines[i], options.margins.left, currentY);
        currentY += lineHeight;
      }

      // Add page number to last page
      if (options.includePageNumbers) {
        doc.setFontSize(10);
        doc.text(
          `Page ${pageNumber}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Add footer to last page
      if (options.includeFooter && options.footerText) {
        doc.setFontSize(options.fontSize - 2);
        doc.text(options.footerText, options.margins.left, pageHeight - 5);
      }

      // Download the PDF
      doc.save(`${filename || 'document'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    copy(text);
  };

  const handleClear = () => {
    setText('');
    setFilename('document');
  };

  const updateOption = <K extends keyof PdfOptions>(key: K, value: PdfOptions[K]) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const updateMargin = (side: keyof PdfOptions['margins'], value: number) => {
    setOptions(prev => ({
      ...prev,
      margins: { ...prev.margins, [side]: value }
    }));
  };

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  const estimatedPages = Math.ceil(text.length / 2000); // Rough estimate

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Text to PDF Generator</h1>
            <p className="text-gray-600 dark:text-gray-400">Convert text to PDF with custom styling options</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showOptions 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 mr-2 inline" />
              Options
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2 inline" />
              Clear
            </button>
            <button
              onClick={generatePdf}
              disabled={!text.trim() || isGenerating}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              {isGenerating ? 'Generating...' : 'Generate PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* PDF Options */}
          {showOptions && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">PDF Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Basic Settings</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Size: {options.fontSize}px
                    </label>
                    <input
                      type="range"
                      min="8"
                      max="24"
                      value={options.fontSize}
                      onChange={(e) => updateOption('fontSize', parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Font Family
                    </label>
                    <select
                      value={options.fontFamily}
                      onChange={(e) => updateOption('fontFamily', e.target.value as PdfOptions['fontFamily'])}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="helvetica">Helvetica</option>
                      <option value="times">Times</option>
                      <option value="courier">Courier</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Line Height: {options.lineHeight}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={options.lineHeight}
                      onChange={(e) => updateOption('lineHeight', parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Page Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Page Settings</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Page Size
                    </label>
                    <select
                      value={options.pageSize}
                      onChange={(e) => updateOption('pageSize', e.target.value as PdfOptions['pageSize'])}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Orientation
                    </label>
                    <select
                      value={options.orientation}
                      onChange={(e) => updateOption('orientation', e.target.value as PdfOptions['orientation'])}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.includePageNumbers}
                        onChange={(e) => updateOption('includePageNumbers', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Include Page Numbers</span>
                    </label>
                  </div>
                </div>

                {/* Margins */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Margins (mm)</h4>
                  
                  {Object.entries(options.margins).map(([side, value]) => (
                    <div key={side}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {side.charAt(0).toUpperCase() + side.slice(1)}: {value}mm
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={value}
                        onChange={(e) => updateMargin(side as keyof PdfOptions['margins'], parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Header/Footer */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={options.includeHeader}
                      onChange={(e) => updateOption('includeHeader', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Include Header</span>
                  </label>
                  {options.includeHeader && (
                    <input
                      type="text"
                      value={options.headerText}
                      onChange={(e) => updateOption('headerText', e.target.value)}
                      placeholder="Header text..."
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={options.includeFooter}
                      onChange={(e) => updateOption('includeFooter', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Include Footer</span>
                  </label>
                  {options.includeFooter && (
                    <input
                      type="text"
                      value={options.footerText}
                      onChange={(e) => updateOption('footerText', e.target.value)}
                      placeholder="Footer text..."
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Text Input */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Text Content</h3>
                  <button
                    onClick={handleCopy}
                    disabled={!text}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1 inline" />
                    Copy
                  </button>
                </div>
                
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter the text content for your PDF document..."
                  className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    placeholder="document"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    File will be saved as "{filename || 'document'}.pdf"
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics and Preview */}
            <div className="space-y-6">
              {/* Document Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  <FileText className="w-5 h-5 inline mr-2" />
                  Document Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Words:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{wordCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Characters:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{charCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Estimated Pages:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{estimatedPages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Font:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{options.fontFamily} {options.fontSize}px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Page Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{options.pageSize.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
                <div 
                  className="border border-gray-300 dark:border-gray-600 rounded p-4 bg-white dark:bg-gray-900 min-h-48 max-h-64 overflow-y-auto"
                  style={{
                    fontFamily: options.fontFamily === 'helvetica' ? 'Arial, sans-serif' : 
                               options.fontFamily === 'times' ? 'Times, serif' : 
                               'Courier, monospace',
                    fontSize: `${Math.max(10, options.fontSize - 2)}px`,
                    lineHeight: options.lineHeight
                  }}
                >
                  {options.includeHeader && options.headerText && (
                    <div className="font-bold mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
                      {options.headerText}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap">
                    {text || (
                      <span className="text-gray-500 dark:text-gray-400 italic">
                        Your text content will appear here...
                      </span>
                    )}
                  </div>
                  {options.includeFooter && options.footerText && (
                    <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-600 text-sm">
                      {options.footerText}
                    </div>
                  )}
                  {options.includePageNumbers && (
                    <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                      Page 1
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              PDF Generation Tips
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Use appropriate margins for better readability (20mm recommended)</li>
              <li>• Choose font sizes between 10-14px for optimal reading experience</li>
              <li>• Line height of 1.4-1.6 improves text readability</li>
              <li>• Headers and footers appear on every page when enabled</li>
              <li>• Large documents may take a moment to generate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};