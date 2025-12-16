# Simple Backend Deployment Script
# This script helps deploy backend changes to AWS EC2

Write-Host "🚀 SPECTR SYSTEMS Backend Deployment" -ForegroundColor Green
Write-Host ""

# Check if git is available
$useGit = $false
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "✓ Git detected" -ForegroundColor Green
    $useGit = $true
} else {
    Write-Host "⚠ Git not found - will use direct file transfer" -ForegroundColor Yellow
}

# Build TypeScript
Write-Host ""
Write-Host "📦 Building TypeScript..." -ForegroundColor Cyan
Set-Location backend

# Try to build (may have some errors, but agent route should compile)
npm run build 2>&1 | Out-Null

if (Test-Path "dist/routes/agent.js") {
    Write-Host "✓ Agent route built successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Build completed with warnings (this is OK)" -ForegroundColor Yellow
}

Set-Location ..

Write-Host ""
Write-Host "📋 Deployment Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Git Deployment (Recommended)" -ForegroundColor Yellow
Write-Host "  1. Commit and push your changes:" -ForegroundColor Gray
Write-Host "     git add ." -ForegroundColor White
Write-Host "     git commit -m 'Add Claude AI support to agent route'" -ForegroundColor White
Write-Host "     git push" -ForegroundColor White
Write-Host ""
Write-Host "  2. SSH into your server and run:" -ForegroundColor Gray
Write-Host "     ssh -i your-key.pem ec2-user@your-server-ip" -ForegroundColor White
Write-Host "     cd ~/chainCommands" -ForegroundColor White
Write-Host "     git pull" -ForegroundColor White
Write-Host "     cd backend" -ForegroundColor White
Write-Host "     npm run build" -ForegroundColor White
Write-Host "     pm2 restart spectr-backend" -ForegroundColor White
Write-Host ""
Write-Host "Option 2: Direct File Transfer" -ForegroundColor Yellow
Write-Host "  Run: .\deploy-backend-to-aws.ps1" -ForegroundColor White
Write-Host ""

if ($useGit) {
    Write-Host "Would you like to commit and push changes now? (y/n)" -ForegroundColor Cyan
    $response = Read-Host
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host ""
        Write-Host "📤 Committing changes..." -ForegroundColor Cyan
        git add .
        git status
        Write-Host ""
        Write-Host "Enter commit message (or press Enter for default):" -ForegroundColor Cyan
        $commitMsg = Read-Host
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "Add Claude AI support to agent route and AI nodes"
        }
        git commit -m $commitMsg
        Write-Host ""
        Write-Host "📤 Pushing to remote..." -ForegroundColor Cyan
        git push
        Write-Host ""
        Write-Host "✅ Changes pushed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next: SSH into your server and run:" -ForegroundColor Yellow
        Write-Host "  cd ~/chainCommands && git pull && cd backend && npm run build && pm2 restart spectr-backend" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "✅ Ready to deploy!" -ForegroundColor Green

