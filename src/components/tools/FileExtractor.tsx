import React, { useState, useCallback } from 'react';
import { Copy, RotateCcw, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface ExtractedFile {
  name: string;
  size: number;
  type: string;
  content: string;
  lastModified: number;
}

interface ProcessingHistory {
  id: string;
  files: ExtractedFile[];
  timestamp: number;
  totalSize: number;
}

export const FileExtractor: React.FC = () => {
  const [extractedFiles, setExtractedFiles] = useState<ExtractedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState<ProcessingHistory[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>('');
  const { copy, copied } = useClipboard();

  const supportedTypes = [
    'text/plain',
    'text/csv',
    'text/html',
    'text/css',
    'text/javascript',
    'application/json',
    'application/xml',
    'text/xml',
    'application/javascript',
    'text/markdown'
  ];

  const processFiles = async (files: FileList) => {
    setIsProcessing(true);
    setError('');
    
    const newExtractedFiles: ExtractedFile[] = [];
    let totalSize = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        }

        // Check if file type is supported
        const isSupported = supportedTypes.includes(file.type) || 
                           file.name.match(/\.(txt|md|json|xml|html|css|js|csv|log|sql|py|java|cpp|c|h|php|rb|go|rs|ts|jsx|tsx|vue|svelte)$/i);

        if (!isSupported) {
          console.warn(`Skipping unsupported file: ${file.name}`);
          continue;
        }

        try {
          const content = await readFileAsText(file);
          
          newExtractedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            content,
            lastModified: file.lastModified
          });
          
          totalSize += file.size;
        } catch (fileError) {
          console.error(`Error reading file ${file.name}:`, fileError);
          throw new Error(`Failed to read file "${file.name}". Please ensure it's a valid text file.`);
        }
      }

      if (newExtractedFiles.length === 0) {
        throw new Error('No supported text files found. Please upload text files (.txt, .md, .json, .xml, .html, .css, .js, etc.)');
      }

      setExtractedFiles(newExtractedFiles);

      // Add to history
      const historyEntry: ProcessingHistory = {
        id: Date.now().toString(),
        files: newExtractedFiles,
        timestamp: Date.now(),
        totalSize
      };
      
      setHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
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

  const handleCopyFile = (content: string) => {
    copy(content);
  };

  const handleCopyAll = () => {
    const allContent = extractedFiles.map(file => 
      `=== ${file.name} ===\n${file.content}\n\n`
    ).join('');
    copy(allContent);
  };

  const handleDownloadFile = (file: ExtractedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const allContent = extractedFiles.map(file => 
      `=== ${file.name} ===\n${file.content}\n\n`
    ).join('');
    
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted_files_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setExtractedFiles([]);
    setError('');
    setSelectedHistoryId('');
  };

  const loadFromHistory = (historyId: string) => {
    const historyEntry = history.find(h => h.id === historyId);
    if (historyEntry) {
      setExtractedFiles(historyEntry.files);
      setSelectedHistoryId(historyId);
      setError('');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const totalFiles = extractedFiles.length;
  const totalSize = extractedFiles.reduce((sum, file) => sum + file.size, 0);
  const totalCharacters = extractedFiles.reduce((sum, file) => sum + file.content.length, 0);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">File Text Extractor</h1>
            <p className="text-gray-600 dark:text-gray-400">Extract text content from uploaded files with drag-and-drop support</p>
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
              onClick={handleDownloadAll}
              disabled={extractedFiles.length === 0}
              className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Download All
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Upload Area */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upload Files</h3>
            
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
                accept=".txt,.md,.json,.xml,.html,.css,.js,.csv,.log,.sql,.py,.java,.cpp,.c,.h,.php,.rb,.go,.rs,.ts,.jsx,.tsx,.vue,.svelte"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {dragActive ? 'Drop files here' : 'Drag and drop files here'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    or click to browse files
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Supported formats: TXT, MD, JSON, XML, HTML, CSS, JS, CSV, and more</p>
                  <p>Maximum file size: 10MB per file</p>
                </div>
              </div>
              
              {isProcessing && (
                <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Processing files...</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          {extractedFiles.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                <FileText className="w-5 h-5 inline mr-2" />
                Extraction Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalFiles}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Files Processed</div>
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
                    onClick={handleCopyAll}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Copy className="w-4 h-4 mr-2 inline" />
                    Copy All
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing History */}
          {history.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Processing History</h3>
              <div className="space-y-2">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => loadFromHistory(entry.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedHistoryId === entry.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {entry.files.length} file{entry.files.length !== 1 ? 's' : ''} • {formatFileSize(entry.totalSize)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(entry.timestamp)}
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Files */}
          {extractedFiles.length > 0 && (
            <div className="space-y-4">
              {extractedFiles.map((file, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">{file.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatFileSize(file.size)} • {file.content.length.toLocaleString()} characters • {formatDate(file.lastModified)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyFile(file.content)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Copy className="w-4 h-4 mr-1 inline" />
                        Copy
                      </button>
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-1 inline" />
                        Download
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded border p-3">
                      <pre className="text-sm font-mono text-gray-900 dark:text-white whitespace-pre-wrap">
                        {file.content.length > 1000 
                          ? `${file.content.substring(0, 1000)}...\n\n[Content truncated - ${file.content.length.toLocaleString()} total characters]`
                          : file.content
                        }
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Help */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Supported File Types
            </h3>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p>• <strong>Text files:</strong> .txt, .md, .log</p>
              <p>• <strong>Web files:</strong> .html, .css, .js, .jsx, .ts, .tsx</p>
              <p>• <strong>Data files:</strong> .json, .xml, .csv</p>
              <p>• <strong>Code files:</strong> .py, .java, .cpp, .c, .h, .php, .rb, .go, .rs</p>
              <p>• <strong>Framework files:</strong> .vue, .svelte</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};