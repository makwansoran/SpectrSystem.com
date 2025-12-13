# Quick Setup Guide for AWS SES

## Step 1: Verify Email Address in AWS SES

1. Go to AWS SES Console → **Verified identities**
2. Click **Create identity**
3. Select **Email address**
4. Enter: `noreply@spectrsystem.com`
5. Click **Create identity**
6. Check your email inbox for verification email
7. Click the verification link

**Note:** If your domain is verified, you may be able to use any email from that domain without verifying individual addresses. Check your domain verification status.

## Step 2: Get SMTP Credentials

1. In AWS SES Console, click **SMTP settings** (left sidebar)
2. Click **Create SMTP credentials**
3. Enter IAM user name: `spectr-systems-smtp`
4. Click **Create**
5. **IMPORTANT:** Download or copy these immediately:
   - **SMTP Server Name:** `email-smtp.[region].amazonaws.com`
   - **Port:** 587
   - **Username:** (shown here)
   - **Password:** (shown here - only shown once!)

## Step 3: Find Your Region

Check the top-right corner of AWS Console for your region:
- `us-east-1` → `email-smtp.us-east-1.amazonaws.com`
- `us-west-2` → `email-smtp.us-west-2.amazonaws.com`
- `eu-west-1` → `email-smtp.eu-west-1.amazonaws.com`
- etc.

## Step 4: Create .env File

Create a file named `.env` in the `backend` folder with:

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username-from-step-2
SMTP_PASS=your-smtp-password-from-step-2
SMTP_FROM=noreply@spectrsystem.com
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-secret-key-change-in-production
```

Replace:
- `SMTP_HOST` with your region's endpoint
- `SMTP_USER` with your SMTP username
- `SMTP_PASS` with your SMTP password
- `SMTP_FROM` is already set to `noreply@spectrsystem.com`

## Step 5: Restart Backend

```bash
cd backend
npm run dev
```

Look for: `✅ Email service configured successfully`

## Testing

1. Register a new user account
2. Check email inbox for verification email from `noreply@spectrsystem.com`
3. Click verification link

Done! 🎉

