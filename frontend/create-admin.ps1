# Script PowerShell pour créer un utilisateur admin
# Usage: .\create-admin.ps1

# Configuration
$BACKEND_URL = "http://localhost:4000"
$ADMIN_SECRET = "admin123"  # Changez ceci en production!

# Credentials
$ADMIN_EMAIL = "admin@stocknex.com"
$ADMIN_USERNAME = "admin"
$ADMIN_PASSWORD = "Admin@123456"

Write-Host "🔐 Création d'un utilisateur admin..." -ForegroundColor Cyan
Write-Host "Email: $ADMIN_EMAIL" -ForegroundColor Yellow
Write-Host "Username: $ADMIN_USERNAME" -ForegroundColor Yellow
Write-Host ""

# Préparer le payload JSON
$payload = @{
    email = $ADMIN_EMAIL
    username = $ADMIN_USERNAME
    password = $ADMIN_PASSWORD
    adminSecret = $ADMIN_SECRET
} | ConvertTo-Json

Write-Host "Envoi de la requête..." -ForegroundColor Gray

# Appel API pour créer l'admin
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/admin/create" `
        -Method POST `
        -Headers @{ "Content-Type" = "application/json" } `
        -Body $payload `
        -ErrorAction Stop

    Write-Host "✅ Admin créé avec succès!" -ForegroundColor Green
    Write-Host ""
    
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "Réponse du serveur:" -ForegroundColor Yellow
    Write-Host ($responseData | ConvertTo-Json -Depth 3)
    
    Write-Host ""
    Write-Host "📝 Utilisateur créé:" -ForegroundColor Cyan
    Write-Host "Email: $($responseData.user.email)"
    Write-Host "Username: $($responseData.user.username)"
    Write-Host "Admin: $($responseData.user.isAdmin)"
    Write-Host ""
    Write-Host "🔑 Token JWT (à utiliser pour tester l'API):" -ForegroundColor Gray
    Write-Host $responseData.token
    Write-Host ""
    Write-Host "✅ Vous pouvez maintenant vous connecter avec:" -ForegroundColor Green
    Write-Host "  Email: $ADMIN_EMAIL"
    Write-Host "  Password: $ADMIN_PASSWORD"
    
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse.StatusCode.value__ -eq 403) {
        Write-Host "❌ Erreur 403: Admin secret invalide!" -ForegroundColor Red
        Write-Host "Vérifiez la variable ADMIN_SECRET" -ForegroundColor Red
    } else {
        Write-Host "❌ Erreur: $_" -ForegroundColor Red
        Write-Host "Réponse: $($_.Exception.Message)" -ForegroundColor Red
    }
    exit 1
}
