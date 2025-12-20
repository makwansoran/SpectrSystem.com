# Deploy All Changes to AWS
# This will deploy backend and frontend changes to AWS

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "51.20.122.184",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user"
)

Write-Host "🚀 Deploying All Changes to AWS" -ForegroundColor Green
Write-Host ""

# Validate SSH key
if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ SSH key file not found: $SSHKey" -ForegroundColor Red
    exit 1
}

Write-Host "📡 Server: $ServerIP" -ForegroundColor Cyan
Write-Host "🔑 SSH Key: $SSHKey" -ForegroundColor Cyan
Write-Host ""

# Skip local build - we'll build on the server
Write-Host "ℹ️  Skipping local build - will build on server" -ForegroundColor Yellow
Write-Host ""

# Deployment command
$deployCommand = @"
cd ~/SpectrSystem.com
echo "📥 Pulling latest code from git..."
git pull || echo "⚠️  Git pull failed or not a git repo, continuing with file transfer..."

echo ""
echo "📤 Uploading backend files..."
"@

# Upload backend source files
Write-Host "📤 Uploading backend source files..." -ForegroundColor Yellow
$backendFiles = @(
    "backend/src/routes/auth.ts",
    "backend/src/routes/workflows.ts",
    "backend/src/database/postgresql.ts",
    "backend/src/database/sqlite.ts",
    "backend/src/database/index.ts",
    "backend/scripts/migrate-workflows-to-organization.js"
)

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        if ($file -like "*.ts") {
            $targetPath = $file -replace "backend/src/", "~/SpectrSystem.com/backend/src/"
            Write-Host "  Uploading $file..." -ForegroundColor Gray
            $scpCmd = "scp -i `"$SSHKey`" `"$file`" $User@${ServerIP}:$targetPath"
            Invoke-Expression $scpCmd
        } elseif ($file -like "*.js") {
            $targetPath = $file -replace "backend/", "~/SpectrSystem.com/backend/"
            Write-Host "  Uploading $file..." -ForegroundColor Gray
            $scpCmd = "scp -i `"$SSHKey`" `"$file`" $User@${ServerIP}:$targetPath"
            Invoke-Expression $scpCmd
        }
    }
}

# Upload frontend files
Write-Host ""
Write-Host "📤 Uploading frontend files..." -ForegroundColor Yellow
$frontendFiles = @(
    "frontend/src/pages/SelectPlanPage.tsx",
    "frontend/src/pages/VerifyEmailPage.tsx",
    "frontend/src/services/api.ts"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        $targetPath = $file -replace "frontend/", "~/SpectrSystem.com/frontend/"
        Write-Host "  Uploading $file..." -ForegroundColor Gray
        $scpCmd = "scp -i `"$SSHKey`" `"$file`" $User@${ServerIP}:$targetPath"
        Invoke-Expression $scpCmd
    }
}

# Build and restart on server
Write-Host ""
Write-Host "🔄 Building and restarting on server..." -ForegroundColor Yellow

$buildCommand = "cd ~/SpectrSystem.com/backend && echo '📦 Installing dependencies...' && npm install --production && echo '' && echo '🔄 Running workflow organization migration...' && node scripts/migrate-workflows-to-organization.js && echo '' && echo '🔨 Building TypeScript...' && npm run build && echo '' && echo '🔄 Restarting backend...' && pm2 restart spectr-backend || pm2 start ecosystem.config.js && echo '' && echo '✅ Deployment complete!' && pm2 status spectr-backend"

$sshCommand = "ssh -i `"$SSHKey`" $User@${ServerIP} `"$buildCommand`""
Invoke-Expression $sshCommand

Write-Host ""
Write-Host "✅ All changes deployed to AWS!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployed changes:" -ForegroundColor Cyan
Write-Host "  ✅ Email verification fixes (auth.ts)" -ForegroundColor White
Write-Host "  ✅ PostgreSQL password reset fix" -ForegroundColor White
Write-Host "  ✅ Select Plan page (light theme)" -ForegroundColor White
Write-Host "  ✅ Verify Email page (light theme)" -ForegroundColor White
Write-Host "  ✅ User-specific workflows (organization isolation)" -ForegroundColor White
Write-Host "  ✅ Workflow authentication middleware" -ForegroundColor White
Write-Host "  ✅ Frontend API authentication interceptor" -ForegroundColor White
Write-Host "  ✅ Workflow organization migration" -ForegroundColor White

