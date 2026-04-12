# Professional Code Refactoring Plan for NexQuantSite

## Current Issues Identified

### 1. **Root Directory Pollution**
- 30+ documentation files cluttering the root
- Multiple phase/plan files that should be organized
- Redundant configuration files

### 2. **Inconsistent Directory Structure**
- `lib/`, `core/`, `shared/`, `types/` with overlapping purposes
- Files scattered at root level of `lib/` instead of organized subdirectories
- Duplicate functionality across different folders

### 3. **Naming Convention Issues**
- Mixed kebab-case and camelCase files
- Inconsistent component naming (some with .tsx, some .ts)
- Non-descriptive file names (e.g., `factors.ts`, `sweep.ts`)

### 4. **Poor Architecture Organization**
- No clear domain boundaries
- Missing proper layered architecture
- Services mixed with utilities
- No clear separation between infrastructure and domain logic

## Target Professional Structure

```
nexquant/
├── src/                          # All source code
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Auth group routes
│   │   ├── (marketing)/         # Marketing pages
│   │   ├── (platform)/          # Trading platform
│   │   └── api/                 # API routes
│   │
│   ├── core/                     # Core business logic
│   │   ├── domain/              # Domain models & logic
│   │   │   ├── trading/
│   │   │   ├── user/
│   │   │   └── analytics/
│   │   ├── application/         # Use cases & services
│   │   │   ├── services/
│   │   │   └── use-cases/
│   │   └── infrastructure/     # External integrations
│   │       ├── database/
│   │       ├── external-apis/
│   │       └── messaging/
│   │
│   ├── shared/                  # Shared utilities
│   │   ├── types/              # TypeScript types
│   │   ├── constants/          # App constants
│   │   ├── utils/              # Utility functions
│   │   └── config/             # Configuration
│   │
│   ├── ui/                     # UI Components
│   │   ├── components/         # Reusable components
│   │   ├── features/           # Feature-specific components
│   │   ├── layouts/            # Layout components
│   │   └── primitives/         # Base UI primitives
│   │
│   └── modules/                # Feature modules
│       ├── auth/
│       ├── trading/
│       ├── analytics/
│       └── admin/
│
├── tests/                      # All tests
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── performance/
│
├── docs/                       # Documentation
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   └── development/
│
├── scripts/                    # Build & deployment scripts
├── config/                     # Configuration files
└── public/                     # Static assets
```

## Refactoring Steps

### Phase 1: Documentation Organization (Quick Win)
1. Create `docs/` directory structure
2. Move all markdown files to appropriate subdirectories
3. Keep only essential files in root (README, LICENSE, etc.)

### Phase 2: Source Code Reorganization
1. Create `src/` directory
2. Move `app/` to `src/app/`
3. Consolidate `lib/`, `core/`, `shared/` into new structure
4. Organize components into `src/ui/`

### Phase 3: Naming Standardization
1. Convert all files to consistent naming:
   - Components: PascalCase (e.g., `TradingDashboard.tsx`)
   - Utilities/Services: camelCase (e.g., `authService.ts`)
   - Types/Interfaces: PascalCase (e.g., `TradingStrategy.ts`)
   - Constants: UPPER_SNAKE_CASE files
   - Config files: kebab-case

### Phase 4: Module Boundaries
1. Create clear module structure with:
   - Public API exports (index.ts)
   - Internal implementation
   - Module-specific types
   - Module tests

### Phase 5: Infrastructure Layer
1. Implement Repository pattern for data access
2. Create service interfaces
3. Dependency injection setup
4. Clear separation of concerns

## Naming Conventions

### Files
```typescript
// Components
TradingDashboard.tsx         // React components
TradingDashboard.styles.ts   // Styled components
TradingDashboard.test.tsx    // Component tests
TradingDashboard.stories.tsx // Storybook stories

// Services & Utilities
authService.ts               // Services
formatCurrency.ts           // Utility functions
validateEmail.ts            // Validators

// Types & Interfaces
ITradingStrategy.ts         // Interfaces (prefixed with I)
TradingTypes.ts            // Type definitions
TradingEnums.ts            // Enumerations

// Constants
API_ENDPOINTS.ts           // Constants
TRADING_CONSTANTS.ts       // Domain constants
```

### Directories
```
trading-strategies/        // Feature directories (kebab-case)
use-cases/                // Use case directories
external-apis/            // Integration directories
```

## Code Organization Patterns

### 1. **Barrel Exports**
Each module should have an `index.ts` that exports its public API:

```typescript
// src/modules/trading/index.ts
export { TradingService } from './services/TradingService';
export { TradingDashboard } from './components/TradingDashboard';
export type { ITradingStrategy } from './types/ITradingStrategy';
```

### 2. **Feature Modules**
```
src/modules/trading/
├── components/           # UI components
├── hooks/               # Custom hooks
├── services/            # Business logic
├── types/               # TypeScript types
├── utils/               # Module utilities
├── constants/           # Module constants
└── index.ts            # Public API
```

### 3. **Layered Architecture**
```
Presentation Layer (UI Components)
    ↓
Application Layer (Use Cases)
    ↓
Domain Layer (Business Logic)
    ↓
Infrastructure Layer (External Services)
```

## File Naming Examples

### Before → After
```
lib/auth-tokens.ts          → src/core/infrastructure/auth/tokenService.ts
lib/rate-limiter.ts         → src/core/infrastructure/security/RateLimiter.ts
components/trading/StrategyDashboard.tsx → src/ui/features/trading/TradingDashboard.tsx
lib/database/sqlite-connection.ts → src/core/infrastructure/database/adapters/SqliteAdapter.ts
hooks/use-toast.tsx         → src/shared/hooks/useToast.ts
```

## Implementation Priority

### High Priority (Week 1)
1. Documentation cleanup
2. Create src/ directory structure
3. Move and rename critical business logic files
4. Standardize component naming

### Medium Priority (Week 2)
1. Implement module structure
2. Create barrel exports
3. Consolidate duplicate functionality
4. Setup dependency injection

### Low Priority (Week 3)
1. Add comprehensive JSDoc comments
2. Create module documentation
3. Setup architecture decision records (ADRs)
4. Implement code quality tools

## Quality Standards

### Every File Should Have:
1. **Clear Purpose**: Single responsibility
2. **Consistent Naming**: Following conventions
3. **Proper Types**: Full TypeScript coverage
4. **Documentation**: JSDoc for public APIs
5. **Tests**: Unit tests for logic
6. **Exports**: Clear public API

### Every Module Should Have:
1. **README.md**: Module documentation
2. **index.ts**: Public API exports
3. **types/**: Type definitions
4. **tests/**: Module tests
5. **Clear boundaries**: No circular dependencies

## Automated Refactoring Tools

### Scripts to Create:
```bash
scripts/refactor/
├── organize-docs.sh        # Move documentation files
├── standardize-names.sh    # Rename files to conventions
├── create-modules.sh       # Setup module structure
├── generate-barrels.sh     # Create index.ts files
└── validate-structure.sh   # Validate new structure
```

## Success Metrics

- ✅ No files in lib/ root directory
- ✅ All components follow PascalCase
- ✅ All services follow camelCase
- ✅ Clear module boundaries with index.ts exports
- ✅ No circular dependencies
- ✅ 100% TypeScript coverage
- ✅ Consistent file organization
- ✅ Documentation in docs/ folder
- ✅ Clean root directory (< 10 files)

## Next Steps

1. **Review** this plan with the team
2. **Create** the new directory structure
3. **Start** with Phase 1 (documentation cleanup)
4. **Migrate** incrementally to avoid breaking changes
5. **Update** import statements as files move
6. **Test** thoroughly after each phase
7. **Document** any deviations from the plan

This refactoring will transform the codebase into a professional, maintainable, and scalable architecture that clearly shows expert-level engineering practices.
