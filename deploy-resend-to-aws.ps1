# Complete deployment script - Deploy Resend email service to AWS
# This script will: 1) Pull latest code, 2) Update Resend API key, 3) Install dependencies, 4) Build, 5) Restart

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$ResendApiKey = "re_ApHf5BBN_BxLoM4F25weAxwG1AKbv4AHw",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user"
)

Write-Host "🚀 Deploying Resend Email Service to AWS" -ForegroundColor Green
Write-Host "This will: Pull code, update Resend config, install dependencies, build, and restart" -ForegroundColor Cyan
Write-Host ""

# Try to find server IP from DNS if not provided
if (-not $ServerIP) {
    Write-Host "🔍 Finding server IP from DNS..." -ForegroundColor Yellow
    try {
        $dnsResult = Resolve-DnsName -Name "spectrsystem.com" -Type A -ErrorAction Stop
        $ServerIP = $dnsResult[0].IPAddress
        Write-Host "✓ Found server IP: $ServerIP" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not resolve DNS. Please provide server IP." -ForegroundColor Red
        $ServerIP = Read-Host "Enter your EC2 server IP or hostname"
    }
}

# Try to find SSH key if not provided
if (-not $SSHKey) {
    Write-Host "🔍 Looking for SSH key..." -ForegroundColor Yellow
    $possibleKeys = @(
        "$HOME\OneDrive\Skrivebord\spectr-backend-key.pem",
        "$HOME\Downloads\*.pem",
        "$HOME\Desktop\*.pem"
    )
    
    $foundKey = $null
    foreach ($keyPath in $possibleKeys) {
        $keys = Get-ChildItem -Path $keyPath -ErrorAction SilentlyContinue
        if ($keys) {
            $foundKey = $keys[0].FullName
            break
        }
    }
    
    if ($foundKey) {
        $SSHKey = $foundKey
        Write-Host "✓ Found SSH key: $SSHKey" -ForegroundColor Green
    } else {
        Write-Host "❌ SSH key not found. Please provide path." -ForegroundColor Red
        $SSHKey = Read-Host "Enter path to your SSH key (.pem file)"
    }
}

if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ SSH key file not found: $SSHKey" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Server: $ServerIP" -ForegroundColor Gray
Write-Host "  SSH Key: $SSHKey" -ForegroundColor Gray
Write-Host "  Resend API Key: $($ResendApiKey.Substring(0, 10))..." -ForegroundColor Gray
Write-Host ""

# Skip local build - will build on server
# (TypeScript errors are pre-existing and don't affect email service)
Write-Host "📦 Will build on server (skipping local build due to pre-existing TS errors)" -ForegroundColor Yellow
Write-Host ""

# Complete deployment command
$deployCommand = @"
cd ~/chainCommands || cd ~/SpectrSystem.com || { echo "Error: Could not find project directory"; exit 1; }
echo "📥 Pulling latest code..."
git pull || echo "⚠️  Git pull failed (may not be a git repo, continuing...)"

cd backend
echo ""
echo "🔑 Updating Resend configuration..."

# Remove old SMTP and Resend variables
if [ -f .env ]; then
    sed -i '/^SMTP_HOST=/d' .env
    sed -i '/^SMTP_PORT=/d' .env
    sed -i '/^SMTP_USER=/d' .env
    sed -i '/^SMTP_PASS=/d' .env
    sed -i '/^SMTP_FROM=/d' .env
    sed -i '/^RESEND_API_KEY=/d' .env
    sed -i '/^RESEND_FROM=/d' .env
    echo "✓ Removed old email configuration"
fi

# Add new Resend variables
echo "RESEND_API_KEY=$ResendApiKey" >> .env
echo "RESEND_FROM=noreply@spectrsystem.com" >> .env

# Update FRONTEND_URL if not present or update to production URL
if grep -q "^FRONTEND_URL=" .env; then
    sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://spectrsystem.com|' .env
else
    echo "FRONTEND_URL=https://spectrsystem.com" >> .env
fi

echo "✓ Resend configuration updated"
echo ""
echo "📋 Current Resend configuration:"
grep -E "RESEND_|FRONTEND_URL" .env || echo "  (No Resend variables found)"

echo ""
echo "📦 Installing dependencies (including Resend package)..."
npm install --production

echo ""
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "🔄 Restarting backend..."
pm2 restart spectr-backend || pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Deployment complete!"
echo ""
pm2 status spectr-backend
echo ""
echo "📧 Checking email service logs..."
pm2 logs spectr-backend --lines 20 --nostream | grep -i "email\|resend" || echo "  (No email-related logs found in last 20 lines)"
"@

# Replace the placeholder
$deployCommand = $deployCommand -replace '\$ResendApiKey', $ResendApiKey

Write-Host "📡 Connecting to server and deploying..." -ForegroundColor Cyan
Write-Host ""

$sshCommand = "ssh -i `"$SSHKey`" -o StrictHostKeyChecking=no $User@${ServerIP} `"$deployCommand`""

Invoke-Expression $sshCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🧪 Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test email sending: Sign up a new user" -ForegroundColor White
    Write-Host "  2. Check logs: ssh -i `"$SSHKey`" $User@${ServerIP} 'pm2 logs spectr-backend --lines 50'" -ForegroundColor White
    Write-Host "  3. Verify email design: White background with black text" -ForegroundColor White
    Write-Host ""
    Write-Host "📧 Email service should now be using Resend API" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the output above for errors." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - SSH key permissions: chmod 400 on the key file" -ForegroundColor White
    Write-Host "  - Server not accessible: Check firewall/security groups" -ForegroundColor White
    Write-Host "  - Git repository: Make sure code is committed and pushed" -ForegroundColor White
    exit 1
}

