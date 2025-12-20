# Deploy Admin Page Only to AWS
# Deploys only the admin page changes (AdminPage.tsx, HomePage.tsx, Sidebar.tsx) to production
# Uses S3 + CloudFront for frontend deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$CloudFrontId = "E2IVW7KLAT4UF8",
    
    [Parameter(Mandatory=$false)]
    [string]$S3Bucket = "spectr-systems-frontend"
)

Write-Host "🚀 Deploying Admin Page Only to AWS" -ForegroundColor Green
Write-Host "This will deploy:" -ForegroundColor Cyan
Write-Host "  - AdminPage.tsx (updated theme)" -ForegroundColor Gray
Write-Host "  - HomePage.tsx (admin button in sidebar)" -ForegroundColor Gray
Write-Host "  - Sidebar.tsx (admin button)" -ForegroundColor Gray
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Error: frontend directory not found" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

# Navigate to frontend
Set-Location frontend

# Build frontend
Write-Host "📦 Building frontend..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Check if AWS CLI is available
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI not found. Please install AWS CLI first." -ForegroundColor Red
    Write-Host "Download from: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    Set-Location ..
    exit 1
}

# Upload to S3
Write-Host "📤 Uploading to S3 bucket: $S3Bucket..." -ForegroundColor Cyan

# Sync all files (with proper cache control)
Write-Host "  Syncing static assets..." -ForegroundColor Gray
aws s3 sync dist/ s3://$S3Bucket --delete --cache-control "public, max-age=31536000, immutable" --exclude "*.html" --exclude "*.json"

# Upload HTML files with no-cache
Write-Host "  Uploading HTML files..." -ForegroundColor Gray
aws s3 sync dist/ s3://$S3Bucket --delete --cache-control "no-cache, no-store, must-revalidate" --include "*.html"

# Upload index.html specifically
aws s3 cp dist/index.html s3://$S3Bucket/index.html --content-type "text/html" --cache-control "no-cache, no-store, must-revalidate"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ S3 upload failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Files uploaded to S3!" -ForegroundColor Green
Write-Host ""

# Invalidate CloudFront cache
Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Cyan
Write-Host "  Distribution ID: $CloudFrontId" -ForegroundColor Gray

$invalidation = aws cloudfront create-invalidation --distribution-id $CloudFrontId --paths "/*" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CloudFront cache invalidation started!" -ForegroundColor Green
} else {
    Write-Host "⚠️  CloudFront invalidation may have failed. Check the output above." -ForegroundColor Yellow
    Write-Host $invalidation -ForegroundColor Gray
}

Set-Location ..

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Wait 1-2 minutes for CloudFront to update" -ForegroundColor Gray
Write-Host "  2. Visit https://spectrsystem.com/admin" -ForegroundColor Gray
Write-Host "  3. Hard refresh (Ctrl+Shift+R) if you don't see changes" -ForegroundColor Gray
Write-Host ""
Write-Host "The admin page should now have the updated theme matching the rest of the site." -ForegroundColor Cyan

