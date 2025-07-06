import React, { useState, useMemo } from 'react';
import { Copy, RotateCcw, Download, Eye, Code, FileText } from 'lucide-react';
import { marked } from 'marked';
import { useClipboard } from '../../hooks/useClipboard';

export const MarkdownConverter: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [filename, setFilename] = useState('document');
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'code'>('split');
  const { copy, copied } = useClipboard();

  // Configure marked options
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  const html = useMemo(() => {
    if (!markdown.trim()) return '';
    try {
      return marked(markdown);
    } catch (error) {
      console.error('Markdown parsing error:', error);
      return '<p style="color: red;">Error parsing markdown</p>';
    }
  }, [markdown]);

  const handleCopyMarkdown = () => copy(markdown);
  const handleCopyHtml = () => copy(html);

  const handleDownloadHtml = () => {
    if (!html) return;
    
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename || 'Document'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
        }
        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 10px; }
        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 8px; }
        h3 { font-size: 1.25em; }
        p { margin-bottom: 16px; }
        code {
            background-color: #f6f8fa;
            border-radius: 3px;
            font-size: 85%;
            margin: 0;
            padding: 0.2em 0.4em;
        }
        pre {
            background-color: #f6f8fa;
            border-radius: 6px;
            font-size: 85%;
            line-height: 1.45;
            overflow: auto;
            padding: 16px;
        }
        pre code {
            background-color: transparent;
            border: 0;
            display: inline;
            line-height: inherit;
            margin: 0;
            max-width: auto;
            overflow: visible;
            padding: 0;
            word-wrap: normal;
        }
        blockquote {
            border-left: 4px solid #dfe2e5;
            margin: 0;
            padding: 0 16px;
            color: #6a737d;
        }
        table {
            border-collapse: collapse;
            border-spacing: 0;
            width: 100%;
            margin-bottom: 16px;
        }
        table th, table td {
            border: 1px solid #dfe2e5;
            padding: 6px 13px;
        }
        table th {
            background-color: #f6f8fa;
            font-weight: 600;
        }
        ul, ol {
            margin-bottom: 16px;
            padding-left: 2em;
        }
        li {
            margin-bottom: 4px;
        }
        a {
            color: #0366d6;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        img {
            max-width: 100%;
            height: auto;
        }
        hr {
            border: none;
            border-top: 1px solid #eaecef;
            margin: 24px 0;
        }
    </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename || 'document'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setMarkdown('');
    setFilename('document');
  };

  const loadSample = () => {
    const sampleMarkdown = `# Welcome to Markdown

This is a **sample document** to demonstrate Markdown conversion.

## Features

- **Bold text** and *italic text*
- [Links](https://example.com)
- \`inline code\` and code blocks
- Lists and tables
- Images and blockquotes

### Code Example

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### Table Example

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✅ | H1-H6 |
| Lists | ✅ | Ordered & unordered |
| Code | ✅ | Inline & blocks |
| Tables | ✅ | GitHub flavored |

### Blockquote

> This is a blockquote. It can contain multiple paragraphs and other markdown elements.
> 
> - Even lists!
> - And **formatting**

---

## Links and Images

Visit [GitHub](https://github.com) for more information.

![Sample Image](https://via.placeholder.com/400x200?text=Sample+Image)

### Task Lists

- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

That's it! Your markdown is now converted to beautiful HTML.`;

    setMarkdown(sampleMarkdown);
  };

  const wordCount = markdown.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = markdown.length;
  const lineCount = markdown.split('\n').length;

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Markdown to HTML Converter</h1>
            <p className="text-gray-600 dark:text-gray-400">Convert Markdown to HTML with live preview</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'split' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Split
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'preview' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'code' 
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Code className="w-4 h-4 inline mr-1" />
                HTML
              </button>
            </div>
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
            <button
              onClick={handleDownloadHtml}
              disabled={!html}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Download HTML
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full space-y-6">
          {/* Filename Input */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filename
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="document"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Words: {wordCount}</span>
                <span>Characters: {charCount}</span>
                <span>Lines: {lineCount}</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
            <div className="flex-1 overflow-hidden">
              {viewMode === 'split' && (
                <div className="grid grid-cols-2 gap-0 h-full">
                  {/* Markdown Input */}
                  <div className="border-r border-gray-200 dark:border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">Markdown</h3>
                      <button
                        onClick={handleCopyMarkdown}
                        disabled={!markdown}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Copy className="w-4 h-4 mr-1 inline" />
                        Copy
                      </button>
                    </div>
                    <textarea
                      value={markdown}
                      onChange={(e) => setMarkdown(e.target.value)}
                      placeholder="Enter your Markdown here..."
                      className="flex-1 p-4 border-none outline-none resize-none bg-transparent text-gray-900 dark:text-white font-mono text-sm"
                    />
                  </div>

                  {/* HTML Preview */}
                  <div className="flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">Preview</h3>
                      <button
                        onClick={handleCopyHtml}
                        disabled={!html}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Copy className="w-4 h-4 mr-1 inline" />
                        Copy HTML
                      </button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                      {html ? (
                        <div 
                          className="prose dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: html }}
                        />
                      ) : (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                          HTML preview will appear here...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'preview' && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      <Eye className="w-5 h-5 inline mr-2" />
                      Preview Only
                    </h3>
                    <button
                      onClick={handleCopyHtml}
                      disabled={!html}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1 inline" />
                      Copy HTML
                    </button>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto">
                    {html ? (
                      <div 
                        className="prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400 italic">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No content to preview</p>
                        <p className="text-sm">Enter Markdown content to see the preview</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewMode === 'code' && (
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      <Code className="w-5 h-5 inline mr-2" />
                      HTML Source
                    </h3>
                    <button
                      onClick={handleCopyHtml}
                      disabled={!html}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1 inline" />
                      Copy HTML
                    </button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                      {html || (
                        <span className="text-gray-500 dark:text-gray-400 italic">
                          HTML source will appear here...
                        </span>
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Markdown Cheatsheet */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Markdown Quick Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded"># Header 1</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">## Header 2</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">**Bold**</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">*Italic*</code></p>
              </div>
              <div>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">- List item</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">1. Numbered</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">[Link](url)</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">`code`</code></p>
              </div>
              <div>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">```code block```</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">> Blockquote</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">---</code> (horizontal rule)</p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">![Image](url)</code></p>
              </div>
              <div>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">| Table | Header |</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">|-------|--------|</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">| Cell  | Data   |</code></p>
                <p><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">- [x] Task list</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};