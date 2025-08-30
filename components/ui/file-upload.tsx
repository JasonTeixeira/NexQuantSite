"use client"

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  Check,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  Trash2
} from "lucide-react"
import { toast } from "sonner"

import {
  fileUploadManager,
  DEFAULT_UPLOAD_CONFIGS,
  type UploadedFile,
  type UploadProgress,
  type FileUploadConfig
} from '@/lib/utils/file-upload'

interface FileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void
  config?: Partial<FileUploadConfig>
  configPreset?: 'image' | 'video' | 'document' | 'chart'
  accept?: string
  multiple?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
}

interface FileUploadState {
  files: File[]
  uploadedFiles: UploadedFile[]
  uploadProgress: Map<string, UploadProgress>
  dragActive: boolean
  uploading: boolean
}

export function FileUpload({
  onFilesUploaded,
  config,
  configPreset = 'image',
  accept,
  multiple = true,
  disabled = false,
  className = '',
  children
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploadedFiles: [],
    uploadProgress: new Map(),
    dragActive: false,
    uploading: false
  })

  // Get upload configuration
  const uploadConfig: FileUploadConfig = {
    ...DEFAULT_UPLOAD_CONFIGS[configPreset],
    ...config
  }

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return

    const filesArray = Array.from(selectedFiles)
    
    // Validate file count
    if (uploadConfig.maxFiles && filesArray.length > uploadConfig.maxFiles) {
      toast.error(`Maximum ${uploadConfig.maxFiles} files allowed`)
      return
    }

    // Validate each file
    for (const file of filesArray) {
      const validation = await fileUploadManager.validateFile(file, uploadConfig)
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`)
        return
      }
    }

    setState(prev => ({ ...prev, files: filesArray, uploading: true }))

    // Start uploads
    try {
      const uploadedFiles = await fileUploadManager.uploadMultipleFiles(
        filesArray,
        uploadConfig,
        (fileId, progress) => {
          setState(prev => ({
            ...prev,
            uploadProgress: new Map(prev.uploadProgress.set(fileId, progress))
          }))
        }
      )

      setState(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...uploadedFiles],
        uploading: false,
        files: []
      }))

      onFilesUploaded(uploadedFiles)
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully!`)

    } catch (error: any) {
      setState(prev => ({ ...prev, uploading: false, files: [] }))
      toast.error(`Upload failed: ${error.message}`)
    }
  }, [uploadConfig, onFilesUploaded])

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setState(prev => ({ ...prev, dragActive: true }))
    }
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState(prev => ({ ...prev, dragActive: false }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setState(prev => ({ ...prev, dragActive: false }))
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }, [handleFileSelect])

  // File type icon
  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) return ImageIcon
    if (type.startsWith('video/')) return Video
    if (type.startsWith('audio/')) return Music
    if (type === 'application/pdf') return FileText
    return File
  }

  // Remove uploaded file
  const removeUploadedFile = (fileId: string) => {
    setState(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter(f => f.id !== fileId)
    }))
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg transition-all duration-200
          ${state.dragActive 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-600 hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <div className="p-8 text-center">
          {children ? children : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${state.dragActive ? 'text-blue-400' : 'text-gray-400'}`} />
              <h3 className="text-lg font-semibold text-white mb-2">
                {state.dragActive ? 'Drop files here' : 'Upload Files'}
              </h3>
              <p className="text-gray-400 mb-4">
                Drag and drop files here, or click to select
              </p>
              <div className="text-sm text-gray-500">
                <p>Max file size: {fileUploadManager.formatFileSize(uploadConfig.maxFileSize)}</p>
                <p>Supported formats: {uploadConfig.allowedTypes.map(type => type.split('/')[1]).join(', ')}</p>
                {uploadConfig.maxFiles && (
                  <p>Max files: {uploadConfig.maxFiles}</p>
                )}
              </div>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept || uploadConfig.allowedTypes.join(',')}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {/* Upload Progress */}
      {state.files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Uploading Files...</h4>
          {state.files.map((file, index) => {
            const fileId = `upload_${Date.now()}_${index}`
            const progress = state.uploadProgress.get(fileId)
            const FileIcon = getFileIcon(file)

            return (
              <motion.div
                key={`${file.name}-${file.size}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-white truncate">{file.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {fileUploadManager.formatFileSize(file.size)}
                      </Badge>
                    </div>
                    
                    {progress && (
                      <div className="space-y-2">
                        <Progress 
                          value={progress.progress} 
                          className="h-2"
                        />
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 capitalize">
                            {progress.status}... {progress.progress}%
                          </span>
                          {progress.status === 'error' && progress.error && (
                            <span className="text-red-400">{progress.error}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Uploaded Files */}
      {state.uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Uploaded Files</h4>
          <AnimatePresence>
            {state.uploadedFiles.map((file) => (
              <UploadedFileCard
                key={file.id}
                file={file}
                onRemove={removeUploadedFile}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

// Individual uploaded file card
function UploadedFileCard({ 
  file, 
  onRemove 
}: { 
  file: UploadedFile
  onRemove: (fileId: string) => void 
}) {
  const [showPreview, setShowPreview] = useState(false)
  
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
    >
      <div className="flex items-center gap-3">
        {/* Thumbnail or Icon */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
          {file.thumbnail ? (
            <img 
              src={file.thumbnail} 
              alt={file.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl">{fileUploadManager.getFileIcon(file.type)}</span>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-white truncate">{file.name}</p>
            <Badge variant="outline" className="text-xs">
              {fileUploadManager.formatFileSize(file.size)}
            </Badge>
          </div>
          <p className="text-sm text-gray-400">{file.type}</p>
          {file.metadata && (
            <div className="text-xs text-gray-500 mt-1">
              {file.metadata.width && file.metadata.height && (
                <span>{file.metadata.width}x{file.metadata.height}</span>
              )}
              {file.metadata.duration && (
                <span> • {Math.round(file.metadata.duration)}s</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {(isImage || isVideo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(true)}
              className="h-8 w-8 p-0"
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(file.url, '_blank')}
            className="h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(file.id)}
            className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowPreview(false)}
        >
          <div className="max-w-4xl max-h-full">
            {isImage ? (
              <img 
                src={file.url} 
                alt={file.name}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ) : isVideo ? (
              <video 
                src={file.url} 
                controls
                className="max-w-full max-h-full"
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// Simple file upload button component
export function FileUploadButton({
  onFileUploaded,
  configPreset = 'image',
  accept,
  children,
  ...buttonProps
}: {
  onFileUploaded: (file: UploadedFile) => void
  configPreset?: 'image' | 'video' | 'document' | 'chart'
  accept?: string
  children?: React.ReactNode
} & React.ComponentProps<typeof Button>) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadedFile = await fileUploadManager.uploadFile(
        file,
        DEFAULT_UPLOAD_CONFIGS[configPreset]
      )
      onFileUploaded(uploadedFile)
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Button
        {...buttonProps}
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading || buttonProps.disabled}
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            {children || 'Upload File'}
          </>
        )}
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={accept || DEFAULT_UPLOAD_CONFIGS[configPreset].allowedTypes.join(',')}
        onChange={handleFileSelect}
      />
    </>
  )
}

