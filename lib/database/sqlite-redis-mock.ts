/**
 * 🗄️ SQLite and Redis Mock
 * Provides mock implementations for database and caching functionality
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';

// In-memory data storage for SQLite mock
const inMemoryDatabase: Record<string, any[]> = {
  users: [],
  strategies: [],
  signals: [],
  trades: [],
  performance: [],
  settings: [],
  apiKeys: [],
  sessions: [],
};

// In-memory cache for Redis mock
const inMemoryCache: Record<string, { value: any; expiry: number | null }> = {};

/**
 * SQLite Database Mock
 */
export class SqliteConnection {
  private connected: boolean = false;
  private tables: string[] = Object.keys(inMemoryDatabase);

  constructor() {
    console.log('🎭 Mock database connection initialized');
  }

  async connect(): Promise<void> {
    this.connected = true;
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    return Promise.resolve();
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.connected) {
      await this.connect();
    }

    // Parse the SQL query (very simplistic)
    const isSelect = sql.trim().toLowerCase().startsWith('select');
    const isInsert = sql.trim().toLowerCase().startsWith('insert');
    const isUpdate = sql.trim().toLowerCase().startsWith('update');
    const isDelete = sql.trim().toLowerCase().startsWith('delete');

    // Extract table name - this is a very simplified approach
    let table = '';
    if (isSelect) {
      const fromMatch = sql.match(/from\s+(\w+)/i);
      table = fromMatch ? fromMatch[1].toLowerCase() : '';
    } else if (isInsert) {
      const intoMatch = sql.match(/into\s+(\w+)/i);
      table = intoMatch ? intoMatch[1].toLowerCase() : '';
    } else if (isUpdate || isDelete) {
      const tableMatch = sql.match(/(update|delete from)\s+(\w+)/i);
      table = tableMatch ? tableMatch[2].toLowerCase() : '';
    }

    if (!this.tables.includes(table)) {
      return [] as T[];
    }

    // Handle different query types
    if (isSelect) {
      // For simplicity, just return the whole table
      return [...inMemoryDatabase[table]] as T[];
    } else if (isInsert) {
      // Create a new record with UUID if not provided
      const newRecord = { id: uuidv4(), ...params[0] };
      inMemoryDatabase[table].push(newRecord);
      return [newRecord] as T[];
    } else if (isUpdate) {
      // Update logic would go here (simplified)
      const id = params[0]?.id;
      if (id) {
        const index = inMemoryDatabase[table].findIndex(item => item.id === id);
        if (index !== -1) {
          inMemoryDatabase[table][index] = { ...inMemoryDatabase[table][index], ...params[0] };
          return [inMemoryDatabase[table][index]] as T[];
        }
      }
      return [] as T[];
    } else if (isDelete) {
      // Delete logic would go here (simplified)
      const id = params[0]?.id;
      if (id) {
        const index = inMemoryDatabase[table].findIndex(item => item.id === id);
        if (index !== -1) {
          const deleted = inMemoryDatabase[table].splice(index, 1);
          return deleted as T[];
        }
      }
      return [] as T[];
    }

    return [] as T[];
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    await this.query(sql, params);
    return Promise.resolve();
  }

  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    // No real transaction support in the mock, just execute the callback
    return callback();
  }
}

/**
 * Redis Client Mock
 */
export class RedisClient extends EventEmitter {
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectInterval: number = 1000;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
    // Auto-connect on initialization
    this.connect();

    // Set up interval to clean expired cache entries
    setInterval(() => this.cleanExpiredEntries(), 60000);
  }

  connect(): Promise<void> {
    // Simulate successful connection (mock doesn't actually connect to anything)
    this.connected = true;
    this.reconnectAttempts = 0;
    this.emit('connect');
    console.log('📦 Mock Redis connected');
    return Promise.resolve();
  }

  disconnect(): Promise<void> {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.connected = false;
    this.emit('end');
    console.log('⚠️ Mock Redis disconnected');
    return Promise.resolve();
  }

  // Mock Redis get operation
  async get(key: string): Promise<string | null> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    const cacheEntry = inMemoryCache[key];
    if (!cacheEntry) {
      return null;
    }

    // Check if the entry has expired
    if (cacheEntry.expiry !== null && cacheEntry.expiry < Date.now()) {
      delete inMemoryCache[key];
      return null;
    }

    return typeof cacheEntry.value === 'string' 
      ? cacheEntry.value 
      : JSON.stringify(cacheEntry.value);
  }

  // Mock Redis set operation
  async set(key: string, value: any): Promise<void> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    inMemoryCache[key] = {
      value,
      expiry: null, // No expiry by default
    };
    return Promise.resolve();
  }

  // Mock Redis setex operation (set with expiry)
  async setex(key: string, seconds: number, value: any): Promise<void> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    inMemoryCache[key] = {
      value,
      expiry: Date.now() + seconds * 1000,
    };
    return Promise.resolve();
  }

  // Mock Redis del operation
  async del(key: string): Promise<number> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    const exists = key in inMemoryCache;
    if (exists) {
      delete inMemoryCache[key];
      return 1;
    }
    return 0;
  }

  // Mock Redis exists operation
  async exists(key: string): Promise<number> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    return key in inMemoryCache ? 1 : 0;
  }

  // Mock Redis keys operation
  async keys(pattern: string): Promise<string[]> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    // Simple pattern matching for keys (very basic, not full Redis pattern support)
    const patternRegex = new RegExp('^' + pattern.replace('*', '.*') + '$');
    return Object.keys(inMemoryCache).filter(key => patternRegex.test(key));
  }

  // Mock Redis mget operation
  async mget(...keys: string[]): Promise<(string | null)[]> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    return Promise.all(keys.map(key => this.get(key)));
  }

  // Helper to clean expired entries
  private cleanExpiredEntries(): void {
    const now = Date.now();
    for (const key in inMemoryCache) {
      const entry = inMemoryCache[key];
      if (entry.expiry !== null && entry.expiry < now) {
        delete inMemoryCache[key];
      }
    }
  }

  // For handling authentication since we're mocking
  async auth(password: string): Promise<void> {
    return Promise.resolve();
  }

  // For handling HSET operations
  async hset(key: string, field: string, value: string): Promise<number> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    const hashKey = `${key}:${field}`;
    inMemoryCache[hashKey] = {
      value,
      expiry: null,
    };
    return 1;
  }

  // For handling HGET operations
  async hget(key: string, field: string): Promise<string | null> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    const hashKey = `${key}:${field}`;
    const cacheEntry = inMemoryCache[hashKey];
    if (!cacheEntry) {
      return null;
    }
    
    return typeof cacheEntry.value === 'string' 
      ? cacheEntry.value 
      : JSON.stringify(cacheEntry.value);
  }

  // For handling HGETALL operations
  async hgetall(key: string): Promise<Record<string, string>> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    const result: Record<string, string> = {};
    const keyPrefix = `${key}:`;
    
    for (const hashKey in inMemoryCache) {
      if (hashKey.startsWith(keyPrefix)) {
        const field = hashKey.slice(keyPrefix.length);
        const cacheEntry = inMemoryCache[hashKey];
        
        result[field] = typeof cacheEntry.value === 'string' 
          ? cacheEntry.value 
          : JSON.stringify(cacheEntry.value);
      }
    }
    
    return result;
  }

  // For handling HDEL operations
  async hdel(key: string, ...fields: string[]): Promise<number> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    let deletedCount = 0;
    for (const field of fields) {
      const hashKey = `${key}:${field}`;
      if (hashKey in inMemoryCache) {
        delete inMemoryCache[hashKey];
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  // For handling HEXISTS operations
  async hexists(key: string, field: string): Promise<number> {
    // For mock implementation, pretend connection succeeded
    if (!this.connected) {
      await this.connect();
    }

    const hashKey = `${key}:${field}`;
    return hashKey in inMemoryCache ? 1 : 0;
  }
}

// Instantiate Redis client for export
export const redis = new RedisClient();

/**
 * Get and parse Redis cached data
 */
export async function getAndParse<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  if (!cached) {
    return null;
  }
  
  try {
    return JSON.parse(cached) as T;
  } catch (error) {
    console.error(`Error parsing cached data for key ${key}:`, error);
    return null;
  }
}

/**
 * Set data in Redis with expiry
 */
export async function setWithExpiry(key: string, data: any, seconds: number): Promise<void> {
  const serialized = typeof data === 'string' ? data : JSON.stringify(data);
  await redis.setex(key, seconds, serialized);
}

/**
 * Delete a key from Redis
 */
export async function deleteKey(key: string): Promise<boolean> {
  const result = await redis.del(key);
  return result > 0;
}

/**
 * Check Redis health
 */
export async function checkRedisHealth(): Promise<{ connected: boolean; memory?: number }> {
  try {
    await redis.set('health_check', 'ok');
    const result = await redis.get('health_check');
    await redis.del('health_check');
    
    return {
      connected: result === 'ok',
      memory: 0.1, // Mock memory usage (10%)
    };
  } catch (error) {
    console.error('Redis health check failed:', error);
    return { connected: false };
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  await redis.disconnect();
  return Promise.resolve();
}
