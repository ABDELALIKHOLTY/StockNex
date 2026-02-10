# Admin User Setup & Configuration

## Overview

This document describes how to create and manage admin users in StockNex.

## Creating First Admin User

### Method 1: Using Quick Start Script (Recommended)

See `CREATE_ADMIN_QUICK_START.md` for automated admin creation.

### Method 2: Manual Database Setup

1. Connect to PostgreSQL
```bash
docker-compose exec db psql -U postgres -d postgres
```

2. Run admin creation query
```sql
-- Create admin user
INSERT INTO "User" (email, password, role, createdAt) 
VALUES ('admin@example.com', 'hashed_password', 'ADMIN', NOW());
```

### Method 3: Using Backend API

After starting the application, use the admin endpoint:

```bash
curl -X POST http://localhost:4000/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure_password"
  }'
```

## Admin Roles & Permissions

### ADMIN Role
- Full system access
- User management
- Market data configuration
- Model training
- System settings

### MODERATOR Role (Optional)
- User moderation
- Content review
- Support access

### USER Role
- Standard user features
- Watchlist management
- Prediction access

## Admin Panel Features

### User Management
- View all users
- Create/edit/delete users
- Assign roles
- View user activity

### Market Configuration
- Update stock symbols
- Configure data sources
- Manage API keys
- Set refresh intervals

### Monitoring
- System health dashboard
- Database performance
- API usage statistics
- Error tracking

### Maintenance
- Database cleanup
- Cache management
- Log archives
- Backup management

## Authentication

### Login
```bash
# Admin login endpoint
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}

# Response includes JWT token
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user-id",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

### Protected Routes

Admin routes are protected by middleware:
```typescript
// backend/src/middlewares/auth.ts
router.get('/admin/users', requireAuth, requireAdmin, controller)
```

## Environment Configuration

### Required Admin Settings

In `.env` or `docker-compose.yml`:
```
# Admin email for alerts
ADMIN_EMAIL=admin@example.com

# Session timeout (minutes)
SESSION_TIMEOUT=120

# Max failed login attempts
MAX_LOGIN_ATTEMPTS=5

# JWT secret
JWT_SECRET=your_secure_secret_here
```

## Security Best Practices

### Password Policy
- Minimum 12 characters
- Must include uppercase, lowercase, numbers, special chars
- Change password every 90 days
- Cannot reuse last 5 passwords

### Access Control
- Use strong JWT secrets
- Rotate secrets regularly
- Implement 2FA (if available)
- Monitor admin login attempts

### Data Protection
- Enable database encryption
- Use HTTPS in production
- Implement audit logging
- Regular security backups

## Admin Maintenance Tasks

### Daily
- Monitor system health
- Check error logs
- Verify backups

### Weekly
- Review user activity
- Update security logs
- Check model predictions

### Monthly
- Review system performance
- Update market data sources
- Audit user access
- Rotate API keys

### Quarterly
- Security audit
- Dependency updates
- Database optimization
- Disaster recovery test

## Troubleshooting

### Admin Account Locked
```bash
# Reset using database
docker-compose exec db psql -U postgres -d postgres

UPDATE "User" SET failed_login_attempts = 0 
WHERE email = 'admin@example.com';
```

### Lost Admin Password
```bash
# Reset password via API
POST /admin/reset-password
{
  "email": "admin@example.com",
  "token": "reset_token"
}
```

### Authentication Issues
- Check JWT_SECRET in environment
- Verify database connection
- Review auth middleware logs

## Support

Contact system administrator for:
- Access issues
- Account recovery
- Security concerns
- System maintenance
