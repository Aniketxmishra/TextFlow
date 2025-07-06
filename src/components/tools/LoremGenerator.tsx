import React, { useState } from 'react';
import { Copy, RotateCcw, RefreshCw } from 'lucide-react';
import { generateLoremIpsum } from '../../utils/textProcessing';
import { useClipboard } from '../../hooks/useClipboard';

export const LoremGenerator: React.FC = () => {
  const [paragraphs, setParagraphs] = useState(3);
  const [wordsPerParagraph, setWordsPerParagraph] = useState(50);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [text, setText] = useState('');
  const { copy, copied } = useClipboard();

  const generateText = () => {
    const generated = generateLoremIpsum(paragraphs, wordsPerParagraph);
    setText(generated);
  };

  const handleCopy = () => {
    copy(text);
  };

  const handleClear = () => {
    setText('');
  };

  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lorem Ipsum Generator</h1>
            <p className="text-gray-600 dark:text-gray-400">Generate placeholder text for your designs</p>
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
              disabled={!text}
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
          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generation Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Number of Paragraphs: {paragraphs}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={paragraphs}
                  onChange={(e) => setParagraphs(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Words per Paragraph: {wordsPerParagraph}
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={wordsPerParagraph}
                  onChange={(e) => setWordsPerParagraph(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>10</span>
                  <span>100</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Start with "Lorem ipsum dolor sit amet..."
                </span>
              </label>

              <button
                onClick={generateText}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2 inline" />
                Generate Text
              </button>
            </div>
          </div>

          {/* Generated Text */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Text</h3>
                {text && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Words: {wordCount}</span>
                    <span>Characters: {charCount}</span>
                    <span>Chars (no spaces): {charCountNoSpaces}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4">
              {text ? (
                <div className="relative">
                  <div className="prose dark:prose-invert max-w-none">
                    {text.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-lg mb-2">No text generated yet</p>
                    <p className="text-sm">Click "Generate Text" to create Lorem Ipsum placeholder text</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
              About Lorem Ipsum
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. It has been the 
              industry's standard dummy text ever since the 1500s, when an unknown printer took a galley 
              of type and scrambled it to make a type specimen book. It's perfect for mockups, designs, 
              and when you need placeholder text that doesn't distract from the visual elements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};