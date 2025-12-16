# Quick Deploy Script - Fast deployment to AWS
# Run this after making changes to quickly deploy

Write-Host "Quick Deploy to AWS" -ForegroundColor Green
Write-Host ""

# Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Build
Write-Host "Building frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

# Deploy to S3
Write-Host "Uploading to S3..." -ForegroundColor Cyan
aws s3 sync dist/ s3://spectr-systems-frontend --delete

if ($LASTEXITCODE -ne 0) {
    Write-Host "S3 upload failed!" -ForegroundColor Red
    exit 1
}

# Set content type
Write-Host "Setting content types..." -ForegroundColor Cyan
aws s3 cp dist/index.html s3://spectr-systems-frontend/index.html --content-type "text/html" --cache-control "no-cache"

# Invalidate CloudFront
Write-Host "Invalidating CloudFront cache..." -ForegroundColor Cyan
aws cloudfront create-invalidation --distribution-id E2IVW7KLAT4UF8 --paths "/*" | Out-Null

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Wait 1-2 minutes for CloudFront to update, then hard refresh (Ctrl+Shift+R)" -ForegroundColor Yellow
