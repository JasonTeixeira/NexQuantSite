import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"

interface JWTPayload {
  userId: string
  email: string
  role: string
  permissions: string[]
  sessionId: string
  iat: number
  exp: number
}

interface TokenPair {
  accessToken: string
  refreshToken: string
}

export class JWTManager {
  private readonly accessTokenSecret: Uint8Array
  private readonly refreshTokenSecret: Uint8Array
  private readonly accessTokenExpiry = "15m"
  private readonly refreshTokenExpiry = "7d"

  constructor() {
    const jwtSecret = process.env.JWT_SECRET
    const refreshSecret = process.env.JWT_REFRESH_SECRET

    if (!jwtSecret || !refreshSecret) {
      throw new Error("JWT secrets not configured")
    }

    this.accessTokenSecret = new TextEncoder().encode(jwtSecret)
    this.refreshTokenSecret = new TextEncoder().encode(refreshSecret)
  }

  async generateTokenPair(payload: Omit<JWTPayload, "iat" | "exp">): Promise<TokenPair> {
    const now = Math.floor(Date.now() / 1000)

    // Generate access token
    const accessToken = await new SignJWT({
      ...payload,
      type: "access",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now)
      .setExpirationTime(now + 15 * 60) // 15 minutes
      .setIssuer("nexural-trading")
      .setAudience("nexural-users")
      .sign(this.accessTokenSecret)

    // Generate refresh token
    const refreshToken = await new SignJWT({
      userId: payload.userId,
      sessionId: payload.sessionId,
      type: "refresh",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(now)
      .setExpirationTime(now + 7 * 24 * 60 * 60) // 7 days
      .setIssuer("nexural-trading")
      .setAudience("nexural-users")
      .sign(this.refreshTokenSecret)

    return { accessToken, refreshToken }
  }

  async verifyAccessToken(token: string): Promise<JWTPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.accessTokenSecret, {
        issuer: "nexural-trading",
        audience: "nexural-users",
      })

      return payload as unknown as JWTPayload
    } catch (error) {
      console.error("Access token verification failed:", error)
      return null
    }
  }

  async verifyRefreshToken(token: string): Promise<{ userId: string; sessionId: string } | null> {
    try {
      const { payload } = await jwtVerify(token, this.refreshTokenSecret, {
        issuer: "nexural-trading",
        audience: "nexural-users",
      })

      if (payload.type !== "refresh") {
        return null
      }

      return {
        userId: payload.userId as string,
        sessionId: payload.sessionId as string,
      }
    } catch (error) {
      console.error("Refresh token verification failed:", error)
      return null
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    const refreshPayload = await this.verifyRefreshToken(refreshToken)
    if (!refreshPayload) {
      return null
    }

    // In production, verify session is still valid in database
    const userSession = await this.validateSession(refreshPayload.sessionId)
    if (!userSession) {
      return null
    }

    const newTokenPair = await this.generateTokenPair({
      userId: userSession.userId,
      email: userSession.email,
      role: userSession.role,
      permissions: userSession.permissions,
      sessionId: refreshPayload.sessionId,
    })

    return newTokenPair.accessToken
  }

  private async validateSession(sessionId: string): Promise<any | null> {
    // Placeholder for database session validation
    // In production, this would check against your database
    return {
      userId: "user_123",
      email: "user@example.com",
      role: "user",
      permissions: ["read:profile", "write:trades"],
    }
  }

  async setTokenCookies(tokens: TokenPair) {
    const cookieStore = await cookies()

    cookieStore.set("access_token", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    })

    cookieStore.set("refresh_token", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })
  }

  async clearTokenCookies() {
    const cookieStore = await cookies()

    cookieStore.delete("access_token")
    cookieStore.delete("refresh_token")
  }

  extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }
    return authHeader.substring(7)
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return Date.now() >= payload.exp * 1000
    } catch {
      return true
    }
  }

  getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      return payload.exp * 1000
    } catch {
      return null
    }
  }
}

export const jwtManager = new JWTManager()
