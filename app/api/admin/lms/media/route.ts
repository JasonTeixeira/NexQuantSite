import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - List all media files with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const type = searchParams.get('type') // video, audio, image, document
    const courseId = searchParams.get('courseId')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'uploadedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Mock media files data
    const mockMedia = [
      {
        id: 'media-1',
        filename: 'market-structure-intro.mp4',
        originalName: 'Market Structure Introduction.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        size: 156789456, // bytes
        duration: 900, // seconds for video/audio
        dimensions: { width: 1920, height: 1080 },
        url: '/api/media/market-structure-intro.mp4',
        thumbnailUrl: '/api/media/thumbnails/market-structure-intro.jpg',
        processingStatus: 'completed',
        uploadedAt: '2024-01-15T10:30:00Z',
        uploadedBy: 'admin-1',
        uploaderName: 'Admin User',
        courseId: 'course-1',
        courseName: 'Advanced Trading Strategies',
        moduleId: 'module-1',
        moduleName: 'Market Structure Analysis',
        chapterId: 'chapter-1',
        chapterName: 'Introduction to Market Making',
        usage: {
          totalViews: 1247,
          uniqueViewers: 892,
          totalWatchTime: 18720, // seconds
          averageWatchTime: 720,
          dropOffRate: 15.3
        },
        metadata: {
          codec: 'H.264',
          bitrate: 2500,
          framerate: 30,
          quality: '1080p'
        },
        tags: ['market-making', 'introduction', 'liquidity'],
        isActive: true
      },
      {
        id: 'media-2',
        filename: 'order-flow-analysis.mp4',
        originalName: 'Order Flow Analysis Deep Dive.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        size: 234567890,
        duration: 1800,
        dimensions: { width: 1920, height: 1080 },
        url: '/api/media/order-flow-analysis.mp4',
        thumbnailUrl: '/api/media/thumbnails/order-flow-analysis.jpg',
        processingStatus: 'completed',
        uploadedAt: '2024-01-16T14:20:00Z',
        uploadedBy: 'admin-1',
        uploaderName: 'Admin User',
        courseId: 'course-1',
        courseName: 'Advanced Trading Strategies',
        moduleId: 'module-1',
        moduleName: 'Market Structure Analysis',
        chapterId: 'chapter-2',
        chapterName: 'Order Flow Analysis',
        usage: {
          totalViews: 1089,
          uniqueViewers: 756,
          totalWatchTime: 16340,
          averageWatchTime: 825,
          dropOffRate: 22.1
        },
        metadata: {
          codec: 'H.264',
          bitrate: 3000,
          framerate: 30,
          quality: '1080p'
        },
        tags: ['order-flow', 'analysis', 'institutional'],
        isActive: true
      },
      {
        id: 'media-3',
        filename: 'trading-strategy-guide.pdf',
        originalName: 'Professional Trading Strategy Guide.pdf',
        type: 'document',
        mimeType: 'application/pdf',
        size: 5432100,
        url: '/api/media/trading-strategy-guide.pdf',
        thumbnailUrl: '/api/media/thumbnails/trading-strategy-guide.png',
        processingStatus: 'completed',
        uploadedAt: '2024-01-17T09:15:00Z',
        uploadedBy: 'instructor-1',
        uploaderName: 'John Smith',
        courseId: 'course-1',
        courseName: 'Advanced Trading Strategies',
        moduleId: null,
        usage: {
          totalDownloads: 567,
          uniqueDownloaders: 423
        },
        metadata: {
          pages: 47,
          language: 'en'
        },
        tags: ['strategy', 'guide', 'pdf'],
        isActive: true
      },
      {
        id: 'media-4',
        filename: 'chart-patterns.mp4',
        originalName: 'Advanced Chart Patterns.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        size: 198765432,
        duration: 1200,
        dimensions: { width: 1920, height: 1080 },
        url: '/api/media/chart-patterns.mp4',
        thumbnailUrl: '/api/media/thumbnails/chart-patterns.jpg',
        processingStatus: 'processing',
        uploadedAt: '2024-01-18T16:45:00Z',
        uploadedBy: 'admin-1',
        uploaderName: 'Admin User',
        courseId: 'course-1',
        courseName: 'Advanced Trading Strategies',
        moduleId: 'module-2',
        moduleName: 'Advanced Chart Patterns',
        chapterId: null,
        usage: {
          totalViews: 0,
          uniqueViewers: 0,
          totalWatchTime: 0,
          averageWatchTime: 0,
          dropOffRate: 0
        },
        metadata: {
          codec: 'H.264',
          bitrate: 2800,
          framerate: 30,
          quality: '1080p'
        },
        tags: ['chart-patterns', 'advanced'],
        isActive: false
      }
    ]

    // Apply filters
    let filteredMedia = mockMedia
    if (type) {
      filteredMedia = filteredMedia.filter(media => media.type === type)
    }
    if (courseId) {
      filteredMedia = filteredMedia.filter(media => media.courseId === courseId)
    }
    if (search) {
      const searchLower = search.toLowerCase()
      filteredMedia = filteredMedia.filter(media =>
        media.originalName.toLowerCase().includes(searchLower) ||
        media.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Sorting
    filteredMedia.sort((a, b) => {
      let aValue, bValue
      switch (sortBy) {
        case 'size':
          aValue = a.size
          bValue = b.size
          break
        case 'name':
          aValue = a.originalName.toLowerCase()
          bValue = b.originalName.toLowerCase()
          break
        case 'uploadedAt':
        default:
          aValue = new Date(a.uploadedAt).getTime()
          bValue = new Date(b.uploadedAt).getTime()
      }
      
      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    // Pagination
    const offset = (page - 1) * limit
    const paginatedMedia = filteredMedia.slice(offset, offset + limit)

    // Calculate storage statistics
    const totalSize = filteredMedia.reduce((sum, media) => sum + media.size, 0)
    const typeDistribution = filteredMedia.reduce((acc, media) => {
      acc[media.type] = (acc[media.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      media: paginatedMedia,
      pagination: {
        page,
        limit,
        total: filteredMedia.length,
        pages: Math.ceil(filteredMedia.length / limit)
      },
      statistics: {
        totalFiles: filteredMedia.length,
        totalSize,
        typeDistribution,
        storageUsed: '2.4 GB',
        storageLimit: '10 GB'
      },
      filters: {
        types: ['video', 'audio', 'image', 'document'],
        sortOptions: [
          { value: 'uploadedAt', label: 'Upload Date' },
          { value: 'name', label: 'Name' },
          { value: 'size', label: 'File Size' }
        ]
      }
    })

  } catch (error: any) {
    console.error('Media API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Upload new media file
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('upload_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // In a real implementation, this would handle multipart form data
    // For now, we'll simulate the upload process
    const body = await request.json()
    const {
      filename,
      originalName,
      type,
      mimeType,
      size,
      courseId,
      moduleId,
      chapterId,
      tags = []
    } = body

    // Validation
    if (!filename || !originalName || !type || !mimeType || !size) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, originalName, type, mimeType, size' },
        { status: 400 }
      )
    }

    // File size limits (in bytes)
    const limits = {
      video: 500 * 1024 * 1024, // 500 MB
      audio: 100 * 1024 * 1024, // 100 MB
      image: 10 * 1024 * 1024,  // 10 MB
      document: 50 * 1024 * 1024 // 50 MB
    }

    if (size > (limits[type as keyof typeof limits] || limits.document)) {
      return NextResponse.json(
        { error: `File size exceeds limit for ${type} files` },
        { status: 400 }
      )
    }

    const newMedia = {
      id: `media-${Date.now()}`,
      filename,
      originalName,
      type,
      mimeType,
      size,
      url: `/api/media/${filename}`,
      thumbnailUrl: type === 'video' ? `/api/media/thumbnails/${filename.replace(/\.[^/.]+$/, '.jpg')}` : null,
      processingStatus: type === 'video' ? 'processing' : 'completed',
      uploadedAt: new Date().toISOString(),
      uploadedBy: session.userId,
      uploaderName: session.username,
      courseId: courseId || null,
      moduleId: moduleId || null,
      chapterId: chapterId || null,
      usage: {
        totalViews: 0,
        uniqueViewers: 0,
        totalWatchTime: 0,
        averageWatchTime: 0,
        dropOffRate: 0
      },
      metadata: {},
      tags,
      isActive: true
    }

    // In production:
    // 1. Store file in cloud storage (AWS S3, Azure Blob, etc.)
    // 2. Generate thumbnails for videos/images
    // 3. Process video transcoding if needed
    // 4. Save metadata to database
    // 5. Create processing job if required

    console.log('Creating media:', newMedia)

    return NextResponse.json({
      success: true,
      media: newMedia,
      message: 'File uploaded successfully',
      processingStatus: newMedia.processingStatus
    }, { status: 201 })

  } catch (error: any) {
    console.error('Media API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to upload media', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Bulk delete media files
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('delete_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { mediaIds } = body

    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return NextResponse.json(
        { error: 'Media IDs required' },
        { status: 400 }
      )
    }

    // Check for usage in courses
    const filesInUse = mediaIds.filter(id => {
      // Mock check - in production, query database for usage
      return ['media-1', 'media-2'].includes(id)
    })

    if (filesInUse.length > 0) {
      return NextResponse.json(
        { 
          error: 'Some files are in use and cannot be deleted',
          filesInUse,
          suggestion: 'Remove from courses first or replace with other media'
        },
        { status: 400 }
      )
    }

    // In production:
    // 1. Delete files from cloud storage
    // 2. Remove database records
    // 3. Clean up any associated processing jobs
    console.log('Deleting media files:', mediaIds)

    return NextResponse.json({
      success: true,
      deletedCount: mediaIds.length,
      message: `Successfully deleted ${mediaIds.length} media files`
    })

  } catch (error: any) {
    console.error('Media API DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete media', details: error.message },
      { status: 500 }
    )
  }
}

