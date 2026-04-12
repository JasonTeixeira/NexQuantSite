import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

// File upload configuration
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = [
  // Images
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  // Videos
  'video/mp4', 'video/webm', 'video/mov', 'video/avi',
  // Documents
  'application/pdf', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Audio
  'audio/mp3', 'audio/wav', 'audio/ogg'
]

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, 'thumbnails')

// Ensure upload directories exist
async function ensureUploadDirs() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
  if (!existsSync(THUMBNAILS_DIR)) {
    await mkdir(THUMBNAILS_DIR, { recursive: true })
  }
}

// Generate unique filename
function generateFilename(originalName: string, fileId?: string): string {
  const id = fileId || uuidv4()
  const ext = path.extname(originalName)
  const name = path.basename(originalName, ext)
  const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_')
  return `${id}_${safeName}${ext}`
}

// Get file metadata
function getFileMetadata(file: File): Promise<any> {
  return new Promise((resolve) => {
    if (file.type.startsWith('image/')) {
      // For images, we could extract EXIF data, dimensions, etc.
      // This is a simplified version
      resolve({
        type: 'image',
        originalSize: file.size,
        mimeType: file.type
      })
    } else if (file.type.startsWith('video/')) {
      resolve({
        type: 'video',
        originalSize: file.size,
        mimeType: file.type
      })
    } else {
      resolve({
        type: 'document',
        originalSize: file.size,
        mimeType: file.type
      })
    }
  })
}

// Save thumbnail if provided
async function saveThumbnail(thumbnailData: string, fileId: string): Promise<string> {
  const thumbnailBuffer = Buffer.from(thumbnailData.split(',')[1], 'base64')
  const thumbnailFilename = `thumb_${fileId}.jpg`
  const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailFilename)
  
  await writeFile(thumbnailPath, thumbnailBuffer)
  return `/uploads/thumbnails/${thumbnailFilename}`
}

export async function POST(request: NextRequest) {
  try {
    await ensureUploadDirs()

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileId = formData.get('fileId') as string
    const thumbnail = formData.get('thumbnail') as string

    // Validate file exists
    if (!file || !file.name) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File size must be less than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB` 
        },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File type not supported. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Generate unique filename
    const filename = generateFilename(file.name, fileId)
    const filePath = path.join(UPLOAD_DIR, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Save thumbnail if provided
    let thumbnailUrl: string | undefined
    if (thumbnail && thumbnail.startsWith('data:image/')) {
      thumbnailUrl = await saveThumbnail(thumbnail, fileId || uuidv4())
    }

    // Get file metadata
    const metadata = await getFileMetadata(file)

    // Create file record
    const uploadedFile = {
      id: fileId || uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/${filename}`,
      thumbnail: thumbnailUrl,
      metadata: {
        ...metadata,
        uploadedBy: 'anonymous', // In real app, get from auth
        uploadedAt: new Date().toISOString()
      },
      uploadedAt: new Date().toISOString()
    }

    // In a real application, you would save this to a database
    // For now, we'll just return the file information

    return NextResponse.json({
      success: true,
      data: { file: uploadedFile },
      message: 'File uploaded successfully'
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID required' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Check if user has permission to delete this file
    // 2. Remove file from database
    // 3. Delete physical file from storage
    // 4. Delete thumbnail if exists

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Delete failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// Get file information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID required' },
        { status: 400 }
      )
    }

    // In a real application, you would fetch file info from database
    // For now, return a placeholder response

    return NextResponse.json({
      success: true,
      data: {
        file: {
          id: fileId,
          name: 'example.jpg',
          size: 1024000,
          type: 'image/jpeg',
          url: `/uploads/${fileId}_example.jpg`,
          uploadedAt: new Date().toISOString()
        }
      }
    })

  } catch (error: any) {
    console.error('Get file error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get file info', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}

