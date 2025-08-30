import { createHash, randomBytes } from "crypto"

export class CSRFProtection {
  private static readonly SECRET_KEY = process.env.CSRF_SECRET || "default-csrf-secret-change-in-production"
  private static readonly TOKEN_LENGTH = 32
  private static readonly HEADER_NAME = "x-csrf-token"
  private static readonly COOKIE_NAME = "csrf-token"

  static generateToken(sessionId: string): string {
    const timestamp = Date.now().toString()
    const nonce = randomBytes(16).toString("hex")
    const payload = `${sessionId}:${timestamp}:${nonce}`

    const hash = createHash("sha256")
      .update(payload + this.SECRET_KEY)
      .digest("hex")

    return Buffer.from(`${payload}:${hash}`).toString("base64url")
  }

  static validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = Buffer.from(token, "base64url").toString()
      const parts = decoded.split(":")

      if (parts.length !== 4) return false

      const [tokenSessionId, timestamp, nonce, hash] = parts

      // Validate session ID
      if (tokenSessionId !== sessionId) return false

      // Validate timestamp (token expires after 1 hour)
      const tokenTime = Number.parseInt(timestamp)
      const now = Date.now()
      if (now - tokenTime > 60 * 60 * 1000) return false

      // Validate hash
      const payload = `${tokenSessionId}:${timestamp}:${nonce}`
      const expectedHash = createHash("sha256")
        .update(payload + this.SECRET_KEY)
        .digest("hex")

      return hash === expectedHash
    } catch (error) {
      return false
    }
  }

  static getTokenFromRequest(request: Request): string | null {
    // Try header first
    const headerToken = request.headers.get(this.HEADER_NAME)
    if (headerToken) return headerToken

    // Try form data for POST requests
    const contentType = request.headers.get("content-type")
    if (contentType?.includes("application/x-www-form-urlencoded")) {
      // This would need to be handled in the route handler
      return null
    }

    return null
  }
}
