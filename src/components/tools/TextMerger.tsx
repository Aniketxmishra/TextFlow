import React, { useState, useCallback } from 'react';
import { Copy, RotateCcw, Download, Upload, FileText, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface TextFile {
  id: string;
  name: string;
  content: string;
  size: number;
  lastModified: number;
}

interface MergeOptions {
  separator: string;
  includeFilenames: boolean;
  includeTimestamps: boolean;
  includeLineNumbers: boolean;
  customHeader: string;
  customFooter: string;
  sortOrder: 'original' | 'alphabetical' | 'size' | 'date';
}

export const TextMerger: React.FC = () => {
  const [files, setFiles] = useState<TextFile[]>([]);
  const [mergeOptions, setMergeOptions] = useState<MergeOptions>({
    separator: '\n\n=== {filename} ===\n\n',
    includeFilenames: true,
    includeTimestamps: false,
    includeLineNumbers: false,
    customHeader: '',
    customFooter: '',
    sortOrder: 'original'
  });
  const [outputFilename, setOutputFilename] = useState('merged_files');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { copy, copied } = useClipboard();

  const processFiles = async (fileList: FileList) => {
    setIsProcessing(true);
    
    const newFiles: TextFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`Skipping large file: ${file.name}`);
        continue;
      }

      try {
        const content = await readFileAsText(file);
        
        newFiles.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          content,
          size: file.size,
          lastModified: file.lastModified
        });
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('File reading failed'));
      };
      
      reader.readAsText(file);
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const addTextFile = () => {
    const newFile: TextFile = {
      id: Date.now().toString(),
      name: `Text ${files.length + 1}`,
      content: '',
      size: 0,
      lastModified: Date.now()
    };
    setFiles(prev => [...prev, newFile]);
  };

  const updateFile = (id: string, updates: Partial<TextFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === id 
        ? { ...file, ...updates, size: updates.content?.length || file.size }
        : file
    ));
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const getSortedFiles = (): TextFile[] => {
    const filesCopy = [...files];
    
    switch (mergeOptions.sortOrder) {
      case 'alphabetical':
        return filesCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'size':
        return filesCopy.sort((a, b) => b.size - a.size);
      case 'date':
        return filesCopy.sort((a, b) => b.lastModified - a.lastModified);
      default:
        return filesCopy;
    }
  };

  const generateMergedContent = (): string => {
    const sortedFiles = getSortedFiles();
    let content = '';
    
    // Add custom header
    if (mergeOptions.customHeader) {
      content += mergeOptions.customHeader + '\n\n';
    }
    
    sortedFiles.forEach((file, index) => {
      // Add separator with filename if enabled
      if (mergeOptions.includeFilenames && mergeOptions.separator) {
        let separator = mergeOptions.separator
          .replace('{filename}', file.name)
          .replace('{index}', (index + 1).toString())
          .replace('{size}', formatFileSize(file.size));
        
        if (mergeOptions.includeTimestamps) {
          separator = separator.replace('{timestamp}', new Date(file.lastModified).toLocaleString());
        }
        
        content += separator;
      }
      
      // Add file content with optional line numbers
      if (mergeOptions.includeLineNumbers) {
        const lines = file.content.split('\n');
        const numberedContent = lines.map((line, lineIndex) => 
          `${(lineIndex + 1).toString().padStart(4, ' ')}: ${line}`
        ).join('\n');
        content += numberedContent;
      } else {
        content += file.content;
      }
      
      // Add spacing between files
      if (index < sortedFiles.length - 1) {
        content += '\n\n';
      }
    });
    
    // Add custom footer
    if (mergeOptions.customFooter) {
      content += '\n\n' + mergeOptions.customFooter;
    }
    
    return content;
  };

  const mergedContent = generateMergedContent();

  const handleCopy = () => {
    copy(mergedContent);
  };

  const handleDownload = () => {
    if (!mergedContent) return;
    
    const blob = new Blob([mergedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${outputFilename || 'merged_files'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setFiles([]);
    setOutputFilename('merged_files');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalFiles = files.length;
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalCharacters = files.reduce((sum, file) => sum + file.content.length, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Text File Merger</h1>
            <p className="text-gray-600 dark:text-gray-400">Merge multiple text files with custom formatting options</p>
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
              disabled={files.length === 0}
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
          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Files</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Upload */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".txt,.md,.json,.xml,.html,.css,.js,.csv,.log"
                />
                
                <div className="space-y-2">
                  <Upload className={`w-8 h-8 mx-auto ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {dragActive ? 'Drop files here' : 'Upload Files'}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Drag & drop or click to browse
                  </p>
                </div>
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Manual Text Entry */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <button
                  onClick={addTextFile}
                  className="w-full h-full flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded"
                >
                  <Plus className="w-8 h-8 text-gray-400" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Add Text Manually</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Create a new text entry</p>
                </button>
              </div>
            </div>
          </div>

          {/* Merge Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Merge Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    File Separator
                  </label>
                  <input
                    type="text"
                    value={mergeOptions.separator}
                    onChange={(e) => setMergeOptions(prev => ({ ...prev, separator: e.target.value }))}
                    placeholder="Separator between files"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use {'{filename}'}, {'{index}'}, {'{size}'}, {'{timestamp}'} as placeholders
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort Order
                  </label>
                  <select
                    value={mergeOptions.sortOrder}
                    onChange={(e) => setMergeOptions(prev => ({ ...prev, sortOrder: e.target.value as MergeOptions['sortOrder'] }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="original">Original Order</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="size">By Size (Largest First)</option>
                    <option value="date">By Date (Newest First)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Output Filename
                  </label>
                  <input
                    type="text"
                    value={outputFilename}
                    onChange={(e) => setOutputFilename(e.target.value)}
                    placeholder="merged_files"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={mergeOptions.includeFilenames}
                      onChange={(e) => setMergeOptions(prev => ({ ...prev, includeFilenames: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Filenames</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={mergeOptions.includeTimestamps}
                      onChange={(e) => setMergeOptions(prev => ({ ...prev, includeTimestamps: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Timestamps</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={mergeOptions.includeLineNumbers}
                      onChange={(e) => setMergeOptions(prev => ({ ...prev, includeLineNumbers: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Include Line Numbers</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Header
                  </label>
                  <textarea
                    value={mergeOptions.customHeader}
                    onChange={(e) => setMergeOptions(prev => ({ ...prev, customHeader: e.target.value }))}
                    placeholder="Optional header text..."
                    className="w-full h-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Footer
                  </label>
                  <textarea
                    value={mergeOptions.customFooter}
                    onChange={(e) => setMergeOptions(prev => ({ ...prev, customFooter: e.target.value }))}
                    placeholder="Optional footer text..."
                    className="w-full h-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          {files.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <FileText className="w-5 h-5 inline mr-2" />
                Merge Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalFiles}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatFileSize(totalSize)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalCharacters.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
                </div>
                <div className="text-center">
                  <button
                    onClick={handleCopy}
                    disabled={files.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2 inline" />
                    Copy Result
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Files to Merge</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {files.map((file, index) => (
                  <div key={file.id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveFile(file.id, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveFile(file.id, 'down')}
                          disabled={index === files.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={file.name}
                            onChange={(e) => updateFile(file.id, { name: e.target.value })}
                            className="font-medium text-gray-900 dark:text-white bg-transparent border-none outline-none focus:bg-gray-50 dark:focus:bg-gray-700 px-2 py-1 rounded"
                          />
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </span>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <textarea
                          value={file.content}
                          onChange={(e) => updateFile(file.id, { content: e.target.value })}
                          placeholder="Enter text content..."
                          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Merged Output Preview */}
          {files.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Merged Output Preview</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {mergedContent.length.toLocaleString()} characters
                  </span>
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-1 inline" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="max-h-96 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded border p-3">
                  <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                    {mergedContent || 'Merged content will appear here...'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Help */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
              Merge Features
            </h3>
            <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
              <li>• Drag and drop multiple files or add text manually</li>
              <li>• Customize separators with dynamic placeholders</li>
              <li>• Sort files by name, size, date, or keep original order</li>
              <li>• Add custom headers, footers, and line numbers</li>
              <li>• Reorder files using up/down arrows</li>
              <li>• Real-time preview of merged output</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};