import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - List all enrollments with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const studentEmail = searchParams.get('studentEmail')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Mock enrollments data
    const mockEnrollments = [
      {
        id: 'enrollment-1',
        studentId: 'student-1',
        student: {
          id: 'student-1',
          email: 'john.doe@email.com',
          name: 'John Doe',
          avatar: '/api/placeholder/50/50',
          registrationDate: '2024-01-10T00:00:00Z'
        },
        courseId: 'course-1',
        course: {
          id: 'course-1',
          title: 'Advanced Trading Strategies',
          category: 'Trading',
          price: 299,
          thumbnail: '/api/placeholder/300/200'
        },
        status: 'active',
        enrollmentDate: '2024-01-15T10:30:00Z',
        startDate: '2024-01-15T10:30:00Z',
        completionDate: null,
        progress: {
          percentage: 65,
          modulesCompleted: 2,
          totalModules: 4,
          chaptersCompleted: 8,
          totalChapters: 15,
          quizzesCompleted: 1,
          totalQuizzes: 3,
          lastAccessDate: '2024-01-20T14:22:00Z',
          totalTimeSpent: 240 // minutes
        },
        certificate: null,
        paymentStatus: 'paid',
        paymentAmount: 299,
        paymentDate: '2024-01-15T10:25:00Z',
        notes: 'Excellent progress, very engaged student'
      },
      {
        id: 'enrollment-2',
        studentId: 'student-2',
        student: {
          id: 'student-2',
          email: 'jane.smith@email.com',
          name: 'Jane Smith',
          avatar: '/api/placeholder/50/50',
          registrationDate: '2024-01-08T00:00:00Z'
        },
        courseId: 'course-1',
        course: {
          id: 'course-1',
          title: 'Advanced Trading Strategies',
          category: 'Trading',
          price: 299,
          thumbnail: '/api/placeholder/300/200'
        },
        status: 'completed',
        enrollmentDate: '2024-01-10T09:15:00Z',
        startDate: '2024-01-10T09:15:00Z',
        completionDate: '2024-01-18T16:45:00Z',
        progress: {
          percentage: 100,
          modulesCompleted: 4,
          totalModules: 4,
          chaptersCompleted: 15,
          totalChapters: 15,
          quizzesCompleted: 3,
          totalQuizzes: 3,
          lastAccessDate: '2024-01-18T16:45:00Z',
          totalTimeSpent: 480
        },
        certificate: {
          id: 'cert-1',
          issuedDate: '2024-01-18T17:00:00Z',
          certificateUrl: '/api/certificates/cert-1.pdf'
        },
        paymentStatus: 'paid',
        paymentAmount: 299,
        paymentDate: '2024-01-10T09:10:00Z',
        notes: 'Completed with distinction'
      },
      {
        id: 'enrollment-3',
        studentId: 'student-3',
        student: {
          id: 'student-3',
          email: 'bob.wilson@email.com',
          name: 'Bob Wilson',
          avatar: '/api/placeholder/50/50',
          registrationDate: '2024-01-12T00:00:00Z'
        },
        courseId: 'course-2',
        course: {
          id: 'course-2',
          title: 'Risk Management Fundamentals',
          category: 'Risk Management',
          price: 199,
          thumbnail: '/api/placeholder/300/200'
        },
        status: 'inactive',
        enrollmentDate: '2024-01-16T11:20:00Z',
        startDate: '2024-01-16T11:20:00Z',
        completionDate: null,
        progress: {
          percentage: 15,
          modulesCompleted: 0,
          totalModules: 3,
          chaptersCompleted: 2,
          totalChapters: 12,
          quizzesCompleted: 0,
          totalQuizzes: 2,
          lastAccessDate: '2024-01-17T10:30:00Z',
          totalTimeSpent: 35
        },
        certificate: null,
        paymentStatus: 'paid',
        paymentAmount: 199,
        paymentDate: '2024-01-16T11:15:00Z',
        notes: 'Student seems to have lost interest after initial modules'
      }
    ]

    // Apply filters
    let filteredEnrollments = mockEnrollments
    if (courseId) {
      filteredEnrollments = filteredEnrollments.filter(enrollment => enrollment.courseId === courseId)
    }
    if (status) {
      filteredEnrollments = filteredEnrollments.filter(enrollment => enrollment.status === status)
    }
    if (studentEmail) {
      filteredEnrollments = filteredEnrollments.filter(enrollment => 
        enrollment.student.email.toLowerCase().includes(studentEmail.toLowerCase())
      )
    }
    if (dateFrom) {
      filteredEnrollments = filteredEnrollments.filter(enrollment => 
        new Date(enrollment.enrollmentDate) >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      filteredEnrollments = filteredEnrollments.filter(enrollment => 
        new Date(enrollment.enrollmentDate) <= new Date(dateTo)
      )
    }

    // Pagination
    const offset = (page - 1) * limit
    const paginatedEnrollments = filteredEnrollments.slice(offset, offset + limit)

    // Calculate summary statistics
    const totalEnrollments = filteredEnrollments.length
    const activeEnrollments = filteredEnrollments.filter(e => e.status === 'active').length
    const completedEnrollments = filteredEnrollments.filter(e => e.status === 'completed').length
    const totalRevenue = filteredEnrollments
      .filter(e => e.paymentStatus === 'paid')
      .reduce((sum, e) => sum + e.paymentAmount, 0)

    return NextResponse.json({
      success: true,
      enrollments: paginatedEnrollments,
      pagination: {
        page,
        limit,
        total: totalEnrollments,
        pages: Math.ceil(totalEnrollments / limit)
      },
      summary: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        inactiveEnrollments: totalEnrollments - activeEnrollments - completedEnrollments,
        totalRevenue,
        averageProgress: Math.round(
          filteredEnrollments.reduce((sum, e) => sum + e.progress.percentage, 0) / totalEnrollments
        )
      },
      filters: {
        statuses: ['active', 'completed', 'inactive', 'suspended'],
        paymentStatuses: ['paid', 'pending', 'failed', 'refunded']
      }
    })

  } catch (error: any) {
    console.error('Enrollments API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch enrollments', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create new enrollment (manual enrollment)
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('manage_users')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      studentEmail,
      courseId,
      paymentStatus = 'pending',
      paymentAmount,
      notes,
      sendWelcomeEmail = true
    } = body

    // Validation
    if (!studentEmail || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentEmail, courseId' },
        { status: 400 }
      )
    }

    // Check if student exists or create new student
    // Check if already enrolled
    // In production, perform these checks against database

    const newEnrollment = {
      id: `enrollment-${Date.now()}`,
      studentId: `student-${Date.now()}`, // Would be resolved from email
      student: {
        id: `student-${Date.now()}`,
        email: studentEmail,
        name: studentEmail.split('@')[0].replace(/[.-]/g, ' '),
        avatar: '/api/placeholder/50/50'
      },
      courseId,
      status: 'active',
      enrollmentDate: new Date().toISOString(),
      startDate: new Date().toISOString(),
      completionDate: null,
      progress: {
        percentage: 0,
        modulesCompleted: 0,
        totalModules: 4, // Would be fetched from course
        chaptersCompleted: 0,
        totalChapters: 15, // Would be calculated from course
        quizzesCompleted: 0,
        totalQuizzes: 3, // Would be calculated from course
        lastAccessDate: null,
        totalTimeSpent: 0
      },
      certificate: null,
      paymentStatus,
      paymentAmount: paymentAmount || 0,
      paymentDate: paymentStatus === 'paid' ? new Date().toISOString() : null,
      notes: notes || '',
      enrolledBy: session.userId
    }

    // In production:
    // 1. Save to database
    // 2. Send welcome email if requested
    // 3. Create initial progress records
    console.log('Creating enrollment:', newEnrollment)

    return NextResponse.json({
      success: true,
      enrollment: newEnrollment,
      message: `Successfully enrolled ${studentEmail} in course`
    }, { status: 201 })

  } catch (error: any) {
    console.error('Enrollments API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create enrollment', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Bulk operations on enrollments
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('manage_users')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { operation, enrollmentIds, updates } = body

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return NextResponse.json(
        { error: 'Enrollment IDs required' },
        { status: 400 }
      )
    }

    if (operation === 'suspend') {
      // Suspend enrollments
      console.log('Suspending enrollments:', enrollmentIds)

      return NextResponse.json({
        success: true,
        operation: 'suspend',
        updatedCount: enrollmentIds.length,
        message: `Successfully suspended ${enrollmentIds.length} enrollments`
      })
    }

    if (operation === 'activate') {
      // Activate enrollments
      console.log('Activating enrollments:', enrollmentIds)

      return NextResponse.json({
        success: true,
        operation: 'activate',
        updatedCount: enrollmentIds.length,
        message: `Successfully activated ${enrollmentIds.length} enrollments`
      })
    }

    if (operation === 'refund') {
      // Process refunds
      console.log('Processing refunds for enrollments:', enrollmentIds)

      return NextResponse.json({
        success: true,
        operation: 'refund',
        processedCount: enrollmentIds.length,
        message: `Successfully processed refunds for ${enrollmentIds.length} enrollments`
      })
    }

    if (operation === 'update_notes') {
      // Bulk update notes
      if (!updates || !updates.notes) {
        return NextResponse.json(
          { error: 'Notes required for update_notes operation' },
          { status: 400 }
        )
      }

      console.log('Updating notes for enrollments:', enrollmentIds, updates.notes)

      return NextResponse.json({
        success: true,
        operation: 'update_notes',
        updatedCount: enrollmentIds.length,
        message: `Successfully updated notes for ${enrollmentIds.length} enrollments`
      })
    }

    return NextResponse.json(
      { error: 'Invalid operation. Supported: suspend, activate, refund, update_notes' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Enrollments API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update enrollments', details: error.message },
      { status: 500 }
    )
  }
}

