// 📁 PRODUCTION FILE STORAGE SYSTEM
// Flexible file storage supporting local, AWS S3, and Digital Ocean Spaces

import { v4 as uuidv4 } from 'uuid'
import { createHash } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { query } from '../database/connection'

// ============================================================================
// INTERFACES
// ============================================================================

export interface FileUpload {
  id: string
  uploaderId: string
  filename: string
  originalFilename: string
  fileSize: number
  mimeType: string
  filePath: string
  storageProvider: 'local' | 'aws' | 'digital_ocean'
  width?: number
  height?: number
  duration?: number
  metadata?: any
  visibility: 'public' | 'private' | 'restricted'
  accessUrl?: string
  createdAt: Date
  expiresAt?: Date
}

export interface UploadOptions {
  visibility?: 'public' | 'private' | 'restricted'
  maxFileSize?: number // bytes
  allowedMimeTypes?: string[]
  generateThumbnail?: boolean
  expiresIn?: number // seconds
  metadata?: any
}

export interface StorageProvider {
  name: string
  upload(file: Buffer, key: string, options: UploadOptions): Promise<{
    filePath: string
    accessUrl?: string
  }>
  download(filePath: string): Promise<Buffer>
  delete(filePath: string): Promise<boolean>
  getPublicUrl(filePath: string): string
}

// ============================================================================
// LOCAL STORAGE PROVIDER
// ============================================================================

export class LocalStorageProvider implements StorageProvider {
  name = 'local'
  private uploadDir: string
  
  constructor(uploadDir: string = './uploads') {
    this.uploadDir = path.resolve(uploadDir)
  }
  
  async upload(file: Buffer, key: string, options: UploadOptions): Promise<{
    filePath: string
    accessUrl?: string
  }> {
    // Ensure upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true })
    
    const filePath = path.join(this.uploadDir, key)
    const dir = path.dirname(filePath)
    
    // Create directory if it doesn't exist
    await fs.mkdir(dir, { recursive: true })
    
    // Write file
    await fs.writeFile(filePath, file)
    
    const accessUrl = options.visibility === 'public' 
      ? `/uploads/${key}`
      : undefined
    
    return {
      filePath: key,
      accessUrl
    }
  }
  
  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, filePath)
    return await fs.readFile(fullPath)
  }
  
  async delete(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadDir, filePath)
      await fs.unlink(fullPath)
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }
  
  getPublicUrl(filePath: string): string {
    return `/uploads/${filePath}`
  }
}

// ============================================================================
// AWS S3 STORAGE PROVIDER (Placeholder)
// ============================================================================

export class AWSStorageProvider implements StorageProvider {
  name = 'aws'
  private bucket: string
  private region: string
  
  constructor(bucket: string, region: string = 'us-east-1') {
    this.bucket = bucket
    this.region = region
  }
  
  async upload(file: Buffer, key: string, options: UploadOptions): Promise<{
    filePath: string
    accessUrl?: string
  }> {
    // TODO: Implement AWS S3 upload
    // This is a placeholder - in production, use AWS SDK
    console.log('AWS S3 upload not implemented yet')
    throw new Error('AWS S3 upload not implemented')
  }
  
  async download(filePath: string): Promise<Buffer> {
    // TODO: Implement AWS S3 download
    throw new Error('AWS S3 download not implemented')
  }
  
  async delete(filePath: string): Promise<boolean> {
    // TODO: Implement AWS S3 delete
    throw new Error('AWS S3 delete not implemented')
  }
  
  getPublicUrl(filePath: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${filePath}`
  }
}

// ============================================================================
// DIGITAL OCEAN SPACES PROVIDER (Placeholder)
// ============================================================================

export class DigitalOceanStorageProvider implements StorageProvider {
  name = 'digital_ocean'
  private spaceName: string
  private region: string
  private endpoint: string
  
  constructor(spaceName: string, region: string) {
    this.spaceName = spaceName
    this.region = region
    this.endpoint = `https://${region}.digitaloceanspaces.com`
  }
  
  async upload(file: Buffer, key: string, options: UploadOptions): Promise<{
    filePath: string
    accessUrl?: string
  }> {
    // TODO: Implement Digital Ocean Spaces upload
    // This is a placeholder - in production, use DO Spaces SDK
    console.log('Digital Ocean Spaces upload not implemented yet')
    throw new Error('Digital Ocean Spaces upload not implemented')
  }
  
  async download(filePath: string): Promise<Buffer> {
    // TODO: Implement Digital Ocean Spaces download
    throw new Error('Digital Ocean Spaces download not implemented')
  }
  
  async delete(filePath: string): Promise<boolean> {
    // TODO: Implement Digital Ocean Spaces delete
    throw new Error('Digital Ocean Spaces delete not implemented')
  }
  
  getPublicUrl(filePath: string): string {
    return `https://${this.spaceName}.${this.region}.digitaloceanspaces.com/${filePath}`
  }
}

// ============================================================================
// FILE STORAGE MANAGER
// ============================================================================

export class FileStorageManager {
  private providers: Map<string, StorageProvider> = new Map()
  private defaultProvider: string
  
  constructor() {
    // Initialize default providers
    this.addProvider('local', new LocalStorageProvider())
    this.defaultProvider = 'local'
    
    // Add cloud providers if configured
    if (process.env.AWS_S3_BUCKET) {
      this.addProvider('aws', new AWSStorageProvider(
        process.env.AWS_S3_BUCKET,
        process.env.AWS_REGION
      ))
    }
    
    if (process.env.DO_SPACES_NAME && process.env.DO_SPACES_REGION) {
      this.addProvider('digital_ocean', new DigitalOceanStorageProvider(
        process.env.DO_SPACES_NAME,
        process.env.DO_SPACES_REGION
      ))
    }
    
    // Set default provider from environment
    if (process.env.DEFAULT_STORAGE_PROVIDER) {
      this.defaultProvider = process.env.DEFAULT_STORAGE_PROVIDER
    }
  }
  
  addProvider(name: string, provider: StorageProvider): void {
    this.providers.set(name, provider)
  }
  
  getProvider(name?: string): StorageProvider {
    const providerName = name || this.defaultProvider
    const provider = this.providers.get(providerName)
    
    if (!provider) {
      throw new Error(`Storage provider '${providerName}' not found`)
    }
    
    return provider
  }
  
  // Upload file with full processing
  async uploadFile(
    file: Buffer,
    uploaderId: string,
    originalFilename: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<FileUpload> {
    // Validate file
    this.validateFile(file, mimeType, options)
    
    // Generate unique filename
    const extension = path.extname(originalFilename)
    const filename = this.generateFilename(extension)
    
    // Generate file path based on type and date
    const filePath = this.generateFilePath(filename, mimeType)
    
    // Get storage provider
    const provider = this.getProvider()
    
    // Upload to storage
    const uploadResult = await provider.upload(file, filePath, options)
    
    // Get file metadata
    const metadata = await this.extractMetadata(file, mimeType)
    
    // Calculate expiration
    const expiresAt = options.expiresIn 
      ? new Date(Date.now() + options.expiresIn * 1000)
      : undefined
    
    // Save to database
    const fileRecord: FileUpload = {
      id: uuidv4(),
      uploaderId,
      filename,
      originalFilename,
      fileSize: file.length,
      mimeType,
      filePath: uploadResult.filePath,
      storageProvider: provider.name as any,
      width: metadata.width,
      height: metadata.height,
      duration: metadata.duration,
      metadata: { ...metadata, ...options.metadata },
      visibility: options.visibility || 'private',
      accessUrl: uploadResult.accessUrl,
      createdAt: new Date(),
      expiresAt
    }
    
    await this.saveFileRecord(fileRecord)
    
    return fileRecord
  }
  
  // Get file by ID
  async getFile(id: string): Promise<FileUpload | null> {
    const sql = 'SELECT * FROM file_uploads WHERE id = $1'
    const result = await query(sql, [id])
    return result.rows[0] ? this.mapRowToFile(result.rows[0]) : null
  }
  
  // Download file content
  async downloadFile(id: string): Promise<{ file: Buffer; metadata: FileUpload } | null> {
    const fileRecord = await this.getFile(id)
    if (!fileRecord) return null
    
    const provider = this.getProvider(fileRecord.storageProvider)
    const file = await provider.download(fileRecord.filePath)
    
    return { file, metadata: fileRecord }
  }
  
  // Delete file
  async deleteFile(id: string): Promise<boolean> {
    const fileRecord = await this.getFile(id)
    if (!fileRecord) return false
    
    const provider = this.getProvider(fileRecord.storageProvider)
    const deleted = await provider.delete(fileRecord.filePath)
    
    if (deleted) {
      const sql = 'DELETE FROM file_uploads WHERE id = $1'
      await query(sql, [id])
    }
    
    return deleted
  }
  
  // Get user files
  async getUserFiles(uploaderId: string, options: {
    mimeTypePrefix?: string
    visibility?: string
    page?: number
    limit?: number
  } = {}): Promise<{ files: FileUpload[]; pagination: any }> {
    const { mimeTypePrefix, visibility, page = 1, limit = 20 } = options
    
    let sql = `
      SELECT * FROM file_uploads 
      WHERE uploader_id = $1
    `
    
    const params: any[] = [uploaderId]
    let paramIndex = 2
    
    if (mimeTypePrefix) {
      sql += ` AND mime_type LIKE $${paramIndex}`
      params.push(`${mimeTypePrefix}%`)
      paramIndex++
    }
    
    if (visibility) {
      sql += ` AND visibility = $${paramIndex}`
      params.push(visibility)
      paramIndex++
    }
    
    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, (page - 1) * limit)
    
    const result = await query(sql, params)
    const files = result.rows.map(row => this.mapRowToFile(row))
    
    return {
      files,
      pagination: {
        page,
        limit,
        total: files.length, // TODO: Implement proper count
        pages: Math.ceil(files.length / limit)
      }
    }
  }
  
  // Get public URL
  getPublicUrl(fileId: string): string | null {
    // This would typically be an async method that looks up the file
    // For now, return a placeholder
    return `/api/files/${fileId}`
  }
  
  // Clean expired files
  async cleanExpiredFiles(): Promise<number> {
    const sql = `
      SELECT * FROM file_uploads 
      WHERE expires_at IS NOT NULL AND expires_at <= NOW()
    `
    
    const result = await query(sql)
    let deletedCount = 0
    
    for (const row of result.rows) {
      const success = await this.deleteFile(row.id)
      if (success) deletedCount++
    }
    
    return deletedCount
  }
  
  // Private helper methods
  private validateFile(file: Buffer, mimeType: string, options: UploadOptions): void {
    // Check file size
    const maxSize = options.maxFileSize || 50 * 1024 * 1024 // 50MB default
    if (file.length > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize} bytes`)
    }
    
    // Check MIME type
    if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(mimeType)) {
      throw new Error(`File type '${mimeType}' is not allowed`)
    }
    
    // Additional validation based on file type
    if (mimeType.startsWith('image/')) {
      // Image-specific validation
      if (file.length < 100) {
        throw new Error('Invalid image file')
      }
    }
  }
  
  private generateFilename(extension: string): string {
    const uuid = uuidv4()
    const timestamp = Date.now().toString(36)
    return `${timestamp}_${uuid}${extension}`
  }
  
  private generateFilePath(filename: string, mimeType: string): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    let category = 'misc'
    if (mimeType.startsWith('image/')) category = 'images'
    else if (mimeType.startsWith('video/')) category = 'videos'
    else if (mimeType.startsWith('audio/')) category = 'audio'
    else if (mimeType.includes('pdf')) category = 'documents'
    else if (mimeType.includes('zip') || mimeType.includes('tar')) category = 'archives'
    
    return `${category}/${year}/${month}/${day}/${filename}`
  }
  
  private async extractMetadata(file: Buffer, mimeType: string): Promise<any> {
    const metadata: any = {}
    
    // Extract metadata based on file type
    if (mimeType.startsWith('image/')) {
      // TODO: Extract image dimensions using a library like sharp
      // For now, return placeholder values
      metadata.width = null
      metadata.height = null
    } else if (mimeType.startsWith('video/')) {
      // TODO: Extract video metadata using ffprobe
      metadata.duration = null
      metadata.width = null
      metadata.height = null
    } else if (mimeType.startsWith('audio/')) {
      // TODO: Extract audio metadata
      metadata.duration = null
    }
    
    // Calculate file hash for deduplication
    metadata.hash = createHash('sha256').update(file).digest('hex')
    
    return metadata
  }
  
  private async saveFileRecord(fileRecord: FileUpload): Promise<void> {
    const sql = `
      INSERT INTO file_uploads (
        id, uploader_id, filename, original_filename, file_size, mime_type,
        file_path, storage_provider, width, height, duration, metadata,
        visibility, access_url, created_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `
    
    const params = [
      fileRecord.id,
      fileRecord.uploaderId,
      fileRecord.filename,
      fileRecord.originalFilename,
      fileRecord.fileSize,
      fileRecord.mimeType,
      fileRecord.filePath,
      fileRecord.storageProvider,
      fileRecord.width,
      fileRecord.height,
      fileRecord.duration,
      JSON.stringify(fileRecord.metadata || {}),
      fileRecord.visibility,
      fileRecord.accessUrl,
      fileRecord.createdAt,
      fileRecord.expiresAt
    ]
    
    await query(sql, params)
  }
  
  private mapRowToFile(row: any): FileUpload {
    return {
      id: row.id,
      uploaderId: row.uploader_id,
      filename: row.filename,
      originalFilename: row.original_filename,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      filePath: row.file_path,
      storageProvider: row.storage_provider,
      width: row.width,
      height: row.height,
      duration: row.duration,
      metadata: row.metadata || {},
      visibility: row.visibility,
      accessUrl: row.access_url,
      createdAt: row.created_at,
      expiresAt: row.expires_at
    }
  }
}

// ============================================================================
// FILE UPLOAD UTILITIES
// ============================================================================

export class FileUploadUtils {
  // Generate secure upload URL (for direct client uploads)
  static generateUploadUrl(uploaderId: string, options: {
    maxFileSize?: number
    allowedMimeTypes?: string[]
    expiresIn?: number
  } = {}): {
    uploadUrl: string
    uploadId: string
    expiresAt: Date
  } {
    const uploadId = uuidv4()
    const expiresAt = new Date(Date.now() + (options.expiresIn || 3600) * 1000)
    
    // In production, this would generate a signed URL
    const uploadUrl = `/api/files/upload/${uploadId}`
    
    return {
      uploadUrl,
      uploadId,
      expiresAt
    }
  }
  
  // Validate file before upload
  static validateFile(file: File, options: UploadOptions = {}): { valid: boolean; error?: string } {
    // Check file size
    const maxSize = options.maxFileSize || 50 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum allowed size (${Math.round(maxSize / 1024 / 1024)}MB)`
      }
    }
    
    // Check MIME type
    if (options.allowedMimeTypes && !options.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type '${file.type}' is not allowed`
      }
    }
    
    return { valid: true }
  }
  
  // Get file type category
  static getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    if (mimeType.startsWith('audio/')) return 'audio'
    if (mimeType.includes('pdf')) return 'document'
    if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('rar')) return 'archive'
    if (mimeType.includes('text/') || mimeType.includes('json') || mimeType.includes('xml')) return 'text'
    return 'other'
  }
  
  // Format file size for display
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Get file icon based on type
  static getFileIcon(mimeType: string): string {
    const category = this.getFileCategory(mimeType)
    
    const icons = {
      image: '🖼️',
      video: '🎥',
      audio: '🎵',
      document: '📄',
      archive: '📦',
      text: '📝',
      other: '📄'
    }
    
    return icons[category as keyof typeof icons] || icons.other
  }
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

export const FileUploadPresets = {
  // Avatar images
  AVATAR: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    visibility: 'public' as const,
    generateThumbnail: true
  },
  
  // Strategy files
  STRATEGY: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedMimeTypes: [
      'application/zip',
      'application/x-zip-compressed',
      'text/plain',
      'application/json',
      'text/python',
      'text/javascript'
    ],
    visibility: 'private' as const
  },
  
  // Post media
  POST_MEDIA: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    ],
    visibility: 'public' as const,
    generateThumbnail: true
  },
  
  // Course videos
  COURSE_VIDEO: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
    visibility: 'restricted' as const
  },
  
  // Documents
  DOCUMENT: {
    maxFileSize: 25 * 1024 * 1024, // 25MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    visibility: 'private' as const
  }
}

// Create singleton instance
export const fileStorage = new FileStorageManager()

// Export default
export default {
  FileStorageManager,
  FileUploadUtils,
  FileUploadPresets,
  fileStorage
}

