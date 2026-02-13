# Docker & ML Dependencies Configuration

## Overview

This document details all Docker services, dependencies, and ML framework requirements for StockNex.

## Docker Services

### 1. Frontend Service

**Image**: `node:20-alpine`
**Container**: `stocknex-frontend`
**Port**: 3000

#### Dependencies
```dockerfile
# From package.json
- Next.js: ^14.0.0
- React: ^18.2.0
- TypeScript: ^5.0.0
- Tailwind CSS: ^3.0.0
- Axios: ^1.6.0
- React Query: ^3.0.0
- Zustand: ^4.0.0 (optional state management)
```

#### Build Requirements
- npm/yarn package manager
- Node.js build tools
- PostCSS for CSS processing

#### Environment Variables
```env
NEXT_PUBLIC_API_URL=http://backend:4000
NEXT_PUBLIC_ML_API_URL=http://prediction-api:8000
NODE_ENV=production
```

#### Volumes
- None (stateless)
- Node modules installed in container

### 2. Backend Service

**Image**: `node:22-alpine`
**Container**: `stocknex-backend`
**Port**: 4000

#### System Dependencies
```dockerfile
# Alpine packages
- openssl: TLS/SSL support
- python3: For data processing (optional)
- curl: Health checks
```

#### NPM Dependencies
```json
{
  "express": "^4.18.0",
  "typescript": "^5.0.0",
  "@prisma/client": "^5.0.0",
  "jsonwebtoken": "^9.0.0",
  "cors": "^2.8.0",
  "dotenv": "^16.0.0",
  "axios": "^1.6.0"
}
```

#### Build Steps
1. Install system dependencies (openssl)
2. Copy package.json and install Node modules
3. Copy TypeScript source
4. Generate Prisma client: `npx prisma generate`
5. Compile TypeScript

#### Environment Variables
```env
DATABASE_URL=postgresql://postgres:password@db:5432/postgres?schema=public
NODE_ENV=production
JWT_SECRET=Ali@Yassir$StockNex#Prediction2025!Gi-ilsi-Info*Secure
```

#### Volumes
- Database migrations: `./prisma:/app/prisma`

### 3. ML Prediction API Service

**Image**: `python:3.11-slim`
**Container**: `prediction-api`
**Port**: 8000

#### Python Version
- Python 3.11 (slim variant for smaller image)
- pip package manager

#### ML Dependencies

```txt
# Core ML Libraries
tensorflow>=2.13.0      # Deep learning framework
scikit-learn>=1.3.0     # Traditional ML algorithms
pandas>=2.0.0           # Data manipulation
numpy>=1.24.0           # Numerical computing

# FastAPI Framework
fastapi>=0.104.0        # Web framework
uvicorn>=0.24.0         # ASGI server
pydantic>=2.0.0         # Data validation

# Data Processing
scipy>=1.11.0           # Scientific computing
joblib>=1.3.0           # Model serialization
pickle-mixin            # Pickle support

# Utilities
python-dotenv>=1.0.0    # Environment config
aiofiles>=23.0.0        # Async file I/O
```

#### Model Storage
- Path: `/stock-predictor/storage/models/`
- Persisted between container restarts
- Organized by symbol (e.g., `AAPL/model.pkl`)

#### Build Steps
1. Use Python 3.11-slim base
2. Install system dependencies (if any)
3. Copy requirements.txt
4. Install Python packages with timeout config
5. Copy application code
6. Create storage directory

#### Environment Variables
```env
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
MODEL_PATH=/stock-predictor/storage/models
```

#### Volumes
- Model storage: `./stock-prediction-api/stock-prediction-api/storage:/stock-predictor/storage`

### 4. Database Service

**Image**: `postgres:12`
**Container**: `db`
**Port**: 5432

#### Configuration
```yaml
User: postgres
Password: password
Database: postgres
Port: 5432
```

#### Environment
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=postgres
```

#### Health Check
```yaml
test: ["CMD-SHELL", "pg_isready -U postgres"]
interval: 5s
timeout: 5s
retries: 5
```

#### Persistence
- Volume: `pgdata` (Docker named volume)
- Path: `/var/lib/postgresql/data`

#### Connection String
```
postgresql://postgres:password@db:5432/postgres?schema=public
```

## Dependency Graph

```
Frontend (Node 20)
    ↓
Backend (Node 22)
    ↓
Database (PostgreSQL 12)
    ↓
ML API (Python 3.11)
```

All services connect through Docker network.

## Version Compatibility

| Service | Language | Version | Status |
|---------|----------|---------|--------|
| Frontend | Node.js | 20-alpine | Active |
| Backend | Node.js | 22-alpine | Active |
| Database | PostgreSQL | 12 | Stable |
| ML API | Python | 3.11-slim | Active |

## Building from Source

### Full Build
```bash
docker-compose build
```

### Selective Build
```bash
# Frontend only
docker-compose build frontend

# Backend only
docker-compose build backend

# ML API only
docker-compose build prediction-api
```

### Build with No Cache
```bash
docker-compose build --no-cache
```

## Common Dependency Issues

### Issue: npm install timeout
**Solution**: Increase fetch timeout in Dockerfile
```dockerfile
RUN npm config set fetch-timeout 300000
```

### Issue: Python package installation slow
**Solution**: Use index mirror or increase timeout
```dockerfile
RUN pip install --default-timeout=1000 -r requirements.txt
```

### Issue: DNS resolution in Docker
**Solution**: Configure Docker daemon DNS or use Google DNS
```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

### Issue: Out of disk space
**Solution**: Clean Docker build cache
```bash
docker system prune -a --volumes
```

## Production Deployment

### Image Size Optimization
- Use Alpine variants for smaller images
- Remove development dependencies
- Multi-stage builds (if applicable)

### Security
- Keep base images updated
- Don't run as root
- Use read-only filesystems (where applicable)
- Scan images for vulnerabilities

### Performance
- CPU limits: Set appropriately
- Memory limits: See below
- Network: Host network (if needed)

### Resource Limits

Recommended for development:
```yaml
services:
  frontend:
    mem_limit: 512m
  backend:
    mem_limit: 1024m
  prediction-api:
    mem_limit: 2048m
  db:
    mem_limit: 512m
```

## Monitoring Dependencies

### Check Version
```bash
# Frontend
docker-compose exec frontend node --version
docker-compose exec frontend npm --version

# Backend
docker-compose exec backend node --version

# ML API
docker-compose exec prediction-api python --version
docker-compose exec prediction-api pip list

# Database
docker-compose exec db psql --version
```

### Update Dependencies

```bash
# Node services
docker-compose exec backend npm update
docker-compose exec frontend npm update

# Python packages
docker-compose exec prediction-api pip install --upgrade -r requirements.txt

# Docker images
docker-compose pull
docker-compose up -d
```

## Security Updates

Subscribe to security notices:
- Node.js: https://nodejs.org/en/security/
- PostgreSQL: https://www.postgresql.org/support/security/
- Python: https://www.python.org/dev/security/
- TensorFlow: https://github.com/tensorflow/tensorflow/security

## Support & Documentation

- Node.js: https://nodejs.org/docs/
- PostgreSQL: https://www.postgresql.org/docs/
- Python: https://docs.python.org/
- FastAPI: https://fastapi.tiangolo.com/
- TensorFlow: https://www.tensorflow.org/guide
- Docker: https://docs.docker.com/

---

Last Updated: December 2025
