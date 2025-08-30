-- 🚀 NEXURAL TRADING PLATFORM - COMPLETE PRODUCTION SCHEMA
-- Comprehensive database design for world-class SaaS platform
-- Version: Production Ready v1.0
-- Last Updated: 2024-01-25

-- ============================================================================
-- EXTENSIONS & SETUP
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USER MANAGEMENT & AUTHENTICATION (Enhanced)
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    country VARCHAR(3), -- ISO country code
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Account Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'pending')),
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    kyc_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'approved', 'rejected')),
    
    -- Subscription & Role
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'premium', 'pro', 'enterprise', 'admin', 'super_admin')),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(20) DEFAULT 'inactive',
    subscription_expires_at TIMESTAMP,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(32),
    backup_codes TEXT[], -- Array of backup codes
    last_password_change TIMESTAMP DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Tracking
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    login_count INTEGER DEFAULT 0,
    
    -- Preferences
    preferences JSONB DEFAULT '{
        "theme": "dark",
        "notifications": {
            "email": true,
            "browser": true,
            "mobile": false,
            "marketing": false
        },
        "privacy": {
            "profile_visibility": "public",
            "activity_visibility": "public"
        },
        "trading": {
            "risk_level": "moderate",
            "paper_trading": true
        }
    }'::jsonb,
    
    -- Stats
    stats JSONB DEFAULT '{
        "total_trades": 0,
        "total_profit": 0,
        "win_rate": 0,
        "referrals_count": 0,
        "articles_read": 0,
        "courses_completed": 0,
        "badges_earned": [],
        "achievements": []
    }'::jsonb,
    
    -- Referral
    referral_code VARCHAR(20) UNIQUE,
    referred_by_code VARCHAR(20),
    
    CONSTRAINT fk_referred_by FOREIGN KEY (referred_by_code) REFERENCES users(referral_code) ON DELETE SET NULL
);

-- Enhanced Sessions Table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    device_id VARCHAR(255),
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    location JSONB, -- Country, city, etc.
    expires_at TIMESTAMP NOT NULL,
    refresh_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    last_accessed TIMESTAMP DEFAULT NOW()
);

-- Admin Users (Separate from regular users)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'moderator', 'super_admin')),
    permissions TEXT[], -- Array of permission strings
    department VARCHAR(100),
    mfa_enabled BOOLEAN DEFAULT true,
    mfa_secret VARCHAR(32),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    created_by UUID REFERENCES admin_users(id)
);

-- ============================================================================
-- COMMUNITY PLATFORM (Complete)
-- ============================================================================

-- Posts System
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) DEFAULT 'insight' CHECK (type IN ('trade', 'strategy', 'insight', 'question', 'news', 'poll')),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT, -- Generated summary
    tags TEXT[], -- Array of tags
    
    -- Trading Data (for trade posts)
    trading_data JSONB,
    
    -- Poll Data (for poll posts)
    poll_data JSONB,
    
    -- Media attachments
    media_attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Engagement
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted', 'flagged')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
    
    -- Moderation
    flagged_count INTEGER DEFAULT 0,
    moderation_status VARCHAR(20) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    moderated_by UUID REFERENCES admin_users(id),
    moderated_at TIMESTAMP,
    
    -- SEO
    slug VARCHAR(255) UNIQUE,
    meta_description TEXT,
    featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- Comments System
CREATE TABLE community_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE, -- For threading
    content TEXT NOT NULL,
    mentions UUID[], -- Array of mentioned user IDs
    
    -- Engagement
    likes INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'deleted', 'flagged')),
    flagged_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reactions System
CREATE TABLE community_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'comment')),
    target_id UUID NOT NULL,
    reaction_type VARCHAR(20) NOT NULL CHECK (reaction_type IN ('like', 'bullish', 'bearish', 'fire', 'genius', 'helpful', 'funny')),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, target_type, target_id, reaction_type)
);

-- User Relationships (Follow/Unfollow)
CREATE TABLE user_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'muted')),
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id)
);

-- Direct Messaging System
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    title VARCHAR(255), -- For group conversations
    participants UUID[] NOT NULL, -- Array of user IDs
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_message_at TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    attachments JSONB DEFAULT '[]'::jsonb,
    reply_to UUID REFERENCES messages(id),
    
    -- Status
    edited BOOLEAN DEFAULT false,
    deleted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message_read_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(message_id, user_id)
);

-- Groups/Channels System
CREATE TABLE community_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) DEFAULT 'public' CHECK (type IN ('public', 'private', 'premium')),
    category VARCHAR(100),
    avatar_url TEXT,
    banner_url TEXT,
    
    -- Settings
    settings JSONB DEFAULT '{
        "allow_posts": true,
        "moderated": false,
        "invite_only": false
    }'::jsonb,
    
    -- Stats
    members_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    
    -- Ownership
    created_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES community_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin', 'owner')),
    joined_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(group_id, user_id)
);

-- ============================================================================
-- MARKETPLACE SYSTEM (Complete)
-- ============================================================================

-- Strategy Categories
CREATE TABLE strategy_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trading Strategies
CREATE TABLE trading_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES strategy_categories(id),
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    tags TEXT[],
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10,2),
    pricing_model VARCHAR(20) DEFAULT 'one_time' CHECK (pricing_model IN ('one_time', 'subscription', 'revenue_share')),
    
    -- Strategy Details
    complexity VARCHAR(20) CHECK (complexity IN ('beginner', 'intermediate', 'advanced', 'expert')),
    timeframe VARCHAR(50), -- "1m-5m", "1h-4h", etc.
    asset_classes TEXT[], -- ["stocks", "crypto", "forex", "options"]
    min_capital DECIMAL(15,2),
    
    -- Performance Metrics
    performance_data JSONB DEFAULT '{
        "win_rate": 0,
        "sharpe_ratio": 0,
        "max_drawdown": 0,
        "total_return": 0,
        "avg_trade": 0,
        "profit_factor": 0
    }'::jsonb,
    
    -- Backtest Data
    backtest_period VARCHAR(100),
    backtest_data JSONB,
    live_results BOOLEAN DEFAULT false,
    
    -- Files & Media
    strategy_file_url TEXT, -- Main strategy file
    images TEXT[], -- Screenshots, charts
    video_url TEXT,
    documentation_url TEXT,
    
    -- Sales & Reviews
    sales_count INTEGER DEFAULT 0,
    revenue DECIMAL(15,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived', 'rejected')),
    featured BOOLEAN DEFAULT false,
    bestseller BOOLEAN DEFAULT false,
    
    -- Moderation
    reviewed_by UUID REFERENCES admin_users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- Strategy Reviews
CREATE TABLE strategy_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(strategy_id, reviewer_id)
);

-- Strategy Purchases
CREATE TABLE strategy_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES trading_strategies(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction Details
    amount DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(10,2) NOT NULL, -- Amount after fees
    payment_method VARCHAR(50),
    payment_id VARCHAR(255), -- Stripe payment intent ID
    
    -- Access Details
    download_count INTEGER DEFAULT 0,
    max_downloads INTEGER DEFAULT 3,
    access_expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- LEARNING MANAGEMENT SYSTEM (Complete)
-- ============================================================================

-- Course Categories
CREATE TABLE course_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES course_categories(id),
    instructor_id UUID REFERENCES users(id),
    
    -- Basic Info
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT,
    objectives TEXT[],
    prerequisites TEXT[],
    tags TEXT[],
    
    -- Media
    thumbnail_url TEXT,
    trailer_video_url TEXT,
    
    -- Course Details
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INTEGER, -- Total duration in minutes
    language VARCHAR(10) DEFAULT 'en',
    
    -- Pricing
    price DECIMAL(10,2) DEFAULT 0,
    original_price DECIMAL(10,2),
    free BOOLEAN DEFAULT false,
    
    -- Stats
    enrolled_count INTEGER DEFAULT 0,
    completed_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- Course Modules
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT, -- Markdown content
    lesson_type VARCHAR(20) DEFAULT 'video' CHECK (lesson_type IN ('video', 'article', 'quiz', 'assignment')),
    
    -- Media
    video_url TEXT,
    video_duration INTEGER, -- Duration in seconds
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Settings
    sort_order INTEGER NOT NULL,
    free_preview BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Quizzes
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70, -- Percentage
    max_attempts INTEGER DEFAULT 3,
    time_limit_minutes INTEGER,
    show_correct_answers BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
    options JSONB, -- Array of answer options
    correct_answer JSONB, -- Correct answer(s)
    explanation TEXT,
    points INTEGER DEFAULT 1,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Student Enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMP,
    
    UNIQUE(course_id, student_id)
);

-- Learning Progress Tracking
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_position INTEGER DEFAULT 0, -- For video position
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(enrollment_id, lesson_id)
);

-- Quiz Attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    score DECIMAL(5,2),
    passed BOOLEAN DEFAULT false,
    answers JSONB, -- Student's answers
    time_taken_minutes INTEGER,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    
    UNIQUE(quiz_id, student_id, attempt_number)
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    pdf_url TEXT,
    
    UNIQUE(course_id, student_id)
);

-- Discussion Forums for Courses
CREATE TABLE course_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500),
    content TEXT NOT NULL,
    pinned BOOLEAN DEFAULT false,
    replies_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE course_discussion_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID REFERENCES course_discussions(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- FILE STORAGE SYSTEM
-- ============================================================================

CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    storage_provider VARCHAR(50) DEFAULT 'local', -- 'local', 'aws', 'digital_ocean'
    
    -- Metadata
    width INTEGER, -- For images
    height INTEGER, -- For images
    duration INTEGER, -- For videos
    metadata JSONB,
    
    -- Access Control
    visibility VARCHAR(20) DEFAULT 'private' CHECK (visibility IN ('public', 'private', 'restricted')),
    access_url TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- ============================================================================
-- PAYMENT & BILLING SYSTEM
-- ============================================================================

-- Subscription Plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_interval VARCHAR(20) NOT NULL CHECK (billing_interval IN ('month', 'year')),
    trial_days INTEGER DEFAULT 0,
    features JSONB,
    limits JSONB,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive', 'cancelled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    trial_end TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Records
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- Usage Tracking (for usage-based billing)
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'api_calls', 'storage', 'compute'
    quantity INTEGER NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'calls', 'gb', 'hours'
    timestamp TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- ============================================================================
-- ANALYTICS & TRACKING
-- ============================================================================

-- Page Views
CREATE TABLE page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    page_path VARCHAR(500) NOT NULL,
    referrer VARCHAR(500),
    user_agent TEXT,
    ip_address INET,
    session_id VARCHAR(255),
    country VARCHAR(3),
    city VARCHAR(100),
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Events
CREATE TABLE user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Metrics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20),
    tags JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- NOTIFICATION SYSTEM
-- ============================================================================

-- Notification Templates
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    email_template TEXT,
    push_template TEXT,
    in_app_template TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Notifications
CREATE TABLE user_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    
    -- Delivery Status
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMP,
    
    -- Channels
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email', 'push', 'sms')),
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Email Queue
CREATE TABLE email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    html_content TEXT,
    text_content TEXT,
    template_id UUID REFERENCES notification_templates(id),
    template_data JSONB,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Scheduling
    scheduled_at TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    failed_at TIMESTAMP,
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ADMIN & MODERATION
-- ============================================================================

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Can be user or admin
    user_type VARCHAR(20) CHECK (user_type IN ('user', 'admin')),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Content Moderation Queue
CREATE TABLE moderation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(50) NOT NULL, -- 'post', 'comment', 'strategy', etc.
    content_id UUID NOT NULL,
    reporter_id UUID REFERENCES users(id),
    reason VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES admin_users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- System Settings
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT,
    category VARCHAR(50),
    data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'integer', 'boolean', 'json')),
    updated_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Sessions
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Community Posts
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_posts_type ON community_posts(type);
CREATE INDEX idx_community_posts_status ON community_posts(status);
CREATE INDEX idx_community_posts_created ON community_posts(created_at);
CREATE INDEX idx_community_posts_slug ON community_posts(slug);
CREATE INDEX idx_community_posts_featured ON community_posts(featured);

-- Full-text search
CREATE INDEX idx_community_posts_search ON community_posts USING GIN(to_tsvector('english', title || ' ' || content));

-- Comments
CREATE INDEX idx_community_comments_post ON community_comments(post_id);
CREATE INDEX idx_community_comments_author ON community_comments(author_id);
CREATE INDEX idx_community_comments_parent ON community_comments(parent_id);

-- Reactions
CREATE INDEX idx_community_reactions_target ON community_reactions(target_type, target_id);
CREATE INDEX idx_community_reactions_user ON community_reactions(user_id);

-- Trading Strategies
CREATE INDEX idx_trading_strategies_creator ON trading_strategies(creator_id);
CREATE INDEX idx_trading_strategies_category ON trading_strategies(category_id);
CREATE INDEX idx_trading_strategies_status ON trading_strategies(status);
CREATE INDEX idx_trading_strategies_featured ON trading_strategies(featured);
CREATE INDEX idx_trading_strategies_price ON trading_strategies(price);

-- Courses
CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category_id);
CREATE INDEX idx_courses_status ON courses(status);
CREATE INDEX idx_courses_featured ON courses(featured);

-- File Uploads
CREATE INDEX idx_file_uploads_uploader ON file_uploads(uploader_id);
CREATE INDEX idx_file_uploads_created ON file_uploads(created_at);
CREATE INDEX idx_file_uploads_expires ON file_uploads(expires_at);

-- Notifications
CREATE INDEX idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_read ON user_notifications(user_id, read);
CREATE INDEX idx_user_notifications_created ON user_notifications(created_at);

-- Analytics
CREATE INDEX idx_page_views_created ON page_views(created_at);
CREATE INDEX idx_page_views_user ON page_views(user_id);
CREATE INDEX idx_page_views_path ON page_views(page_path);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATES
-- ============================================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_comments_updated_at BEFORE UPDATE ON community_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_strategies_updated_at BEFORE UPDATE ON trading_strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT DATA INSERTS
-- ============================================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (id, name, description, price, billing_interval, features, limits) VALUES
('00000000-0000-0000-0000-000000000001', 'Free', 'Perfect for getting started', 0, 'month', 
 '["Basic dashboard", "Community access", "5 strategy downloads"]',
 '{"api_calls": 100, "storage_gb": 1, "strategies": 5}'),
('00000000-0000-0000-0000-000000000002', 'Pro', 'For serious traders', 29.99, 'month',
 '["Advanced analytics", "Unlimited strategies", "Priority support", "Custom indicators"]',
 '{"api_calls": 10000, "storage_gb": 50, "strategies": -1}'),
('00000000-0000-0000-0000-000000000003', 'Enterprise', 'For institutional users', 99.99, 'month',
 '["Everything in Pro", "API access", "Custom integrations", "Dedicated support"]',
 '{"api_calls": -1, "storage_gb": 500, "strategies": -1}');

-- Insert default categories
INSERT INTO strategy_categories (id, name, description, icon) VALUES
('10000000-0000-0000-0000-000000000001', 'Cryptocurrency', 'Bitcoin, Ethereum, and altcoin strategies', 'bitcoin'),
('10000000-0000-0000-0000-000000000002', 'Forex', 'Currency pair trading strategies', 'dollar-sign'),
('10000000-0000-0000-0000-000000000003', 'Stocks', 'Equity and index trading strategies', 'trending-up'),
('10000000-0000-0000-0000-000000000004', 'Options', 'Options trading strategies', 'target');

INSERT INTO course_categories (id, name, description, icon, color) VALUES
('20000000-0000-0000-0000-000000000001', 'Trading Basics', 'Fundamental trading concepts', 'book-open', '#3B82F6'),
('20000000-0000-0000-0000-000000000002', 'Technical Analysis', 'Chart patterns and indicators', 'bar-chart', '#10B981'),
('20000000-0000-0000-0000-000000000003', 'Risk Management', 'Portfolio protection strategies', 'shield', '#F59E0B'),
('20000000-0000-0000-0000-000000000004', 'Psychology', 'Trading mindset and discipline', 'brain', '#8B5CF6');

-- Insert notification templates
INSERT INTO notification_templates (type, name, subject, email_template) VALUES
('welcome', 'Welcome Email', 'Welcome to Nexural Trading!', 
 '<h1>Welcome {{name}}!</h1><p>Thanks for joining our community.</p>'),
('password_reset', 'Password Reset', 'Reset your password',
 '<h1>Reset Password</h1><p>Click <a href="{{reset_link}}">here</a> to reset your password.</p>'),
('course_completed', 'Course Completion', 'Congratulations! Course completed',
 '<h1>Course Completed!</h1><p>You have successfully completed {{course_name}}.</p>');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- User Stats View
CREATE VIEW user_stats_view AS
SELECT 
    u.id,
    u.username,
    u.created_at,
    COALESCE(posts.post_count, 0) as total_posts,
    COALESCE(followers.follower_count, 0) as followers_count,
    COALESCE(following.following_count, 0) as following_count,
    COALESCE(strategies.strategy_count, 0) as strategies_count,
    COALESCE(courses.completed_courses, 0) as completed_courses
FROM users u
LEFT JOIN (SELECT author_id, COUNT(*) as post_count FROM community_posts WHERE status = 'published' GROUP BY author_id) posts ON u.id = posts.author_id
LEFT JOIN (SELECT following_id, COUNT(*) as follower_count FROM user_relationships WHERE status = 'active' GROUP BY following_id) followers ON u.id = followers.following_id
LEFT JOIN (SELECT follower_id, COUNT(*) as following_count FROM user_relationships WHERE status = 'active' GROUP BY follower_id) following ON u.id = following.follower_id
LEFT JOIN (SELECT creator_id, COUNT(*) as strategy_count FROM trading_strategies WHERE status = 'published' GROUP BY creator_id) strategies ON u.id = strategies.creator_id
LEFT JOIN (SELECT student_id, COUNT(*) as completed_courses FROM course_enrollments WHERE completed_at IS NOT NULL GROUP BY student_id) courses ON u.id = courses.student_id;

-- Popular Posts View
CREATE VIEW popular_posts_view AS
SELECT 
    p.*,
    u.username as author_username,
    u.avatar_url as author_avatar,
    (p.likes * 3 + p.comments_count * 5 + p.shares * 2 + p.views * 0.1) as popularity_score
FROM community_posts p
JOIN users u ON p.author_id = u.id
WHERE p.status = 'published'
ORDER BY popularity_score DESC;

-- ============================================================================
-- PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Partitioning for large tables (if needed)
-- This can be added later for tables like page_views, user_events

-- Connection pooling settings (for application level)
-- These would be configured in your connection pool settings

COMMIT;

-- ============================================================================
-- POST-SETUP NOTES
-- ============================================================================

/*
After running this schema:

1. Set up connection pooling (recommended: 10-20 connections for small/medium loads)
2. Configure backup strategy (daily full backups + WAL archiving)
3. Set up monitoring for slow queries
4. Consider read replicas for analytics queries
5. Implement proper indexing strategy based on query patterns
6. Set up proper user roles and permissions
7. Configure SSL/TLS for secure connections
8. Set up automated vacuuming and statistics updates

Environment Variables needed:
- DATABASE_URL
- REDIS_URL (for caching)
- AWS_S3_BUCKET (for file storage)
- STRIPE_SECRET_KEY
- EMAIL_SERVICE_API_KEY
- JWT_SECRET
*/

