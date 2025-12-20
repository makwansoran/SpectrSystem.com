# Deploy All Changes to AWS - Simple Commands

## Quick Deploy (Copy & Paste)

Run these commands in PowerShell:

### 1. Build Backend Locally
```powershell
cd backend
npm run build
cd ..
```

### 2. Upload Backend Files
```powershell
$SSH_KEY = "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem"
$SERVER_IP = "51.20.122.184"

# Upload auth.ts (email verification fixes)
scp -i $SSH_KEY backend/src/routes/auth.ts ec2-user@$SERVER_IP:~/SpectrSystem.com/backend/src/routes/auth.ts

# Upload postgresql.ts (password reset fix)
scp -i $SSH_KEY backend/src/database/postgresql.ts ec2-user@$SERVER_IP:~/SpectrSystem.com/backend/src/database/postgresql.ts

# Upload built files
scp -i $SSH_KEY -r backend/dist/* ec2-user@$SERVER_IP:~/SpectrSystem.com/backend/dist/
```

### 3. Upload Frontend Files
```powershell
# Upload SelectPlanPage (light theme)
scp -i $SSH_KEY frontend/src/pages/SelectPlanPage.tsx ec2-user@$SERVER_IP:~/SpectrSystem.com/frontend/src/pages/SelectPlanPage.tsx

# Upload VerifyEmailPage (light theme)
scp -i $SSH_KEY frontend/src/pages/VerifyEmailPage.tsx ec2-user@$SERVER_IP:~/SpectrSystem.com/frontend/src/pages/VerifyEmailPage.tsx
```

### 4. Build and Restart on Server
```powershell
ssh -i $SSH_KEY ec2-user@$SERVER_IP "cd ~/SpectrSystem.com/backend && npm install --production && npm run build && pm2 restart spectr-backend"
```

## Or Use Git (If Using Git)

If your code is in git:

```powershell
ssh -i $SSH_KEY ec2-user@$SERVER_IP "cd ~/SpectrSystem.com && git pull && cd backend && npm install --production && npm run build && pm2 restart spectr-backend"
```

## What Gets Deployed

✅ **Backend:**
- Email verification fixes (`auth.ts`)
- PostgreSQL password reset fix (`postgresql.ts`)
- All built TypeScript files

✅ **Frontend:**
- Select Plan page (light theme)
- Verify Email page (light theme)

