import { type NextRequest, NextResponse } from "next/server"
import { AppError, ValidationError, handleError, logError } from "@/lib/error-handler"
import { strictRateLimiter } from "@/lib/rate-limiter"

// In production, store reset tokens in database
const resetTokens = new Map<
  string,
  {
    email: string
    userId: string
    expires: number
    used: boolean
  }
>()

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID()

  try {
    // Apply strict rate limiting for password reset
    const { allowed } = await strictRateLimiter.checkLimit(request)
    if (!allowed) {
      throw new AppError("Too many password reset attempts. Please try again later.", 429, true, requestId)
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      throw new ValidationError("Email is required", requestId)
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format", requestId)
    }

    // In production, check if user exists in database
    // For now, simulate user lookup
    const userExists = true // Replace with actual database lookup

    if (!userExists) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
        requestId,
      })
    }

    // Generate reset token
    const token = crypto.randomUUID()
    const expires = Date.now() + 60 * 60 * 1000 // 1 hour

    resetTokens.set(token, {
      email,
      userId: `user_${Date.now()}`, // In production, get from database
      expires,
      used: false,
    })

    // In production, send email with reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    console.log(`Password reset email sent to ${email}: ${resetLink}`)

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
      requestId,
      // Remove in production
      resetLink,
    })
  } catch (error) {
    const appError = handleError(error, requestId)
    logError(appError, { endpoint: "/api/auth/forgot-password", email: "redacted" })

    return NextResponse.json(
      {
        success: false,
        message: appError.message,
        requestId,
      },
      { status: appError.statusCode },
    )
  }
}

export async function PUT(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID()

  try {
    const body = await request.json()
    const { token, password } = body

    if (!token || !password) {
      throw new ValidationError("Token and new password are required", requestId)
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long", requestId)
    }

    const tokenData = resetTokens.get(token)
    if (!tokenData) {
      throw new ValidationError("Invalid or expired reset token", requestId)
    }

    if (tokenData.used) {
      throw new ValidationError("Reset token has already been used", requestId)
    }

    if (Date.now() > tokenData.expires) {
      resetTokens.delete(token)
      throw new ValidationError("Reset token has expired", requestId)
    }

    // Mark token as used
    tokenData.used = true
    resetTokens.set(token, tokenData)

    // In production, update user's password in database
    console.log(`Password reset for user ${tokenData.userId}: ${tokenData.email}`)

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      requestId,
    })
  } catch (error) {
    const appError = handleError(error, requestId)
    logError(appError, { endpoint: "/api/auth/forgot-password (reset)" })

    return NextResponse.json(
      {
        success: false,
        message: appError.message,
        requestId,
      },
      { status: appError.statusCode },
    )
  }
}
