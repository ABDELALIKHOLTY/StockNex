#!/bin/bash

# Script pour créer un utilisateur admin
# Usage: bash create-admin.sh

# Configuration
BACKEND_URL="http://localhost:4000"
ADMIN_SECRET="admin123"  # Changez ceci en production!

# Credentials
ADMIN_EMAIL="admin@stocknex.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="Admin@123456"

echo "🔐 Création d'un utilisateur admin..."
echo "Email: $ADMIN_EMAIL"
echo "Username: $ADMIN_USERNAME"
echo ""

# Appel API pour créer l'admin
RESPONSE=$(curl -X POST "$BACKEND_URL/admin/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"username\": \"$ADMIN_USERNAME\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"adminSecret\": \"$ADMIN_SECRET\"
  }")

echo "Réponse du serveur:"
echo "$RESPONSE" | jq '.'

echo ""
echo "✅ Admin créé avec succès!"
echo ""
echo "Vous pouvez maintenant vous connecter avec:"
echo "Email: $ADMIN_EMAIL"
echo "Password: $ADMIN_PASSWORD"
