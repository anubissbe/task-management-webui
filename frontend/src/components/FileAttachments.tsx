import { useState, useRef } from 'react';
import { TaskAttachment } from '../types';

interface FileAttachmentsProps {
  taskId: string;
  attachments: TaskAttachment[];
  onFileUpload: (file: File) => Promise<void>;
  onFileDelete: (attachmentId: string) => Promise<void>;
  currentUser: string;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
}

const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
  'application/pdf',
  'text/plain', 'text/csv',
  'application/json',
  'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export function FileAttachments({
  taskId,
  attachments,
  onFileUpload,
  onFileDelete,
  currentUser,
  maxFileSize = 10, // 10MB default
  allowedTypes = DEFAULT_ALLOWED_TYPES
}: FileAttachmentsProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return '📊';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    if (mimeType.startsWith('text/')) return '📃';
    if (mimeType.includes('json')) return '🔧';
    return '📎';
  };

  const getFileTypeColor = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800';
    if (mimeType === 'application/pdf') return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'bg-blue-100 text-blue-800';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'bg-green-100 text-green-800';
    if (mimeType.includes('zip')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }

    return null;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateFile(file);
      
      if (validation) {
        alert(validation);
        continue;
      }

      try {
        // Simulate upload progress
        const progressKey = `${file.name}-${Date.now()}`;
        setUploadProgress(prev => ({ ...prev, [progressKey]: 0 }));
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const currentProgress = prev[progressKey] || 0;
            if (currentProgress >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [progressKey]: currentProgress + Math.random() * 20 };
          });
        }, 100);

        await onFileUpload(file);
        
        // Complete progress
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [progressKey]: 100 }));
        
        // Remove progress after delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [progressKey]: _, ...rest } = prev;
            return rest;
          });
        }, 1000);
        
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
      }
    }
    
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          📎 Attachments
          <span className="text-sm text-gray-500 dark:text-gray-400">({attachments.length})</span>
        </h4>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="text-4xl text-gray-400 dark:text-gray-500">📁</div>
          <div className="text-gray-600 dark:text-gray-400">
            <p className="font-medium">Drop files here or click to upload</p>
            <p className="text-sm mt-1">
              Supports images, PDFs, documents up to {maxFileSize}MB
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Uploading...' : 'Choose Files'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(',')}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([key, progress]) => {
            const fileName = key.split('-')[0];
            return (
              <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{fileName}</span>
                  <span className="text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attachments List */}
      <div className="space-y-3">
        {attachments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-2">📎</div>
            <p>No attachments yet.</p>
            <p className="text-sm mt-1">Upload files to share with your team.</p>
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              {/* File Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${getFileTypeColor(attachment.mime_type)}`}>
                {getFileIcon(attachment.mime_type)}
              </div>
              
              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-gray-900 dark:text-white truncate">
                    {attachment.filename}
                  </h5>
                  {attachment.mime_type.startsWith('image/') && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Image
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span>{formatFileSize(attachment.file_size)}</span>
                  <span>•</span>
                  <span>Uploaded by {attachment.uploaded_by}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(attachment.uploaded_at)}</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Download file - this would be implemented based on your file storage
                    window.open(attachment.upload_path, '_blank');
                  }}
                  className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                  title="Download"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                
                {/* Show delete button only for file uploader or admin */}
                {(attachment.uploaded_by === currentUser) && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${attachment.filename}"?`)) {
                        onFileDelete(attachment.id);
                      }
                    }}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Attachment Summary */}
      {attachments.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {attachments.length}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Files</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {formatFileSize(attachments.reduce((sum, att) => sum + att.file_size, 0))}
              </div>
              <div className="text-gray-500 dark:text-gray-400">Total Size</div>
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {new Set(attachments.map(att => att.mime_type.split('/')[0])).size}
              </div>
              <div className="text-gray-500 dark:text-gray-400">File Types</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}