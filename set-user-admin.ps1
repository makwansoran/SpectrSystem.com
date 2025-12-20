# Set User as Admin
# This script sets a user's role to 'admin' in the database

param(
    [Parameter(Mandatory=$true)]
    [string]$UserEmail,
    
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "51.20.122.184",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem"
)

Write-Host "Setting user '$UserEmail' as admin..." -ForegroundColor Green
Write-Host ""

if (-not (Test-Path $SSHKey)) {
    Write-Host "SSH key not found: $SSHKey" -ForegroundColor Red
    exit 1
}

$command = @"
cd ~/SpectrSystem.com/backend
if [ -f .env ]; then
    source .env
fi

# Check if using PostgreSQL
if [ "\$DB_TYPE" = "postgresql" ]; then
    PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME -c "UPDATE users SET role = 'admin' WHERE email = '$UserEmail';"
    PGPASSWORD=\$DB_PASSWORD psql -h \$DB_HOST -U \$DB_USER -d \$DB_NAME -c "SELECT id, email, name, role FROM users WHERE email = '$UserEmail';"
else
    sqlite3 data/spectr-systems.db "UPDATE users SET role = 'admin' WHERE email = '$UserEmail';"
    sqlite3 data/spectr-systems.db "SELECT id, email, name, role FROM users WHERE email = '$UserEmail';"
fi

echo ""
echo "✅ User role updated to admin!"
"@

ssh -i $SSHKey ec2-user@${ServerIP} $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ User '$UserEmail' is now an admin!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Log out and log back in to refresh your user data" -ForegroundColor Gray
    Write-Host "  2. The admin button should appear in the sidebar" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Failed to update user role" -ForegroundColor Red
}

