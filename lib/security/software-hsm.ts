/**
 * Software-based Hardware Security Module (HSM) - OCHcloud Compatible
 * Replaces AWS KMS with military-grade software encryption
 * Zero cloud dependencies, works on any hosting provider
 */

import { scrypt, randomBytes, createCipheriv, createDecipheriv, createHmac, timingSafeEqual } from 'crypto'
import { getClusterManager } from '../database/cluster-manager'
import { getIntelligentCache } from '../caching/intelligent-cache'

export interface EncryptionKey {
  id: string
  alias: string
  version: number
  keyMaterial: Buffer
  salt: Buffer
  createdAt: Date
  lastRotated: Date
  status: 'active' | 'rotating' | 'archived'
  usage: 'api_keys' | 'database' | 'session' | 'general'
  metadata: {
    rotationPeriod: number // days
    encryptionCount: number
    decryptionCount: number
  }
}

export interface EncryptedData {
  ciphertext: string
  iv: string
  authTag: string
  keyId: string
  algorithm: string
  version: number
}

export class SoftwareHSM {
  private db = getClusterManager()
  private cache = getIntelligentCache()
  private keyCache: Map<string, EncryptionKey> = new Map()
  private masterKey: Buffer | null = null

  constructor() {
    this.initializeHSM()
  }

  private async initializeHSM() {
    try {
      await this.setupKeyStorage()
      await this.initializeMasterKey()
      await this.loadActiveKeys()
      await this.startKeyRotationScheduler()
      console.log('🔐 Software HSM initialized successfully')
    } catch (error) {
      console.error('❌ Software HSM initialization failed:', error)
      throw error
    }
  }

  private async setupKeyStorage() {
    const createKeysTable = `
      CREATE TABLE IF NOT EXISTS encryption_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        alias VARCHAR(255) UNIQUE NOT NULL,
        version INTEGER NOT NULL DEFAULT 1,
        key_material_encrypted TEXT NOT NULL,
        salt BYTEA NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_rotated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'rotating', 'archived')),
        usage VARCHAR(50) NOT NULL DEFAULT 'general',
        metadata JSONB NOT NULL DEFAULT '{}',
        UNIQUE(alias, version)
      );
      
      CREATE INDEX IF NOT EXISTS idx_encryption_keys_alias ON encryption_keys(alias);
      CREATE INDEX IF NOT EXISTS idx_encryption_keys_status ON encryption_keys(status);
      CREATE INDEX IF NOT EXISTS idx_encryption_keys_usage ON encryption_keys(usage);
    `

    await this.db.query(createKeysTable)
  }

  private async initializeMasterKey() {
    // In production, this would come from secure environment variables or key ceremony
    const masterPassword = process.env.HSM_MASTER_PASSWORD || 'default-master-key-change-in-production'
    const masterSalt = process.env.HSM_MASTER_SALT || 'default-salt-change-in-production'
    
    this.masterKey = await this.deriveKey(masterPassword, masterSalt, 32)
    
    if (process.env.NODE_ENV === 'production' && (
      masterPassword === 'default-master-key-change-in-production' ||
      masterSalt === 'default-salt-change-in-production'
    )) {
      console.warn('🚨 WARNING: Using default HSM master key in production! Set HSM_MASTER_PASSWORD and HSM_MASTER_SALT environment variables!')
    }
  }

  private async deriveKey(password: string, salt: string, keyLength: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scrypt(password, salt, keyLength, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) reject(err)
        else resolve(derivedKey as Buffer)
      })
    })
  }

  /**
   * Create a new encryption key
   */
  async createKey(alias: string, usage: EncryptionKey['usage'] = 'general'): Promise<string> {
    try {
      if (!this.masterKey) {
        throw new Error('Master key not initialized')
      }

      const keyId = randomBytes(16).toString('hex')
      const keyMaterial = randomBytes(32) // 256-bit key
      const salt = randomBytes(32)

      // Encrypt the key material with master key
      const encryptedKeyMaterial = await this.encryptWithMasterKey(keyMaterial)

      const encryptionKey: EncryptionKey = {
        id: keyId,
        alias,
        version: 1,
        keyMaterial,
        salt,
        createdAt: new Date(),
        lastRotated: new Date(),
        status: 'active',
        usage,
        metadata: {
          rotationPeriod: usage === 'api_keys' ? 90 : 365, // API keys rotate every 90 days
          encryptionCount: 0,
          decryptionCount: 0
        }
      }

      // Store in database
      await this.db.query(`
        INSERT INTO encryption_keys (id, alias, version, key_material_encrypted, salt, status, usage, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        keyId,
        alias,
        encryptionKey.version,
        encryptedKeyMaterial,
        salt,
        encryptionKey.status,
        usage,
        JSON.stringify(encryptionKey.metadata)
      ])

      // Cache the key
      this.keyCache.set(keyId, encryptionKey)
      this.keyCache.set(alias, encryptionKey)

      console.log(`🔑 Created encryption key: ${alias} (${keyId})`)
      return keyId

    } catch (error) {
      console.error('❌ Failed to create encryption key:', error)
      throw error
    }
  }

  /**
   * Encrypt data with specified key
   */
  async encrypt(
    data: string | Buffer, 
    keyIdOrAlias: string, 
    additionalData?: string
  ): Promise<EncryptedData> {
    try {
      const key = await this.getKey(keyIdOrAlias)
      if (!key || key.status !== 'active') {
        throw new Error(`Key not found or inactive: ${keyIdOrAlias}`)
      }

      const iv = randomBytes(16)
      const cipher = createCipheriv('aes-256-gcm', key.keyMaterial, iv)

      if (additionalData) {
        cipher.setAAD(Buffer.from(additionalData, 'utf8'))
      }

      const inputBuffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data
      const encrypted = Buffer.concat([cipher.update(inputBuffer), cipher.final()])
      const authTag = cipher.getAuthTag()

      // Update usage statistics
      key.metadata.encryptionCount++
      await this.updateKeyMetadata(key.id, key.metadata)

      const result: EncryptedData = {
        ciphertext: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        keyId: key.id,
        algorithm: 'aes-256-gcm',
        version: key.version
      }

      return result

    } catch (error) {
      console.error('❌ Encryption failed:', error)
      throw error
    }
  }

  /**
   * Decrypt data with specified key
   */
  async decrypt(
    encryptedData: EncryptedData, 
    additionalData?: string
  ): Promise<Buffer> {
    try {
      const key = await this.getKey(encryptedData.keyId)
      if (!key) {
        throw new Error(`Key not found: ${encryptedData.keyId}`)
      }

      const iv = Buffer.from(encryptedData.iv, 'base64')
      const authTag = Buffer.from(encryptedData.authTag, 'base64')
      const ciphertext = Buffer.from(encryptedData.ciphertext, 'base64')

      const decipher = createDecipheriv('aes-256-gcm', key.keyMaterial, iv)
      decipher.setAuthTag(authTag)

      if (additionalData) {
        decipher.setAAD(Buffer.from(additionalData, 'utf8'))
      }

      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])

      // Update usage statistics
      key.metadata.decryptionCount++
      await this.updateKeyMetadata(key.id, key.metadata)

      return decrypted

    } catch (error) {
      console.error('❌ Decryption failed:', error)
      throw error
    }
  }

  /**
   * Rotate encryption key
   */
  async rotateKey(keyIdOrAlias: string): Promise<string> {
    try {
      const oldKey = await this.getKey(keyIdOrAlias)
      if (!oldKey) {
        throw new Error(`Key not found: ${keyIdOrAlias}`)
      }

      // Mark old key as rotating
      await this.updateKeyStatus(oldKey.id, 'rotating')

      // Create new version of the key
      const newKeyMaterial = randomBytes(32)
      const newSalt = randomBytes(32)
      const newVersion = oldKey.version + 1
      const newKeyId = randomBytes(16).toString('hex')

      const encryptedKeyMaterial = await this.encryptWithMasterKey(newKeyMaterial)

      const newKey: EncryptionKey = {
        ...oldKey,
        id: newKeyId,
        version: newVersion,
        keyMaterial: newKeyMaterial,
        salt: newSalt,
        lastRotated: new Date(),
        status: 'active',
        metadata: {
          ...oldKey.metadata,
          encryptionCount: 0,
          decryptionCount: 0
        }
      }

      // Store new key version
      await this.db.query(`
        INSERT INTO encryption_keys (id, alias, version, key_material_encrypted, salt, status, usage, metadata, last_rotated)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        newKeyId,
        newKey.alias,
        newVersion,
        encryptedKeyMaterial,
        newSalt,
        'active',
        newKey.usage,
        JSON.stringify(newKey.metadata)
      ])

      // Archive old key after grace period
      setTimeout(async () => {
        await this.updateKeyStatus(oldKey.id, 'archived')
      }, 24 * 60 * 60 * 1000) // 24 hours grace period

      // Update cache
      this.keyCache.set(newKeyId, newKey)
      this.keyCache.set(newKey.alias, newKey)

      console.log(`🔄 Rotated key: ${oldKey.alias} (v${oldKey.version} -> v${newVersion})`)
      return newKeyId

    } catch (error) {
      console.error('❌ Key rotation failed:', error)
      throw error
    }
  }

  /**
   * Secure API key storage
   */
  async encryptApiKey(
    apiKey: string, 
    broker: string, 
    userId: string
  ): Promise<{ encryptedData: EncryptedData; keyId: string }> {
    const keyAlias = 'api-key-encryption'
    
    // Ensure API key encryption key exists
    let key = await this.getKey(keyAlias)
    if (!key) {
      await this.createKey(keyAlias, 'api_keys')
      key = await this.getKey(keyAlias)
    }

    // Additional authenticated data for extra security
    const aad = `${broker}:${userId}`
    
    const encryptedData = await this.encrypt(apiKey, keyAlias, aad)
    
    return {
      encryptedData,
      keyId: key!.id
    }
  }

  /**
   * Secure API key retrieval
   */
  async decryptApiKey(
    encryptedData: EncryptedData, 
    broker: string, 
    userId: string
  ): Promise<string> {
    const aad = `${broker}:${userId}`
    const decrypted = await this.decrypt(encryptedData, aad)
    return decrypted.toString('utf8')
  }

  /**
   * Generate cryptographically secure tokens
   */
  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('base64url')
  }

  /**
   * HMAC signing for data integrity
   */
  async signData(data: string, keyIdOrAlias: string): Promise<string> {
    const key = await this.getKey(keyIdOrAlias)
    if (!key) {
      throw new Error(`Key not found: ${keyIdOrAlias}`)
    }

    const hmac = createHmac('sha256', key.keyMaterial)
    hmac.update(data)
    return hmac.digest('base64')
  }

  /**
   * Verify HMAC signature
   */
  async verifySignature(data: string, signature: string, keyIdOrAlias: string): Promise<boolean> {
    try {
      const expectedSignature = await this.signData(data, keyIdOrAlias)
      const signatureBuffer = Buffer.from(signature, 'base64')
      const expectedBuffer = Buffer.from(expectedSignature, 'base64')
      
      return timingSafeEqual(signatureBuffer, expectedBuffer)
    } catch (error) {
      console.error('❌ Signature verification failed:', error)
      return false
    }
  }

  /**
   * Key management helpers
   */
  private async getKey(keyIdOrAlias: string): Promise<EncryptionKey | null> {
    // Check cache first
    if (this.keyCache.has(keyIdOrAlias)) {
      return this.keyCache.get(keyIdOrAlias)!
    }

    try {
      let result
      
      // Try by ID first, then by alias
      if (keyIdOrAlias.length === 32) { // Hex ID
        result = await this.db.query(
          'SELECT * FROM encryption_keys WHERE id = $1 AND status != $2',
          [keyIdOrAlias, 'archived']
        )
      } else {
        result = await this.db.query(
          'SELECT * FROM encryption_keys WHERE alias = $1 AND status != $2 ORDER BY version DESC LIMIT 1',
          [keyIdOrAlias, 'archived']
        )
      }

      if (result.rows.length === 0) {
        return null
      }

      const row = result.rows[0]
      
      // Decrypt key material
      const keyMaterial = await this.decryptWithMasterKey(row.key_material_encrypted)

      const key: EncryptionKey = {
        id: row.id,
        alias: row.alias,
        version: row.version,
        keyMaterial,
        salt: row.salt,
        createdAt: row.created_at,
        lastRotated: row.last_rotated,
        status: row.status,
        usage: row.usage,
        metadata: row.metadata
      }

      // Cache the key
      this.keyCache.set(key.id, key)
      this.keyCache.set(key.alias, key)

      return key

    } catch (error) {
      console.error('❌ Failed to load key:', error)
      return null
    }
  }

  private async loadActiveKeys() {
    const result = await this.db.query(
      'SELECT * FROM encryption_keys WHERE status = $1',
      ['active']
    )

    for (const row of result.rows) {
      try {
        const keyMaterial = await this.decryptWithMasterKey(row.key_material_encrypted)
        
        const key: EncryptionKey = {
          id: row.id,
          alias: row.alias,
          version: row.version,
          keyMaterial,
          salt: row.salt,
          createdAt: row.created_at,
          lastRotated: row.last_rotated,
          status: row.status,
          usage: row.usage,
          metadata: row.metadata
        }

        this.keyCache.set(key.id, key)
        this.keyCache.set(key.alias, key)
      } catch (error) {
        console.error(`Failed to load key ${row.id}:`, error)
      }
    }

    console.log(`🔑 Loaded ${this.keyCache.size / 2} active encryption keys`)
  }

  private async encryptWithMasterKey(data: Buffer): Promise<string> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized')
    }

    const iv = randomBytes(16)
    const cipher = createCipheriv('aes-256-gcm', this.masterKey, iv)
    
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, encrypted]).toString('base64')
  }

  private async decryptWithMasterKey(encryptedData: string): Promise<Buffer> {
    if (!this.masterKey) {
      throw new Error('Master key not initialized')
    }

    const data = Buffer.from(encryptedData, 'base64')
    const iv = data.subarray(0, 16)
    const authTag = data.subarray(16, 32)
    const ciphertext = data.subarray(32)

    const decipher = createDecipheriv('aes-256-gcm', this.masterKey, iv)
    decipher.setAuthTag(authTag)

    return Buffer.concat([decipher.update(ciphertext), decipher.final()])
  }

  private async updateKeyStatus(keyId: string, status: EncryptionKey['status']) {
    await this.db.query(
      'UPDATE encryption_keys SET status = $1, last_rotated = CASE WHEN $1 = \'active\' THEN NOW() ELSE last_rotated END WHERE id = $2',
      [status, keyId]
    )
  }

  private async updateKeyMetadata(keyId: string, metadata: EncryptionKey['metadata']) {
    await this.db.query(
      'UPDATE encryption_keys SET metadata = $1 WHERE id = $2',
      [JSON.stringify(metadata), keyId]
    )
  }

  private startKeyRotationScheduler() {
    // Check for keys that need rotation every hour
    setInterval(async () => {
      try {
        const result = await this.db.query(`
          SELECT id, alias, last_rotated, metadata->'rotationPeriod' as rotation_period
          FROM encryption_keys 
          WHERE status = 'active' 
          AND last_rotated < NOW() - INTERVAL '1 day' * (metadata->>'rotationPeriod')::int
        `)

        for (const row of result.rows) {
          console.log(`🔄 Auto-rotating key: ${row.alias}`)
          await this.rotateKey(row.id)
        }

      } catch (error) {
        console.error('❌ Key rotation scheduler error:', error)
      }
    }, 60 * 60 * 1000) // Every hour

    console.log('⏰ Key rotation scheduler started')
  }

  /**
   * Get key statistics
   */
  async getKeyStatistics(): Promise<{
    totalKeys: number
    activeKeys: number
    rotatingKeys: number
    archivedKeys: number
    keysByUsage: { [usage: string]: number }
  }> {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total_keys,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_keys,
        COUNT(CASE WHEN status = 'rotating' THEN 1 END) as rotating_keys,
        COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_keys,
        usage,
        COUNT(*) as usage_count
      FROM encryption_keys 
      GROUP BY usage
    `)

    const stats = {
      totalKeys: 0,
      activeKeys: 0,
      rotatingKeys: 0,
      archivedKeys: 0,
      keysByUsage: {} as { [usage: string]: number }
    }

    for (const row of result.rows) {
      stats.totalKeys += parseInt(row.total_keys)
      stats.activeKeys += parseInt(row.active_keys)
      stats.rotatingKeys += parseInt(row.rotating_keys)
      stats.archivedKeys += parseInt(row.archived_keys)
      stats.keysByUsage[row.usage] = parseInt(row.usage_count)
    }

    return stats
  }

  /**
   * Cleanup and shutdown
   */
  async cleanup(): Promise<void> {
    this.keyCache.clear()
    if (this.masterKey) {
      this.masterKey.fill(0) // Zero out master key
    }
    console.log('🧹 Software HSM cleanup completed')
  }
}

// Singleton instance
let softwareHSM: SoftwareHSM | null = null

export const getSoftwareHSM = (): SoftwareHSM => {
  if (!softwareHSM) {
    softwareHSM = new SoftwareHSM()
  }
  return softwareHSM
}

export default SoftwareHSM
