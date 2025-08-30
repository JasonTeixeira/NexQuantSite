/**
 * Database client stub for frontend-only environment
 * This will be replaced with actual database connection when connecting to backend
 */

export interface Pool {
  query: (text: string, params?: any[]) => Promise<any>
  connect: () => Promise<any>
  end: () => Promise<void>
}

// Mock pool for frontend development
class MockPool implements Pool {
  async query(text: string, params?: any[]) {
    console.log("Mock database query:", text, params)
    return { rows: [], rowCount: 0 }
  }

  async connect() {
    console.log("Mock database connection established")
    return { release: () => {} }
  }

  async end() {
    console.log("Mock database connection closed")
  }
}

let pool: Pool | null = null

export function initializeDatabase(): Pool {
  if (!pool) {
    console.log("Initializing mock database pool for frontend development")
    pool = new MockPool()
  }
  return pool
}

export function getPool(): Pool {
  if (!pool) {
    pool = initializeDatabase()
  }
  return pool
}

export default { initializeDatabase, getPool }