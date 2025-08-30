import { randomBytes } from "crypto"
import { authenticator } from "otplib"

interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

interface TwoFactorVerification {
  isValid: boolean
  remainingAttempts?: number
  lockoutTime?: number
}

export class TwoFactorAuthManager {
  private readonly serviceName = "NEXURAL Trading Platform"
  private readonly issuer = "NEXURAL"
  private readonly maxAttempts = 3
  private readonly lockoutDuration = 15 * 60 * 1000 // 15 minutes

  private failedAttempts: Map<string, { count: number; lastAttempt: number }> = new Map()

  generateSecret(): string {
    return authenticator.generateSecret()
  }

  generateQRCodeUrl(userEmail: string, secret: string): string {
    return authenticator.keyuri(userEmail, this.issuer, secret)
  }

  generateBackupCodes(count = 10): string[] {
    const codes: string[] = []
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString("hex").toUpperCase()
      codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
    }
    return codes
  }

  async setupTwoFactor(userEmail: string): Promise<TwoFactorSetup> {
    const secret = this.generateSecret()
    const qrCodeUrl = this.generateQRCodeUrl(userEmail, secret)
    const backupCodes = this.generateBackupCodes()

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    }
  }

  verifyToken(secret: string, token: string, userId: string): TwoFactorVerification {
    const attempts = this.failedAttempts.get(userId)
    const now = Date.now()

    // Check if user is locked out
    if (attempts && attempts.count >= this.maxAttempts) {
      const timeSinceLastAttempt = now - attempts.lastAttempt
      if (timeSinceLastAttempt < this.lockoutDuration) {
        return {
          isValid: false,
          remainingAttempts: 0,
          lockoutTime: attempts.lastAttempt + this.lockoutDuration,
        }
      } else {
        // Reset attempts after lockout period
        this.failedAttempts.delete(userId)
      }
    }

    // Verify the token
    const isValid = authenticator.verify({ token, secret })

    if (isValid) {
      // Clear failed attempts on successful verification
      this.failedAttempts.delete(userId)
      return { isValid: true }
    } else {
      // Record failed attempt
      const currentAttempts = this.failedAttempts.get(userId) || { count: 0, lastAttempt: 0 }
      currentAttempts.count++
      currentAttempts.lastAttempt = now
      this.failedAttempts.set(userId, currentAttempts)

      return {
        isValid: false,
        remainingAttempts: Math.max(0, this.maxAttempts - currentAttempts.count),
      }
    }
  }

  verifyBackupCode(
    backupCodes: string[],
    inputCode: string,
    userId: string,
  ): { isValid: boolean; remainingCodes: string[] } {
    const normalizedInput = inputCode.replace(/[-\s]/g, "").toUpperCase()
    const codeIndex = backupCodes.findIndex((code) => code.replace(/[-\s]/g, "").toUpperCase() === normalizedInput)

    if (codeIndex !== -1) {
      // Remove used backup code
      const remainingCodes = [...backupCodes]
      remainingCodes.splice(codeIndex, 1)

      // Clear failed attempts on successful verification
      this.failedAttempts.delete(userId)

      return { isValid: true, remainingCodes }
    }

    return { isValid: false, remainingCodes: backupCodes }
  }

  generateRecoveryCodes(): string[] {
    return this.generateBackupCodes(8)
  }
}

export const twoFactorAuth = new TwoFactorAuthManager()
