import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - Get specific course details
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = params

    // Mock detailed course data - replace with database query
    const mockCourse = {
      id: courseId,
      title: 'Advanced Trading Strategies',
      description: 'Master professional trading techniques used by institutional traders',
      category: 'Trading',
      difficulty: 'advanced',
      duration: '8 hours',
      instructor: {
        id: 'instructor-1',
        name: 'John Smith',
        email: 'john@nexural.com',
        avatar: '/api/placeholder/100/100',
        bio: 'Former hedge fund manager with 15+ years experience',
        rating: 4.9,
        totalStudents: 5420
      },
      thumbnail: '/api/placeholder/400/300',
      price: 299,
      isPremium: true,
      learningObjectives: [
        'Master advanced chart patterns',
        'Understand market microstructure',
        'Develop systematic trading approaches',
        'Risk management techniques'
      ],
      prerequisites: [
        'Basic trading knowledge',
        'Understanding of financial markets',
        'Completed "Trading Fundamentals" course'
      ],
      tags: ['trading', 'advanced', 'strategies', 'institutional'],
      status: 'published',
      enrolledStudents: 1247,
      rating: 4.8,
      totalRatings: 342,
      isPublished: true,
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-20').toISOString(),
      createdBy: 'admin-1',
      
      // Modules/Chapters
      modules: [
        {
          id: 'module-1',
          title: 'Market Structure Analysis',
          description: 'Understanding how markets operate',
          order: 1,
          duration: '45 minutes',
          isPublished: true,
          chapters: [
            {
              id: 'chapter-1',
              title: 'Introduction to Market Making',
              duration: '15 minutes',
              videoUrl: '/api/placeholder/video/1',
              order: 1,
              isCompleted: false
            },
            {
              id: 'chapter-2', 
              title: 'Order Flow Analysis',
              duration: '30 minutes',
              videoUrl: '/api/placeholder/video/2',
              order: 2,
              isCompleted: false
            }
          ]
        },
        {
          id: 'module-2',
          title: 'Advanced Chart Patterns',
          description: 'Recognizing profitable patterns',
          order: 2,
          duration: '60 minutes',
          isPublished: true,
          chapters: [
            {
              id: 'chapter-3',
              title: 'Complex Reversal Patterns',
              duration: '25 minutes',
              videoUrl: '/api/placeholder/video/3',
              order: 1,
              isCompleted: false
            },
            {
              id: 'chapter-4',
              title: 'Continuation Pattern Recognition',
              duration: '35 minutes',
              videoUrl: '/api/placeholder/video/4',
              order: 2,
              isCompleted: false
            }
          ]
        }
      ],

      // Quizzes
      quizzes: [
        {
          id: 'quiz-1',
          title: 'Market Structure Assessment',
          moduleId: 'module-1',
          questions: 10,
          timeLimit: 15,
          passingScore: 80,
          attempts: 3,
          isPublished: true
        },
        {
          id: 'quiz-2',
          title: 'Chart Pattern Recognition',
          moduleId: 'module-2', 
          questions: 15,
          timeLimit: 20,
          passingScore: 85,
          attempts: 2,
          isPublished: true
        }
      ],

      // Resources
      resources: [
        {
          id: 'resource-1',
          title: 'Trading Strategy Templates',
          type: 'pdf',
          size: '2.4 MB',
          url: '/api/placeholder/pdf/1'
        },
        {
          id: 'resource-2',
          title: 'Market Analysis Spreadsheet',
          type: 'excel',
          size: '1.8 MB',
          url: '/api/placeholder/excel/1'
        }
      ],

      // Analytics
      analytics: {
        totalViews: 15420,
        completionRate: 73.5,
        averageRating: 4.8,
        enrollmentTrend: [
          { date: '2024-01-15', enrollments: 45 },
          { date: '2024-01-16', enrollments: 52 },
          { date: '2024-01-17', enrollments: 38 }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      course: mockCourse
    })

  } catch (error: any) {
    console.error('Course API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update specific course
export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('edit_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { courseId } = params
    const body = await request.json()
    
    const {
      title,
      description,
      category,
      difficulty,
      instructor,
      thumbnail,
      price,
      isPremium,
      learningObjectives,
      prerequisites,
      tags,
      status
    } = body

    // Validation
    if (status && !['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be draft, published, or archived' },
        { status: 400 }
      )
    }

    // Create update object
    const updates = {
      ...(title && { title }),
      ...(description && { description }),
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(instructor && { instructor }),
      ...(thumbnail && { thumbnail }),
      ...(price !== undefined && { price }),
      ...(isPremium !== undefined && { isPremium }),
      ...(learningObjectives && { learningObjectives }),
      ...(prerequisites && { prerequisites }),
      ...(tags && { tags }),
      ...(status && { status, isPublished: status === 'published' }),
      updatedAt: new Date().toISOString(),
      updatedBy: session.userId
    }

    // In production, update in database
    console.log('Updating course:', courseId, updates)

    return NextResponse.json({
      success: true,
      courseId,
      updates,
      message: 'Course updated successfully'
    })

  } catch (error: any) {
    console.error('Course API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update course', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('delete_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { courseId } = params

    // Check if course has enrolled students
    const enrolledStudents = 1247 // Mock - fetch from database
    
    if (enrolledStudents > 0) {
      return NextResponse.json(
        { error: `Cannot delete course with ${enrolledStudents} enrolled students. Archive instead.` },
        { status: 400 }
      )
    }

    // In production, delete from database with cascade
    console.log('Deleting course:', courseId)

    return NextResponse.json({
      success: true,
      courseId,
      message: 'Course deleted successfully'
    })

  } catch (error: any) {
    console.error('Course API DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete course', details: error.message },
      { status: 500 }
    )
  }
}

