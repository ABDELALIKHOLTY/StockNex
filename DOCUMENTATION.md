# 📊 COMPLETE DOCUMENTATION - STOCKNEX

## 🎯 ABOUT THIS DOCUMENT

This is the **technical companion** to StockNex's main README. While the README focuses on what the platform does and how to get started, this document explains how it works under the hood.

---

## 🏗️ GENERAL ARCHITECTURE

### System Overview

<img width="1360" height="706" alt="project_architecture" src="https://github.com/user-attachments/assets/5a8de521-656e-4d58-8480-72fe28f0d716" />

---

## 💻 TECHNOLOGY STACK

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 15.5.6 + React 19 | App Router, SSR |
| UI | Radix UI, Recharts, D3.js | Components, Charts |
| Backend | Express.js + TypeScript | RESTful API |
| Database | PostgreSQL 14+ + Prisma | Data persistence |
| ML | FastAPI + LSTM | Price prediction |
| Auth | JWT + bcrypt | Authentication |
| Cache | Redis | Performance |
| APIs | Yahoo Finance, Finnhub | Market data |

---

## 📋 DETAILED PROJECT STRUCTURE

### 1. BACKEND (`/backend`)

#### Directory Structure

```
backend/
│
├── src/
│   │
│   ├── index.ts                   # Main entry point
│   │                              # - Express initialization
│   │                              # - CORS configuration
│   │                              # - Admin endpoints
│   │                              # - Authentication endpoints
│   │
│   ├── middlewares/               # Express middleware
│   │   ├── auth.ts                # JWT authentication
│   │   └── ...
│   │
│   ├── routes/                    # API routes
│   │   ├── users.ts               # User endpoints
│   │   ├── watchlist.ts           # Watchlist endpoints
│   │   ├── predictions.ts         # Prediction endpoints
│   │   └── ...
│   │
│   └── services/                  # Business logic
│       ├── market.service.ts      # Market data service
│       ├── cache.service.ts       # Cache management
│       ├── user.service.ts        # User operations
│       └── ...
│
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # Migration history
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── backend.dockerfile             # Docker configuration
```

#### Database (Prisma Schema)

```
Models:
├── User
│   ├── id (PK)
│   ├── email (unique)
│   ├── username
│   ├── password (hashed)
│   ├── createdAt
│   ├── lastLogin
│   ├── loginCount
│   ├── isAdmin (admin role)
│   ├── Relations:
│   │   ├── watchlistItems (1-to-many)
│   │   ├── predictions (1-to-many)
│   │   └── activityLogs (1-to-many)
│
├── WatchlistItem
│   ├── id (PK)
│   ├── userId (FK)
│   ├── symbol (e.g.: AAPL)
│   ├── companyName
│   ├── addedAt
│   └── Unique constraint: [userId, symbol]
│
├── UserPrediction
│   ├── id (PK)
│   ├── userId (FK)
│   ├── symbol
│   ├── companyName
│   ├── predictedPrice
│   └── viewedAt
│
└── ActivityLog
    ├── id (PK)
    ├── userId (FK)
    ├── action (login, view_prediction, add_watchlist, remove_watchlist)
    ├── details (JSON)
    └── timestamp
```

#### Main API Routes

**Authentication:**
- `POST /users` - User registration
- `POST /users/login` - User login
- `GET /user` - Get current authenticated user

**User Management (Admin):**
- `GET /users` - List all users (admin only)
- `GET /users/:id` - User details
- `GET /users/:id/stats` - User statistics

**Stock Data:**
- `GET /api/market/overview` - Market overview
- `GET /api/market/quotes` - Real-time quotes
- `GET /api/market/heatmap` - Stock heatmap
- `GET /api/market/news` - Stock news

**Watchlist:**
- `GET /watchlist` - Get user watchlist
- `POST /watchlist` - Add stock to watchlist
- `DELETE /watchlist/:id` - Remove stock from watchlist

**Predictions:**
- `GET /predictions/:symbol` - Get stock prediction
- `GET /predictions/history` - Get prediction history

#### Key Services

**MarketService:**
```
Responsibility: Fetch and manage market data

Methods:
├─ getStockPrice(symbol: string)
│  └─ Returns: { symbol, price, change, changePercent, timestamp }
│
├─ getStockHistory(symbol: string, range: string)
│  ├─ Range options: 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y
│  └─ Returns: { dates[], prices[], volumes[] }
│
├─ searchStock(query: string)
│  └─ Returns: { symbol, name, exchange, type }[]
│
└─ getMarketNews()
   └─ Returns: { headlines, sentiment }

Features:
- Fetches stock data via Yahoo Finance API
- Converts raw data to structured StockData format
- Manages: Real-time prices, Changes, Volumes, Market caps, PE ratios, Sectors
- Error handling with exponential backoff retry
- Detailed error logging
```

**CacheService:**
```
Responsibility: Performance optimization via caching

Strategies:
├─ In-Memory Cache (default)
│  ├─ Storage: Map<string, CacheEntry>
│  ├─ TTL Configuration:
│  │  ├─ Stock prices: 15 seconds
│  │  ├─ Historical data: 5 minutes
│  │  └─ Heatmap: 15 seconds
│  └─ Limit: 1000 entries max
│
└─ Redis Cache (optional)
   ├─ Persistence across restarts
   ├─ Shared across instances
   └─ Automatic TTL expiration

Methods:
├─ get(key: string): Promise<any>
├─ set(key: string, value: any, ttl?: number): Promise<void>
├─ invalidate(pattern: string): Promise<void>
└─ clear(): Promise<void>

Benefits:
- Reduces API latency (1 min → 1ms)
- Reduces load on external APIs
- Improves user experience
```

**PredictionService:**
```
Responsibility: AI prediction orchestration

Methods:
├─ getUserPredictions(userId: number)
│  └─ Returns: UserPrediction[]
│
├─ predictStockPrice(symbol: string, userId: number)
│  ├─ Fetches historical data via MarketService
│  ├─ Calls ML API (FastAPI, port 8000)
│  ├─ Receives: { price, confidence, timeframe }
│  ├─ Stores in database
│  ├─ Logs activity
│  └─ Returns: UserPrediction with metadata
│
└─ invalidatePrediction(predictionId: number)
   ├─ Marks as obsolete
   └─ Requests new prediction

Integration Flow:
Backend → HTTP POST /predict → ML API (FastAPI)
  ↓          { symbol, historicalData }       ↓
  ↓                                      LSTM/RF Model
  ↓          { price, confidence } ←─────     ↓
Database ← Store result ← Cache result
```

---

### 2. FRONTEND (`/frontend`)

#### Directory Structure

```
frontend/
│
├── app/                           # Next.js 15 App Router
│   │
│   ├── (auth)/                    # Authentication group
│   │   ├── sign-in/               # Login page
│   │   ├── sign-up/               # Registration page
│   │   └── layout.tsx             # Auth layout
│   │
│   ├── (root)/                    # Main application group
│   │   ├── page.tsx               # Dashboard home
│   │   ├── dashboard/             # Dashboard section
│   │   │   └── page.tsx
│   │   ├── search/                # Stock search
│   │   │   └── page.tsx
│   │   ├── watchlist/             # User watchlist
│   │   │   └── page.tsx
│   │   ├── prediction/            # AI predictions
│   │   │   └── page.tsx
│   │   ├── settings/              # User settings
│   │   │   └── page.tsx
│   │   ├── admin/                 # Admin panel
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   ├── alerts/
│   │   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   ├── stats/
│   │   │   └── layout.tsx
│   │   └── layout.tsx             # Main layout
│   │
│   ├── api/                       # Next.js API routes
│   │   ├── auth/                  # Auth endpoints
│   │   ├── watchlist/             # Watchlist endpoints
│   │   └── predictions/           # Prediction endpoints
│   │
│   ├── context/                   # React Context
│   │   └── ThemeContext.tsx       # Theme provider
│   │
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   ├── providers.tsx              # Global providers
│   └── RootLayoutClient.tsx       # Client wrapper
│
├── components/                    # Reusable components
│   │
│   ├── AuthGuard.tsx              # Protected route guard
│   ├── AuthModal.tsx              # Auth modal
│   ├── Header.tsx                 # App header
│   ├── Sidebar.tsx                # Main sidebar
│   ├── AdminSidebar.tsx           # Admin sidebar
│   ├── UserDropdown.tsx           # User menu
│   ├── Logo.tsx                   # App logo
│   ├── NavItems.tsx               # Navigation items
│   │
│   ├── market/                    # Market components
│   │   ├── MarketOverview.tsx     # Market indices
│   │   ├── MarketQuotes.tsx       # Stock quotes
│   │   ├── StockHeatmap.tsx       # D3.js heatmap
│   │   ├── MarketNews.tsx         # News feed
│   │   ├── StockChart.tsx         # Recharts graphs
│   │   ├── LineChart.tsx          # Line graphs
│   │   └── TradingViewWidget.tsx  # TradingView widget
│   │
│   ├── forms/                     # Form components
│   │   ├── InputField.tsx         # Text input
│   │   ├── SelectField.tsx        # Select dropdown
│   │   └── CountrySelectField.tsx # Country selector
│   │
│   └── ui/                        # Radix UI components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── dropdown-menu.tsx
│       ├── popover.tsx
│       ├── card.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── avatar.tsx
│       └── command.tsx
│
├── hooks/                         # Custom React hooks
│   ├── useAdminAuth.ts            # Admin authentication
│   ├── useAdminProtection.ts      # Admin route protection
│   ├── useCache.ts                # Client-side cache
│   ├── useDashboardRefresh.ts     # Dashboard auto-refresh
│   ├── useTradingViewWidget.tsx   # TradingView integration
│   ├── useUserTracking.ts         # User activity tracking
│   └── useWatchlistRefresh.ts     # Watchlist auto-refresh
│
├── lib/                           # Utilities and API clients
│   ├── api.ts                     # General API client
│   ├── prediction-api.ts          # Prediction API client
│   ├── Constants.tsx              # App constants
│   ├── utils.ts                   # Utility functions
│   ├── sp500-symbols.ts           # S&P 500 symbols
│   ├── sp500-domains.ts           # S&P 500 sectors
│   └── generate_symbol_mapping.js # Symbol mapper
│
├── styles/                        # CSS stylesheets
│   ├── globals.css
│   ├── dashboard.css
│   ├── heatmap.css
│   ├── heatmap-interactive.css
│   ├── heatmap-tooltip.css
│   ├── stockheatmap.css
│   └── marketnews.css
│
├── types/                         # TypeScript definitions
│   ├── global.d.ts                # Global types
│   ├── trading.ts                 # Trading types
│   ├── heatmap.ts                 # Heatmap types
│   └── lucide-react.d.ts          # Icon types
│
├── public/                        # Static assets
│   ├── manifest.json              # PWA manifest
│   ├── clear-cache.html           # Cache utility
│   └── assets/                    # Images, fonts
│
└── shared/                        # Shared code
    ├── index.ts
    ├── data/
    └── utils/
```

#### Main Pages

**Dashboard (`/(root)/page.tsx`):**
- **MarketOverview** - Overview of main indices
- **StockHeatmap** - 2D visualization of stock performance
- **MarketNews** - Live stock news
- **MarketQuotes** - Detailed stock quotations

**Admin Section (`/admin`):**
- `alerts/` - Alert management
- `data/` - Data management
- `models/` - Models and predictions
- `reports/` - Reports
- `settings/` - Configuration
- `stats/` - Statistics
- `users/` - User management

**Other Sections:**
- **`/search`** - Stock search
- **`/prediction`** - Prediction consultations
- **`/watchlist`** - Personal watchlist

**Authentication:**
- `/(auth)/sign-in/` - Login page
- `/(auth)/sign-up/` - Registration page

#### Navigation Flow

```
┌─ Unauthenticated User
│  └─ Accessible: /sign-in, /sign-up
│
└─ Authenticated User
   ├─ /                 (Dashboard home)
   ├─ /dashboard        (Dashboard)
   ├─ /search           (Stock search)
   ├─ /watchlist        (Watchlist)
   ├─ /prediction       (Predictions)
   ├─ /settings         (Settings)
   │
   └─ Admin Only (if isAdmin = true)
      └─ /admin         (Admin panel)
         ├─ /admin/users
         ├─ /admin/alerts
         ├─ /admin/data
         ├─ /admin/models
         ├─ /admin/reports
         ├─ /admin/settings
         └─ /admin/stats
```

#### Key Components

**AuthGuard Component**
```
Responsibility: Protect routes and redirect unauthenticated users

Flow:
├─ Check if user is authenticated
├─ Retrieve JWT token from storage
├─ Redirect to /sign-in if not authenticated
└─ Render content if authenticated
```

**Header Component**
```
Responsibility: Main application header

Features:
├─ App logo
├─ Stock search bar
├─ Notifications
└─ User dropdown menu
```

**Sidebar Component**
```
Responsibility: Main navigation for regular users

Navigation:
├─ Dashboard
├─ Search
├─ Watchlist
├─ Predictions
└─ Settings
```

**Market Components**

**MarketOverview:**
- Displays major market indices (S&P 500, NASDAQ, Dow Jones)
- Real-time price updates
- Change indicators

**StockHeatmap:**
- Interactive D3.js visualization
- Color-coded performance
- Sector grouping
- Tooltips with stock details

**MarketQuotes:**
- Detailed stock quotations
- Volume, market cap, PE ratio
- Real-time updates every 15 seconds

**MarketNews:**
- Live stock news feed
- Sentiment analysis
- News source attribution

#### Custom Hooks

- `useAdminAuth.ts` - Admin access verification
- `useCache.ts` - Client-side cache management
- `useAdminProtection.ts` - Admin route protection
- `useDashboardRefresh.ts` - Dashboard auto-refresh
- `useUserTracking.ts` - User activity tracking
- `useWatchlistRefresh.ts` - Watchlist auto-refresh

#### Key Features

**Stock Search & Filtering:**
- Real-time search across all yfinance symbols
- Support for any ticker format (1-5 alphanumeric characters)
- No limitation to S&P 500 only
- Auto-complete suggestions

**Watchlist Management:**
- Add/remove any yfinance stock
- Persistent storage in database
- Real-time price updates every 15 seconds
- Support for stocks from any market
- Drag-and-drop reordering

**Stock Prediction:**
- AI-powered price predictions using LSTM models
- Support for any yfinance symbol
- Multiple time horizons (1-30 days ahead)
- Historical accuracy metrics
- Confidence scores

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### JWT Authentication Flow

```
Client                          Backend
  |                               |
  |--1. POST /users/login-------->|
  |                               |
  |<-----2. JWT Token-------------|
  |                               |
  |--3. GET /api/market (Bearer)-->|
  |                               |
  |<-----4. Protected Data--------|
```

### User Roles

1. **Regular User (User)**
   - View market data
   - Create/manage watchlist
   - View predictions
   - Track activity

2. **Admin User (Admin)**
   - All user permissions
   - Manage users (create, update, delete)
   - Access admin dashboard
   - View system statistics
   - Manage models and reports

### JWT Token Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "isAdmin": false,
  "iat": 1702502400,
  "exp": 1702588800
}
```

**Token Properties:**
- `id`: User's database ID
- `email`: User's email address
- `username`: User's display name
- `isAdmin`: Admin role flag
- `iat`: Issued at timestamp
- `exp`: Expiration timestamp (24 hours from issue)

---

## 🗄️ DATABASE SCHEMA

### Database Model (MLD)

<img width="1408" height="768" alt="MLD" src="https://github.com/user-attachments/assets/841aaaaa-c193-4283-ac6e-46ee68410386" />

### Core Models

**User**
```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,        -- bcrypt hashed
  createdAt TIMESTAMP DEFAULT NOW(),
  lastLogin TIMESTAMP,
  loginCount INT DEFAULT 0,
  isAdmin BOOLEAN DEFAULT false
);
```

**WatchlistItem**
```sql
CREATE TABLE "WatchlistItem" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  companyName VARCHAR(255),
  addedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE,
  UNIQUE(userId, symbol)
);
```

**UserPrediction**
```sql
CREATE TABLE "UserPrediction" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  companyName VARCHAR(255),
  predictedPrice DECIMAL(10, 2),
  viewedAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);
```

**ActivityLog**
```sql
CREATE TABLE "ActivityLog" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  action VARCHAR(50) NOT NULL,           -- login, view_prediction, add_watchlist, etc.
  details JSON,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);
```

### Relationships

| Relation | Type | Description |
|----------|------|-------------|
| User → WatchlistItem | 1:N | User has many watched stocks |
| User → UserPrediction | 1:N | User has many predictions |
| User → ActivityLog | 1:N | User has many activity logs |

**Cascade Delete:** When User deleted → all related data deleted

---

## 📡 API ENDPOINTS

### Authentication

```http
POST /auth/sign-up
Body: { "email": "user@example.com", "username": "user", "password": "pass123" }
Response: { "user": {...}, "token": "jwt..." }

POST /auth/sign-in
Body: { "email": "user@example.com", "password": "pass123" }
Response: { "user": {...}, "token": "jwt..." }

POST /auth/verify
Headers: Authorization: Bearer <token>
Response: { "valid": true, "user": {...} }
```

### Market Data

```http
GET /api/market/overview
Response: {
  "indices": [
    {
      "symbol": "^GSPC",
      "name": "S&P 500",
      "price": 4765.45,
      "change": 12.34,
      "changePercent": 0.26
    }
  ]
}

POST /api/market/quotes
Body: { "symbols": ["AAPL", "MSFT", "GOOGL"] }
Response: [
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 189.45,
    "change": 2.15,
    "changePercent": 1.15,
    "volume": 52134567
  }
]

GET /api/market/heatmap
Response: [
  {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 189.45,
    "changePercent": 1.15,
    "sector": "Technology"
  }
]

GET /api/market/news
Response: {
  "news": [
    {
      "headline": "Apple announces new product line",
      "summary": "Apple Inc. revealed...",
      "source": "Reuters",
      "sentiment": "positive"
    }
  ]
}
```

### Watchlist

```http
GET /watchlist
Headers: Authorization: Bearer <token>
Response: [
  {
    "id": 1,
    "userId": 1,
    "symbol": "AAPL",
    "companyName": "Apple Inc.",
    "addedAt": "2024-12-14T10:00:00Z"
  }
]

POST /watchlist
Headers: Authorization: Bearer <token>
Body: { "symbol": "AAPL", "companyName": "Apple Inc." }
Response: { "id": 1, "userId": 1, "symbol": "AAPL", ... }

DELETE /watchlist/:id
Headers: Authorization: Bearer <token>
Response: { "success": true }
```

### Predictions

```http
GET /predictions/:symbol
Headers: Authorization: Bearer <token>
Response: {
  "symbol": "AAPL",
  "predictedPrice": 185.50,
  "confidence": 0.87,
  "timeframe": "7 days"
}

GET /predictions/history
Headers: Authorization: Bearer <token>
Response: [
  {
    "id": 1,
    "symbol": "AAPL",
    "predictedPrice": 185.50,
    "viewedAt": "2024-12-14T15:30:00Z"
  }
]
```

### User Management (Admin)

```http
GET /admin/users
Headers: Authorization: Bearer <admin-token>
Response: [
  {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "isAdmin": false,
    "createdAt": "2024-12-14T10:00:00Z",
    "lastLogin": "2024-12-14T15:30:00Z",
    "loginCount": 5
  }
]

GET /admin/users/:id/stats
Headers: Authorization: Bearer <admin-token>
Response: {
  "watchlistItems": 15,
  "predictions": 8,
  "logsCount": 42
}
```

### Activity Logs

```http
GET /activity-logs
Headers: Authorization: Bearer <token>
Response: [
  {
    "id": 1,
    "userId": 1,
    "action": "login",
    "details": "{\"ip\":\"192.168.1.1\"}",
    "timestamp": "2024-12-14T15:30:00Z"
  }
]

POST /activity-logs
Headers: Authorization: Bearer <token>
Body: { "action": "add_watchlist", "details": "{\"symbol\":\"AAPL\"}" }
Response: { "id": 3, "action": "add_watchlist", ... }
```

---

## 🔄 DATA FLOW

### Authentication Flow

```
SIGN-UP                           SIGN-IN
Frontend                          Frontend
   │ POST /auth/sign-up              │ POST /auth/sign-in
   ▼                                 ▼
Backend                           Backend
   │ 1. Validate data                │ 1. Find user by email
   │ 2. Hash password                │ 2. Compare password
   │ 3. Create user                  │ 3. Generate JWT
   │ 4. Generate JWT                 │ 4. Update lastLogin
   ▼                                 ▼
Database                          Database
   │ INSERT User                     │ UPDATE User
   ▼                                 ▼
Frontend                          Frontend
   │ Store JWT                       │ Store JWT
   └─ Redirect /dashboard            └─ Redirect /dashboard
```

### Complete User Journey Example

```
═══════════════════════════════════════════════════════════
NEW USER VIEWS STOCK PREDICTION
═══════════════════════════════════════════════════════════

1. REGISTER
   Frontend → POST /auth/sign-up → Backend
   Backend  → Create User (id: 1) → Database
   Backend  → Return JWT → Frontend
   
2. ADD TO WATCHLIST
   Frontend → POST /watchlist {symbol: "AAPL"} → Backend
   Backend  → Validate JWT (userId=1)
   Backend  → INSERT watchlist_items → Database
   Backend  → INSERT activity_logs → Database
   
3. REQUEST PREDICTION
   Frontend → GET /predictions/AAPL → Backend
   Backend  → Fetch historical data → Yahoo Finance
   Backend  → POST to ML API → FastAPI
   ML API   → Run LSTM model
   ML API   → Return {price: 185.50, confidence: 0.87}
   Backend  → INSERT user_predictions → Database
   Backend  → INSERT activity_logs → Database
   Frontend ← Display prediction

FINAL DATABASE STATE:
Users: 1 row (john@email.com)
WatchlistItems: 1 row (AAPL)
UserPredictions: 1 row (AAPL: $185.50)
ActivityLogs: 2 rows (add_watchlist, view_prediction)
```

---

## 🚀 DEPLOYMENT

### Docker Architecture

```yaml
Services:
├─ frontend (Next.js) - Port 3000
├─ backend (Express) - Port 4000  
├─ ml (FastAPI) - Port 8000
├─ postgres (PostgreSQL) - Port 5432
└─ redis (Redis) - Port 6379 [optional]

Network: stocknex-network (bridge)
```

### Production Checklist

**Environment**
- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL`, `JWT_SECRET`
- [ ] Set API URLs for frontend/backend/ML

**Database**
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Configure automated backups
- [ ] Enable connection pooling

**Security**
- [ ] Enable SSL/TLS certificates (Let's Encrypt)
- [ ] Configure CORS whitelist
- [ ] Add security headers (CSP, HSTS, X-Frame-Options)
- [ ] Implement rate limiting
- [ ] Configure firewall rules

**Monitoring**
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure application monitoring
- [ ] Enable access/error logs
- [ ] Set up alerts for critical errors

**Performance**
- [ ] Enable Redis caching
- [ ] Configure CDN for static assets
- [ ] Optimize database indexes
- [ ] Enable gzip compression

### Docker Commands

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f [service-name]

# Stop all services
docker-compose down

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Rebuild specific service
docker-compose up -d --build frontend
```

---

## 🔧 DEVELOPMENT GUIDELINES

### Code Style

**TypeScript**
- Use strict mode with explicit types
- Avoid `any` - use `unknown` or proper types
- Define interfaces for object shapes

**React**
- Functional components with hooks
- Single responsibility principle
- Extract reusable logic to custom hooks

**Naming Conventions**
- Components: PascalCase (`UserProfile.tsx`)
- Utils: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)

**Formatting**
- ESLint + Prettier
- 2 spaces indentation
- Single quotes
- Max line length: 100 characters

### Git Workflow

**Commit Format:**
```
<type>: <subject>

<body>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

**Examples:**
```
feat: add stock price prediction feature

Implemented LSTM-based model for predicting stock prices.
Added new endpoint /predictions/:symbol and integrated
with ML API service.

Closes #123
```

**Branch Naming:**
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Refactoring
- `docs/update-readme` - Documentation

### Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Specific test file
npm test -- UserProfile.test.tsx
```

### Database Migrations

```bash
# Create migration
npx prisma migrate dev --name description_of_changes

# Apply to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Environment Variables

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_ML_API_URL=http://localhost:8000
```

**Backend (.env)**
```
DATABASE_URL=postgresql://user:password@localhost:5432/stocknex
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=4000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
YAHOO_FINANCE_API_KEY=your-api-key
FINNHUB_API_KEY=your-api-key
```

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Docker Documentation](https://docs.docker.com)
- [FastAPI Documentation](https://fastapi.tiangolo.com)

### External APIs
- [Yahoo Finance API](https://finance.yahoo.com)
- [Finnhub API Documentation](https://finnhub.io/docs/api)
- [TradingView Widget Documentation](https://www.tradingview.com/widget/)

### Tools & Libraries
- [Radix UI Components](https://www.radix-ui.com)
- [Recharts Documentation](https://recharts.org)
- [D3.js Documentation](https://d3js.org)
- [Lucide Icons](https://lucide.dev)

---

**Last Updated:** February 2026  
**Version:** 2.0.0  
**Maintained By:** StockNex Development Team
