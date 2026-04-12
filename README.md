# NexQuantSite

A modern trading platform frontend I built with Next.js 15 and React 19. Full-stack application with admin dashboard, user management, trading bots, and real-time market data.

```
┌─────────────────────────────────────────────────────────────────┐
│  WHAT THIS IS                                                   │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 15 + React 19      App Router, Server Components      │
│  Admin Dashboard            60+ features, analytics, user mgmt  │
│  Trading Interface          Bots, signals, portfolio tracking   │
│  Real-time Updates          WebSocket integration ready         │
│  Auth System                JWT + refresh tokens, RBAC          │
│  590,000+ Lines             Not a starter template              │
└─────────────────────────────────────────────────────────────────┘
```

## Why I Built This

Wanted to build a production-quality trading platform frontend that wasn't just a demo. Needed to understand how to handle real-time data, complex state management, and admin tooling at scale.

Built to solve:
- How do you structure a 590k+ line Next.js app without chaos?
- Can you build a trading platform that actually feels responsive?
- What does a real admin dashboard need (not just user CRUD)?
- How do you handle WebSocket updates without destroying performance?

Used Next.js 15 because App Router + Server Components = fast. React 19 for concurrent rendering. Shadcn/UI + Tailwind because I didn't want to fight CSS. Zustand for state because Redux is overkill.

## Quick Start

```bash
git clone https://github.com/JasonTeixeira/NexQuantSite.git
cd NexQuantSite

npm install
cp .env.example .env.local
# Edit .env.local with your config

npm run db:migrate
npm run db:seed

npm run dev
```

Visit http://localhost:3000

## Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer               Stack                                      │
├─────────────────────────────────────────────────────────────────┤
│  Framework           Next.js 15 (App Router)                    │
│  UI                  React 19, TypeScript, Tailwind CSS         │
│  Components          Shadcn/UI, Radix UI primitives             │
│  State               Zustand (simple, fast)                     │
│  Forms               React Hook Form + Zod validation           │
│  Animation           Framer Motion                              │
│  Database            PostgreSQL + Prisma ORM                    │
│  Auth                JWT + refresh tokens                       │
│  Real-time           WebSocket (ready to connect)               │
│  Testing             Jest + Playwright E2E                      │
│  Deployment          Docker + docker-compose                    │
└─────────────────────────────────────────────────────────────────┘
```

## Architecture

```
   Frontend (Next.js)
   ├── Authentication      JWT, RBAC, session management
   ├── Dashboard           User portfolio, charts, positions
   ├── Admin Panel         60+ features, analytics, user mgmt
   ├── Trading Interface   Bots, signals, manual trading
   └── Learning Platform   Courses, tutorials, resources
        │
        v
   API Layer (Next.js API Routes)
   ├── Auth endpoints
   ├── Trading operations
   ├── Admin operations
   └── WebSocket gateway
        │
        v
   Database (PostgreSQL)
   ├── Users, roles, permissions
   ├── Trading data (bots, signals)
   ├── Analytics, logs
   └── Course content
```

## Project Structure

```
NexQuantSite/
├── app/
│   ├── (auth)/           # Login, register, password reset
│   ├── (dashboard)/      # User dashboard pages
│   ├── admin/            # Admin panel (60+ features)
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── trading/      # Trading operations
│   │   └── admin/        # Admin operations
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── ui/               # Shadcn/UI components
│   ├── admin/            # Admin-specific components
│   ├── dashboard/        # Dashboard components
│   └── trading/          # Trading interface components
├── lib/
│   ├── auth/             # Auth utilities, middleware
│   ├── database/         # Prisma schemas, models
│   ├── api/              # API client utilities
│   └── services/         # Business logic
├── hooks/                # Custom React hooks
├── e2e/                  # Playwright tests
└── nexural-backtesting-2/  # Python backtesting engine
```

## Admin Dashboard

Built 60+ features for the admin panel because that's what makes a platform production-ready:

**Core Management:**
- Analytics dashboard (users, revenue, trading stats)
- User management (accounts, roles, permissions, segmentation)
- Bot management (performance monitoring, controls)
- Financial center (revenue, subscriptions, payouts)

**Business Intelligence:**
- Unified analytics (cross-platform data)
- Cohort analysis (retention, behavior)
- A/B testing (feature experiments)
- Mobile analytics (engagement metrics)

**Operations:**
- Messaging system (user communication, campaigns)
- Support tickets (helpdesk integration)
- Workflow automation (business processes)
- Bulk operations (mass updates)

## What Was Hard

- **State management at scale:** 590k lines = lots of state. Zustand kept it manageable but had to be strict about boundaries.
- **Real-time updates:** WebSocket data flooding the UI killed performance. Had to add throttling and selective updates.
- **Admin complexity:** 60+ features = lots of edge cases. Spent more time on error states than happy paths.
- **Build optimization:** Next.js bundle hit 2MB initially. Got it down to <500KB with code splitting and dynamic imports.
- **Type safety:** TypeScript with 590k lines = slow builds. Had to tweak tsconfig and use project references.

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Interactive E2E
npm run test:e2e:ui

# Performance audit
npm run test:lighthouse

# Security scan
npm run test:security
```

## API Endpoints

**Authentication:**
```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/session
POST   /api/auth/refresh
```

**Trading:**
```
GET    /api/trading/bots
POST   /api/trading/signals
GET    /api/market/prices
POST   /api/orders
```

**Admin:**
```
GET    /api/admin/dashboard/stats
GET    /api/admin/users
GET    /api/admin/analytics
POST   /api/admin/users/{id}/roles
```

**WebSocket:**
```
ws://localhost:3000/ws

Events:
- market.price.update
- trading.signal.new
- trading.bot.status
- user.notifications
```

## Deployment

**Docker:**
```bash
docker-compose up -d
```

**Manual:**
```bash
npm run build
npm start
```

**Environment Variables:**
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/nexural
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
JWT_REFRESH_SECRET=your-refresh-secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## What I'd Do Differently

- **Split into micro-frontends:** 590k lines in one repo is manageable but not ideal. Would split admin panel into separate app.
- **Server actions earlier:** Started with API routes, migrated to Server Actions later. Should've used them from day 1.
- **Better caching strategy:** React Query would've simplified data fetching. Zustand works but not ideal for server state.
- **More granular components:** Some components got too big (800+ lines). Should've refactored sooner.

## Build Story

Took 6+ months to build. Started with basic CRUD, grew into full platform as requirements expanded. Admin dashboard alone took 2 months—60+ features is no joke. Real-time updates took another month to get right (WebSocket performance is tricky).

Key lessons:
- Next.js App Router is fast but has learning curve (especially Server Components)
- Shadcn/UI saved months of component building
- TypeScript catches bugs but slows builds at this scale
- Admin features take 3x longer than user features (more edge cases)
- Real-time updates need throttling or they kill performance

## License

MIT

## Docs

- Backend Integration: MASTER_ARCHITECTURE_INTEGRATION.md
- Auth Setup: AUTH_FULLY_WORKING.md
- Admin Guide: ADMIN_LOGIN_INFO.md
