# 📊 COMPLETE DOCUMENTATION - STOCKNEX

## 🎯 ABOUT THIS DOCUMENT

This is the **technical companion** to StockNex's main README. While the README focuses on what the platform does and how to get started, this document explains how it works under the hood.

---

## 🏗️ GENERAL ARCHITECTURE

### Technology Stack

<img width="1360" height="706" alt="project_architecture" src="https://github.com/user-attachments/assets/5a8de521-656e-4d58-8480-72fe28f0d716" />

---

## 📋 DETAILED PROJECT STRUCTURE

### 1. BACKEND (`/backend`)

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
- Add/remove stocks from watchlist
- Get user watchlist

**Predictions:**
- Store and retrieve stock predictions

#### Key Services

**MarketService:**
- Fetches stock data via Yahoo Finance API
- Converts raw data to structured StockData format
- Manages data for:
  - Real-time prices
  - Changes (change, changePercent)
  - Volumes
  - Market capitalizations
  - PE ratios
  - Sectors

**CacheService:**
- In-memory cache with TTL (Time To Live)
- Different cache strategies:
  - Stock data: 15 seconds
  - Historical data: 5 minutes
  - Heatmap: 15 seconds
- Reduces load on Yahoo Finance API

---

### 2. FRONTEND (`/frontend`)

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

#### Reusable Components

**Market Components:**
- `MarketOverview.tsx` - Main indices (S&P 500, NASDAQ, etc.)
- `MarketQuotes.tsx` - Quotation list
- `StockHeatmap.tsx` - Interactive D3.js heatmap
- `MarketNews.tsx` - News feed

**Form Components:**
- `InputField.tsx` - Text input
- `SelectField.tsx` - Selection
- `CountrySelectField.tsx` - Country selection

**UI Components (Radix UI):**
- `button.tsx`, `input.tsx`, `dialog.tsx`
- `dropdown-menu.tsx`, `popover.tsx`
- `card.tsx`, `label.tsx`, `select.tsx`, `avatar.tsx`, `command.tsx`

**Navigation Components:**
- `Header.tsx` - Header with navigation
- `Sidebar.tsx` - Side navigation
- `AdminSidebar.tsx` - Admin navigation

**Advanced Components:**
- `StockChart.tsx` - Charts with Recharts
- `LineChart.tsx` - Line charts
- `TradingViewWidget.tsx` - Integrated TradingView widget
- `Logo.tsx`, `UserDropdown.tsx`

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

**Watchlist Management:**
- Add/remove any yfinance stock
- Persistent storage in database
- Real-time price updates every 15 seconds
- Support for stocks from any market

**Stock Prediction:**
- AI-powered price predictions using LSTM models
- Support for any yfinance symbol
- Multiple time horizons (1-30 days ahead)
- Historical accuracy metrics

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

```
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "isAdmin": false,
  "iat": 1702502400,
  "exp": 1702588800
}
```

---

## 🗄️ DATABASE SCHEMA

### Users Table
```sql
CREATE TABLE "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastLogin TIMESTAMP,
  loginCount INT DEFAULT 0,
  isAdmin BOOLEAN DEFAULT false
);
```

### Watchlist Table
```sql
CREATE TABLE "WatchlistItem" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  companyName VARCHAR(255),
  addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id),
  UNIQUE(userId, symbol)
);
```

### Predictions Table
```sql
CREATE TABLE "UserPrediction" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  companyName VARCHAR(255),
  predictedPrice DECIMAL(10, 2),
  viewedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

### Activity Logs Table
```sql
CREATE TABLE "ActivityLog" (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  details JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id)
);
```

---

## 📡 API ENDPOINTS

### Market Data

**Get Market Overview**
```
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
```

**Get Stock Quotes**
```
POST /api/market/quotes
Body: {
  "symbols": ["AAPL", "MSFT", "GOOGL"]
}
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
```

**Get Stock Heatmap**
```
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
```

### User Management

**List All Users (Admin)**
```
GET /admin/users
Headers: { Authorization: "Bearer <token>" }
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
```

**Get User Statistics (Admin)**
```
GET /admin/users/:id/stats
Headers: { Authorization: "Bearer <token>" }
Response: {
  "watchlistItems": 15,
  "predictions": 8,
  "logsCount": 42
}
```

---

## 🚀 DEPLOYMENT

### Docker Deployment

The project includes Docker Compose configuration for complete containerization:

```yaml
Services:
- frontend: Next.js application (port 3000)
- backend: Express.js API (port 4000)
- prediction-api: FastAPI ML service (port 8000)
- postgres: PostgreSQL database (port 5432)
```

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL/TLS certificates configured
- [ ] Database backups scheduled
- [ ] Monitoring and logging set up
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers added

---

## 🔧 DEVELOPMENT GUIDELINES

### Code Style

- Use TypeScript for all backend code
- Use React functional components with hooks
- Follow ESLint rules
- Use Prettier for code formatting

### Commit Messages

```
Feature: Add new feature description
Fix: Bug fix description
Docs: Documentation update
Style: Code style changes
Refactor: Code refactoring
Test: Add tests
Chore: Maintenance tasks
```

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 📚 ADDITIONAL RESOURCES

- [Next.js Documentation](https://nextjs.org)
- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Docker Documentation](https://docs.docker.com)

---

**Last Updated:** December 14, 2024
**Version:** 1.0.0
