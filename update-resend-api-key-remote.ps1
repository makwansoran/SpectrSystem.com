# Script to update Resend API key on remote AWS server
# Usage: .\update-resend-api-key-remote.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey,
    
    [Parameter(Mandatory=$false)]
    [string]$ResendApiKey = "re_ApHf5BBN_BxLoM4F25weAxwG1AKbv4AHw"
)

Write-Host "🔑 Updating Resend API Key on Server..." -ForegroundColor Cyan
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
        if (Test-Path $keyPath) {
            $foundKey = $keyPath
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
Write-Host "📋 Configuration:" -ForegroundColor Cyan
Write-Host "  Server: $ServerIP" -ForegroundColor Gray
Write-Host "  SSH Key: $SSHKey" -ForegroundColor Gray
Write-Host "  Resend API Key: $($ResendApiKey.Substring(0, 10))..." -ForegroundColor Gray
Write-Host ""

# Create temporary script to run on server
$remoteScript = @"
#!/bin/bash
cd ~/chainCommands/backend || cd backend || { echo "Error: Could not find backend directory"; exit 1; }

echo "🔑 Updating Resend API Key..."

# Remove old Resend variables if they exist
if [ -f ".env" ]; then
    sed -i '/^RESEND_API_KEY=/d' .env
    sed -i '/^RESEND_FROM=/d' .env
    echo "✓ Removed old Resend variables"
fi

# Add new Resend variables
echo "RESEND_API_KEY=$ResendApiKey" >> .env
echo "RESEND_FROM=noreply@spectrsystem.com" >> .env

# Add FRONTEND_URL if not present
if ! grep -q "^FRONTEND_URL=" .env; then
    echo "FRONTEND_URL=https://spectrsystem.com" >> .env
fi

echo "✓ Added Resend configuration"
echo ""
echo "📋 Updated .env file:"
grep -E "RESEND_|FRONTEND_URL" .env || echo "  (No Resend variables found)"

echo ""
echo "🔄 Restarting backend..."
pm2 restart spectr-backend

echo ""
echo "✅ Resend API key updated and backend restarted!"
echo ""
echo "Checking logs..."
pm2 logs spectr-backend --lines 10 --nostream | grep -i "email\|resend" || echo "  (No email-related logs found)"
"@

# Save script to temporary file
$tempScript = [System.IO.Path]::GetTempFileName()
$remoteScript | Out-File -FilePath $tempScript -Encoding ASCII

Write-Host "🚀 Connecting to server and updating configuration..." -ForegroundColor Green
Write-Host ""

# Copy script to server and execute
$sshCommand = "scp -i `"$SSHKey`" -o StrictHostKeyChecking=no `"$tempScript`" ec2-user@${ServerIP}:/tmp/update-resend.sh"
Invoke-Expression $sshCommand

if ($LASTEXITCODE -eq 0) {
    $remoteCommand = "ssh -i `"$SSHKey`" -o StrictHostKeyChecking=no ec2-user@${ServerIP} 'chmod +x /tmp/update-resend.sh && bash /tmp/update-resend.sh'"
    Invoke-Expression $remoteCommand
} else {
    Write-Host "❌ Failed to copy script to server" -ForegroundColor Red
    exit 1
}

# Clean up
Remove-Item $tempScript -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✅ Done! Resend API key has been updated on the server." -ForegroundColor Green
Write-Host ""
Write-Host "📧 Test email sending by:" -ForegroundColor Cyan
Write-Host "  1. Sign up a new user" -ForegroundColor White
Write-Host "  2. Check that verification email is received" -ForegroundColor White
Write-Host "  3. Verify email has white background with black text" -ForegroundColor White

