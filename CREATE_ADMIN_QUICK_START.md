# Quick Start: Create Admin User

## Overview

This guide provides the fastest way to create the first admin user in StockNex.

## Prerequisites

- Docker & Docker Compose installed
- StockNex services running (`docker-compose up -d`)
- Database migrated

## Automated Script Method

### Option 1: Windows PowerShell

Run the provided PowerShell script:
```powershell
.\frontend\create-admin.ps1
```

The script will:
- Prompt for admin email
- Prompt for admin password
- Create admin user in database
- Confirm success

### Option 2: Linux/macOS Bash

Run the bash script:
```bash
bash ./frontend/create-admin.sh
```

### Option 3: Node.js Script

Run the JavaScript setup script:
```bash
docker-compose exec backend node ./create-admin.js
```

## Manual Quick Method

If scripts don't work, use this quick command:

### Step 1: Connect to Database
```bash
docker-compose exec db psql -U postgres -d postgres
```

### Step 2: Create User

Copy and paste in the psql prompt:
```sql
INSERT INTO "User" (email, password, "role", "createdAt", "updatedAt") 
VALUES (
  'admin@example.com', 
  'your_secure_password_here', 
  'ADMIN', 
  NOW(), 
  NOW()
);
```

### Step 3: Verify
```sql
SELECT id, email, "role" FROM "User" WHERE "role" = 'ADMIN';
```

You should see your admin user listed.

### Step 4: Exit psql
```sql
\q
```

## API Quick Create

### Step 1: Start Services
```bash
docker-compose up -d
```

### Step 2: Create Admin via API
```bash
curl -X POST http://localhost:4000/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "YourSecurePassword123!"
  }'
```

Expected response:
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

## Login & Access Admin Panel

### Step 1: Navigate to Frontend
Open browser and go to: `http://localhost:3000`

### Step 2: Sign In
- Email: `admin@example.com`
- Password: `your_secure_password`

### Step 3: Access Admin Panel
Click on "Admin" in the user dropdown menu.

## Default Admin Credentials

If using quick start with defaults:
- **Email**: `admin@example.com`
- **Password**: `AdminPassword123!`
- **Role**: `ADMIN`

⚠️ **IMPORTANT**: Change these credentials immediately in production!

## Troubleshooting

### "User already exists"
Clear existing users:
```bash
docker-compose exec db psql -U postgres -d postgres

DELETE FROM "User" WHERE email = 'admin@example.com';
```

### "Database connection failed"
Ensure database is running:
```bash
docker-compose ps
# Should show 'db' running
```

If not, start services:
```bash
docker-compose up -d
```

### "Permission denied" on scripts
Make script executable:
```bash
# Linux/macOS
chmod +x ./frontend/create-admin.sh
chmod +x ./frontend/create-admin.ps1

# Then run
bash ./frontend/create-admin.sh
```

### Script hangs or doesn't complete
Run manual SQL method above or use API method.

## Next Steps

1. ✅ Admin account created
2. Change default password (if using defaults)
3. Configure admin settings in `ADMIN_SETUP.md`
4. Set up 2FA (optional, if available)
5. Start using admin panel

## Security Reminders

- Change default password immediately
- Use strong, unique passwords
- Enable HTTPS in production
- Rotate credentials regularly
- Never commit credentials to git
- Use environment variables for secrets

## Support

If you encounter issues:
1. Check `DOCUMENTATION.md` for setup help
2. Review Docker logs: `docker-compose logs backend`
3. Verify database: `docker-compose exec db psql -U postgres -l`
4. Check environment variables are set correctly

---

✨ Admin user is now ready to use!
