import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - Get specific module with chapters
export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { moduleId } = params

    // Mock detailed module data
    const mockModule = {
      id: moduleId,
      courseId: 'course-1',
      title: 'Market Structure Analysis',
      description: 'Understanding how markets operate at the institutional level',
      order: 1,
      duration: '45 minutes',
      isPublished: true,
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-16').toISOString(),
      createdBy: 'admin-1',
      
      // Detailed chapters
      chapters: [
        {
          id: 'chapter-1',
          moduleId,
          title: 'Introduction to Market Making',
          description: 'How market makers provide liquidity and profit from bid-ask spreads',
          content: `
            <h2>Learning Objectives</h2>
            <ul>
              <li>Understand the role of market makers</li>
              <li>Learn about bid-ask spreads</li>
              <li>Recognize market making strategies</li>
            </ul>
            
            <h2>Key Concepts</h2>
            <p>Market makers are crucial participants who provide liquidity to financial markets...</p>
          `,
          duration: '15 minutes',
          videoUrl: '/api/placeholder/video/1',
          order: 1,
          isPublished: true,
          hasQuiz: true,
          quizId: 'quiz-1',
          resources: [
            {
              id: 'resource-1',
              title: 'Market Making Guide.pdf',
              type: 'pdf',
              size: '1.2 MB',
              url: '/api/placeholder/pdf/1',
              description: 'Comprehensive guide to market making principles'
            },
            {
              id: 'resource-2',
              title: 'Market Making Examples.xlsx',
              type: 'excel',
              size: '800 KB',
              url: '/api/placeholder/excel/1',
              description: 'Practical examples and calculations'
            }
          ],
          notes: [
            {
              id: 'note-1',
              timestamp: '00:05:30',
              title: 'Key Point: Spread Dynamics',
              content: 'Spreads widen during volatile periods due to increased risk'
            },
            {
              id: 'note-2',
              timestamp: '00:12:15',
              title: 'Important: Inventory Management',
              content: 'Market makers must carefully manage their inventory positions'
            }
          ]
        },
        {
          id: 'chapter-2',
          moduleId,
          title: 'Order Flow Analysis',
          description: 'Reading and interpreting institutional order flow patterns',
          content: `
            <h2>Learning Objectives</h2>
            <ul>
              <li>Identify institutional order flow</li>
              <li>Analyze volume and price action</li>
              <li>Recognize accumulation and distribution</li>
            </ul>
          `,
          duration: '30 minutes',
          videoUrl: '/api/placeholder/video/2',
          order: 2,
          isPublished: true,
          hasQuiz: false,
          resources: [
            {
              id: 'resource-3',
              title: 'Order Flow Indicators.zip',
              type: 'code',
              size: '2.1 MB',
              url: '/api/placeholder/code/1',
              description: 'Custom indicators for order flow analysis'
            }
          ],
          notes: []
        }
      ],

      // Module-level quiz
      quiz: {
        id: 'module-quiz-1',
        title: 'Market Structure Assessment',
        description: 'Test your understanding of market structure concepts',
        questions: 10,
        timeLimit: 15,
        passingScore: 80,
        maxAttempts: 3,
        isPublished: true,
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: 'What is the primary role of a market maker?',
            options: [
              'To provide liquidity to the market',
              'To manipulate prices',
              'To execute large trades',
              'To provide market analysis'
            ],
            correctAnswer: 0,
            explanation: 'Market makers provide liquidity by continuously quoting bid and ask prices.',
            points: 10
          }
        ]
      },

      // Analytics
      analytics: {
        totalViews: 2847,
        averageCompletionTime: '42 minutes',
        completionRate: 78.5,
        dropOffPoints: [
          { chapterId: 'chapter-1', timestamp: '00:08:30', dropoffRate: 12.3 },
          { chapterId: 'chapter-2', timestamp: '00:15:45', dropoffRate: 8.7 }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      module: mockModule
    })

  } catch (error: any) {
    console.error('Module API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch module', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update specific module
export async function PUT(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('edit_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { moduleId } = params
    const body = await request.json()

    const {
      title,
      description,
      order,
      isPublished,
      chapters
    } = body

    // Create update object
    const updates = {
      ...(title && { title }),
      ...(description && { description }),
      ...(order !== undefined && { order }),
      ...(isPublished !== undefined && { isPublished }),
      ...(chapters && { chapters }),
      updatedAt: new Date().toISOString(),
      updatedBy: session.userId
    }

    // In production, update in database
    console.log('Updating module:', moduleId, updates)

    // If chapters were updated, recalculate total duration
    if (chapters) {
      const totalMinutes = chapters.reduce((total: number, chapter: any) => {
        const duration = chapter.duration || '0 minutes'
        const minutes = parseInt(duration.split(' ')[0]) || 0
        return total + minutes
      }, 0)
      updates.duration = `${totalMinutes} minutes`
    }

    return NextResponse.json({
      success: true,
      moduleId,
      updates,
      message: 'Module updated successfully'
    })

  } catch (error: any) {
    console.error('Module API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update module', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific module
export async function DELETE(
  request: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('delete_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { moduleId } = params

    // Check for dependencies (student progress, etc.)
    const hasStudentProgress = true // Mock - check database
    
    if (hasStudentProgress) {
      return NextResponse.json(
        { error: 'Cannot delete module with existing student progress. Archive instead.' },
        { status: 400 }
      )
    }

    // In production, delete from database with cascade
    console.log('Deleting module:', moduleId)

    return NextResponse.json({
      success: true,
      moduleId,
      message: 'Module deleted successfully'
    })

  } catch (error: any) {
    console.error('Module API DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete module', details: error.message },
      { status: 500 }
    )
  }
}

