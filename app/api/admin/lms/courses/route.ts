import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - List all courses with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Mock data - replace with actual database queries
    const mockCourses = [
      {
        id: 'course-1',
        title: 'Advanced Trading Strategies',
        description: 'Master professional trading techniques',
        category: 'Trading',
        status: 'published',
        difficulty: 'advanced',
        duration: '8 hours',
        instructor: 'John Smith',
        thumbnail: '/api/placeholder/400/300',
        enrolledStudents: 1247,
        rating: 4.8,
        price: 299,
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-20').toISOString(),
        moduleCount: 12,
        quizCount: 5,
        isPublished: true,
        isPremium: true
      },
      {
        id: 'course-2', 
        title: 'Risk Management Fundamentals',
        description: 'Learn to protect your capital',
        category: 'Risk Management',
        status: 'draft',
        difficulty: 'intermediate',
        duration: '6 hours',
        instructor: 'Sarah Johnson',
        thumbnail: '/api/placeholder/400/300',
        enrolledStudents: 892,
        rating: 4.7,
        price: 199,
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-18').toISOString(),
        moduleCount: 8,
        quizCount: 3,
        isPublished: false,
        isPremium: false
      }
    ]

    // Apply filters
    let filteredCourses = mockCourses
    if (category) {
      filteredCourses = filteredCourses.filter(course => course.category === category)
    }
    if (status) {
      filteredCourses = filteredCourses.filter(course => course.status === status)
    }
    if (search) {
      filteredCourses = filteredCourses.filter(course => 
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination
    const offset = (page - 1) * limit
    const paginatedCourses = filteredCourses.slice(offset, offset + limit)

    return NextResponse.json({
      courses: paginatedCourses,
      pagination: {
        page,
        limit,
        total: filteredCourses.length,
        pages: Math.ceil(filteredCourses.length / limit)
      },
      filters: {
        categories: ['Trading', 'Risk Management', 'Technical Analysis', 'Fundamental Analysis'],
        statuses: ['draft', 'published', 'archived'],
        difficulties: ['beginner', 'intermediate', 'advanced', 'expert']
      }
    })

  } catch (error: any) {
    console.error('Courses API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new course
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
      category,
      difficulty,
      instructor,
      thumbnail,
      price,
      isPremium,
      learningObjectives,
      prerequisites,
      tags
    } = body

    // Validation
    if (!title || !description || !category || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, difficulty' },
        { status: 400 }
      )
    }

    // Create course object
    const newCourse = {
      id: `course-${Date.now()}`,
      title,
      description,
      category,
      difficulty,
      instructor: instructor || session.username,
      thumbnail: thumbnail || '/api/placeholder/400/300',
      price: price || 0,
      isPremium: isPremium || false,
      learningObjectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      tags: tags || [],
      status: 'draft',
      enrolledStudents: 0,
      rating: 0,
      moduleCount: 0,
      quizCount: 0,
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.userId
    }

    // In production, save to database
    console.log('Creating course:', newCourse)

    return NextResponse.json({
      success: true,
      course: newCourse,
      message: 'Course created successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Courses API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create course', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Bulk update courses
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('edit_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { courseIds, updates } = body

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'Course IDs required' },
        { status: 400 }
      )
    }

    // In production, perform bulk update
    console.log('Bulk updating courses:', courseIds, updates)

    return NextResponse.json({
      success: true,
      updatedCount: courseIds.length,
      message: `Successfully updated ${courseIds.length} courses`
    })

  } catch (error: any) {
    console.error('Courses API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update courses', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Bulk delete courses
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('delete_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { courseIds } = body

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json(
        { error: 'Course IDs required' },
        { status: 400 }
      )
    }

    // In production, perform bulk delete with cascade
    console.log('Bulk deleting courses:', courseIds)

    return NextResponse.json({
      success: true,
      deletedCount: courseIds.length,
      message: `Successfully deleted ${courseIds.length} courses`
    })

  } catch (error: any) {
    console.error('Courses API DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete courses', details: error.message },
      { status: 500 }
    )
  }
}

