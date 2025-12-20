# Set Admin Role for User
# This script will set a user's role to 'admin' in the database

param(
    [Parameter(Mandatory=$true)]
    [string]$UserEmail,
    
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "51.20.122.184",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user",
    
    [Parameter(Mandatory=$false)]
    [string]$ServerPath = "~/SpectrSystem.com"
)

Write-Host "Setting user role to 'admin'..." -ForegroundColor Green
Write-Host "User Email: $UserEmail" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $SSHKey)) {
    Write-Host "SSH key not found: $SSHKey" -ForegroundColor Red
    exit 1
}

$command = @"
cd $ServerPath/backend
source .env 2>/dev/null || true
if [ -f .env ]; then
    export `$(grep -v '^#' .env | grep '=' | xargs)
fi

# Check database type
DB_TYPE=`${DB_TYPE:-sqlite}
DB_TYPE=`$(echo `$DB_TYPE | tr '[:upper:]' '[:lower:]')

if [ `"`$DB_TYPE`" = `"postgresql`" ] || [ -n `"`$DB_HOST`" ]; then
    echo 'Using PostgreSQL...'
    export PGPASSWORD=`${DB_PASSWORD}
    psql -h `${DB_HOST} -p `${DB_PORT:-5432} -U `${DB_USER} -d `${DB_NAME} -c "UPDATE users SET role = 'admin', updated_at = NOW() WHERE email = '$UserEmail'; SELECT id, email, name, role FROM users WHERE email = '$UserEmail';"
else
    echo 'Using SQLite...'
    node -e "
    const Database = require('better-sqlite3');
    const db = new Database('./data/spectr-systems.db');
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE email = ?').get('$UserEmail');
    if (!user) {
        console.log('❌ User not found with email: $UserEmail');
        process.exit(1);
    }
    console.log('Current user info:');
    console.log('  ID: ' + user.id);
    console.log('  Email: ' + user.email);
    console.log('  Name: ' + user.name);
    console.log('  Current Role: ' + (user.role || 'user'));
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE email = ?').run('admin', now, '$UserEmail');
    console.log('');
    console.log('✅ User role updated to: admin');
    "
fi
"@

Write-Host "Connecting to server and updating role..." -ForegroundColor Yellow
ssh -i $SSHKey $User@${ServerIP} $command

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Role updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Refresh your browser (or log out and log back in)" -ForegroundColor Gray
    Write-Host "  2. The Admin button should now appear in the sidebar" -ForegroundColor Gray
    Write-Host "  3. Visit: https://spectrsystem.com/admin" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ Failed to update role. Check the error above." -ForegroundColor Red
}

