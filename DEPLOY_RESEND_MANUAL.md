# Manual Deployment of Resend Email Service to AWS

## Current Status
✅ Code updated locally with Resend API
✅ Email design changed to white background/black text
✅ Package.json updated with Resend dependency
✅ Local .env file updated

## Deployment Options

### Option 1: Git Deployment (Recommended)

If your code is in a git repository:

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Migrate from AWS SES to Resend email service with white background design"
   git push
   ```

2. **SSH into your EC2 server:**
   ```bash
   ssh -i "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem" ec2-user@YOUR_SERVER_IP
   ```

3. **On the server, pull latest code and deploy:**
   ```bash
   cd ~/chainCommands/backend
   # Or: cd ~/SpectrSystem.com/backend
   
   git pull
   
   # Update .env file
   sed -i '/^SMTP_HOST=/d' .env
   sed -i '/^SMTP_PORT=/d' .env
   sed -i '/^SMTP_USER=/d' .env
   sed -i '/^SMTP_PASS=/d' .env
   sed -i '/^SMTP_FROM=/d' .env
   sed -i '/^RESEND_API_KEY=/d' .env
   sed -i '/^RESEND_FROM=/d' .env
   
   echo "RESEND_API_KEY=re_ApHf5BBN_BxLoM4F25weAxwG1AKbv4AHw" >> .env
   echo "RESEND_FROM=noreply@spectrsystem.com" >> .env
   
   # Update FRONTEND_URL
   if grep -q "^FRONTEND_URL=" .env; then
       sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://spectrsystem.com|' .env
   else
       echo "FRONTEND_URL=https://spectrsystem.com" >> .env
   fi
   
   # Install dependencies (including Resend)
   npm install --production
   
   # Build TypeScript
   npm run build
   
   # Restart backend
   pm2 restart spectr-backend
   
   # Check logs
   pm2 logs spectr-backend --lines 20 | grep -i "email\|resend"
   ```

### Option 2: Direct File Upload (If Git not available)

1. **Upload files using SCP:**
   ```powershell
   $SSH_KEY = "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem"
   $SERVER_IP = "YOUR_SERVER_IP"  # Update this
   
   # Upload email service
   scp -i $SSH_KEY backend/src/services/email.ts ec2-user@${SERVER_IP}:~/chainCommands/backend/src/services/email.ts
   
   # Upload package.json
   scp -i $SSH_KEY backend/package.json ec2-user@${SERVER_IP}:~/chainCommands/backend/package.json
   ```

2. **SSH into server and complete setup:**
   ```bash
   ssh -i "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem" ec2-user@YOUR_SERVER_IP
   
   cd ~/chainCommands/backend
   
   # Update .env (same as Option 1)
   # Install, build, restart (same as Option 1)
   ```

## Verify Deployment

After deployment, check:

1. **Backend logs:**
   ```bash
   pm2 logs spectr-backend --lines 50
   ```
   Look for: `✅ Email service configured successfully (Resend)`

2. **Test email sending:**
   - Sign up a new user
   - Check that verification email is received
   - Verify email has white background with black text

3. **Check .env file:**
   ```bash
   grep -E "RESEND_|FRONTEND_URL" .env
   ```
   Should show:
   ```
   RESEND_API_KEY=re_ApHf5BBN_BxLoM4F25weAxwG1AKbv4AHw
   RESEND_FROM=noreply@spectrsystem.com
   FRONTEND_URL=https://spectrsystem.com
   ```

## Troubleshooting

### SSH Connection Timeout
- Check server IP is correct
- Verify security groups allow SSH (port 22)
- Check if server is running
- Try from a different network

### Build Errors on Server
- The TypeScript errors are pre-existing and don't affect email service
- Email service code should compile fine
- If build fails completely, check Node.js version: `node --version` (should be 18+)

### Email Not Sending
- Verify RESEND_API_KEY is correct in .env
- Check domain is verified in Resend dashboard
- Check backend logs for errors
- Verify RESEND_FROM email is from verified domain

## Files Changed

- `backend/src/services/email.ts` - Migrated to Resend API, white background design
- `backend/package.json` - Added Resend dependency
- `.env` - Updated with Resend configuration

