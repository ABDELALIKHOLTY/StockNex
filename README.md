# 📈 StockNex - Advanced Stock Market Intelligence Platform

A comprehensive full-stack stock market analysis platform featuring real-time data, AI-powered price predictions, and an intuitive web interface.

---

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Node.js 18+** (for local development)
- **Python 3.9+** (for ML services)
- **PostgreSQL 14+** (for database)

### Option 1: Docker (Recommended - 2-3 minutes)

```bash
# Clone and navigate to project
git clone <repository-url>
cd StockNex

# Start all services
docker-compose up

# Wait for services to be ready (check logs)
# Frontend:     http://localhost:3000
# Backend API:  http://localhost:4000
# ML API:       http://localhost:8000
# Database:     localhost:5432
```

### Option 2: Local Development

#### Backend Setup
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:4000
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

#### Prediction API Setup
```bash
cd stock-prediction-api
pip install -r requirements.txt
python -m uvicorn stock_prediction_api.app.main:app --reload
# Runs on http://localhost:8000
```

---

## 📋 Project Structure

```
StockNex/
├── frontend/                 # Next.js 15.5.6 React application
│   ├── app/
│   │   ├── (auth)/          # Authentication pages (sign-in, sign-up)
│   │   ├── (root)/          # Main application pages
│   │   │   ├── page.tsx                    # Dashboard
│   │   │   ├── search/                     # Stock search
│   │   │   ├── watchlist/                  # User watchlist
│   │   │   ├── prediction/                 # AI predictions
│   │   │   ├── settings/                   # User settings & preferences
│   │   │   └── admin/                      # Admin dashboard
│   │   ├── api/             # API routes
│   │   └── context/         # React Context (Theme, etc.)
│   ├── components/          # Reusable React components
│   │   ├── market/          # Market-specific components
│   │   ├── forms/           # Form fields
│   │   └── ui/              # UI components (buttons, dialogs, etc.)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions & API clients
│   ├── styles/              # CSS stylesheets
│   └── public/              # Static assets
│
├── backend/                 # Express.js TypeScript API
│   ├── src/
│   │   ├── index.ts         # Main server entry
│   │   ├── middlewares/     # Authentication & logging
│   │   ├── routes/          # API endpoints
│   │   └── services/        # Business logic
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── package.json
│
├── stock-prediction-api/    # FastAPI Python prediction service
│   ├── app/
│       ├── main.py              # FastAPI application
        ├── test.py              # pipeline test
│       ├── api/                 # API endpoints
│           ├── model_trainer/       # LSTM model training
│           ├── model_ops/           # Model operations
│           ├── data_pipeline/       # Data preprocessing
│           ├── hyperparameter_tuner/# Hyperparameter optimization
│    ├── requirements.txt         # Python dependencies
│    ├── storage/                 # Trained models
├── docker-compose.yml       # Docker orchestration
├── DOCUMENTATION.md         # Detailed technical documentation
├── ADMIN_SETUP.md          # Admin configuration guide
└── README.md               # This file
```

---

## 🎯 Key Features

### 📊 Dashboard
- Real-time S&P 500 stock data
- Market overview with indices
- Price charts with technical indicators
- Stock heatmap visualization
- News feed integration

### 🔍 Search & Discovery
- Advanced stock search
- Company information lookup
- Historical data analysis
- Comparison tools

### 📈 Predictions
- AI-powered price predictions using LSTM neural networks
- 5-30 day forecasts
- Confidence intervals
- Hyperparameter optimization with Optuna
- Trend analysis

### 👤 User Features
- User authentication (JWT)
- Personal watchlist management
- Avatar upload & storage
- Customizable theme (light/dark mode)
- Settings & preferences

### 🛡️ Admin Panel
- User management dashboard
- System statistics
- ML model training interface
- Data monitoring
- Performance reports

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                     │
│  - React Components, Theme Context, Dark/Light Mode    │
│  - User Dashboard, Predictions, Watchlist, Admin Panel  │
│  - Real-time updates via WebSockets                     │
└─────────────────────────────────────────────────────────┘
                            ↕
                    (REST API + WebSocket)
                            ↕
┌─────────────────────────────────────────────────────────┐
│              Backend API (Express + TypeScript)          │
│  - User Authentication & JWT                            │
│  - Stock Data Management                                │
│  - Caching (Redis-ready)                                │
│  - Database Integration (Prisma ORM)                    │
└─────────────────────────────────────────────────────────┘
        ↕                          ↕                   ↕
   ┌────────┐            ┌──────────────┐      ┌─────────────┐
   │PostgreSQL│          │yfinance API  │      │Redis Cache  │
   │Database  │          │Market Data   │      │(Optional)   │
   └────────┘            └──────────────┘      └─────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │                                               │
┌──────────────────────────────────┐  ┌────────────────────────┐
│ Prediction API (FastAPI + Python)│  │  yfinance & Alpha      │
│ - LSTM Neural Networks            │  │  Vantage APIs         │
│ - Model Training & Retraining    │  │  Market Data Providers │
│ - Hyperparameter Tuning (Optuna) │  │                        │
│ - Data Preprocessing (Pandas)     │  │                        │
└──────────────────────────────────┘  └────────────────────────┘
```

---

## 🔐 Authentication & Security

### JWT Token Flow
```
User → Sign In → Backend validates → JWT Token issued
                                   ↓
                          Stored in localStorage
                                   ↓
                    Sent with every API request
                                   ↓
                     Backend verifies signature
```

### Admin Access
- Requires `isAdmin=true` flag in JWT
- Verified server-side on every request
- Admin routes protected with middleware
- User can only see own data

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 15.5.6 with Turbopack
- **Styling:** Tailwind CSS + custom CSS
- **State Management:** React Context API
- **Charts:** Recharts (interactive data visualization)
- **Real-time:** TradingView Widget
- **Storage:** localStorage (theme, auth tokens)
- **HTTP Client:** Axios (with custom API wrapper)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 14+
- **ORM:** Prisma
- **Authentication:** JWT
- **Caching:** Redis-ready (optional)

### Machine Learning
- **Framework:** FastAPI (async Python web framework)
- **ML Libraries:** TensorFlow 2.20+, Scikit-learn 1.7+
- **Optimization:** Optuna 4.6+ (hyperparameter tuning)
- **Data Processing:** Pandas 2.3+, NumPy 2.3+
- **Data Source:** yfinance 0.2+

### Infrastructure
- **Containerization:** Docker & Docker Compose
- **Database:** PostgreSQL (in container)
- **Data Source:** yfinance API (free stock data)

---

## 📦 Core Components

### Frontend Components

#### Market Components
- **MarketOverview** - Displays S&P 500 indices and overview
- **MarketNews** - Latest financial news feed
- **MarketQuotes** - Stock quotes and statistics
- **StockHeatmap** - Interactive market visualization
- **TradingViewWidget** - Advanced charting interface

#### Data Visualization
- **StockChart** - OHLCV candlestick charts
- **LineChart** - Historical price trends
- **LoadingScreen** - Smooth loading animations

#### User Components
- **Header** - Navigation and search
- **Sidebar** - Main menu navigation
- **UserDropdown** - User profile & settings
- **Settings** - Theme, avatar, preferences
- **AdminSidebar** - Admin-specific navigation

### Backend Services

#### Market Service (`market.service.ts`)
- Fetches real-time stock data
- Manages S&P 500 symbols
- Handles data caching
- Error handling & retries

#### Cache Service (`cache.service.ts`)
- In-memory caching layer
- TTL management
- Cache invalidation

#### Authentication Middleware (`auth.ts`)
- JWT verification
- Token validation
- User context extraction

---

## 🚀 Running the Application

### 1. Start All Services (Docker)
```bash
docker-compose up
```

Services will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Prediction API:** http://localhost:8000
- **Database:** postgresql://postgres:password@localhost:5432/postgres

### 2. Create Test Admin User

#### PowerShell (Windows)
```powershell
cd frontend
.\create-admin.ps1 -AdminEmail "admin@test.com" -AdminPassword "Admin@123456"
```

#### Bash (macOS/Linux)
```bash
cd frontend
bash create-admin.sh -e admin@test.com -p Admin@123456
```

### 3. Login & Explore
- Navigate to http://localhost:3000
- Sign in with admin credentials
- Access admin panel at `/admin`
- Create test watchlist entries
- Generate predictions

---

## 📊 Database Schema

### Main Tables
- **users** - User accounts with authentication
- **watchlist** - User's tracked stocks
- **predictions** - AI-generated price predictions
- **user_tracking** - User activity logs
- **stock_data** - Cached stock information

See [Prisma Schema](backend/prisma/schema.prisma) for complete details.

---

## 🔄 API Endpoints

### Authentication
- `POST /users/register` - Create new account
- `POST /users/login` - User login
- `GET /users/me` - Get current user info

### Stock Data
- `GET /stocks/:symbol` - Get stock details
- `GET /stocks/search/:query` - Search stocks
- `GET /stocks/sp500` - List all S&P 500 stocks

### Watchlist
- `GET /watchlist` - Get user's watchlist
- `POST /watchlist` - Add stock
- `DELETE /watchlist/:id` - Remove stock

### Predictions
- `GET /predict/:symbol` - Get price prediction
- `POST /predict/train` - Train model (admin)

### Admin
- `GET /admin/users` - List all users
- `GET /admin/stats` - System statistics
- `GET /admin/reports` - Analytics reports

Full API docs: [DOCUMENTATION.md](DOCUMENTATION.md)

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
cd backend
npm run test
```

### Prediction API Tests
```bash
cd stock-prediction-api
pytest
```

---

## 🐛 Common Issues & Troubleshooting

### Docker Container Won't Start
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
docker-compose exec db psql -U postgres -c "SELECT 1"

# Reset migrations
docker-compose exec backend npm run migrate:reset
```

### Frontend Won't Load
```bash
# Clear cache and rebuild
rm -rf frontend/.next
cd frontend
npm install
npm run build
```

### Prediction API Not Responding
```bash
# Check if ML dependencies installed
docker-compose exec prediction-api pip list | grep tensorflow

# Install missing packages
docker-compose exec prediction-api pip install -r requirements-ml.txt
```

See [DOCUMENTATION.md](DOCUMENTATION.md#troubleshooting) for more solutions.

---

## 📈 Performance Optimization

### Caching Strategy
- Stock data cached for 5 minutes
- User data cached per session
- Prediction results cached for 1 hour

### Database Optimization
- Indexed columns: `symbol`, `userId`, `createdAt`
- Connection pooling enabled
- Query optimization in place

### Frontend Performance
- Code splitting via Next.js
- Image optimization (next/image)
- CSS minification
- Lazy loading components

---

## 🔒 Security Best Practices

✅ **Implemented:**
- JWT authentication with secure tokens
- Password hashing (bcryptjs)
- CORS protection
- SQL injection prevention (Prisma ORM)
- XSS protection via React

⚠️ **To Implement:**
- [ ] Rate limiting on API endpoints
- [ ] 2FA (Two-Factor Authentication)
- [ ] Environment variables for secrets
- [ ] HTTPS/TLS in production
- [ ] API key rotation
- [ ] Audit logging
- [ ] DDoS protection

---

## 🎨 UI Customization

### Theme System
```typescript
// Using ThemeContext
const { theme, setTheme } = useTheme();

// Dark mode (default)
setTheme('dark');
```

### CSS Variables
```css
/* Dark Mode (default) */
html.dark {
  --background: #0f172a;
  --foreground: #ffffff;
  color: #ffffff;
}
```

---

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/stocknex
JWT_SECRET=your_secret_key_here
ADMIN_SECRET=admin123
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_PREDICTION_API=http://localhost:8000
```

### Prediction API (.env)
```
PYTHONUNBUFFERED=1
MODEL_PATH=/stock-predictor/storage
```

---

## 🚀 Deployment

### Production Checklist
- [ ] Set secure environment variables
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Setup database backups
- [ ] Enable monitoring & logging
- [ ] Configure domain names
- [ ] Setup CI/CD pipeline
- [ ] Configure rate limiting
- [ ] Setup error tracking (Sentry)

### Deploy with Docker
```bash
# Build production images
docker-compose -f docker-compose.yml build

# Push to registry
docker tag stocknex-frontend <registry>/stocknex-frontend:latest
docker push <registry>/stocknex-frontend:latest

# Deploy to cloud (e.g., AWS, GCP, Azure)
# Update docker-compose with production settings
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📚 Documentation Files

- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete technical documentation
- **[ADMIN_SETUP.md](ADMIN_SETUP.md)** - Admin user configuration
- **[CREATE_ADMIN_QUICK_START.md](CREATE_ADMIN_QUICK_START.md)** - Quick admin creation
- **[DOCKER_DEPENDENCIES.md](DOCKER_DEPENDENCIES.md)** - Docker & ML dependencies

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Use TypeScript for type safety
- Follow ESLint rules
- Write clear, descriptive comments
- Test new features
- Update documentation

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Frontend Components** | 30+ |
| **Backend Routes** | 20+ |
| **API Endpoints** | 25+ |
| **Database Tables** | 5 |
| **Supported Stocks** | 500+ (S&P 500) |
| **Prediction Window** | 5-30 days |
| **Update Frequency** | Real-time |
| **Cache Duration** | 5 minutes |

---

---

## 📞 Support & Contact

For issues, questions, or suggestions:
- Create an issue on GitHub
- Check [DOCUMENTATION.md](DOCUMENTATION.md)
- Review admin guides for setup questions
- Check container logs: `docker-compose logs -f <service>`

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Authors

Built with ❤️ for stock market enthusiasts and traders.

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Status:** Production Ready




