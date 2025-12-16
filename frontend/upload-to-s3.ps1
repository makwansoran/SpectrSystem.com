# Upload frontend files to S3 with correct content types
Import-Module AWS.Tools.S3

$bucketName = "spectr-systems-frontend"
$region = "eu-north-1"
$distPath = Join-Path $PSScriptRoot "dist"

if (-not (Test-Path $distPath)) {
    Write-Host "Error: dist folder not found at $distPath" -ForegroundColor Red
    exit 1
}

Write-Host "Uploading files to S3 bucket: $bucketName" -ForegroundColor Green

# Function to upload file with content type
function Upload-File {
    param(
        [string]$FilePath,
        [string]$S3Key,
        [string]$ContentType
    )
    
    try {
        Write-S3Object -BucketName $bucketName -Key $S3Key -File $FilePath -ContentType $ContentType -ServerSideEncryption "AES256" -Region $region
        Write-Host "  ✓ $S3Key ($ContentType)" -ForegroundColor Gray
    } catch {
        Write-Host "  ✗ Failed to upload $S3Key : $_" -ForegroundColor Red
    }
}

# Get all files
$files = Get-ChildItem -Path $distPath -Recurse -File

Write-Host "Found $($files.Count) files to upload" -ForegroundColor Cyan

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace((Resolve-Path $distPath).Path + "\", "").Replace("\", "/")
    $extension = $file.Extension.ToLower()
    
    switch ($extension) {
        ".html" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "text/html" }
        ".js" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "application/javascript" }
        ".css" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "text/css" }
        ".json" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "application/json" }
        ".png" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "image/png" }
        ".jpg" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "image/jpeg" }
        ".jpeg" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "image/jpeg" }
        ".svg" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "image/svg+xml" }
        ".ico" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "image/x-icon" }
        ".woff" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "font/woff" }
        ".woff2" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "font/woff2" }
        ".ttf" { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "font/ttf" }
        default { Upload-File -FilePath $file.FullName -S3Key $relativePath -ContentType "application/octet-stream" }
    }
}

Write-Host "`nUpload complete! Invalidating CloudFront cache..." -ForegroundColor Green
Write-Host "Please go to CloudFront console and create an invalidation for '/*'" -ForegroundColor Yellow

