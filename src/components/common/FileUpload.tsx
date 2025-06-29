import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Download,
  FileText,
  Image,
  FileSpreadsheet
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface FileUploadProps {
  entityType: string;
  entityId: string;
  allowedTypes?: string[];
  maxFileSize?: number;
  multiple?: boolean;
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
}

interface UploadedFile {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  category: string;
  uploadedAt: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  uploadedFile?: UploadedFile;
}

const FileUpload: React.FC<FileUploadProps> = ({
  entityType,
  entityId,
  allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multiple = true,
  onUploadComplete,
  onUploadError
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [existingFiles, setExistingFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // File type icons
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      return t('fileUpload.invalidFileType', { types: allowedTypes.join(', ') });
    }
    
    if (file.size > maxFileSize) {
      return t('fileUpload.fileTooLarge', { size: Math.round(maxFileSize / 1024 / 1024) });
    }
    
    return null;
  };

  // Simulate file upload with progress
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    return new Promise((resolve, reject) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Simulate successful upload
          setTimeout(() => {
            const uploadedFile: UploadedFile = {
              id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              filename: `${Date.now()}_${file.name}`,
              originalFilename: file.name,
              fileSize: file.size,
              mimeType: file.type,
              fileUrl: URL.createObjectURL(file), // In real app, this would be the server URL
              category: entityType,
              uploadedAt: new Date().toISOString()
            };
            resolve(uploadedFile);
          }, 500);
        }
        
        setUploadProgress(prev => 
          prev.map(item => 
            item.file === file 
              ? { ...item, progress }
              : item
          )
        );
      }, 200);
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
      return;
    }

    // Initialize upload progress
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...initialProgress]);

    // Upload files
    const uploadPromises = validFiles.map(async (file) => {
      try {
        const uploadedFile = await uploadFile(file);
        
        setUploadProgress(prev => 
          prev.map(item => 
            item.file === file 
              ? { ...item, status: 'completed', uploadedFile }
              : item
          )
        );
        
        return uploadedFile;
      } catch (error: any) {
        setUploadProgress(prev => 
          prev.map(item => 
            item.file === file 
              ? { ...item, status: 'error', error: error.message }
              : item
          )
        );
        throw error;
      }
    });

    try {
      const uploadedFiles = await Promise.all(uploadPromises);
      setExistingFiles(prev => [...prev, ...uploadedFiles]);
      onUploadComplete?.(uploadedFiles);
      
      // Clear completed uploads after a delay
      setTimeout(() => {
        setUploadProgress(prev => prev.filter(item => item.status !== 'completed'));
      }, 3000);
    } catch (error: any) {
      onUploadError?.(error.message);
    }
  }, [allowedTypes, maxFileSize, onUploadComplete, onUploadError]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  // File input change handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = '';
  }, [handleFileSelect]);

  // Remove file
  const removeFile = (fileId: string) => {
    setExistingFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
            : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('fileUpload.dropFiles')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('fileUpload.dragDropOrClick')}
        </p>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Upload className="h-4 w-4 mr-2" />
          {t('fileUpload.selectFiles')}
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes.map(type => `.${type}`).join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          {t('fileUpload.allowedTypes')}: {allowedTypes.join(', ')} • 
          {t('fileUpload.maxSize')}: {Math.round(maxFileSize / 1024 / 1024)}MB
        </p>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            {t('fileUpload.uploading')}
          </h4>
          {uploadProgress.map((item, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getFileIcon(item.file.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(item.file.size)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {item.status === 'uploading' && <LoadingSpinner size="sm" />}
                  {item.status === 'completed' && <CheckCircle className="h-5 w-5 text-success-500" />}
                  {item.status === 'error' && <AlertCircle className="h-5 w-5 text-error-500" />}
                </div>
              </div>
              
              {item.status === 'uploading' && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
              )}
              
              {item.status === 'error' && (
                <p className="text-sm text-error-600 dark:text-error-400">
                  {item.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            {t('fileUpload.uploadedFiles')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {existingFiles.map((file) => (
              <div key={file.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.originalFilename}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.fileSize)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(file.fileUrl, '_blank')}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title={t('fileUpload.preview')}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = file.fileUrl;
                        link.download = file.originalFilename;
                        link.click();
                      }}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title={t('fileUpload.download')}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-gray-400 hover:text-error-600 transition-colors"
                      title={t('fileUpload.remove')}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;