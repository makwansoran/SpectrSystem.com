# How to Find Your AWS Server IP and SSH Key

## Finding Your EC2 Server IP/Hostname

### Option 1: AWS Console (Easiest)
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **EC2** service
3. Click **Instances** in the left sidebar
4. Find your instance (look for "spectr" or "chainCommands" in the name)
5. The **Public IPv4 address** or **Public IPv4 DNS** is your server IP/hostname
   - Example: `54.123.45.67` or `ec2-54-123-45-67.compute-1.amazonaws.com`

### Option 2: Check Your Domain DNS
Since your site is at `spectrsystem.com`, check:
1. Go to your domain registrar or Route 53
2. Look for A record pointing to your EC2 instance
3. The IP address there is your server IP

### Option 3: Check Previous Deployment Scripts
Look in your project for any `.env` files or config files that might have the server details.

## Finding Your SSH Key (.pem file)

### Option 1: Check Your Downloads Folder
SSH keys are usually downloaded when you first create an EC2 instance:
- Check: `C:\Users\makwa\Downloads\*.pem`
- Common names: `spectr-key.pem`, `aws-key.pem`, `ec2-key.pem`, `key.pem`

### Option 2: AWS Console
1. Go to AWS Console → **EC2**
2. Click **Key Pairs** in the left sidebar
3. You'll see the key pair name (but not the actual key file)
4. The `.pem` file should be on your local machine from when you created it

### Option 3: Check Common Locations
```powershell
# Search for .pem files
Get-ChildItem -Path $HOME -Filter "*.pem" -Recurse -ErrorAction SilentlyContinue
Get-ChildItem -Path "$HOME\Downloads" -Filter "*.pem" -ErrorAction SilentlyContinue
Get-ChildItem -Path "$HOME\Desktop" -Filter "*.pem" -ErrorAction SilentlyContinue
```

### Option 4: If You Lost the Key
If you can't find the `.pem` file:
- You'll need to create a new key pair in AWS
- Attach it to your instance (this requires stopping the instance)
- OR use AWS Systems Manager Session Manager (no SSH key needed)

## Quick Check Commands

Run these in PowerShell to search for your key:

```powershell
# Search for .pem files
Get-ChildItem -Path $HOME -Filter "*.pem" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName

# Search for files with "key" in the name
Get-ChildItem -Path $HOME -Filter "*key*" -Recurse -ErrorAction SilentlyContinue | Select-Object FullName
```

## Alternative: Use AWS Systems Manager (No SSH Key Needed)

If you can't find your SSH key, you can use AWS Systems Manager Session Manager:

1. Install AWS CLI: https://aws.amazon.com/cli/
2. Install Session Manager plugin: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html
3. Connect without SSH key:
   ```bash
   aws ssm start-session --target i-xxxxxxxxxxxxx
   ```
   (Replace `i-xxxxxxxxxxxxx` with your instance ID from AWS Console)

## Once You Have Both

Run the deployment script:
```powershell
.\deploy-all-to-aws.ps1 `
  -ApiKey "YOUR_ANTHROPIC_API_KEY_HERE" `
  -ServerIP "YOUR_SERVER_IP_HERE" `
  -SSHKey "C:\path\to\your-key.pem"
```

