import crypto from "crypto"
import { authenticator } from "otplib"
import QRCode from "qrcode"

interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

interface TwoFactorValidation {
  isValid: boolean
  usedBackupCode?: string
}

export class TwoFactorAuth {
  private readonly serviceName = "NEXURAL Trading"
  private readonly issuer = "NEXURAL"

  async setupTwoFactor(userId: string, email: string): Promise<TwoFactorSetup> {
    // Generate secret
    const secret = authenticator.generateSecret()

    // Create service name for the authenticator app
    const service = `${this.serviceName} (${email})`

    // Generate OTP Auth URL
    const otpAuthUrl = authenticator.keyuri(email, this.issuer, secret)

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl)

    // Generate backup codes
    const backupCodes = this.generateBackupCodes()

    // In production, store secret and backup codes in database
    await this.storeTwoFactorData(userId, {
      secret,
      backupCodes,
      isEnabled: false,
      createdAt: new Date(),
    })

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    }
  }

  async enableTwoFactor(userId: string, token: string): Promise<boolean> {
    const userData = await this.getTwoFactorData(userId)
    if (!userData || !userData.secret) {
      return false
    }

    // Verify the token
    const isValid = authenticator.verify({
      token,
      secret: userData.secret,
    })

    if (isValid) {
      // Enable 2FA for the user
      await this.updateTwoFactorStatus(userId, true)
      return true
    }

    return false
  }

  async disableTwoFactor(userId: string, token: string): Promise<boolean> {
    const userData = await this.getTwoFactorData(userId)
    if (!userData || !userData.secret || !userData.isEnabled) {
      return false
    }

    // Verify the token or backup code
    const validation = await this.validateTwoFactor(userId, token)

    if (validation.isValid) {
      // Disable 2FA and clear data
      await this.clearTwoFactorData(userId)
      return true
    }

    return false
  }

  async validateTwoFactor(userId: string, token: string): Promise<TwoFactorValidation> {
    const userData = await this.getTwoFactorData(userId)
    if (!userData || !userData.secret || !userData.isEnabled) {
      return { isValid: false }
    }

    // First, try to validate as TOTP token
    const isValidToken = authenticator.verify({
      token,
      secret: userData.secret,
    })

    if (isValidToken) {
      return { isValid: true }
    }

    // If TOTP fails, check backup codes
    const backupCodeIndex = userData.backupCodes.findIndex(
      (code) => code === token && !userData.usedBackupCodes?.includes(code),
    )

    if (backupCodeIndex !== -1) {
      // Mark backup code as used
      await this.markBackupCodeAsUsed(userId, token)

      return {
        isValid: true,
        usedBackupCode: token,
      }
    }

    return { isValid: false }
  }

  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const userData = await this.getTwoFactorData(userId)
    if (!userData || !userData.isEnabled) {
      throw new Error("2FA not enabled for user")
    }

    const newBackupCodes = this.generateBackupCodes()

    await this.updateBackupCodes(userId, newBackupCodes)

    return newBackupCodes
  }

  async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const userData = await this.getTwoFactorData(userId)
    return userData?.isEnabled || false
  }

  async getTwoFactorStatus(userId: string): Promise<{
    isEnabled: boolean
    hasBackupCodes: boolean
    remainingBackupCodes: number
  }> {
    const userData = await this.getTwoFactorData(userId)

    if (!userData) {
      return {
        isEnabled: false,
        hasBackupCodes: false,
        remainingBackupCodes: 0,
      }
    }

    const usedCodes = userData.usedBackupCodes?.length || 0
    const totalCodes = userData.backupCodes?.length || 0

    return {
      isEnabled: userData.isEnabled || false,
      hasBackupCodes: totalCodes > 0,
      remainingBackupCodes: totalCodes - usedCodes,
    }
  }

  private generateBackupCodes(count = 10): string[] {
    const codes: string[] = []

    for (let i = 0; i < count; i++) {
      // Generate 8-character alphanumeric code
      const code = crypto.randomBytes(4).toString("hex").toUpperCase()
      codes.push(code)
    }

    return codes
  }

  private async storeTwoFactorData(userId: string, data: any): Promise<void> {
    // Placeholder for database storage
    // In production, this would store in your database
    console.log(`Storing 2FA data for user: ${userId}`)
  }

  private async getTwoFactorData(userId: string): Promise<any> {
    // Placeholder for database retrieval
    // In production, this would fetch from your database
    return {
      secret: "JBSWY3DPEHPK3PXP", // Mock secret
      backupCodes: ["ABC123DE", "FGH456IJ", "KLM789NO"],
      usedBackupCodes: [],
      isEnabled: true,
      createdAt: new Date(),
    }
  }

  private async updateTwoFactorStatus(userId: string, isEnabled: boolean): Promise<void> {
    // Placeholder for database update
    console.log(`Updating 2FA status for user ${userId}: ${isEnabled}`)
  }

  private async clearTwoFactorData(userId: string): Promise<void> {
    // Placeholder for database cleanup
    console.log(`Clearing 2FA data for user: ${userId}`)
  }

  private async markBackupCodeAsUsed(userId: string, code: string): Promise<void> {
    // Placeholder for marking backup code as used
    console.log(`Marking backup code as used for user ${userId}: ${code}`)
  }

  private async updateBackupCodes(userId: string, codes: string[]): Promise<void> {
    // Placeholder for updating backup codes
    console.log(`Updating backup codes for user: ${userId}`)
  }

  // Utility methods
  generateQRCodeForSecret(email: string, secret: string): Promise<string> {
    const otpAuthUrl = authenticator.keyuri(email, this.issuer, secret)
    return QRCode.toDataURL(otpAuthUrl)
  }

  validateTokenFormat(token: string): boolean {
    // TOTP tokens are 6 digits
    const totpRegex = /^\d{6}$/
    // Backup codes are 8 alphanumeric characters
    const backupCodeRegex = /^[A-Z0-9]{8}$/

    return totpRegex.test(token) || backupCodeRegex.test(token.toUpperCase())
  }

  getTimeRemaining(): number {
    // Get remaining time in current 30-second window
    const now = Math.floor(Date.now() / 1000)
    const timeStep = 30
    return timeStep - (now % timeStep)
  }
}

export const twoFactorAuth = new TwoFactorAuth()
