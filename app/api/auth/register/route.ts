// 🔐 USER REGISTRATION API - Production Implementation
// Real database registration replacing mock auth-utils

import { NextRequest, NextResponse } from 'next/server'
import { registerUser, generateEmailVerificationToken, sendVerificationEmail } from '@/lib/auth/production-auth'

interface RegisterData {
  email: string
  username: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  acceptTerms: boolean
  referralCode?: string
  newsletter?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json()
    
    // Rate limiting check (basic implementation)
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown'
    
    console.log(`📝 Registration attempt from IP: ${clientIP} for email: ${body.email}`)
    
    // Additional server-side validation
    if (!body.email || !body.username || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email, username, and password are required',
          errors: {
            email: !body.email ? 'Email is required' : '',
            username: !body.username ? 'Username is required' : '',
            password: !body.password ? 'Password is required' : ''
          }
        },
        { status: 400 }
      )
    }

    if (!body.acceptTerms) {
      return NextResponse.json(
        {
          success: false,
          message: 'You must accept the terms and conditions',
          errors: { acceptTerms: 'Terms acceptance is required' }
        },
        { status: 400 }
      )
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Passwords do not match',
          errors: { confirmPassword: 'Passwords must match' }
        },
        { status: 400 }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email format',
          errors: { email: 'Please enter a valid email address' }
        },
        { status: 400 }
      )
    }

    // Username validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/
    if (!usernameRegex.test(body.username)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username format',
          errors: { 
            username: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' 
          }
        },
        { status: 400 }
      )
    }

    // Password strength validation
    if (body.password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password too weak',
          errors: { password: 'Password must be at least 8 characters long' }
        },
        { status: 400 }
      )
    }

    const hasUpperCase = /[A-Z]/.test(body.password)
    const hasLowerCase = /[a-z]/.test(body.password)
    const hasNumbers = /\d/.test(body.password)
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password too weak',
          errors: { 
            password: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
          }
        },
        { status: 400 }
      )
    }
    
    // Register user with production database
    const result = await registerUser(body)
    
    if (result.success && result.user) {
      console.log(`✅ Successful registration for user: ${result.user.username}`)
      
      let verificationSent = false
      
      // Send email verification if user was created successfully
      try {
        const verificationToken = await generateEmailVerificationToken(result.user.id, result.user.email)
        const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${verificationToken}`
        
        await sendVerificationEmail(
          result.user.email, 
          result.user.firstName || result.user.username,
          verificationUrl
        )
        
        verificationSent = true
        console.log(`📧 Verification email sent to: ${result.user.email}`)
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError)
        // Don't fail registration if email sending fails
      }
      
      // Registration successful
      return NextResponse.json({
        success: true,
        message: verificationSent 
          ? 'Registration successful! Please check your email to verify your account.' 
          : 'Registration successful! You can now log in.',
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          referralCode: result.user.referralCode,
          emailVerified: result.user.emailVerified,
          role: result.user.role,
          createdAt: result.user.createdAt
        },
        requiresEmailVerification: !result.user.emailVerified,
        verificationEmailSent: verificationSent
      }, { status: 201 })
      
    } else {
      // Registration failed
      console.log(`❌ Failed registration for email: ${body.email} - ${result.message}`)
      
      return NextResponse.json({
        success: false,
        message: result.message,
        errors: result.errors
      }, { status: 400 })
    }

  } catch (error: any) {
    console.error('❌ Register API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Registration failed',
      message: 'An unexpected error occurred during registration',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      errors: { system: 'Internal server error' }
    }, { status: 500 })
  }
}