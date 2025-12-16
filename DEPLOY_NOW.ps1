# Quick deployment with found credentials
# This uses the SSH key we found and tries to get server IP from DNS

$SSH_KEY = "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem"
$API_KEY = "YOUR_ANTHROPIC_API_KEY_HERE"

Write-Host "🔍 Finding server IP from DNS..." -ForegroundColor Cyan
try {
    $dnsResult = Resolve-DnsName -Name "spectrsystem.com" -Type A -ErrorAction Stop
    $SERVER_IP = $dnsResult[0].IPAddress
    Write-Host "✓ Found server IP: $SERVER_IP" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not resolve DNS. You'll need to provide the server IP manually." -ForegroundColor Red
    Write-Host ""
    Write-Host "To find your server IP:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://console.aws.amazon.com/ec2" -ForegroundColor White
    Write-Host "  2. Click 'Instances' in the left sidebar" -ForegroundColor White
    Write-Host "  3. Find your instance and copy the 'Public IPv4 address'" -ForegroundColor White
    Write-Host ""
    $SERVER_IP = Read-Host "Enter your EC2 server IP or hostname"
}

if (-not (Test-Path $SSH_KEY)) {
    Write-Host "❌ SSH key not found at: $SSH_KEY" -ForegroundColor Red
    Write-Host ""
    Write-Host "Found these .pem files:" -ForegroundColor Yellow
    Get-ChildItem -Path $HOME -Filter "*.pem" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName | Format-Table
    $SSH_KEY = Read-Host "Enter the full path to your SSH key (.pem file)"
}

Write-Host ""
Write-Host "🚀 Starting deployment..." -ForegroundColor Green
Write-Host "  Server: $SERVER_IP" -ForegroundColor Gray
Write-Host "  SSH Key: $SSH_KEY" -ForegroundColor Gray
Write-Host ""

# Run the deployment
.\deploy-all-to-aws.ps1 -ApiKey $API_KEY -ServerIP $SERVER_IP -SSHKey $SSH_KEY

