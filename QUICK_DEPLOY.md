# Quick Deploy to AWS

## Run this command (replace with your details):

```powershell
.\deploy-all-to-aws.ps1 `
  -ApiKey "YOUR_ANTHROPIC_API_KEY_HERE" `
  -ServerIP "your-server-ip-or-hostname" `
  -SSHKey "C:\path\to\your-key.pem"
```

## Or use manual commands:

### Step 1: SSH into your server
```bash
ssh -i your-key.pem ec2-user@your-server-ip
```

### Step 2: Run these commands on the server
```bash
cd ~/chainCommands
git pull

cd backend
sed -i '/^ANTHROPIC_API_KEY=/d' .env
echo "ANTHROPIC_API_KEY=YOUR_ANTHROPIC_API_KEY_HERE" >> .env

npm install --production
npm run build
pm2 restart spectr-backend
```

### Step 3: Verify
```bash
curl https://spectrsystem.com/api/agent/test
pm2 logs spectr-backend --lines 20
```

