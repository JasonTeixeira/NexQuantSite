// 📚 LEARNING COURSES API
import { NextRequest, NextResponse } from 'next/server'

const mockCourses = [
  {
    id: 'course-1',
    title: 'Trading Fundamentals',
    description: 'Complete guide to trading basics, risk management, and market analysis',
    instructor: 'Sarah Mitchell',
    duration: '8 hours',
    level: 'Beginner',
    modules: 12,
    students: 4532,
    rating: 4.9,
    price: 0, // Free course
    topics: ['Market Basics', 'Technical Analysis', 'Risk Management', 'Trading Psychology'],
    thumbnail: '/images/courses/fundamentals.jpg',
    progress: 0
  },
  {
    id: 'course-2',
    title: 'Advanced Technical Analysis',
    description: 'Master chart patterns, indicators, and advanced trading strategies',
    instructor: 'Michael Chen',
    duration: '12 hours',
    level: 'Advanced',
    modules: 18,
    students: 2345,
    rating: 4.8,
    price: 99.99,
    topics: ['Chart Patterns', 'Fibonacci', 'Elliott Waves', 'Volume Analysis'],
    thumbnail: '/images/courses/technical.jpg',
    progress: 0
  },
  {
    id: 'course-3',
    title: 'Algorithmic Trading with Python',
    description: 'Build and deploy your own trading bots using Python and AI',
    instructor: 'David Park',
    duration: '16 hours',
    level: 'Expert',
    modules: 24,
    students: 1876,
    rating: 4.9,
    price: 149.99,
    topics: ['Python Basics', 'API Integration', 'Backtesting', 'Machine Learning'],
    thumbnail: '/images/courses/algo.jpg',
    progress: 0
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    
    let filteredCourses = [...mockCourses]
    if (level) {
      filteredCourses = filteredCourses.filter(course => 
        course.level.toLowerCase() === level.toLowerCase()
      )
    }
    
    return NextResponse.json({
      success: true,
      courses: filteredCourses,
      total: filteredCourses.length,
      levels: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}

// Enroll in a course
export async function POST(request: NextRequest) {
  try {
    const { courseId } = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'Enrolled successfully',
      enrollment: {
        courseId,
        enrolledAt: new Date().toISOString(),
        status: 'active'
      }
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Enrollment failed' },
      { status: 500 }
    )
  }
}

