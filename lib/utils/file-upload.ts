/**
 * File Upload Utilities
 * Handles file uploads, validation, compression, and management
 */

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  thumbnail?: string
  metadata?: {
    width?: number
    height?: number
    duration?: number
  }
  uploadedAt: string
}

export interface UploadProgress {
  fileId: string
  progress: number
  status: 'uploading' | 'processing' | 'complete' | 'error'
  error?: string
}

export interface FileUploadConfig {
  maxFileSize: number // in bytes
  allowedTypes: string[]
  maxFiles?: number
  enableCompression?: boolean
  enableThumbnails?: boolean
  compressionQuality?: number
}

export const DEFAULT_UPLOAD_CONFIGS = {
  image: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxFiles: 5,
    enableCompression: true,
    enableThumbnails: true,
    compressionQuality: 0.8
  },
  video: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/mov'],
    maxFiles: 1,
    enableCompression: false,
    enableThumbnails: true
  },
  document: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxFiles: 3,
    enableCompression: false,
    enableThumbnails: false
  },
  chart: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/svg+xml'],
    maxFiles: 3,
    enableCompression: true,
    enableThumbnails: true,
    compressionQuality: 0.9
  }
}

class FileUploadManager {
  private uploads: Map<string, UploadProgress> = new Map()
  private listeners: Map<string, (progress: UploadProgress) => void> = new Map()

  // Validate file before upload
  validateFile(file: File, config: FileUploadConfig): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `File size must be less than ${this.formatFileSize(config.maxFileSize)}`
      }
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Allowed types: ${config.allowedTypes.join(', ')}`
      }
    }

    // Additional validation for images
    if (file.type.startsWith('image/')) {
      return this.validateImage(file)
    }

    return { valid: true }
  }

  // Validate image files
  private validateImage(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)

      img.onload = () => {
        URL.revokeObjectURL(url)
        
        // Check image dimensions
        const maxDimension = 4000
        if (img.width > maxDimension || img.height > maxDimension) {
          resolve({
            valid: false,
            error: `Image dimensions must be less than ${maxDimension}x${maxDimension} pixels`
          })
          return
        }

        resolve({ valid: true })
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({ valid: false, error: 'Invalid image file' })
      }

      img.src = url
    })
  }

  // Compress image if needed
  private async compressImage(
    file: File, 
    quality: number = 0.8,
    maxWidth: number = 1920,
    maxHeight: number = 1080
  ): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback to original
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Generate thumbnail for images and videos
  private async generateThumbnail(file: File): Promise<string | null> {
    if (file.type.startsWith('image/')) {
      return this.generateImageThumbnail(file)
    } else if (file.type.startsWith('video/')) {
      return this.generateVideoThumbnail(file)
    }
    return null
  }

  private generateImageThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()

      img.onload = () => {
        const size = 200
        canvas.width = size
        canvas.height = size

        // Calculate crop area (center crop)
        const { width, height } = img
        const sourceSize = Math.min(width, height)
        const sourceX = (width - sourceSize) / 2
        const sourceY = (height - sourceSize) / 2

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, size, size
        )

        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }

      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  private generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!

      video.onloadedmetadata = () => {
        video.currentTime = Math.min(2, video.duration / 4) // Seek to 25% or 2s
      }

      video.onseeked = () => {
        const size = 200
        canvas.width = size
        canvas.height = size

        const { videoWidth, videoHeight } = video
        const sourceSize = Math.min(videoWidth, videoHeight)
        const sourceX = (videoWidth - sourceSize) / 2
        const sourceY = (videoHeight - sourceSize) / 2

        ctx.drawImage(
          video,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, size, size
        )

        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }

      video.onerror = reject
      video.src = URL.createObjectURL(file)
    })
  }

  // Upload file with progress tracking
  async uploadFile(
    file: File,
    config: FileUploadConfig,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadedFile> {
    const fileId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Initialize upload progress
    const initialProgress: UploadProgress = {
      fileId,
      progress: 0,
      status: 'uploading'
    }

    this.uploads.set(fileId, initialProgress)
    if (onProgress) {
      this.listeners.set(fileId, onProgress)
      onProgress(initialProgress)
    }

    try {
      // Validate file
      const validation = await this.validateFile(file, config)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Process file
      let processedFile = file
      let thumbnail: string | null = null

      this.updateProgress(fileId, 10, 'processing')

      // Compress if needed
      if (config.enableCompression && file.type.startsWith('image/')) {
        processedFile = await this.compressImage(file, config.compressionQuality)
        this.updateProgress(fileId, 30, 'processing')
      }

      // Generate thumbnail if needed
      if (config.enableThumbnails) {
        thumbnail = await this.generateThumbnail(processedFile)
        this.updateProgress(fileId, 50, 'processing')
      }

      // Prepare form data
      const formData = new FormData()
      formData.append('file', processedFile)
      formData.append('fileId', fileId)
      if (thumbnail) {
        formData.append('thumbnail', thumbnail)
      }

      // Upload to server
      const uploadedFile = await this.performUpload(formData, fileId)

      this.updateProgress(fileId, 100, 'complete')
      
      return uploadedFile

    } catch (error: any) {
      this.updateProgress(fileId, 0, 'error', error.message)
      throw error
    } finally {
      // Clean up
      setTimeout(() => {
        this.uploads.delete(fileId)
        this.listeners.delete(fileId)
      }, 5000) // Keep for 5 seconds for any final progress updates
    }
  }

  // Perform actual upload to server
  private async performUpload(formData: FormData, fileId: string): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 50) + 50 // 50-100%
          this.updateProgress(fileId, progress, 'uploading')
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success && response.data) {
              resolve(response.data.file)
            } else {
              reject(new Error(response.error || 'Upload failed'))
            }
          } catch (error) {
            reject(new Error('Invalid response from server'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error during upload'))
      }

      xhr.open('POST', '/api/upload')
      xhr.send(formData)
    })
  }

  // Update upload progress
  private updateProgress(
    fileId: string,
    progress: number,
    status: UploadProgress['status'],
    error?: string
  ) {
    const uploadProgress: UploadProgress = {
      fileId,
      progress,
      status,
      error
    }

    this.uploads.set(fileId, uploadProgress)
    const listener = this.listeners.get(fileId)
    if (listener) {
      listener(uploadProgress)
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: File[],
    config: FileUploadConfig,
    onProgress?: (fileId: string, progress: UploadProgress) => void
  ): Promise<UploadedFile[]> {
    if (config.maxFiles && files.length > config.maxFiles) {
      throw new Error(`Maximum ${config.maxFiles} files allowed`)
    }

    const uploadPromises = files.map(file =>
      this.uploadFile(file, config, onProgress ? (progress) => onProgress(progress.fileId, progress) : undefined)
    )

    return Promise.all(uploadPromises)
  }

  // Get upload progress
  getUploadProgress(fileId: string): UploadProgress | null {
    return this.uploads.get(fileId) || null
  }

  // Cancel upload
  cancelUpload(fileId: string): void {
    this.uploads.delete(fileId)
    this.listeners.delete(fileId)
    // In a real implementation, you would also abort the XMLHttpRequest
  }

  // Utility methods
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.startsWith('video/')) return '🎥'
    if (fileType.startsWith('audio/')) return '🎵'
    if (fileType === 'application/pdf') return '📄'
    if (fileType.includes('document') || fileType.includes('word')) return '📝'
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊'
    return '📎'
  }
}

// Create singleton instance
export const fileUploadManager = new FileUploadManager()

// Export utility functions
export const validateFile = (file: File, config: FileUploadConfig) => 
  fileUploadManager.validateFile(file, config)

export const uploadFile = (file: File, config: FileUploadConfig, onProgress?: (progress: UploadProgress) => void) =>
  fileUploadManager.uploadFile(file, config, onProgress)

export const uploadMultipleFiles = (
  files: File[],
  config: FileUploadConfig,
  onProgress?: (fileId: string, progress: UploadProgress) => void
) => fileUploadManager.uploadMultipleFiles(files, config, onProgress)

export const formatFileSize = (bytes: number) => fileUploadManager.formatFileSize(bytes)
export const getFileIcon = (fileType: string) => fileUploadManager.getFileIcon(fileType)

