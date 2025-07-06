import { Tool } from '../types/tools';

export const toolsData: Tool[] = [
  // Text Tools
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between different cases',
    category: 'text',
    icon: 'Type',
    shortcut: 'C'
  },
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, characters, and lines',
    category: 'text',
    icon: 'Hash',
    shortcut: 'W'
  },
  {
    id: 'find-replace',
    name: 'Find & Replace',
    description: 'Find and replace text with regex support',
    category: 'text',
    icon: 'Search',
    shortcut: 'F'
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two texts and highlight differences',
    category: 'text',
    icon: 'GitCompare',
    shortcut: 'D'
  },

  // Developer Tools
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format and validate JSON data',
    category: 'developer',
    icon: 'Braces',
    shortcut: 'J'
  },
  {
    id: 'base64-encoder',
    name: 'Base64 Encoder',
    description: 'Encode and decode Base64 strings',
    category: 'developer',
    icon: 'Binary',
    shortcut: 'B'
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA1, SHA256 hashes',
    category: 'developer',
    icon: 'Key',
    shortcut: 'H'
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions',
    category: 'developer',
    icon: 'Search',
    shortcut: 'R'
  },

  // Generators
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'Generate QR codes for text or URLs',
    category: 'generator',
    icon: 'QrCode',
    shortcut: 'Q'
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure passwords',
    category: 'generator',
    icon: 'Shield',
    shortcut: 'P'
  },
  {
    id: 'lorem-generator',
    name: 'Lorem Ipsum',
    description: 'Generate placeholder text',
    category: 'generator',
    icon: 'FileText',
    shortcut: 'L'
  },
  {
    id: 'color-palette',
    name: 'Color Palette',
    description: 'Generate color palettes and schemes',
    category: 'generator',
    icon: 'Palette',
    shortcut: 'O'
  },

  // Converters
  // Document Processors
  {
    id: 'text-to-pdf',
    name: 'Text to PDF',
    description: 'Convert text to PDF with styling options',
    category: 'converter',
    icon: 'FileText',
    shortcut: 'X'
  },
  {
    id: 'markdown-converter',
    name: 'Markdown to HTML',
    description: 'Convert Markdown to HTML with live preview',
    category: 'converter',
    icon: 'FileText',
    shortcut: 'K'
  },
  {
    id: 'data-converter',
    name: 'Data Format Converter',
    description: 'Convert between CSV, JSON, and XML formats',
    category: 'converter',
    icon: 'FileText',
    shortcut: 'V'
  },
  {
    id: 'file-extractor',
    name: 'File Text Extractor',
    description: 'Extract text content from uploaded files',
    category: 'converter',
    icon: 'FileText',
    shortcut: 'Z'
  },
  {
    id: 'text-merger',
    name: 'Text File Merger',
    description: 'Merge multiple text files with formatting',
    category: 'converter',
    icon: 'FileText',
    shortcut: 'G'
  },
  {
    id: 'encoding-converter',
    name: 'Text Encoding Converter',
    description: 'Convert between text encodings',
    category: 'converter',
    icon: 'Binary',
    shortcut: 'N'
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert between different units',
    category: 'converter',
    icon: 'Calculator',
    shortcut: 'U'
  },
  {
    id: 'currency-converter',
    name: 'Currency Converter',
    description: 'Convert between currencies',
    category: 'converter',
    icon: 'DollarSign',
    shortcut: 'M'
  },
  {
    id: 'timezone-converter',
    name: 'Timezone Converter',
    description: 'Convert time between timezones',
    category: 'converter',
    icon: 'Clock',
    shortcut: 'T'
  },

  // Calculators
  {
    id: 'percentage-calc',
    name: 'Percentage Calculator',
    description: 'Calculate percentages and ratios',
    category: 'calculator',
    icon: 'Percent',
    shortcut: 'E'
  },
  {
    id: 'tip-calculator',
    name: 'Tip Calculator',
    description: 'Calculate tips and split bills',
    category: 'calculator',
    icon: 'Receipt',
    shortcut: 'I'
  },
  {
    id: 'basic-calculator',
    name: 'Basic Calculator',
    description: 'Basic arithmetic operations',
    category: 'calculator',
    icon: 'Calculator',
    shortcut: 'A'
  }
];