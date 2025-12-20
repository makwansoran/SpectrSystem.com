# Clear All Users from Database via SSH

## Quick Usage

Run this PowerShell script to clear all users from your AWS database:

```powershell
.\clear-all-users-remote.ps1
```

## Script Details

**File:** `clear-all-users-remote.ps1`

**What it does:**
1. Connects to your AWS server via SSH
2. Navigates to the backend directory
3. Runs the clear users script
4. Shows you what was deleted

**Default Settings:**
- Server IP: `51.20.122.184`
- SSH Key: `C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem`
- User: `ec2-user`

## Custom Usage

If you need to use different settings:

```powershell
.\clear-all-users-remote.ps1 `
  -ServerIP "your-server-ip" `
  -SSHKey "C:\path\to\your-key.pem" `
  -User "ec2-user"
```

## What Gets Deleted

The script will remove:
- ✅ All users
- ✅ All organizations
- ✅ All email verification tokens
- ✅ All password reset tokens
- ✅ All user-organization links

## Example Output

```
🗑️  Clear All Users from AWS Database
⚠️  WARNING: This will delete ALL users and related data!

📡 Connecting to server: 51.20.122.184
   Using SSH key: C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem

🚀 Running script on server...

📡 Connected to PostgreSQL

Found:
  - 3 users
  - 3 organizations
  - 3 email verification tokens
  - 0 password reset tokens

✅ Deleted password reset tokens
✅ Deleted email verification tokens
✅ Deleted user-organization links
✅ Deleted organizations
✅ Deleted users

✅ All users and related data cleared successfully!
   You can now create a new account.

✅ Done!
```

## Troubleshooting

### SSH Connection Failed
- Check that your IP is allowed in EC2 security groups
- Verify the server IP is correct
- Ensure the server is running

### Script Not Found
- The script will automatically create it if it doesn't exist
- Or manually upload it using the scp command

### Permission Denied
- Make sure your SSH key has correct permissions
- On Windows, you may need to run: `icacls "path\to\key.pem" /inheritance:r /grant:r "%USERNAME%:R"`

## Security Note

⚠️ **This action is irreversible!** Make sure you want to delete all users before running the script.

