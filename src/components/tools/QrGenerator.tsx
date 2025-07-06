import React, { useState } from 'react';
import { Copy, RotateCcw, Download } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

export const QrGenerator: React.FC = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(200);
  const [errorLevel, setErrorLevel] = useState('M');
  const { copy, copied } = useClipboard();

  const qrCodeUrl = text
    ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&ecc=${errorLevel}`
    : '';

  const handleCopy = () => {
    copy(text);
  };

  const handleClear = () => {
    setText('');
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code Generator</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate QR codes for text, URLs, and more</p>
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
              onClick={handleDownload}
              disabled={!qrCodeUrl}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Download
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Text or URL
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text, URL, or any data to generate QR code..."
                  className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value={150}>150x150</option>
                    <option value={200}>200x200</option>
                    <option value={300}>300x300</option>
                    <option value={400}>400x400</option>
                    <option value={500}>500x500</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Error Correction
                  </label>
                  <select
                    value={errorLevel}
                    onChange={(e) => setErrorLevel(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </div>
              </div>

              {text && (
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Input Data
                    </span>
                    <button
                      onClick={handleCopy}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1 inline" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 font-mono text-sm text-gray-900 dark:text-white break-all">
                    {text}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code Display */}
            <div className="flex flex-col items-center justify-center">
              {qrCodeUrl ? (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <img
                      src={qrCodeUrl}
                      alt="Generated QR Code"
                      className="max-w-full h-auto"
                      style={{ width: size, height: size }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Size: {size}x{size} pixels
                    </p>
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2 inline" />
                        Download PNG
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-48 h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-sm">QR Code Preview</p>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter text above to generate QR code
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