import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSession } from '@/lib/middleware/admin-auth'

// GET - Get specific quiz with detailed questions
export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { quizId } = params

    // Mock detailed quiz data
    const mockQuiz = {
      id: quizId,
      title: 'Market Structure Assessment',
      description: 'Test your understanding of institutional market structure and order flow dynamics',
      courseId: 'course-1',
      courseName: 'Advanced Trading Strategies',
      moduleId: 'module-1',
      moduleName: 'Market Structure Analysis',
      type: 'assessment',
      difficulty: 'intermediate',
      timeLimit: 15,
      passingScore: 80,
      maxAttempts: 3,
      isPublished: true,
      isRandomized: true,
      showCorrectAnswers: false,
      allowReview: true,
      instructions: `
        <h3>Instructions:</h3>
        <ul>
          <li>You have 15 minutes to complete this quiz</li>
          <li>You must score at least 80% to pass</li>
          <li>You can attempt this quiz up to 3 times</li>
          <li>Choose the best answer for each question</li>
        </ul>
      `,
      createdAt: new Date('2024-01-15').toISOString(),
      updatedAt: new Date('2024-01-16').toISOString(),
      createdBy: 'admin-1',

      // Detailed questions
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the primary role of a market maker in financial markets?',
          options: [
            'To provide liquidity by continuously quoting bid and ask prices',
            'To manipulate stock prices for profit',
            'To execute large institutional trades',
            'To provide investment advice to retail investors'
          ],
          correctAnswer: 0,
          explanation: 'Market makers provide liquidity to the market by continuously quoting bid and ask prices, facilitating trading for other market participants.',
          points: 10,
          difficulty: 'intermediate',
          tags: ['market-making', 'liquidity'],
          order: 1
        },
        {
          id: 'q2',
          type: 'multiple_choice',
          question: 'Which of the following best describes order flow analysis?',
          options: [
            'Analyzing company financial statements',
            'Studying the sequence and volume of buy/sell orders',
            'Calculating moving averages',
            'Analyzing news sentiment'
          ],
          correctAnswer: 1,
          explanation: 'Order flow analysis involves studying the sequence, volume, and timing of buy and sell orders to understand market dynamics and institutional activity.',
          points: 10,
          difficulty: 'intermediate',
          tags: ['order-flow', 'analysis'],
          order: 2
        },
        {
          id: 'q3',
          type: 'multiple_select',
          question: 'Which of the following are characteristics of institutional trading? (Select all that apply)',
          options: [
            'Large order sizes',
            'Algorithmic execution',
            'Dark pools usage',
            'High frequency'
          ],
          correctAnswers: [0, 1, 2],
          explanation: 'Institutional trading typically involves large orders, algorithmic execution, and dark pools to minimize market impact. High frequency trading is typically done by specialized firms, not traditional institutions.',
          points: 15,
          difficulty: 'advanced',
          tags: ['institutional', 'trading'],
          order: 3
        },
        {
          id: 'q4',
          type: 'true_false',
          question: 'Bid-ask spreads typically widen during periods of high market volatility.',
          correctAnswer: true,
          explanation: 'During volatile periods, market makers face increased risk and typically widen spreads to compensate for the additional uncertainty.',
          points: 10,
          difficulty: 'beginner',
          tags: ['spreads', 'volatility'],
          order: 4
        },
        {
          id: 'q5',
          type: 'short_answer',
          question: 'Explain in 2-3 sentences how dark pools help institutional investors.',
          correctAnswer: 'Dark pools allow institutional investors to trade large blocks of securities without revealing their intentions to the public market. This helps prevent market impact and price slippage that could occur if large orders were visible on public exchanges.',
          explanation: 'Dark pools provide privacy for large trades, reducing market impact and allowing institutions to execute at better prices.',
          points: 15,
          difficulty: 'advanced',
          tags: ['dark-pools', 'institutional'],
          order: 5
        }
      ],

      // Analytics and performance data
      analytics: {
        totalAttempts: 847,
        averageScore: 76.3,
        passRate: 68.5,
        averageTime: 12.4,
        questionAnalytics: [
          {
            questionId: 'q1',
            correctRate: 85.2,
            averageTime: 1.8,
            commonWrongAnswers: [
              { option: 1, count: 87, percentage: 10.3 },
              { option: 2, count: 23, percentage: 2.7 },
              { option: 3, count: 15, percentage: 1.8 }
            ]
          },
          {
            questionId: 'q2',
            correctRate: 72.1,
            averageTime: 2.3,
            commonWrongAnswers: [
              { option: 0, count: 156, percentage: 18.4 },
              { option: 2, count: 64, percentage: 7.6 },
              { option: 3, count: 16, percentage: 1.9 }
            ]
          }
        ],
        difficultyDistribution: {
          easy: 20,
          medium: 60,
          hard: 20
        },
        timeDistribution: {
          under5min: 15.2,
          between5and10min: 42.8,
          between10and15min: 35.7,
          over15min: 6.3
        }
      },

      // Recent attempts summary
      recentAttempts: [
        {
          studentId: 'student-1',
          studentName: 'John Doe',
          score: 85,
          timeSpent: 11.5,
          passed: true,
          attemptedAt: new Date('2024-01-20T10:30:00').toISOString()
        },
        {
          studentId: 'student-2',
          studentName: 'Jane Smith',
          score: 72,
          timeSpent: 14.2,
          passed: false,
          attemptedAt: new Date('2024-01-20T09:15:00').toISOString()
        }
      ]
    }

    return NextResponse.json({
      success: true,
      quiz: mockQuiz
    })

  } catch (error: any) {
    console.error('Quiz API GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quiz', details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update specific quiz
export async function PUT(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('edit_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { quizId } = params
    const body = await request.json()

    const {
      title,
      description,
      instructions,
      timeLimit,
      passingScore,
      maxAttempts,
      isPublished,
      isRandomized,
      showCorrectAnswers,
      allowReview,
      questions
    } = body

    // Validation
    if (passingScore !== undefined && (passingScore < 0 || passingScore > 100)) {
      return NextResponse.json(
        { error: 'Passing score must be between 0 and 100' },
        { status: 400 }
      )
    }

    if (timeLimit !== undefined && timeLimit < 1) {
      return NextResponse.json(
        { error: 'Time limit must be at least 1 minute' },
        { status: 400 }
      )
    }

    // Create update object
    const updates = {
      ...(title && { title }),
      ...(description && { description }),
      ...(instructions && { instructions }),
      ...(timeLimit !== undefined && { timeLimit }),
      ...(passingScore !== undefined && { passingScore }),
      ...(maxAttempts !== undefined && { maxAttempts }),
      ...(isPublished !== undefined && { isPublished }),
      ...(isRandomized !== undefined && { isRandomized }),
      ...(showCorrectAnswers !== undefined && { showCorrectAnswers }),
      ...(allowReview !== undefined && { allowReview }),
      ...(questions && { questions, questionCount: questions.length }),
      updatedAt: new Date().toISOString(),
      updatedBy: session.userId
    }

    // In production, update in database
    console.log('Updating quiz:', quizId, updates)

    return NextResponse.json({
      success: true,
      quizId,
      updates,
      message: 'Quiz updated successfully'
    })

  } catch (error: any) {
    console.error('Quiz API PUT error:', error)
    return NextResponse.json(
      { error: 'Failed to update quiz', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete specific quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await verifyAdminSession(request)
    if (!session || !session.permissions.includes('delete_content')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { quizId } = params

    // Check for student attempts
    const studentAttempts = 847 // Mock - fetch from database
    
    if (studentAttempts > 0) {
      return NextResponse.json(
        { error: `Cannot delete quiz with ${studentAttempts} student attempts. Archive instead.` },
        { status: 400 }
      )
    }

    // In production, delete from database with cascade
    console.log('Deleting quiz:', quizId)

    return NextResponse.json({
      success: true,
      quizId,
      message: 'Quiz deleted successfully'
    })

  } catch (error: any) {
    console.error('Quiz API DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete quiz', details: error.message },
      { status: 500 }
    )
  }
}

