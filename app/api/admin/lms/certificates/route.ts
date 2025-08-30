import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - List all certificates with filtering
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
    const studentEmail = searchParams.get('studentEmail')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Mock certificates data
    const mockCertificates = [
      {
        id: 'cert-1',
        certificateNumber: 'NXL-ATS-2024-001',
        studentId: 'student-1',
        student: {
          id: 'student-1',
          email: 'john.doe@email.com',
          name: 'John Doe',
          avatar: '/api/placeholder/50/50'
        },
        courseId: 'course-1',
        course: {
          id: 'course-1',
          title: 'Advanced Trading Strategies',
          category: 'Trading',
          instructor: 'John Smith'
        },
        templateId: 'template-1',
        template: {
          id: 'template-1',
          name: 'Professional Certificate',
          type: 'course_completion'
        },
        status: 'issued',
        issuedAt: '2024-01-18T17:00:00Z',
        expiresAt: null, // null for no expiration
        completionData: {
          finalScore: 87.5,
          completionDate: '2024-01-18T16:45:00Z',
          totalHours: 8,
          modulesCompleted: 4,
          quizScores: [85, 92, 84, 89],
          timeSpent: 480 // minutes
        },
        certificateUrl: '/api/certificates/NXL-ATS-2024-001.pdf',
        verificationUrl: '/verify/NXL-ATS-2024-001',
        verificationCode: 'VRF-8H9K-3M2N-7P1Q',
        metadata: {
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          location: 'New York, US'
        },
        isValid: true,
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
        downloadCount: 3,
        lastDownloaded: '2024-01-19T10:30:00Z'
      },
      {
        id: 'cert-2',
        certificateNumber: 'NXL-ATS-2024-002',
        studentId: 'student-2',
        student: {
          id: 'student-2',
          email: 'jane.smith@email.com',
          name: 'Jane Smith',
          avatar: '/api/placeholder/50/50'
        },
        courseId: 'course-1',
        course: {
          id: 'course-1',
          title: 'Advanced Trading Strategies',
          category: 'Trading',
          instructor: 'John Smith'
        },
        templateId: 'template-1',
        template: {
          id: 'template-1',
          name: 'Professional Certificate',
          type: 'course_completion'
        },
        status: 'issued',
        issuedAt: '2024-01-17T14:30:00Z',
        expiresAt: null,
        completionData: {
          finalScore: 94.2,
          completionDate: '2024-01-17T14:15:00Z',
          totalHours: 8,
          modulesCompleted: 4,
          quizScores: [96, 91, 95, 95],
          timeSpent: 465
        },
        certificateUrl: '/api/certificates/NXL-ATS-2024-002.pdf',
        verificationUrl: '/verify/NXL-ATS-2024-002',
        verificationCode: 'VRF-2J8K-9L4M-6N3P',
        metadata: {
          ipAddress: '203.45.67.89',
          userAgent: 'Mozilla/5.0...',
          location: 'London, UK'
        },
        isValid: true,
        revokedAt: null,
        revokedBy: null,
        revokeReason: null,
        downloadCount: 1,
        lastDownloaded: '2024-01-17T15:00:00Z'
      },
      {
        id: 'cert-3',
        certificateNumber: 'NXL-RMF-2024-001',
        studentId: 'student-3',
        student: {
          id: 'student-3',
          email: 'bob.wilson@email.com',
          name: 'Bob Wilson',
          avatar: '/api/placeholder/50/50'
        },
        courseId: 'course-2',
        course: {
          id: 'course-2',
          title: 'Risk Management Fundamentals',
          category: 'Risk Management',
          instructor: 'Sarah Johnson'
        },
        templateId: 'template-2',
        template: {
          id: 'template-2',
          name: 'Foundation Certificate',
          type: 'course_completion'
        },
        status: 'revoked',
        issuedAt: '2024-01-16T12:00:00Z',
        expiresAt: null,
        completionData: {
          finalScore: 76.8,
          completionDate: '2024-01-16T11:45:00Z',
          totalHours: 6,
          modulesCompleted: 3,
          quizScores: [78, 75, 77],
          timeSpent: 360
        },
        certificateUrl: '/api/certificates/NXL-RMF-2024-001.pdf',
        verificationUrl: '/verify/NXL-RMF-2024-001',
        verificationCode: 'VRF-5R7T-1W3Q-9E2A',
        metadata: {
          ipAddress: '172.16.0.50',
          userAgent: 'Mozilla/5.0...',
          location: 'Toronto, CA'
        },
        isValid: false,
        revokedAt: '2024-01-18T09:00:00Z',
        revokedBy: 'admin-1',
        revokeReason: 'Course content violation discovered',
        downloadCount: 2,
        lastDownloaded: '2024-01-16T12:30:00Z'
      }
    ]

    // Apply filters
    let filteredCertificates = mockCertificates
    if (courseId) {
      filteredCertificates = filteredCertificates.filter(cert => cert.courseId === courseId)
    }
    if (studentEmail) {
      filteredCertificates = filteredCertificates.filter(cert => 
        cert.student.email.toLowerCase().includes(studentEmail.toLowerCase())
      )
    }
    if (status) {
      filteredCertificates = filteredCertificates.filter(cert => cert.status === status)
    }
    if (dateFrom) {
      filteredCertificates = filteredCertificates.filter(cert => 
        new Date(cert.issuedAt) >= new Date(dateFrom)
      )
    }
    if (dateTo) {
      filteredCertificates = filteredCertificates.filter(cert => 
        new Date(cert.issuedAt) <= new Date(dateTo)
      )
    }

    // Pagination
    const offset = (page - 1) * limit
    const paginatedCertificates = filteredCertificates.slice(offset, offset + limit)

    // Calculate summary statistics
    const totalCertificates = filteredCertificates.length
    const issuedCertificates = filteredCertificates.filter(c => c.status === 'issued' && c.isValid).length
    const revokedCertificates = filteredCertificates.filter(c => c.status === 'revoked' || !c.isValid).length

    return NextResponse.json({
      success: true,
      certificates: paginatedCertificates,
      pagination: {
        page,
        limit,
        total: totalCertificates,
        pages: Math.ceil(totalCertificates / limit)
      },
      summary: {
        totalCertificates,
        issuedCertificates,
        revokedCertificates,
        pendingCertificates: totalCertificates - issuedCertificates - revokedCertificates
      },
      filters: {
        statuses: ['issued', 'revoked', 'pending', 'expired']
      }
    })

  } catch (error: any) {
    console.error('Certificates API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch certificates', details: error.message },
      { status: 500 }
    )
  }
}

// POST - Issue new certificate
export async function POST(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('manage_certificates')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      studentId,
      courseId,
      templateId,
      completionData,
      customData = {}
    } = body

    // Validation
    if (!studentId || !courseId || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: studentId, courseId, templateId' },
        { status: 400 }
      )
    }

    // Generate certificate number
    const courseCode = courseId.split('-')[1]?.toUpperCase() || 'GEN'
    const year = new Date().getFullYear()
    const sequence = String(Date.now()).slice(-3)
    const certificateNumber = `NXL-${courseCode}-${year}-${sequence}`

    // Generate verification code
    const verificationCode = `VRF-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const newCertificate = {
      id: `cert-${Date.now()}`,
      certificateNumber,
      studentId,
      courseId,
      templateId,
      status: 'issued',
      issuedAt: new Date().toISOString(),
      expiresAt: null, // Can be set based on template/course settings
      completionData,
      customData,
      certificateUrl: `/api/certificates/${certificateNumber}.pdf`,
      verificationUrl: `/verify/${certificateNumber}`,
      verificationCode,
      metadata: {
        issuedBy: session.userId,
        issuerName: session.username,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      },
      isValid: true,
      revokedAt: null,
      revokedBy: null,
      revokeReason: null,
      downloadCount: 0,
      lastDownloaded: null
    }

    // In production:
    // 1. Generate PDF certificate from template
    // 2. Save to database
    // 3. Send notification email to student
    // 4. Update student's achievements
    console.log('Creating certificate:', newCertificate)

    return NextResponse.json({
      success: true,
      certificate: newCertificate,
      message: 'Certificate issued successfully'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Certificates API POST error:', error)
    return NextResponse.json(
      { error: 'Failed to issue certificate', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Bulk operations on certificates
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('manage_certificates')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { operation, certificateIds, reason } = body

    if (!certificateIds || !Array.isArray(certificateIds) || certificateIds.length === 0) {
      return NextResponse.json(
        { error: 'Certificate IDs required' },
        { status: 400 }
      )
    }

    if (operation === 'revoke') {
      if (!reason) {
        return NextResponse.json(
          { error: 'Reason required for revoking certificates' },
          { status: 400 }
        )
      }

      // Revoke certificates
      console.log('Revoking certificates:', certificateIds, 'Reason:', reason)

      return NextResponse.json({
        success: true,
        operation: 'revoke',
        revokedCount: certificateIds.length,
        message: `Successfully revoked ${certificateIds.length} certificates`
      })
    }

    if (operation === 'reissue') {
      // Reissue certificates (creates new ones, keeps old as history)
      console.log('Reissuing certificates:', certificateIds)

      return NextResponse.json({
        success: true,
        operation: 'reissue',
        reissuedCount: certificateIds.length,
        message: `Successfully reissued ${certificateIds.length} certificates`
      })
    }

    if (operation === 'regenerate') {
      // Regenerate certificate PDFs (same certificate, new PDF)
      console.log('Regenerating certificate PDFs:', certificateIds)

      return NextResponse.json({
        success: true,
        operation: 'regenerate',
        regeneratedCount: certificateIds.length,
        message: `Successfully regenerated ${certificateIds.length} certificate PDFs`
      })
    }

    return NextResponse.json(
      { error: 'Invalid operation. Supported: revoke, reissue, regenerate' },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('Certificates API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update certificates', details: error.message },
      { status: 500 }
    )
  }
}

