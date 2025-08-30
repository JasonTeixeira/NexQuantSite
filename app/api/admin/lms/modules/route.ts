import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - List modules for a course
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID required' },
        { status: 400 }
      )
    }

    // Mock modules data
    const mockModules = [
      {
        id: 'module-1',
        courseId,
        title: 'Market Structure Analysis',
        description: 'Understanding how markets operate at the institutional level',
        order: 1,
        duration: '45 minutes',
        isPublished: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-16').toISOString(),
        chapters: [
          {
            id: 'chapter-1',
            moduleId: 'module-1',
            title: 'Introduction to Market Making',
            description: 'How market makers provide liquidity',
            duration: '15 minutes',
            videoUrl: '/api/placeholder/video/1',
            order: 1,
            isPublished: true,
            resources: [
              {
                id: 'resource-1',
                title: 'Market Making Guide.pdf',
                type: 'pdf',
                size: '1.2 MB',
                url: '/api/placeholder/pdf/1'
              }
            ]
          },
          {
            id: 'chapter-2',
            moduleId: 'module-1',
            title: 'Order Flow Analysis',
            description: 'Reading institutional order flow',
            duration: '30 minutes',
            videoUrl: '/api/placeholder/video/2',
            order: 2,
            isPublished: true,
            resources: []
          }
        ]
      },
      {
        id: 'module-2',
        courseId,
        title: 'Advanced Chart Patterns',
        description: 'Recognizing profitable institutional patterns',
        order: 2,
        duration: '60 minutes',
        isPublished: false,
        createdAt: new Date('2024-01-16').toISOString(),
        updatedAt: new Date('2024-01-17').toISOString(),
        chapters: [
          {
            id: 'chapter-3',
            moduleId: 'module-2',
            title: 'Complex Reversal Patterns',
            description: 'Advanced reversal recognition',
            duration: '25 minutes',
            videoUrl: '/api/placeholder/video/3',
            order: 1,
            isPublished: false,
            resources: []
          },
          {
            id: 'chapter-4',
            moduleId: 'module-2',
            title: 'Continuation Pattern Recognition',
            description: 'Identifying continuation signals',
            duration: '35 minutes',
            videoUrl: '/api/placeholder/video/4',
            order: 2,
            isPublished: false,
            resources: []
          }
        ]
      }
    ]

    return NextResponse.json({
      success: true,
      modules: mockModules,
      courseId
    })

  } catch (error: any) {
    console.error('Modules API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch modules', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new module
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('create_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      courseId,
      title,
      description,
      order,
      isPublished = false
    } = body

    // Validation
    if (!courseId || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: courseId, title, description' },
        { status: 400 }
      )
    }

    // Create new module
    const newModule = {
      id: `module-${Date.now()}`,
      courseId,
      title,
      description,
      order: order || 1,
      duration: '0 minutes', // Will be calculated based on chapters
      isPublished,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.userId,
      chapters: []
    }

    // In production, save to database
    console.log('Creating module:', newModule)

    return NextResponse.json({
      success: true,
      module: newModule,
      message: 'Module created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Modules API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create module', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update module order/bulk operations
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('edit_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { operation, moduleIds, updates } = body

    if (operation === 'reorder') {
      // Reorder modules
      if (!moduleIds || !Array.isArray(moduleIds)) {
        return NextResponse.json(
          { error: 'Module IDs required for reordering' },
          { status: 400 }
        )
      }

      // In production, update order in database
      console.log('Reordering modules:', moduleIds)

      return NextResponse.json({
        success: true,
        operation: 'reorder',
        moduleIds,
        message: 'Modules reordered successfully'
      })
    }

    if (operation === 'bulk_update') {
      // Bulk update modules
      if (!moduleIds || !Array.isArray(moduleIds) || !updates) {
        return NextResponse.json(
          { error: 'Module IDs and updates required' },
          { status: 400 }
        )
      }

      // In production, perform bulk update
      console.log('Bulk updating modules:', moduleIds, updates)

      return NextResponse.json({
        success: true,
        operation: 'bulk_update',
        updatedCount: moduleIds.length,
        message: `Successfully updated ${moduleIds.length} modules`
      })
    }

    return NextResponse.json(
      { error: 'Invalid operation. Supported: reorder, bulk_update' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Modules API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update modules', details: error.message },
      { status: 500 }
    )
  }
}

