import { createCipheriv, createDecipheriv, createHash, randomBytes, pbkdf2Sync, createHmac } from "crypto"

interface EncryptionResult {
  encrypted: string
  iv: string
  salt: string
  tag?: string
}

interface DecryptionResult {
  decrypted: string
  verified: boolean
}

export class AdvancedEncryption {
  private readonly algorithm = "aes-256-gcm"
  private readonly keyLength = 32
  private readonly ivLength = 16
  private readonly saltLength = 32
  private readonly tagLength = 16
  private readonly iterations = 100000

  // Encrypt sensitive data with AES-256-GCM
  encryptData(data: string, password: string): EncryptionResult {
    try {
      const salt = randomBytes(this.saltLength)
      const iv = randomBytes(this.ivLength)

      // Derive key using PBKDF2
      const key = pbkdf2Sync(password, salt, this.iterations, this.keyLength, "sha512")

      const cipher = createCipheriv(this.algorithm, key, iv)
      cipher.setAAD(Buffer.from("NEXURAL-TRADING-PLATFORM"))

      let encrypted = cipher.update(data, "utf8", "hex")
      encrypted += cipher.final("hex")

      const tag = cipher.getAuthTag()

      return {
        encrypted,
        iv: iv.toString("hex"),
        salt: salt.toString("hex"),
        tag: tag.toString("hex"),
      }
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`)
    }
  }

  // Decrypt data with verification
  decryptData(encryptionResult: EncryptionResult, password: string): DecryptionResult {
    try {
      const salt = Buffer.from(encryptionResult.salt, "hex")
      const iv = Buffer.from(encryptionResult.iv, "hex")
      const tag = encryptionResult.tag ? Buffer.from(encryptionResult.tag, "hex") : undefined

      // Derive the same key
      const key = pbkdf2Sync(password, salt, this.iterations, this.keyLength, "sha512")

      const decipher = createDecipheriv(this.algorithm, key, iv)
      decipher.setAAD(Buffer.from("NEXURAL-TRADING-PLATFORM"))

      if (tag) {
        decipher.setAuthTag(tag)
      }

      let decrypted = decipher.update(encryptionResult.encrypted, "hex", "utf8")
      decrypted += decipher.final("utf8")

      return {
        decrypted,
        verified: true,
      }
    } catch (error) {
      return {
        decrypted: "",
        verified: false,
      }
    }
  }

  // Hash passwords with salt
  hashPassword(password: string): { hash: string; salt: string } {
    const salt = randomBytes(this.saltLength).toString("hex")
    const hash = pbkdf2Sync(password, salt, this.iterations, this.keyLength, "sha512").toString("hex")

    return { hash, salt }
  }

  // Verify password against hash
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const computedHash = pbkdf2Sync(password, salt, this.iterations, this.keyLength, "sha512").toString("hex")
    return this.constantTimeCompare(hash, computedHash)
  }

  // Generate secure API keys
  generateAPIKey(): string {
    const prefix = "nex_"
    const keyData = randomBytes(32).toString("hex")
    const checksum = createHash("sha256").update(keyData).digest("hex").slice(0, 8)

    return `${prefix}${keyData}${checksum}`
  }

  // Validate API key format and checksum
  validateAPIKey(apiKey: string): boolean {
    if (!apiKey.startsWith("nex_") || apiKey.length !== 75) {
      return false
    }

    const keyData = apiKey.slice(4, -8)
    const providedChecksum = apiKey.slice(-8)
    const computedChecksum = createHash("sha256").update(keyData).digest("hex").slice(0, 8)

    return this.constantTimeCompare(providedChecksum, computedChecksum)
  }

  // Create HMAC signature for API requests
  createHMACSignature(data: string, secret: string): string {
    return createHmac("sha256", secret).update(data).digest("hex")
  }

  // Verify HMAC signature
  verifyHMACSignature(data: string, signature: string, secret: string): boolean {
    const computedSignature = this.createHMACSignature(data, secret)
    return this.constantTimeCompare(signature, computedSignature)
  }

  // Encrypt sensitive user data (PII)
  encryptPII(data: any): string {
    const jsonData = JSON.stringify(data)
    const masterKey = process.env.ENCRYPTION_MASTER_KEY || "default-key-change-in-production"
    const result = this.encryptData(jsonData, masterKey)

    return Buffer.from(JSON.stringify(result)).toString("base64")
  }

  // Decrypt sensitive user data (PII)
  decryptPII(encryptedData: string): any {
    try {
      const masterKey = process.env.ENCRYPTION_MASTER_KEY || "default-key-change-in-production"
      const encryptionResult = JSON.parse(Buffer.from(encryptedData, "base64").toString())
      const result = this.decryptData(encryptionResult, masterKey)

      if (!result.verified) {
        throw new Error("Data integrity verification failed")
      }

      return JSON.parse(result.decrypted)
    } catch (error) {
      throw new Error(`PII decryption failed: ${error.message}`)
    }
  }

  // Generate secure session tokens
  generateSessionToken(): { token: string; expires: Date } {
    const tokenData = {
      random: randomBytes(32).toString("hex"),
      timestamp: Date.now(),
      nonce: randomBytes(16).toString("hex"),
    }

    const token = Buffer.from(JSON.stringify(tokenData)).toString("base64url")
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    return { token, expires }
  }

  // Validate session token
  validateSessionToken(token: string): { valid: boolean; expired: boolean } {
    try {
      const tokenData = JSON.parse(Buffer.from(token, "base64url").toString())
      const now = Date.now()
      const tokenAge = now - tokenData.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      return {
        valid: tokenAge < maxAge,
        expired: tokenAge >= maxAge,
      }
    } catch (error) {
      return { valid: false, expired: true }
    }
  }

  // Constant time string comparison to prevent timing attacks
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }
}

export const encryption = new AdvancedEncryption()
