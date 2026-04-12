// 🔐 HARDWARE SECURITY MODULE (HSM) - Enterprise-grade API key encryption
// Addresses CRITICAL security vulnerability: API keys stored in plain text

import crypto from 'crypto'
import * as AWS from 'aws-sdk'

interface EncryptedCredential {
  keyId: string
  encryptedData: string
  algorithm: string
  keyDerivationFunction: string
  salt: string
  iv: string
  authTag: string
  createdAt: Date
  lastAccessed?: Date
}

interface HSMConfig {
  provider: 'aws-kms' | 'azure-keyvault' | 'local-hsm'
  keyId: string
  region?: string
  endpoint?: string
}

// 🔐 ABSTRACT HSM PROVIDER
export abstract class HSMProvider {
  protected config: HSMConfig

  constructor(config: HSMConfig) {
    this.config = config
  }

  abstract encrypt(plaintext: string): Promise<EncryptedCredential>
  abstract decrypt(credential: EncryptedCredential): Promise<string>
  abstract rotateKey(oldKeyId: string): Promise<string>
  abstract validateKeyAccess(): Promise<boolean>
}

// 🏛️ AWS KMS PROVIDER (Production)
export class AWSKMSProvider extends HSMProvider {
  private kms: AWS.KMS
  private keyCache: Map<string, any> = new Map()
  private cacheTimeout = 300000 // 5 minutes

  constructor(config: HSMConfig) {
    super(config)
    
    this.kms = new AWS.KMS({
      region: config.region || 'us-east-1',
      endpoint: config.endpoint
    })
  }

  async encrypt(plaintext: string): Promise<EncryptedCredential> {
    try {
      // Generate unique data key for envelope encryption
      const { Plaintext: dataKey, CiphertextBlob: encryptedDataKey } = await this.kms.generateDataKey({
        KeyId: this.config.keyId,
        KeySpec: 'AES_256'
      }).promise()

      if (!dataKey || !encryptedDataKey) {
        throw new Error('Failed to generate data key')
      }

      // Generate salt and IV for additional security
      const salt = crypto.randomBytes(32)
      const iv = crypto.randomBytes(16)
      
      // Derive key using PBKDF2
      const derivedKey = crypto.pbkdf2Sync(dataKey, salt, 100000, 32, 'sha256')

      // Encrypt the plaintext using AES-256-GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv)
      cipher.setAAD(Buffer.from(this.config.keyId))
      
      let encrypted = cipher.update(plaintext, 'utf8', 'base64')
      encrypted += cipher.final('base64')
      
      const authTag = cipher.getAuthTag()

      // Store encrypted data key with the encrypted data
      const encryptedPackage = {
        dataKey: encryptedDataKey.toString('base64'),
        data: encrypted,
        authTag: authTag.toString('base64')
      }

      return {
        keyId: this.config.keyId,
        encryptedData: Buffer.from(JSON.stringify(encryptedPackage)).toString('base64'),
        algorithm: 'AES-256-GCM',
        keyDerivationFunction: 'PBKDF2',
        salt: salt.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        createdAt: new Date()
      }
    } catch (error) {
      console.error('HSM encryption failed:', error)
      throw new Error(`HSM encryption failed: ${error}`)
    }
  }

  async decrypt(credential: EncryptedCredential): Promise<string> {
    try {
      // Parse encrypted package
      const packageData = JSON.parse(
        Buffer.from(credential.encryptedData, 'base64').toString('utf8')
      )

      // Decrypt the data key using KMS
      const { Plaintext: dataKey } = await this.kms.decrypt({
        CiphertextBlob: Buffer.from(packageData.dataKey, 'base64')
      }).promise()

      if (!dataKey) {
        throw new Error('Failed to decrypt data key')
      }

      // Derive the same key used for encryption
      const salt = Buffer.from(credential.salt, 'base64')
      const derivedKey = crypto.pbkdf2Sync(dataKey, salt, 100000, 32, 'sha256')

      // Decrypt the data
      const iv = Buffer.from(credential.iv, 'base64')
      const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv)
      decipher.setAAD(Buffer.from(credential.keyId))
      decipher.setAuthTag(Buffer.from(packageData.authTag, 'base64'))

      let decrypted = decipher.update(packageData.data, 'base64', 'utf8')
      decrypted += decipher.final('utf8')

      // Update last accessed time (for audit purposes)
      credential.lastAccessed = new Date()

      return decrypted
    } catch (error) {
      console.error('HSM decryption failed:', error)
      throw new Error(`HSM decryption failed: ${error}`)
    }
  }

  async rotateKey(oldKeyId: string): Promise<string> {
    try {
      // Create new KMS key
      const newKey = await this.kms.createKey({
        Description: `Nexural API Key Encryption - Rotated from ${oldKeyId}`,
        Usage: 'ENCRYPT_DECRYPT',
        KeySpec: 'SYMMETRIC_DEFAULT'
      }).promise()

      const newKeyId = newKey.KeyMetadata?.KeyId
      if (!newKeyId) {
        throw new Error('Failed to create new key')
      }

      // Schedule old key for deletion (7-day waiting period)
      await this.kms.scheduleKeyDeletion({
        KeyId: oldKeyId,
        PendingWindowInDays: 7
      }).promise()

      return newKeyId
    } catch (error) {
      console.error('Key rotation failed:', error)
      throw new Error(`Key rotation failed: ${error}`)
    }
  }

  async validateKeyAccess(): Promise<boolean> {
    try {
      const result = await this.kms.describeKey({
        KeyId: this.config.keyId
      }).promise()

      return result.KeyMetadata?.Enabled === true
    } catch (error) {
      console.error('Key validation failed:', error)
      return false
    }
  }
}

// 🔐 LOCAL HSM PROVIDER (Development/Testing)
export class LocalHSMProvider extends HSMProvider {
  private masterKey: Buffer
  
  constructor(config: HSMConfig) {
    super(config)
    
    // In production, this would be loaded from actual HSM
    this.masterKey = crypto.scryptSync(
      config.keyId || 'nexural-master-key', 
      'nexural-salt', 
      32
    )
  }

  async encrypt(plaintext: string): Promise<EncryptedCredential> {
    const salt = crypto.randomBytes(32)
    const iv = crypto.randomBytes(16)
    
    // Derive key using master key + salt
    const derivedKey = crypto.pbkdf2Sync(this.masterKey, salt, 100000, 32, 'sha256')
    
    // Encrypt using AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', derivedKey, iv)
    let encrypted = cipher.update(plaintext, 'utf8', 'base64')
    encrypted += cipher.final('base64')
    
    const authTag = cipher.getAuthTag()

    return {
      keyId: this.config.keyId,
      encryptedData: encrypted,
      algorithm: 'AES-256-GCM',
      keyDerivationFunction: 'PBKDF2',
      salt: salt.toString('base64'),
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      createdAt: new Date()
    }
  }

  async decrypt(credential: EncryptedCredential): Promise<string> {
    const salt = Buffer.from(credential.salt, 'base64')
    const authTag = Buffer.from(credential.authTag, 'base64')
    
    // Derive the same key
    const derivedKey = crypto.pbkdf2Sync(this.masterKey, salt, 100000, 32, 'sha256')
    
    // Decrypt
    const iv = Buffer.from(credential.iv, 'base64')
    const decipher = crypto.createDecipheriv('aes-256-gcm', derivedKey, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(credential.encryptedData, 'base64', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  async rotateKey(oldKeyId: string): Promise<string> {
    // For local HSM, generate new key
    const newKeyId = `local-key-${Date.now()}`
    return newKeyId
  }

  async validateKeyAccess(): Promise<boolean> {
    return true // Local keys are always available
  }
}

// 🔐 SECURE CREDENTIAL MANAGER
export class SecureCredentialManager {
  private hsm: HSMProvider
  private credentialCache: Map<string, { plaintext: string, expiry: number }> = new Map()
  private cacheTimeout = 300000 // 5 minutes
  
  constructor(hsmProvider: HSMProvider) {
    this.hsm = hsmProvider
    
    // Validate HSM connection on startup
    this.validateConnection()
  }

  private async validateConnection(): Promise<void> {
    try {
      const isValid = await this.hsm.validateKeyAccess()
      if (!isValid) {
        throw new Error('HSM key validation failed')
      }
      console.log('✅ HSM connection validated successfully')
    } catch (error) {
      console.error('🔴 HSM connection validation failed:', error)
      throw error
    }
  }

  // 🔐 ENCRYPT AND STORE BROKER API CREDENTIALS
  async storeBrokerCredentials(
    userId: string, 
    brokerId: string, 
    apiKey: string, 
    apiSecret?: string
  ): Promise<EncryptedCredential[]> {
    try {
      const credentials: EncryptedCredential[] = []
      
      // Encrypt API key
      const encryptedApiKey = await this.hsm.encrypt(apiKey)
      credentials.push({
        ...encryptedApiKey,
        keyId: `${userId}:${brokerId}:api_key`
      })

      // Encrypt API secret if provided
      if (apiSecret) {
        const encryptedSecret = await this.hsm.encrypt(apiSecret)
        credentials.push({
          ...encryptedSecret,
          keyId: `${userId}:${brokerId}:api_secret`
        })
      }

      // Log security event
      this.auditLog('CREDENTIAL_STORED', userId, brokerId)
      
      return credentials
    } catch (error) {
      this.auditLog('CREDENTIAL_STORE_FAILED', userId, brokerId, error)
      throw error
    }
  }

  // 🔓 DECRYPT AND RETRIEVE BROKER CREDENTIALS
  async retrieveBrokerCredentials(
    userId: string, 
    brokerId: string
  ): Promise<{ apiKey: string; apiSecret?: string }> {
    try {
      const cacheKey = `${userId}:${brokerId}`
      
      // Check cache first
      const cached = this.credentialCache.get(cacheKey)
      if (cached && cached.expiry > Date.now()) {
        return JSON.parse(cached.plaintext)
      }

      // Retrieve from database (mock implementation)
      const encryptedCredentials = await this.getEncryptedCredentialsFromDB(userId, brokerId)
      
      if (!encryptedCredentials || encryptedCredentials.length === 0) {
        throw new Error('No credentials found')
      }

      // Decrypt credentials
      const credentials: any = {}
      
      for (const credential of encryptedCredentials) {
        const decrypted = await this.hsm.decrypt(credential)
        
        if (credential.keyId.endsWith(':api_key')) {
          credentials.apiKey = decrypted
        } else if (credential.keyId.endsWith(':api_secret')) {
          credentials.apiSecret = decrypted
        }
      }

      // Cache decrypted credentials (in memory only)
      this.credentialCache.set(cacheKey, {
        plaintext: JSON.stringify(credentials),
        expiry: Date.now() + this.cacheTimeout
      })

      // Log access for audit
      this.auditLog('CREDENTIAL_ACCESSED', userId, brokerId)
      
      return credentials
    } catch (error) {
      this.auditLog('CREDENTIAL_ACCESS_FAILED', userId, brokerId, error)
      throw error
    }
  }

  // 🔄 ROTATE CREDENTIALS
  async rotateCredentials(userId: string, brokerId: string): Promise<void> {
    try {
      // Get current credentials
      const currentCreds = await this.retrieveBrokerCredentials(userId, brokerId)
      
      // Rotate HSM key
      const newKeyId = await this.hsm.rotateKey(this.hsm.config.keyId)
      
      // Re-encrypt with new key
      await this.storeBrokerCredentials(userId, brokerId, currentCreds.apiKey, currentCreds.apiSecret)
      
      // Clear cache
      this.credentialCache.delete(`${userId}:${brokerId}`)
      
      this.auditLog('CREDENTIAL_ROTATED', userId, brokerId)
    } catch (error) {
      this.auditLog('CREDENTIAL_ROTATION_FAILED', userId, brokerId, error)
      throw error
    }
  }

  // 🗑️ SECURE DELETE
  async deleteCredentials(userId: string, brokerId: string): Promise<void> {
    try {
      // Remove from database
      await this.deleteCredentialsFromDB(userId, brokerId)
      
      // Clear from cache
      this.credentialCache.delete(`${userId}:${brokerId}`)
      
      this.auditLog('CREDENTIAL_DELETED', userId, brokerId)
    } catch (error) {
      this.auditLog('CREDENTIAL_DELETE_FAILED', userId, brokerId, error)
      throw error
    }
  }

  // 📊 AUDIT LOGGING
  private auditLog(action: string, userId: string, brokerId: string, error?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      brokerId,
      success: !error,
      error: error?.message,
      ip: 'TODO: Get from request',
      userAgent: 'TODO: Get from request'
    }
    
    // In production, this would go to a secure audit log system
    console.log(`🔐 AUDIT LOG: ${JSON.stringify(logEntry)}`)
  }

  // 💾 DATABASE OPERATIONS (Mock - implement with actual DB)
  private async getEncryptedCredentialsFromDB(userId: string, brokerId: string): Promise<EncryptedCredential[]> {
    // TODO: Implement actual database query
    // SELECT * FROM encrypted_credentials WHERE user_id = ? AND broker_id = ?
    return []
  }

  private async saveEncryptedCredentialsToDB(credentials: EncryptedCredential[]): Promise<void> {
    // TODO: Implement actual database save
    // INSERT INTO encrypted_credentials (...)
  }

  private async deleteCredentialsFromDB(userId: string, brokerId: string): Promise<void> {
    // TODO: Implement actual database delete
    // DELETE FROM encrypted_credentials WHERE user_id = ? AND broker_id = ?
  }

  // 🧹 CLEANUP
  cleanup(): void {
    // Clear sensitive data from memory
    this.credentialCache.clear()
  }
}

// 🏭 FACTORY FOR HSM PROVIDERS
export class HSMFactory {
  static create(config: HSMConfig): HSMProvider {
    switch (config.provider) {
      case 'aws-kms':
        return new AWSKMSProvider(config)
      case 'local-hsm':
        return new LocalHSMProvider(config)
      default:
        throw new Error(`Unsupported HSM provider: ${config.provider}`)
    }
  }

  static createCredentialManager(config: HSMConfig): SecureCredentialManager {
    const hsm = this.create(config)
    return new SecureCredentialManager(hsm)
  }
}

export { EncryptedCredential, HSMConfig }
