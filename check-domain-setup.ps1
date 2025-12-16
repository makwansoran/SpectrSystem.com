# Domain Setup Verification Script for spectrsystem.com
# Run this script to check if your domain is configured correctly

Write-Host "Checking spectrsystem.com Domain Configuration..." -ForegroundColor Cyan
Write-Host ""

# Check DNS Resolution
Write-Host "1. Checking DNS Resolution..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName -Name "spectrsystem.com" -Type A -ErrorAction Stop
    Write-Host "   [OK] DNS resolves to: $($dnsResult[0].IPAddress)" -ForegroundColor Green
    Write-Host "   Name: $($dnsResult[0].Name)" -ForegroundColor Gray
} catch {
    Write-Host "   [FAIL] DNS resolution failed: $_" -ForegroundColor Red
    Write-Host "   [WARN] DNS may not be configured or not propagated yet" -ForegroundColor Yellow
}

Write-Host ""

# Check HTTPS Connection
Write-Host "2. Checking HTTPS Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://spectrsystem.com" -Method Head -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   [OK] HTTPS connection successful" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   SSL Certificate: Valid" -ForegroundColor Green
} catch {
    Write-Host "   [FAIL] HTTPS connection failed: $_" -ForegroundColor Red
    if ($_.Exception.Message -like "*SSL*" -or $_.Exception.Message -like "*certificate*") {
        Write-Host "   [WARN] SSL Certificate issue detected" -ForegroundColor Yellow
        Write-Host "   [TIP] Check: AWS Certificate Manager (ACM) - certificate must be Issued" -ForegroundColor Cyan
    } elseif ($_.Exception.Message -like "*resolve*" -or $_.Exception.Message -like "*DNS*") {
        Write-Host "   [WARN] DNS resolution issue" -ForegroundColor Yellow
    } else {
        Write-Host "   [WARN] Connection issue - check CloudFront distribution status" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check HTTP Redirect
Write-Host "3. Checking HTTP to HTTPS Redirect..." -ForegroundColor Yellow
try {
    $httpResponse = Invoke-WebRequest -Uri "http://spectrsystem.com" -Method Head -MaximumRedirection 0 -ErrorAction Stop
} catch {
    if ($_.Exception.Response.StatusCode -eq 301 -or $_.Exception.Response.StatusCode -eq 302) {
        Write-Host "   [OK] HTTP redirects to HTTPS" -ForegroundColor Green
    } else {
        Write-Host "   [WARN] HTTP redirect may not be working: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Check API Endpoint
Write-Host "4. Checking Backend API..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "https://spectrsystem.com/api/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
    $apiData = $apiResponse.Content | ConvertFrom-Json
    if ($apiData.success) {
        Write-Host "   [OK] Backend API is responding" -ForegroundColor Green
        Write-Host "   Message: $($apiData.message)" -ForegroundColor Gray
    } else {
        Write-Host "   [WARN] Backend API returned: $($apiData.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [FAIL] Backend API not accessible: $_" -ForegroundColor Red
    Write-Host "   [TIP] Check:" -ForegroundColor Cyan
    Write-Host "      - Backend is running on EC2 (pm2 status)" -ForegroundColor Gray
    Write-Host "      - Nginx is configured correctly" -ForegroundColor Gray
    Write-Host "      - CORS_ORIGIN in backend .env matches domain" -ForegroundColor Gray
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Gray
Write-Host ""

# Recommendations
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "If DNS is not resolving:" -ForegroundColor Yellow
Write-Host "  1. Check DNS records at your domain registrar" -ForegroundColor White
Write-Host "  2. Verify A/CNAME record points to CloudFront distribution" -ForegroundColor White
Write-Host "  3. Check DNS propagation: https://dnschecker.org/#A/spectrsystem.com" -ForegroundColor White
Write-Host ""
Write-Host "If HTTPS fails:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://console.aws.amazon.com/acm/home?region=us-east-1" -ForegroundColor White
Write-Host "  2. Verify certificate status is Issued" -ForegroundColor White
Write-Host "  3. Check CloudFront has certificate attached" -ForegroundColor White
Write-Host ""
Write-Host "If API fails:" -ForegroundColor Yellow
Write-Host "  1. SSH into EC2 and check: pm2 status" -ForegroundColor White
Write-Host "  2. Verify backend .env has: FRONTEND_URL=https://spectrsystem.com" -ForegroundColor White
Write-Host "  3. Restart backend: pm2 restart spectr-backend" -ForegroundColor White
Write-Host ""
Write-Host "For detailed troubleshooting, see: DOMAIN_TROUBLESHOOTING.md" -ForegroundColor Cyan
Write-Host ""
