import React from 'react';
import { useApp } from '../contexts/AppContext';
import { CaseConverter } from './tools/CaseConverter';
import { WordCounter } from './tools/WordCounter';
import { FindReplace } from './tools/FindReplace';
import { JsonFormatter } from './tools/JsonFormatter';
import { Base64Encoder } from './tools/Base64Encoder';
import { HashGenerator } from './tools/HashGenerator';
import { QrGenerator } from './tools/QrGenerator';
import { PasswordGenerator } from './tools/PasswordGenerator';
import { LoremGenerator } from './tools/LoremGenerator';
import { ColorPalette } from './tools/ColorPalette';
import { UnitConverter } from './tools/UnitConverter';
import { TipCalculator } from './tools/TipCalculator';
import { PercentageCalculator } from './tools/PercentageCalculator';
import { BasicCalculator } from './tools/BasicCalculator';
import { RegexTester } from './tools/RegexTester';
import { TextToPdf } from './tools/TextToPdf';
import { MarkdownConverter } from './tools/MarkdownConverter';
import { DataConverter } from './tools/DataConverter';
import { FileExtractor } from './tools/FileExtractor';
import { TextMerger } from './tools/TextMerger';
import { EncodingConverter } from './tools/EncodingConverter';

const toolComponents: Record<string, React.ComponentType> = {
  'case-converter': CaseConverter,
  'word-counter': WordCounter,
  'find-replace': FindReplace,
  'json-formatter': JsonFormatter,
  'base64-encoder': Base64Encoder,
  'hash-generator': HashGenerator,
  'qr-generator': QrGenerator,
  'password-generator': PasswordGenerator,
  'lorem-generator': LoremGenerator,
  'color-palette': ColorPalette,
  'unit-converter': UnitConverter,
  'tip-calculator': TipCalculator,
  'percentage-calc': PercentageCalculator,
  'basic-calculator': BasicCalculator,
  'regex-tester': RegexTester,
  'text-to-pdf': TextToPdf,
  'markdown-converter': MarkdownConverter,
  'data-converter': DataConverter,
  'file-extractor': FileExtractor,
  'text-merger': TextMerger,
  'encoding-converter': EncodingConverter,
};

export const ToolContainer: React.FC = () => {
  const { state } = useApp();
  
  const activeTab = state.tabs.find(tab => tab.isActive);
  
  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-6xl mb-4">⚡</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to TextFlow Pro
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your comprehensive text processing and utility hub
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+K</kbd> to open the command palette
          </div>
        </div>
      </div>
    );
  }

  const ToolComponent = toolComponents[activeTab.toolId];
  
  if (!ToolComponent) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Tool Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested tool is not available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <ToolComponent />
    </div>
  );
};