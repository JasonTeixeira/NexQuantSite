import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - List all quizzes with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const moduleId = searchParams.get('moduleId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    // Mock quizzes data
    const mockQuizzes = [
      {
        id: 'quiz-1',
        title: 'Market Structure Assessment',
        description: 'Test your understanding of institutional market structure',
        courseId: 'course-1',
        moduleId: 'module-1',
        type: 'assessment',
        difficulty: 'intermediate',
        questions: 10,
        timeLimit: 15,
        passingScore: 80,
        maxAttempts: 3,
        isPublished: true,
        isRandomized: true,
        showCorrectAnswers: false,
        allowReview: true,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-16').toISOString(),
        createdBy: 'admin-1',
        analytics: {
          totalAttempts: 847,
          averageScore: 76.3,
          passRate: 68.5,
          averageTime: 12.4
        }
      },
      {
        id: 'quiz-2',
        title: 'Chart Pattern Recognition',
        description: 'Identify advanced chart patterns used by professionals',
        courseId: 'course-1',
        moduleId: 'module-2',
        type: 'practice',
        difficulty: 'advanced',
        questions: 15,
        timeLimit: 20,
        passingScore: 85,
        maxAttempts: 5,
        isPublished: false,
        isRandomized: true,
        showCorrectAnswers: true,
        allowReview: true,
        createdAt: new Date('2024-01-16').toISOString(),
        updatedAt: new Date('2024-01-17').toISOString(),
        createdBy: 'admin-1',
        analytics: {
          totalAttempts: 234,
          averageScore: 82.1,
          passRate: 74.2,
          averageTime: 18.7
        }
      },
      {
        id: 'quiz-3',
        title: 'Final Course Assessment',
        description: 'Comprehensive test covering all course materials',
        courseId: 'course-1',
        moduleId: null,
        type: 'final',
        difficulty: 'advanced',
        questions: 25,
        timeLimit: 45,
        passingScore: 90,
        maxAttempts: 2,
        isPublished: true,
        isRandomized: true,
        showCorrectAnswers: false,
        allowReview: false,
        createdAt: new Date('2024-01-17').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString(),
        createdBy: 'admin-1',
        analytics: {
          totalAttempts: 156,
          averageScore: 87.2,
          passRate: 89.1,
          averageTime: 38.5
        }
      }
    ]

    // Apply filters
    let filteredQuizzes = mockQuizzes
    if (courseId) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.courseId === courseId)
    }
    if (moduleId) {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.moduleId === moduleId)
    }
    if (status === 'published') {
      filteredQuizzes = filteredQuizzes.filter(quiz => quiz.isPublished)
    } else if (status === 'draft') {
      filteredQuizzes = filteredQuizzes.filter(quiz => !quiz.isPublished)
    }

    // Pagination
    const offset = (page - 1) * limit
    const paginatedQuizzes = filteredQuizzes.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      quizzes: paginatedQuizzes,
      pagination: {
        page,
        limit,
        total: filteredQuizzes.length,
        pages: Math.ceil(filteredQuizzes.length / limit)
      },
      filters: {
        types: ['practice', 'assessment', 'final'],
        difficulties: ['beginner', 'intermediate', 'advanced', 'expert'],
        statuses: ['draft', 'published']
      }
    })

  } catch (error: any) {
    console.error('Quizzes API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new quiz
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('create_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      title,
      description,
      courseId,
      moduleId,
      type = 'practice',
      difficulty = 'intermediate',
      timeLimit = 15,
      passingScore = 80,
      maxAttempts = 3,
      isRandomized = true,
      showCorrectAnswers = true,
      allowReview = true,
      questions = []
    } = body

    // Validation
    if (!title || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, courseId' },
        { status: 400 }
      )
    }

    if (passingScore < 0 || passingScore > 100) {
      return NextResponse.json(
        { error: 'Passing score must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Create new quiz
    const newQuiz = {
      id: `quiz-${Date.now()}`,
      title,
      description: description || '',
      courseId,
      moduleId: moduleId || null,
      type,
      difficulty,
      questions: questions.length,
      timeLimit,
      passingScore,
      maxAttempts,
      isPublished: false,
      isRandomized,
      showCorrectAnswers,
      allowReview,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.userId,
      questionsData: questions,
      analytics: {
        totalAttempts: 0,
        averageScore: 0,
        passRate: 0,
        averageTime: 0
      }
    }

    // In production, save to database
    console.log('Creating quiz:', newQuiz)

    return NextResponse.json({
      success: true,
      quiz: newQuiz,
      message: 'Quiz created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Quizzes API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create quiz', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Bulk operations on quizzes
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('edit_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { operation, quizIds, updates } = body

    if (!quizIds || !Array.isArray(quizIds) || quizIds.length === 0) {
      return NextResponse.json(
        { error: 'Quiz IDs required' },
        { status: 400 }
      )
    }

    if (operation === 'publish') {
      // Bulk publish quizzes
      console.log('Publishing quizzes:', quizIds)

      return NextResponse.json({
        success: true,
        operation: 'publish',
        updatedCount: quizIds.length,
        message: `Successfully published ${quizIds.length} quizzes`
      })
    }

    if (operation === 'unpublish') {
      // Bulk unpublish quizzes
      console.log('Unpublishing quizzes:', quizIds)

      return NextResponse.json({
        success: true,
        operation: 'unpublish', 
        updatedCount: quizIds.length,
        message: `Successfully unpublished ${quizIds.length} quizzes`
      })
    }

    if (operation === 'duplicate') {
      // Duplicate quizzes
      console.log('Duplicating quizzes:', quizIds)

      return NextResponse.json({
        success: true,
        operation: 'duplicate',
        duplicatedCount: quizIds.length,
        message: `Successfully duplicated ${quizIds.length} quizzes`
      })
    }

    if (operation === 'bulk_update') {
      // Bulk update quizzes
      if (!updates) {
        return NextResponse.json(
          { error: 'Updates required for bulk_update operation' },
          { status: 400 }
        )
      }

      console.log('Bulk updating quizzes:', quizIds, updates)

      return NextResponse.json({
        success: true,
        operation: 'bulk_update',
        updatedCount: quizIds.length,
        message: `Successfully updated ${quizIds.length} quizzes`
      })
    }

    return NextResponse.json(
      { error: 'Invalid operation. Supported: publish, unpublish, duplicate, bulk_update' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Quizzes API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update quizzes', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Bulk delete quizzes
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('delete_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { quizIds } = body

    if (!quizIds || !Array.isArray(quizIds) || quizIds.length === 0) {
      return NextResponse.json(
        { error: 'Quiz IDs required' },
        { status: 400 }
      )
    }

    // Check for student attempts
    const hasAttempts = true // Mock - check database
    
    if (hasAttempts) {
      return NextResponse.json(
        { error: 'Cannot delete quizzes with existing student attempts' },
        { status: 400 }
      )
    }

    // In production, delete from database with cascade
    console.log('Bulk deleting quizzes:', quizIds)

    return NextResponse.json({
      success: true,
      deletedCount: quizIds.length,
      message: `Successfully deleted ${quizIds.length} quizzes`
    })

  } catch (error: any) {
    console.error('Quizzes API DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete quizzes', details: error.message },
      { status: 500 }
    )
  }
}

