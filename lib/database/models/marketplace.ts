// 🛒 MARKETPLACE MODELS - Production Database Implementation
// Replaces all mock marketplace data with real PostgreSQL persistence

import { query, transaction, batchInsert, fullTextSearch, paginate } from '../connection'
import { v4 as uuidv4 } from 'uuid'

// ============================================================================
// INTERFACES
// ============================================================================

export interface StrategyCategory {
  id: string
  name: string
  description?: string
  icon?: string
  sortOrder: number
  active: boolean
  createdAt: Date
}

export interface TradingStrategy {
  id: string
  creatorId: string
  categoryId?: string
  title: string
  description: string
  shortDescription?: string
  tags: string[]
  
  // Pricing
  price: number
  originalPrice?: number
  pricingModel: 'one_time' | 'subscription' | 'revenue_share'
  
  // Strategy Details
  complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  timeframe?: string
  assetClasses: string[]
  minCapital?: number
  
  // Performance Metrics
  performanceData: {
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
    totalReturn: number
    avgTrade: number
    profitFactor: number
  }
  
  // Backtest Data
  backtestPeriod?: string
  backtestData?: any
  liveResults: boolean
  
  // Files & Media
  strategyFileUrl?: string
  images: string[]
  videoUrl?: string
  documentationUrl?: string
  
  // Sales & Reviews
  salesCount: number
  revenue: number
  rating: number
  reviewsCount: number
  
  // Status
  status: 'draft' | 'pending_review' | 'published' | 'archived' | 'rejected'
  featured: boolean
  bestseller: boolean
  
  // Moderation
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
  
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  
  // Populated fields
  creator?: {
    id: string
    username: string
    firstName?: string
    lastName?: string
    avatarUrl?: string
    verified: boolean
    stats: any
  }
  category?: StrategyCategory
}

export interface StrategyReview {
  id: string
  strategyId: string
  reviewerId: string
  rating: number
  title?: string
  content?: string
  verifiedPurchase: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
  
  // Populated fields
  reviewer?: {
    id: string
    username: string
    avatarUrl?: string
    verified: boolean
  }
}

export interface StrategyPurchase {
  id: string
  strategyId: string
  buyerId: string
  sellerId: string
  amount: number
  fee: number
  netAmount: number
  paymentMethod?: string
  paymentId?: string
  downloadCount: number
  maxDownloads: number
  accessExpiresAt?: Date
  createdAt: Date
  
  // Populated fields
  strategy?: TradingStrategy
  buyer?: {
    id: string
    username: string
    email: string
  }
}

// ============================================================================
// STRATEGY CATEGORY DAO
// ============================================================================

export class StrategyCategoryDAO {
  // Get all categories
  static async getAll(): Promise<StrategyCategory[]> {
    const sql = `
      SELECT * FROM strategy_categories 
      WHERE active = true 
      ORDER BY sort_order, name
    `
    
    const result = await query(sql)
    return result.rows.map(row => this.mapRowToCategory(row))
  }
  
  // Get category by ID
  static async getById(id: string): Promise<StrategyCategory | null> {
    const sql = 'SELECT * FROM strategy_categories WHERE id = $1'
    const result = await query(sql, [id])
    return result.rows[0] ? this.mapRowToCategory(result.rows[0]) : null
  }
  
  // Create category
  static async create(categoryData: {
    name: string
    description?: string
    icon?: string
    sortOrder?: number
  }): Promise<StrategyCategory> {
    const sql = `
      INSERT INTO strategy_categories (name, description, icon, sort_order)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `
    
    const params = [
      categoryData.name,
      categoryData.description,
      categoryData.icon,
      categoryData.sortOrder || 0
    ]
    
    const result = await query(sql, params)
    return this.mapRowToCategory(result.rows[0])
  }
  
  // Update category
  static async update(id: string, updateData: Partial<{
    name: string
    description: string
    icon: string
    sortOrder: number
    active: boolean
  }>): Promise<StrategyCategory | null> {
    const setClause: string[] = []
    const params: any[] = []
    let paramIndex = 1
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key)
        setClause.push(`${columnName} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })
    
    if (setClause.length === 0) return null
    
    params.push(id)
    const sql = `
      UPDATE strategy_categories
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    const result = await query(sql, params)
    return result.rows[0] ? this.mapRowToCategory(result.rows[0]) : null
  }
  
  private static mapRowToCategory(row: any): StrategyCategory {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      icon: row.icon,
      sortOrder: row.sort_order,
      active: row.active,
      createdAt: row.created_at
    }
  }
  
  private static camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }
}

// ============================================================================
// TRADING STRATEGY DAO
// ============================================================================

export class TradingStrategyDAO {
  // Create strategy
  static async create(strategyData: {
    creatorId: string
    categoryId?: string
    title: string
    description: string
    shortDescription?: string
    tags?: string[]
    price: number
    originalPrice?: number
    pricingModel?: TradingStrategy['pricingModel']
    complexity?: TradingStrategy['complexity']
    timeframe?: string
    assetClasses?: string[]
    minCapital?: number
    performanceData?: TradingStrategy['performanceData']
    backtestPeriod?: string
    backtestData?: any
    liveResults?: boolean
    strategyFileUrl?: string
    images?: string[]
    videoUrl?: string
    documentationUrl?: string
  }): Promise<TradingStrategy> {
    const sql = `
      INSERT INTO trading_strategies (
        creator_id, category_id, title, description, short_description, tags,
        price, original_price, pricing_model, complexity, timeframe, asset_classes,
        min_capital, performance_data, backtest_period, backtest_data, live_results,
        strategy_file_url, images, video_url, documentation_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *
    `
    
    const params = [
      strategyData.creatorId,
      strategyData.categoryId,
      strategyData.title,
      strategyData.description,
      strategyData.shortDescription,
      strategyData.tags || [],
      strategyData.price,
      strategyData.originalPrice,
      strategyData.pricingModel || 'one_time',
      strategyData.complexity || 'intermediate',
      strategyData.timeframe,
      strategyData.assetClasses || [],
      strategyData.minCapital,
      JSON.stringify(strategyData.performanceData || {
        winRate: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        totalReturn: 0,
        avgTrade: 0,
        profitFactor: 0
      }),
      strategyData.backtestPeriod,
      strategyData.backtestData ? JSON.stringify(strategyData.backtestData) : null,
      strategyData.liveResults || false,
      strategyData.strategyFileUrl,
      strategyData.images || [],
      strategyData.videoUrl,
      strategyData.documentationUrl
    ]
    
    const result = await query(sql, params)
    return this.mapRowToStrategy(result.rows[0])
  }
  
  // Get strategies with filtering and pagination
  static async getStrategies(options: {
    creatorId?: string
    categoryId?: string
    status?: TradingStrategy['status']
    featured?: boolean
    bestseller?: boolean
    complexity?: TradingStrategy['complexity']
    pricingModel?: TradingStrategy['pricingModel']
    priceMin?: number
    priceMax?: number
    assetClass?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
    includeCreator?: boolean
    includeCategory?: boolean
  } = {}) {
    const {
      creatorId, categoryId, status = 'published', featured, bestseller,
      complexity, pricingModel, priceMin, priceMax, assetClass,
      sortBy = 'created_at', sortOrder = 'desc', page = 1, limit = 12,
      includeCreator = true, includeCategory = false
    } = options
    
    let sql = `
      SELECT s.*
      ${includeCreator ? `,
        u.username as creator_username,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.avatar_url as creator_avatar_url,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as creator_verified,
        u.stats as creator_stats` : ''}
      ${includeCategory ? `,
        c.name as category_name,
        c.description as category_description,
        c.icon as category_icon` : ''}
      FROM trading_strategies s
      ${includeCreator ? 'JOIN users u ON s.creator_id = u.id' : ''}
      ${includeCategory ? 'LEFT JOIN strategy_categories c ON s.category_id = c.id' : ''}
      WHERE s.status = $1
    `
    
    const params: any[] = [status]
    let paramIndex = 2
    
    // Add filters
    if (creatorId) {
      sql += ` AND s.creator_id = $${paramIndex}`
      params.push(creatorId)
      paramIndex++
    }
    
    if (categoryId) {
      sql += ` AND s.category_id = $${paramIndex}`
      params.push(categoryId)
      paramIndex++
    }
    
    if (featured !== undefined) {
      sql += ` AND s.featured = $${paramIndex}`
      params.push(featured)
      paramIndex++
    }
    
    if (bestseller !== undefined) {
      sql += ` AND s.bestseller = $${paramIndex}`
      params.push(bestseller)
      paramIndex++
    }
    
    if (complexity) {
      sql += ` AND s.complexity = $${paramIndex}`
      params.push(complexity)
      paramIndex++
    }
    
    if (pricingModel) {
      sql += ` AND s.pricing_model = $${paramIndex}`
      params.push(pricingModel)
      paramIndex++
    }
    
    if (priceMin !== undefined) {
      sql += ` AND s.price >= $${paramIndex}`
      params.push(priceMin)
      paramIndex++
    }
    
    if (priceMax !== undefined) {
      sql += ` AND s.price <= $${paramIndex}`
      params.push(priceMax)
      paramIndex++
    }
    
    if (assetClass) {
      sql += ` AND $${paramIndex} = ANY(s.asset_classes)`
      params.push(assetClass)
      paramIndex++
    }
    
    // Add sorting
    const allowedSortFields = ['created_at', 'updated_at', 'price', 'rating', 'sales_count']
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at'
    const validSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC'
    
    sql += ` ORDER BY s.${validSortBy} ${validSortOrder}`
    
    // Get paginated results
    const countSql = `
      SELECT COUNT(*) as count
      FROM trading_strategies s
      WHERE s.status = $1 ${sql.match(/AND.*?ORDER BY/s)?.[0]?.replace('ORDER BY', '') || ''}
    `
    
    const paginatedResult = await paginate(sql, countSql, page, limit, params)
    
    const strategies = paginatedResult.rows.map(row => this.mapRowToStrategy(row, includeCreator, includeCategory))
    
    return {
      strategies,
      pagination: paginatedResult.pagination
    }
  }
  
  // Get single strategy by ID
  static async getById(id: string, includeCreator: boolean = true, includeCategory: boolean = true): Promise<TradingStrategy | null> {
    let sql = `
      SELECT s.*
      ${includeCreator ? `,
        u.username as creator_username,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.avatar_url as creator_avatar_url,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as creator_verified,
        u.stats as creator_stats` : ''}
      ${includeCategory ? `,
        c.name as category_name,
        c.description as category_description,
        c.icon as category_icon` : ''}
      FROM trading_strategies s
      ${includeCreator ? 'JOIN users u ON s.creator_id = u.id' : ''}
      ${includeCategory ? 'LEFT JOIN strategy_categories c ON s.category_id = c.id' : ''}
      WHERE s.id = $1
    `
    
    const result = await query(sql, [id])
    return result.rows[0] ? this.mapRowToStrategy(result.rows[0], includeCreator, includeCategory) : null
  }
  
  // Update strategy
  static async update(id: string, updateData: Partial<{
    title: string
    description: string
    shortDescription: string
    tags: string[]
    price: number
    originalPrice: number
    pricingModel: TradingStrategy['pricingModel']
    complexity: TradingStrategy['complexity']
    timeframe: string
    assetClasses: string[]
    minCapital: number
    performanceData: TradingStrategy['performanceData']
    backtestPeriod: string
    backtestData: any
    liveResults: boolean
    strategyFileUrl: string
    images: string[]
    videoUrl: string
    documentationUrl: string
    status: TradingStrategy['status']
    featured: boolean
    bestseller: boolean
    rejectionReason: string
  }>): Promise<TradingStrategy | null> {
    const setClause: string[] = []
    const params: any[] = []
    let paramIndex = 1
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        const columnName = this.camelToSnakeCase(key)
        
        if (['performance_data', 'backtest_data'].includes(columnName) && typeof value === 'object') {
          setClause.push(`${columnName} = $${paramIndex}::jsonb`)
          params.push(JSON.stringify(value))
        } else {
          setClause.push(`${columnName} = $${paramIndex}`)
          params.push(value)
        }
        paramIndex++
      }
    })
    
    if (setClause.length === 0) return null
    
    params.push(id)
    const sql = `
      UPDATE trading_strategies
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    const result = await query(sql, params)
    return result.rows[0] ? this.mapRowToStrategy(result.rows[0]) : null
  }
  
  // Search strategies
  static async search(searchTerm: string, options: {
    categoryId?: string
    complexity?: string
    priceMin?: number
    priceMax?: number
    page?: number
    limit?: number
  } = {}) {
    const { categoryId, complexity, priceMin, priceMax, page = 1, limit = 20 } = options
    
    let additionalFilters = "status = 'published'"
    const additionalParams: any[] = []
    let paramIndex = 2
    
    if (categoryId) {
      additionalFilters += ` AND category_id = $${paramIndex}`
      additionalParams.push(categoryId)
      paramIndex++
    }
    
    if (complexity) {
      additionalFilters += ` AND complexity = $${paramIndex}`
      additionalParams.push(complexity)
      paramIndex++
    }
    
    if (priceMin !== undefined) {
      additionalFilters += ` AND price >= $${paramIndex}`
      additionalParams.push(priceMin)
      paramIndex++
    }
    
    if (priceMax !== undefined) {
      additionalFilters += ` AND price <= $${paramIndex}`
      additionalParams.push(priceMax)
      paramIndex++
    }
    
    const result = await fullTextSearch(
      searchTerm,
      'trading_strategies',
      ['title', 'description'],
      {
        limit,
        offset: (page - 1) * limit,
        additionalFilters,
        additionalParams,
        orderBy: 'search_rank DESC'
      }
    )
    
    const strategies = result.rows.map(row => this.mapRowToStrategy(row))
    
    return {
      strategies,
      total: result.rowCount,
      page,
      pages: Math.ceil(result.rowCount / limit)
    }
  }
  
  // Get trending strategies (high sales/views recently)
  static async getTrending(limit: number = 10, days: number = 30): Promise<TradingStrategy[]> {
    const sql = `
      SELECT 
        s.*,
        u.username as creator_username,
        u.first_name as creator_first_name,
        u.last_name as creator_last_name,
        u.avatar_url as creator_avatar_url,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as creator_verified,
        u.stats as creator_stats,
        (s.sales_count * 10 + s.rating * 5) as trending_score
      FROM trading_strategies s
      JOIN users u ON s.creator_id = u.id
      WHERE s.status = 'published'
        AND s.created_at > NOW() - INTERVAL '${days} days'
      ORDER BY trending_score DESC
      LIMIT $1
    `
    
    const result = await query(sql, [limit])
    return result.rows.map(row => this.mapRowToStrategy(row, true))
  }
  
  // Update sales stats
  static async updateSalesStats(id: string, salesCount: number, revenue: number): Promise<void> {
    const sql = `
      UPDATE trading_strategies
      SET sales_count = $1, revenue = $2, updated_at = NOW()
      WHERE id = $3
    `
    
    await query(sql, [salesCount, revenue, id])
  }
  
  // Update rating
  static async updateRating(id: string, rating: number, reviewsCount: number): Promise<void> {
    const sql = `
      UPDATE trading_strategies
      SET rating = $1, reviews_count = $2, updated_at = NOW()
      WHERE id = $3
    `
    
    await query(sql, [rating, reviewsCount, id])
  }
  
  private static mapRowToStrategy(row: any, includeCreator: boolean = false, includeCategory: boolean = false): TradingStrategy {
    const strategy: TradingStrategy = {
      id: row.id,
      creatorId: row.creator_id,
      categoryId: row.category_id,
      title: row.title,
      description: row.description,
      shortDescription: row.short_description,
      tags: row.tags || [],
      price: parseFloat(row.price),
      originalPrice: row.original_price ? parseFloat(row.original_price) : undefined,
      pricingModel: row.pricing_model,
      complexity: row.complexity,
      timeframe: row.timeframe,
      assetClasses: row.asset_classes || [],
      minCapital: row.min_capital ? parseFloat(row.min_capital) : undefined,
      performanceData: row.performance_data || {
        winRate: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        totalReturn: 0,
        avgTrade: 0,
        profitFactor: 0
      },
      backtestPeriod: row.backtest_period,
      backtestData: row.backtest_data,
      liveResults: row.live_results || false,
      strategyFileUrl: row.strategy_file_url,
      images: row.images || [],
      videoUrl: row.video_url,
      documentationUrl: row.documentation_url,
      salesCount: row.sales_count || 0,
      revenue: parseFloat(row.revenue || '0'),
      rating: parseFloat(row.rating || '0'),
      reviewsCount: row.reviews_count || 0,
      status: row.status,
      featured: row.featured || false,
      bestseller: row.bestseller || false,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at
    }
    
    if (includeCreator) {
      strategy.creator = {
        id: row.creator_id,
        username: row.creator_username,
        firstName: row.creator_first_name,
        lastName: row.creator_last_name,
        avatarUrl: row.creator_avatar_url,
        verified: row.creator_verified || false,
        stats: row.creator_stats || {}
      }
    }
    
    if (includeCategory && row.category_name) {
      strategy.category = {
        id: row.category_id,
        name: row.category_name,
        description: row.category_description,
        icon: row.category_icon,
        sortOrder: 0,
        active: true,
        createdAt: new Date()
      }
    }
    
    return strategy
  }
  
  private static camelToSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  }
}

// ============================================================================
// STRATEGY REVIEW DAO
// ============================================================================

export class StrategyReviewDAO {
  // Create review
  static async create(reviewData: {
    strategyId: string
    reviewerId: string
    rating: number
    title?: string
    content?: string
    verifiedPurchase?: boolean
  }): Promise<StrategyReview> {
    const sql = `
      INSERT INTO strategy_reviews (strategy_id, reviewer_id, rating, title, content, verified_purchase)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    
    return await transaction(async (client) => {
      const params = [
        reviewData.strategyId,
        reviewData.reviewerId,
        reviewData.rating,
        reviewData.title,
        reviewData.content,
        reviewData.verifiedPurchase || false
      ]
      
      const result = await client.query(sql, params)
      
      // Update strategy rating
      const avgRatingResult = await client.query(`
        SELECT AVG(rating) as avg_rating, COUNT(*) as review_count
        FROM strategy_reviews 
        WHERE strategy_id = $1
      `, [reviewData.strategyId])
      
      const avgRating = parseFloat(avgRatingResult.rows[0].avg_rating || '0')
      const reviewCount = parseInt(avgRatingResult.rows[0].review_count || '0')
      
      await client.query(`
        UPDATE trading_strategies
        SET rating = $1, reviews_count = $2, updated_at = NOW()
        WHERE id = $3
      `, [avgRating, reviewCount, reviewData.strategyId])
      
      return this.mapRowToReview(result.rows[0])
    })
  }
  
  // Get reviews for strategy
  static async getByStrategyId(strategyId: string, options: {
    page?: number
    limit?: number
    sortBy?: 'created_at' | 'rating' | 'helpful_count'
    sortOrder?: 'asc' | 'desc'
  } = {}): Promise<{ reviews: StrategyReview[]; pagination: any }> {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'desc' } = options
    
    const sql = `
      SELECT 
        r.*,
        u.username as reviewer_username,
        u.avatar_url as reviewer_avatar_url,
        (u.email_verified OR u.role IN ('admin', 'premium', 'pro')) as reviewer_verified
      FROM strategy_reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.strategy_id = $1
      ORDER BY r.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $2 OFFSET $3
    `
    
    const offset = (page - 1) * limit
    const result = await query(sql, [strategyId, limit, offset])
    
    const countSql = `
      SELECT COUNT(*) as count
      FROM strategy_reviews
      WHERE strategy_id = $1
    `
    const countResult = await query(countSql, [strategyId])
    
    const reviews = result.rows.map(row => this.mapRowToReview(row, true))
    
    return {
      reviews,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    }
  }
  
  // Update review
  static async update(id: string, updateData: Partial<{
    rating: number
    title: string
    content: string
  }>): Promise<StrategyReview | null> {
    const setClause: string[] = []
    const params: any[] = []
    let paramIndex = 1
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        setClause.push(`${key} = $${paramIndex}`)
        params.push(value)
        paramIndex++
      }
    })
    
    if (setClause.length === 0) return null
    
    params.push(id)
    const sql = `
      UPDATE strategy_reviews
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    const result = await query(sql, params)
    return result.rows[0] ? this.mapRowToReview(result.rows[0]) : null
  }
  
  // Delete review
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM strategy_reviews WHERE id = $1'
    const result = await query(sql, [id])
    return result.rowCount > 0
  }
  
  private static mapRowToReview(row: any, includeReviewer: boolean = false): StrategyReview {
    const review: StrategyReview = {
      id: row.id,
      strategyId: row.strategy_id,
      reviewerId: row.reviewer_id,
      rating: row.rating,
      title: row.title,
      content: row.content,
      verifiedPurchase: row.verified_purchase || false,
      helpfulCount: row.helpful_count || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
    
    if (includeReviewer) {
      review.reviewer = {
        id: row.reviewer_id,
        username: row.reviewer_username,
        avatarUrl: row.reviewer_avatar_url,
        verified: row.reviewer_verified || false
      }
    }
    
    return review
  }
}

// ============================================================================
// STRATEGY PURCHASE DAO
// ============================================================================

export class StrategyPurchaseDAO {
  // Create purchase
  static async create(purchaseData: {
    strategyId: string
    buyerId: string
    sellerId: string
    amount: number
    fee?: number
    paymentMethod?: string
    paymentId?: string
    maxDownloads?: number
    accessExpiresAt?: Date
  }): Promise<StrategyPurchase> {
    const fee = purchaseData.fee || (purchaseData.amount * 0.1) // 10% platform fee
    const netAmount = purchaseData.amount - fee
    
    const sql = `
      INSERT INTO strategy_purchases (
        strategy_id, buyer_id, seller_id, amount, fee, net_amount,
        payment_method, payment_id, max_downloads, access_expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `
    
    return await transaction(async (client) => {
      const params = [
        purchaseData.strategyId,
        purchaseData.buyerId,
        purchaseData.sellerId,
        purchaseData.amount,
        fee,
        netAmount,
        purchaseData.paymentMethod,
        purchaseData.paymentId,
        purchaseData.maxDownloads || 3,
        purchaseData.accessExpiresAt
      ]
      
      const result = await client.query(sql, params)
      
      // Update strategy sales count and revenue
      await client.query(`
        UPDATE trading_strategies
        SET sales_count = sales_count + 1, revenue = revenue + $1, updated_at = NOW()
        WHERE id = $2
      `, [purchaseData.amount, purchaseData.strategyId])
      
      return this.mapRowToPurchase(result.rows[0])
    })
  }
  
  // Get user purchases
  static async getUserPurchases(buyerId: string, options: {
    page?: number
    limit?: number
  } = {}): Promise<{ purchases: StrategyPurchase[]; pagination: any }> {
    const { page = 1, limit = 20 } = options
    
    const sql = `
      SELECT 
        p.*,
        s.title as strategy_title,
        s.description as strategy_description,
        s.images as strategy_images,
        u.username as seller_username
      FROM strategy_purchases p
      JOIN trading_strategies s ON p.strategy_id = s.id
      JOIN users u ON p.seller_id = u.id
      WHERE p.buyer_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3
    `
    
    const offset = (page - 1) * limit
    const result = await query(sql, [buyerId, limit, offset])
    
    const countSql = `
      SELECT COUNT(*) as count
      FROM strategy_purchases
      WHERE buyer_id = $1
    `
    const countResult = await query(countSql, [buyerId])
    
    const purchases = result.rows.map(row => this.mapRowToPurchase(row, true))
    
    return {
      purchases,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    }
  }
  
  // Check if user has purchased strategy
  static async hasPurchased(buyerId: string, strategyId: string): Promise<boolean> {
    const sql = `
      SELECT 1 FROM strategy_purchases
      WHERE buyer_id = $1 AND strategy_id = $2
      LIMIT 1
    `
    
    const result = await query(sql, [buyerId, strategyId])
    return result.rows.length > 0
  }
  
  // Get purchase by ID
  static async getById(id: string, includeStrategy: boolean = false): Promise<StrategyPurchase | null> {
    let sql = `
      SELECT p.*
      ${includeStrategy ? `,
        s.title as strategy_title,
        s.description as strategy_description,
        s.strategy_file_url as strategy_file_url,
        s.images as strategy_images` : ''}
      FROM strategy_purchases p
      ${includeStrategy ? 'JOIN trading_strategies s ON p.strategy_id = s.id' : ''}
      WHERE p.id = $1
    `
    
    const result = await query(sql, [id])
    return result.rows[0] ? this.mapRowToPurchase(result.rows[0], includeStrategy) : null
  }
  
  // Increment download count
  static async incrementDownloadCount(id: string): Promise<boolean> {
    const sql = `
      UPDATE strategy_purchases
      SET download_count = download_count + 1
      WHERE id = $1 AND download_count < max_downloads
      RETURNING id
    `
    
    const result = await query(sql, [id])
    return result.rowCount > 0
  }
  
  // Get sales analytics for creator
  static async getCreatorSales(creatorId: string, options: {
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  } = {}): Promise<{
    purchases: StrategyPurchase[]
    analytics: {
      totalSales: number
      totalRevenue: number
      totalFees: number
      netRevenue: number
    }
    pagination?: any
  }> {
    const { startDate, endDate, page = 1, limit = 50 } = options
    
    let sql = `
      SELECT 
        p.*,
        s.title as strategy_title,
        u.username as buyer_username,
        u.email as buyer_email
      FROM strategy_purchases p
      JOIN trading_strategies s ON p.strategy_id = s.id
      JOIN users u ON p.buyer_id = u.id
      WHERE p.seller_id = $1
    `
    
    const params: any[] = [creatorId]
    let paramIndex = 2
    
    if (startDate) {
      sql += ` AND p.created_at >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }
    
    if (endDate) {
      sql += ` AND p.created_at <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }
    
    sql += ` ORDER BY p.created_at DESC`
    
    // Get analytics
    const analyticsSql = `
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(fee), 0) as total_fees,
        COALESCE(SUM(net_amount), 0) as net_revenue
      FROM strategy_purchases
      WHERE seller_id = $1
      ${startDate ? ` AND created_at >= $${params.length}` : ''}
      ${endDate ? ` AND created_at <= $${params.length + (startDate ? 1 : 0)}` : ''}
    `
    
    const [purchasesResult, analyticsResult] = await Promise.all([
      query(`${sql} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, [...params, limit, (page - 1) * limit]),
      query(analyticsSql, params)
    ])
    
    const purchases = purchasesResult.rows.map(row => this.mapRowToPurchase(row, true))
    
    return {
      purchases,
      analytics: {
        totalSales: parseInt(analyticsResult.rows[0].total_sales),
        totalRevenue: parseFloat(analyticsResult.rows[0].total_revenue),
        totalFees: parseFloat(analyticsResult.rows[0].total_fees),
        netRevenue: parseFloat(analyticsResult.rows[0].net_revenue)
      }
    }
  }
  
  private static mapRowToPurchase(row: any, includeStrategy: boolean = false): StrategyPurchase {
    const purchase: StrategyPurchase = {
      id: row.id,
      strategyId: row.strategy_id,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      amount: parseFloat(row.amount),
      fee: parseFloat(row.fee),
      netAmount: parseFloat(row.net_amount),
      paymentMethod: row.payment_method,
      paymentId: row.payment_id,
      downloadCount: row.download_count || 0,
      maxDownloads: row.max_downloads || 3,
      accessExpiresAt: row.access_expires_at,
      createdAt: row.created_at
    }
    
    if (includeStrategy) {
      purchase.strategy = {
        id: row.strategy_id,
        title: row.strategy_title,
        description: row.strategy_description,
        strategyFileUrl: row.strategy_file_url,
        images: row.strategy_images || []
      } as any
      
      if (row.buyer_username) {
        purchase.buyer = {
          id: row.buyer_id,
          username: row.buyer_username,
          email: row.buyer_email
        }
      }
    }
    
    return purchase
  }
}

// Export all classes
export default {
  StrategyCategoryDAO,
  TradingStrategyDAO,
  StrategyReviewDAO,
  StrategyPurchaseDAO
}

