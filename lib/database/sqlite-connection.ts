/**
 * 🔄 SQLITE CONNECTION FOR LOCAL DEVELOPMENT
 * Lightweight alternative to PostgreSQL for development and testing
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

// Ensure the data directory exists
const DB_DIR = path.join(process.cwd(), '.data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'nexquant.db');
const db = new Database(DB_PATH);

// Set up pragmas for better performance
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// Initialize schema if needed
const initializeSchema = () => {
  // Check if the users table exists
  const userTableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
  
  if (!userTableExists) {
    console.log('🗄️ Initializing SQLite schema for local development...');
    
    // Create users table
    db.prepare(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        first_name TEXT,
        last_name TEXT,
        role TEXT DEFAULT 'user',
        subscription_tier TEXT DEFAULT 'free',
        email_verified INTEGER DEFAULT 0,
        two_factor_enabled INTEGER DEFAULT 0,
        preferences TEXT DEFAULT '{}',
        stats TEXT DEFAULT '{}',
        referral_code TEXT,
        referred_by_code TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_login_at TEXT,
        login_count INTEGER DEFAULT 0
      )
    `).run();
    
    // Create sessions table
    db.prepare(`
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE,
        expires_at TEXT NOT NULL,
        refresh_expires_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_accessed TEXT DEFAULT CURRENT_TIMESTAMP,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run();
    
    // Create tokens table (for email verification, password reset, etc.)
    db.prepare(`
      CREATE TABLE tokens (
        id TEXT PRIMARY KEY,
        token TEXT UNIQUE NOT NULL,
        token_type TEXT NOT NULL,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        data TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `).run();
    
    // Create sample user for testing
    const demoUser = {
      id: 'user_demo',
      email: 'demo@nexural.com',
      username: 'demo',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD6d2JQNVhb5mCKe', // demo123
      first_name: 'Demo',
      last_name: 'User',
      role: 'user',
      subscription_tier: 'pro',
      email_verified: 1,
      referral_code: 'DEMO2023'
    };
    
    db.prepare(`
      INSERT INTO users (
        id, email, username, password_hash, first_name, last_name, 
        role, subscription_tier, email_verified, referral_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      demoUser.id,
      demoUser.email,
      demoUser.username,
      demoUser.password_hash,
      demoUser.first_name,
      demoUser.last_name,
      demoUser.role,
      demoUser.subscription_tier,
      demoUser.email_verified,
      demoUser.referral_code
    );
    
    // Create admin user for testing
    const adminUser = {
      id: 'user_admin',
      email: 'admin@nexural.com',
      username: 'admin',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeD6d2JQNVhb5mCKe', // admin123 (same for simplicity)
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      subscription_tier: 'enterprise',
      email_verified: 1,
      referral_code: 'ADMIN2023'
    };
    
    db.prepare(`
      INSERT INTO users (
        id, email, username, password_hash, first_name, last_name, 
        role, subscription_tier, email_verified, referral_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      adminUser.id,
      adminUser.email,
      adminUser.username,
      adminUser.password_hash,
      adminUser.first_name,
      adminUser.last_name,
      adminUser.role,
      adminUser.subscription_tier,
      adminUser.email_verified,
      adminUser.referral_code
    );
    
    console.log('✅ SQLite schema initialized with sample users');
  }
};

// Run schema initialization
initializeSchema();

// Query interface similar to PostgreSQL client
export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
  command: string;
  executionTime: number;
  fields?: any[];
  oid?: number;
}

// Execute query function
export const query = async <T = any>(
  text: string,
  params: any[] = [],
  options?: { timeout?: number; logQuery?: boolean }
): Promise<QueryResult<T>> => {
  const startTime = Date.now();
  const queryId = createHash('md5').update(text).digest('hex').substring(0, 8);
  
  try {
    if (options?.logQuery !== false) {
      console.log(`🔍 SQLite Query ${queryId}:`, text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      if (params.length) console.log('📝 Parameters:', params);
    }
    
    // SQLite doesn't have a direct equivalent to postgres commands like SELECT, INSERT, etc.
    // We'll detect it from the SQL text
    const command = text.trim().split(' ')[0].toUpperCase();
    
    let rows: T[] = [];
    let rowCount = 0;
    
    if (command === 'SELECT' || text.includes('RETURNING')) {
      // Handle SELECT queries and those with RETURNING clause
      const stmt = db.prepare(text);
      rows = stmt.all(...params) as T[];
      rowCount = rows.length;
    } else {
      // Handle other DML queries (INSERT, UPDATE, DELETE)
      const stmt = db.prepare(text);
      const result = stmt.run(...params);
      rowCount = result.changes;
    }
    
    const executionTime = Date.now() - startTime;
    
    if (executionTime > 1000) {
      console.warn(`⚠️ Slow query detected (${executionTime}ms) - Query ${queryId}`);
    }
    
    return {
      rows,
      rowCount,
      command,
      executionTime,
      fields: [], // Mock fields for compatibility
      oid: 0      // Mock oid for compatibility
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error(`💥 SQLite query failed after ${executionTime}ms - Query ${queryId}:`, error);
    throw error;
  }
};

// Transaction support
export const transaction = async <T>(
  callback: (client: any) => Promise<T>
): Promise<T> => {
  try {
    db.exec('BEGIN TRANSACTION');
    const result = await callback({ query });
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
};

/**
 * Batch insert helper (SQLite implementation)
 */
export const batchInsert = async <T extends Record<string, any>>(
  tableName: string,
  records: T[],
  options?: {
    onConflict?: string;
    returning?: string;
    chunkSize?: number;
  }
): Promise<QueryResult> => {
  if (records.length === 0) {
    return {
      rows: [],
      rowCount: 0,
      command: 'INSERT',
      executionTime: 0,
      fields: [],
      oid: 0
    };
  }
  
  const startTime = Date.now();
  const chunkSize = options?.chunkSize || 500; // SQLite has lower limits than PostgreSQL
  const keys = Object.keys(records[0]);
  
  let totalRows: any[] = [];
  let totalRowCount = 0;
  
  // Begin transaction for better performance
  db.exec('BEGIN TRANSACTION');
  
  try {
    // Process in chunks to avoid parameter limits
    for (let i = 0; i < records.length; i += chunkSize) {
      const chunk = records.slice(i, i + chunkSize);
      
      // Build SQL for this chunk
      const placeholders = chunk.map(() => `(${keys.map(() => '?').join(', ')})`).join(', ');
      let sql = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES ${placeholders}`;
      
      if (options?.onConflict) {
        sql += ` ${options.onConflict}`;
      }
      
      if (options?.returning) {
        sql += ` RETURNING ${options.returning}`;
      }
      
      // Flatten the values array
      const values = chunk.flatMap(record => keys.map(key => record[key]));
      
      // Execute the query
      const stmt = db.prepare(sql);
      
      if (options?.returning) {
        // If RETURNING clause is present, we expect rows back
        const rows = stmt.all(...values);
        totalRows = [...totalRows, ...rows];
        totalRowCount += rows.length;
      } else {
        // Otherwise, just get the count of affected rows
        const result = stmt.run(...values);
        totalRowCount += result.changes;
      }
    }
    
    // Commit the transaction
    db.exec('COMMIT');
    
    return {
      rows: totalRows,
      rowCount: totalRowCount,
      command: 'INSERT',
      executionTime: Date.now() - startTime,
      fields: [],
      oid: 0
    };
  } catch (error) {
    // Rollback on error
    db.exec('ROLLBACK');
    console.error('Error in batchInsert:', error);
    throw error;
  }
};

/**
 * Full-text search helper (SQLite implementation)
 * Note: This is a simplified version that does basic LIKE searches
 * For proper FTS in SQLite, you would need to set up FTS5 virtual tables
 */
export const fullTextSearch = async (
  searchTerm: string,
  tableName: string,
  searchColumns: string[],
  options?: {
    limit?: number | string;
    offset?: number | string;
    orderBy?: string;
    additionalFilters?: string;
    additionalParams?: any[];
  }
): Promise<QueryResult> => {
  const startTime = Date.now();
  
  if (!searchTerm || searchTerm.trim().length < 3) {
    return {
      rows: [],
      rowCount: 0,
      command: 'SELECT',
      executionTime: 0,
      fields: [],
      oid: 0
    };
  }
  
  // Build simple LIKE conditions for each column
  // This is not as powerful as PostgreSQL's full-text search but works for basic cases
  const searchConditions = searchColumns.map(col => `${col} LIKE ?`).join(' OR ');
  const searchParams = searchColumns.map(() => `%${searchTerm}%`);
  
  let sql = `SELECT *, 0 as search_rank FROM ${tableName} WHERE ${searchConditions}`;
  let params = [...searchParams];
  
  if (options?.additionalFilters) {
    sql += ` AND ${options.additionalFilters}`;
    if (options.additionalParams) {
      params.push(...options.additionalParams.map(p => String(p)));
    }
  }
  
  sql += ` ORDER BY ${options?.orderBy || 'rowid DESC'}`; // Default ordering
  
  if (options?.limit !== undefined) {
    sql += ` LIMIT ?`;
    params.push(String(options.limit));
  }
  
  if (options?.offset !== undefined) {
    sql += ` OFFSET ?`;
    params.push(String(options.offset));
  }
  
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    
    return {
      rows,
      rowCount: rows.length,
      command: 'SELECT',
      executionTime: Date.now() - startTime,
      fields: [],
      oid: 0
    };
  } catch (error) {
    console.error('Error in fullTextSearch:', error);
    throw error;
  }
};

/**
 * Pagination helper (SQLite implementation)
 */
export const paginate = async (
  baseQuery: string,
  countQuery: string,
  page: number | string = 1,
  limit: number | string = 10,
  params?: any[]
): Promise<{
  rows: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> => {
  // Convert parameters to numbers for calculation
  const pageNum = typeof page === 'string' ? parseInt(page) : page;
  const limitNum = typeof limit === 'string' ? parseInt(limit) : limit;
  const offsetNum = (pageNum - 1) * limitNum;
  
  // Convert all params to strings for SQLite
  const paramsCopy = params ? [...params].map(p => String(p)) : [];
  
  // Get total count
  const countStmt = db.prepare(countQuery);
  const countResult = countStmt.get(...paramsCopy);
  const total = parseInt(countResult?.count || '0');
  
  // Get paginated results
  const dataQuery = `${baseQuery} LIMIT ? OFFSET ?`;
  const dataParams = [...paramsCopy, String(limitNum), String(offsetNum)];
  
  const dataStmt = db.prepare(dataQuery);
  const rows = dataStmt.all(...dataParams);
  
  const pages = Math.ceil(total / limitNum);
  
  return {
    rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages,
      hasNext: pageNum < pages,
      hasPrev: pageNum > 1
    }
  };
};

// Health check
export const checkDatabaseHealth = async (): Promise<{
  healthy: boolean;
  latency?: number;
  connections?: { total: number; idle: number; waiting: number };
  error?: string;
}> => {
  const startTime = Date.now();
  
  try {
    const result = db.prepare('SELECT datetime() as current_time, sqlite_version() as db_version').get();
    const latency = Date.now() - startTime;
    
    return {
      healthy: true,
      latency,
      connections: { total: 1, idle: 0, waiting: 0 }
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown database error'
    };
  }
};

// Graceful shutdown
export const closeDatabaseConnections = async (): Promise<void> => {
  try {
    db.close();
    console.log('🔒 SQLite database connection closed gracefully');
  } catch (error) {
    console.error('💥 Error closing database connection:', error);
  }
};

// Export functions
export default {
  query,
  transaction,
  batchInsert,
  fullTextSearch,
  paginate,
  checkDatabaseHealth,
  closeDatabaseConnections
};
