# Admin User Setup & Configuration Guide

## Overview

This document provides a complete guide to creating, configuring, and managing admin users in StockNex. It covers the fastest methods to get your first admin account running, alongside detailed permissions, security best practices, and maintenance protocols.

---

## 1. Prerequisites

Before setting up an admin user, ensure your environment is ready:

* Docker & Docker Compose installed.
* StockNex services running (`docker-compose up -d`).
* Database migrated and accessible.

---

## 2. Creating the First Admin User

You can create your initial admin account using one of the three methods below.

### Method A: Automated Scripts (Recommended)

This is the fastest method. Choose the script for your environment:

* **Windows PowerShell:**
```powershell
.\frontend\create-admin.ps1

```


* **Linux/macOS Bash:**
```bash
chmod +x ./frontend/create-admin.sh
bash ./frontend/create-admin.sh

```


* **Node.js Script:**
```bash
docker-compose exec backend node ./create-admin.js

```



*These scripts will prompt you for an email and password, create the user in the database, and confirm success.*

### Method B: Backend API

If your application services are already running, you can hit the admin creation endpoint directly:

```bash
curl -X POST http://localhost:4000/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourSecurePassword123!"
  }'

```

**Expected Response:**

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}

```

### Method C: Manual Database Setup

If scripts or API methods fail, you can manually insert the user into the database.

1. **Connect to PostgreSQL:**
```bash
docker-compose exec db psql -U postgres -d postgres

```


2. **Run the Creation Query:**
```sql
INSERT INTO "User" (email, password, "role", "createdAt", "updatedAt") 
VALUES (
  'admin@example.com', 
  'hashed_password', -- Ensure this is properly hashed if required by your ORM
  'ADMIN', 
  NOW(), 
  NOW()
);

```


3. **Verify & Exit:**
```sql
SELECT id, email, "role" FROM "User" WHERE "role" = 'ADMIN';
\q

```



> **⚠️ IMPORTANT:** If you used automated scripts with default credentials (`admin@example.com` / `AdminPassword123!`), **change them immediately** in production!

---

## 3. Login & Authentication

### Accessing the Admin Panel via Frontend

1. Navigate to `http://localhost:3000` in your browser.
2. Sign in using your admin email and password.
3. Click on **"Admin"** in the user dropdown menu to access the panel.

### Authentication API & Protected Routes

When logging in via the API, the system returns a JWT token:

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "YourSecurePassword123!"
}

```

Admin routes are protected by middleware to ensure only authorized personnel can access them:

```typescript
// backend/src/middlewares/auth.ts
router.get('/admin/users', requireAuth, requireAdmin, controller)

```

---

## 4. Admin Roles & Panel Features

### Roles & Permissions

* **ADMIN:** Full system access, user management, market data configuration, model training, and system settings.
* **MODERATOR (Optional):** User moderation, content review, and support access.
* **USER:** Standard user features, watchlist management, and prediction access.

### Admin Panel Capabilities

* **User Management:** View, create, edit, or delete users; assign roles; monitor user activity.
* **Market Configuration:** Update stock symbols, configure data sources, manage API keys, and set refresh intervals.
* **Monitoring:** Access the system health dashboard, database performance, API usage stats, and error tracking.
* **Maintenance:** Perform database cleanup, cache management, log archives, and backup management.

---

## 5. Environment & Security Configuration

Ensure the following variables are securely set in your `.env` or `docker-compose.yml`:

```env
# Admin & Auth Settings
ADMIN_EMAIL=admin@example.com
SESSION_TIMEOUT=120
MAX_LOGIN_ATTEMPTS=5
JWT_SECRET=Ali@Yassir$StockNex#Prediction2025!Gi-ilsi-Info*Secure

```

### Security Best Practices

* **Password Policy:** Minimum 12 characters (uppercase, lowercase, numbers, special chars). Change every 90 days; no reuse of the last 5 passwords.
* **Access Control:** Use strong, regularly rotated JWT secrets. Implement 2FA and strictly monitor admin login attempts.
* **Data Protection:** Enable database encryption, mandate HTTPS in production, implement audit logging, and perform regular security backups. Never commit credentials to git.

---

## 6. Maintenance Schedule

* **Daily:** Monitor system health, check error logs, verify backups.
* **Weekly:** Review user activity, update security logs, check model predictions.
* **Monthly:** Review system performance, update market data sources, audit user access, rotate API keys.
* **Quarterly:** Conduct a full security audit, update dependencies, optimize the database, and run disaster recovery tests.

---

## 7. Troubleshooting

| Issue | Solution |
| --- | --- |
| **"User already exists"** | Clear existing users: `docker-compose exec db psql -U postgres -d postgres -c "DELETE FROM \"User\" WHERE email = 'admin@example.com';"` |
| **"Database connection failed"** | Verify the database container is running: `docker-compose ps`. If not, run `docker-compose up -d`. |
| **"Permission denied" on scripts** | Run `chmod +x ./frontend/create-admin.sh` (or `.ps1`) before executing. |
| **Admin Account Locked** | Reset attempts via DB: `UPDATE "User" SET failed_login_attempts = 0 WHERE email = 'admin@example.com';` |
| **Lost Admin Password** | Reset via API: `POST /admin/reset-password` with your email and reset token. |
| **Authentication Issues** | Check `JWT_SECRET` in `.env`, verify DB connection, and review auth middleware logs. |

---

## Support & Next Steps

1. ✅ **Admin account created.**
2. Change default passwords and set up 2FA (if available).
3. Configure your market data sources in the Admin Panel.

If you encounter persistent issues, review the Docker logs (`docker-compose logs backend`), verify the database status (`docker-compose exec db psql -U postgres -l`), or refer to the main `DOCUMENTATION.md`.
