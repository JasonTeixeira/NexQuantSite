import { type NextRequest, NextResponse } from "next/server"
import { ValidationError, handleError, logError } from "@/lib/error-handler"

// In production, store verification tokens in database
const verificationTokens = new Map<
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
    const body = await request.json()
    const { token } = body

    if (!token) {
      throw new ValidationError("Verification token is required", requestId)
    }

    const tokenData = verificationTokens.get(token)
    if (!tokenData) {
      throw new ValidationError("Invalid verification token", requestId)
    }

    if (tokenData.used) {
      throw new ValidationError("Verification token has already been used", requestId)
    }

    if (Date.now() > tokenData.expires) {
      verificationTokens.delete(token)
      throw new ValidationError("Verification token has expired", requestId)
    }

    // Mark token as used
    tokenData.used = true
    verificationTokens.set(token, tokenData)

    // In production, update user's email_verified status in database
    console.log(`Email verified for user ${tokenData.userId}: ${tokenData.email}`)

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      requestId,
    })
  } catch (error) {
    const appError = handleError(error, requestId)
    logError(appError, { endpoint: "/api/auth/verify-email" })

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

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID()

  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      throw new ValidationError("Email is required", requestId)
    }

    // Generate verification token
    const token = crypto.randomUUID()
    const expires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

    verificationTokens.set(token, {
      email,
      userId: `user_${Date.now()}`, // In production, get from database
      expires,
      used: false,
    })

    // In production, send email with verification link
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
    console.log(`Verification email sent to ${email}: ${verificationLink}`)

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
      requestId,
      // Remove in production
      verificationLink,
    })
  } catch (error) {
    const appError = handleError(error, requestId)
    logError(appError, { endpoint: "/api/auth/verify-email" })

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
