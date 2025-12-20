# Clear All Users from AWS Database via SSH
# This script will SSH into your AWS server and run the clear users script

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP = "51.20.122.184",
    
    [Parameter(Mandatory=$false)]
    [string]$SSHKey = "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem",
    
    [Parameter(Mandatory=$false)]
    [string]$User = "ec2-user"
)

Write-Host "🗑️  Clear All Users from AWS Database" -ForegroundColor Red
Write-Host "⚠️  WARNING: This will delete ALL users and related data!" -ForegroundColor Yellow
Write-Host ""

# Validate SSH key exists
if (-not (Test-Path $SSHKey)) {
    Write-Host "❌ SSH key file not found: $SSHKey" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please provide the correct path to your SSH key file." -ForegroundColor Yellow
    exit 1
}

Write-Host "📡 Connecting to server: $ServerIP" -ForegroundColor Cyan
Write-Host "   Using SSH key: $SSHKey" -ForegroundColor Gray
Write-Host ""

# Command to run on the server
$remoteCommand = @"
cd ~/SpectrSystem.com/backend
if [ -f scripts/clear-all-users-postgresql.js ]; then
    echo "✅ Found clear-all-users-postgresql.js script"
    node scripts/clear-all-users-postgresql.js
elif [ -f scripts/clear-aws-users.js ]; then
    echo "✅ Found clear-aws-users.js script"
    node scripts/clear-aws-users.js
else
    echo "❌ Script not found. Creating it now..."
    cat > scripts/clear-all-users-postgresql.js << 'SCRIPT_EOF'
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

async function clearUsers() {
  try {
    await client.connect();
    console.log('📡 Connected to PostgreSQL\n');

    const userResult = await client.query('SELECT COUNT(*) as count FROM users');
    const orgResult = await client.query('SELECT COUNT(*) as count FROM organizations');
    const tokenResult = await client.query('SELECT COUNT(*) as count FROM email_verification_tokens');
    const resetTokenResult = await client.query('SELECT COUNT(*) as count FROM password_reset_tokens');

    const userCount = parseInt(userResult.rows[0].count);
    const orgCount = parseInt(orgResult.rows[0].count);
    const tokenCount = parseInt(tokenResult.rows[0].count);
    const resetTokenCount = parseInt(resetTokenResult.rows[0].count);

    console.log('Found:');
    console.log(\`  - \${userCount} users\`);
    console.log(\`  - \${orgCount} organizations\`);
    console.log(\`  - \${tokenCount} email verification tokens\`);
    console.log(\`  - \${resetTokenCount} password reset tokens\n\`);

    if (userCount === 0) {
      console.log('✅ No users to delete. Database is already empty.');
      await client.end();
      return;
    }

    await client.query('DELETE FROM password_reset_tokens');
    console.log('✅ Deleted password reset tokens');

    await client.query('DELETE FROM email_verification_tokens');
    console.log('✅ Deleted email verification tokens');

    await client.query('DELETE FROM user_organizations');
    console.log('✅ Deleted user-organization links');

    await client.query('DELETE FROM organizations');
    console.log('✅ Deleted organizations');

    await client.query('DELETE FROM users');
    console.log('✅ Deleted users');

    console.log('\n✅ All users and related data cleared successfully!');
    console.log('   You can now create a new account.');
  } catch (error) {
    console.error('❌ Error clearing data:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

clearUsers();
SCRIPT_EOF
    node scripts/clear-all-users-postgresql.js
fi
"@

$sshCommand = "ssh -i `"$SSHKey`" $User@${ServerIP} `"$remoteCommand`""

Write-Host "🚀 Running script on server..." -ForegroundColor Green
Write-Host ""

try {
    Invoke-Expression $sshCommand
    Write-Host ""
    Write-Host "✅ Done!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Error running script: $_" -ForegroundColor Red
    exit 1
}

