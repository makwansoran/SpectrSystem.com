# Clear all users from AWS database by running script on the server
# This script will SSH into your AWS server and run the clear-aws-users.js script

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user"
)

Write-Host "🗑️  Clear All Users from AWS Database" -ForegroundColor Red
Write-Host "⚠️  WARNING: This will delete ALL users and related data!" -ForegroundColor Yellow
Write-Host ""

# Try to find server IP from DNS
if ([string]::IsNullOrEmpty($ServerIP)) {
    Write-Host "🔍 Finding server IP from DNS..." -ForegroundColor Cyan
    try {
        $dnsResult = Resolve-DnsName -Name "spectrsystem.com" -Type A -ErrorAction Stop
        $ServerIP = $dnsResult[0].IPAddress
        Write-Host "✓ Found server IP: $ServerIP" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not resolve DNS." -ForegroundColor Red
        $ServerIP = Read-Host "Enter your EC2 server IP or hostname"
    }
}

# Try to find SSH key
if ([string]::IsNullOrEmpty($SSHKey)) {
    $possibleKeys = @(
        "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem",
        "$HOME\Downloads\*.pem",
        "$HOME\Desktop\*.pem"
    )
    
    Write-Host "🔍 Looking for SSH key..." -ForegroundColor Cyan
    foreach ($keyPath in $possibleKeys) {
        if (Test-Path $keyPath) {
            $SSHKey = $keyPath
            Write-Host "✓ Found SSH key: $SSHKey" -ForegroundColor Green
            break
        }
    }
    
    if ([string]::IsNullOrEmpty($SSHKey)) {
        Write-Host "❌ SSH key not found automatically." -ForegroundColor Red
        Write-Host ""
        Write-Host "Found these .pem files:" -ForegroundColor Yellow
        Get-ChildItem -Path $HOME -Filter "*.pem" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName | Format-Table
        $SSHKey = Read-Host "Enter the full path to your SSH key (.pem file)"
    }
}

if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ SSH key file not found: $SSHKey" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📡 Connecting to server: $ServerIP" -ForegroundColor Yellow
Write-Host "   Using SSH key: $SSHKey" -ForegroundColor Gray
Write-Host ""

# First, upload the script to the server (in case it's not there)
Write-Host "📤 Uploading script to server..." -ForegroundColor Cyan
$uploadCommand = "scp -i `"$SSHKey`" backend\scripts\clear-aws-users.js ${User}@${ServerIP}:~/chainCommands/backend/scripts/clear-aws-users.js"
try {
    Invoke-Expression $uploadCommand
    Write-Host "✓ Script uploaded" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not upload script (might already exist on server)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Running script on server..." -ForegroundColor Green
Write-Host ""

# Command to run on the server
$remoteCommand = @"
cd ~/chainCommands/backend
if [ ! -f scripts/clear-aws-users.js ]; then
    echo "❌ Script not found. Please make sure it's uploaded."
    exit 1
fi
node scripts/clear-aws-users.js
"@

$sshCommand = "ssh -i `"$SSHKey`" $User@${ServerIP} `"$remoteCommand`""

try {
    Invoke-Expression $sshCommand
    Write-Host ""
    Write-Host "✅ Done!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Error running script: $_" -ForegroundColor Red
    exit 1
}

