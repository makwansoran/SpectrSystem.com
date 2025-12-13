# AWS SES Setup Guide for SPECTR SYSTEMS

Complete guide to set up AWS Simple Email Service (SES) for email verification.

## Step 1: Access AWS SES

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Sign in to your AWS account
3. Search for "SES" or "Simple Email Service" in the top search bar
4. Click on "Simple Email Service"

## Step 2: Verify Your Email Address

1. In SES Console, click **"Verified identities"** in the left sidebar
2. Click **"Create identity"**
3. Select **"Email address"**
4. Enter your email address (e.g., `noreply@yourdomain.com`)
5. Click **"Create identity"**
6. Check your email inbox for verification email
7. Click the verification link in the email

**Note:** You can verify multiple email addresses if needed.

## Step 3: Request Production Access (Important!)

By default, AWS SES is in **sandbox mode**, which means:
- ❌ Can only send to verified email addresses
- ❌ Limited to 200 emails per day
- ❌ Cannot send to unverified emails

To send verification emails to any user:

1. In SES Console, go to **"Account dashboard"**
2. Click **"Request production access"**
3. Fill out the form:
   - **Mail Type:** Transactional
   - **Website URL:** Your website URL
   - **Use case description:** "Email verification for user accounts in SPECTR SYSTEMS platform"
   - **Expected sending volume:** Estimate your monthly emails
   - **Compliance:** Check all boxes
4. Submit the request
5. Wait for approval (usually 24-48 hours)

**For testing:** You can stay in sandbox mode and verify test email addresses.

## Step 4: Get SMTP Credentials

1. In SES Console, click **"SMTP settings"** in the left sidebar
2. Click **"Create SMTP credentials"**
3. Enter an IAM user name (e.g., `spectr-systems-smtp`)
4. Click **"Create"**
5. **IMPORTANT:** Download or copy the credentials immediately
   - You'll see:
     - **SMTP Server Name:** `email-smtp.[region].amazonaws.com`
     - **Port:** 587 (TLS) or 465 (SSL)
     - **Username:** Your SMTP username
     - **Password:** Your SMTP password

**Note:** The password is only shown once! Save it securely.

## Step 5: Find Your Region

Your SMTP endpoint depends on your AWS region:

- **US East (N. Virginia):** `email-smtp.us-east-1.amazonaws.com`
- **US West (Oregon):** `email-smtp.us-west-2.amazonaws.com`
- **EU (Ireland):** `email-smtp.eu-west-1.amazonaws.com`
- **Asia Pacific (Singapore):** `email-smtp.ap-southeast-1.amazonaws.com`
- **Asia Pacific (Tokyo):** `email-smtp.ap-northeast-1.amazonaws.com`

Check your region in the top-right corner of AWS Console.

## Step 6: Configure Your Backend

1. Copy `.env.example` to `.env` in the `backend` folder:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` and fill in your AWS SES credentials:
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username-from-step-4
   SMTP_PASS=your-smtp-password-from-step-4
   SMTP_FROM=noreply@yourdomain.com
   FRONTEND_URL=http://localhost:5173
   JWT_SECRET=your-secret-key-change-in-production
   ```

3. Replace:
   - `SMTP_HOST` with your region's SMTP endpoint
   - `SMTP_USER` with your SMTP username
   - `SMTP_PASS` with your SMTP password
   - `SMTP_FROM` with your verified email address
   - `FRONTEND_URL` with your frontend URL (localhost for dev, your domain for production)

## Step 7: Test the Configuration

1. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Look for this message in the console:
   ```
   ✅ Email service configured successfully
   ```

3. If you see a warning instead:
   ```
   ⚠️  Email service not configured
   ```
   Check your `.env` file and credentials.

4. Test by registering a new user account - you should receive a verification email.

## Troubleshooting

### "Email address not verified" error
- Make sure you verified your email address in SES Console
- Check that `SMTP_FROM` matches your verified email

### "Access Denied" error
- Verify your SMTP credentials are correct
- Check that you copied the username and password correctly
- Make sure you're using the correct region

### Emails not sending
- Check SES Console > Account dashboard for sending limits
- Verify you're not in sandbox mode (or verify recipient email)
- Check CloudWatch logs in AWS for detailed error messages

### "Rate exceeded" error
- Sandbox mode: Limited to 200 emails/day
- Check your sending quota in SES Console
- Request production access to increase limits

## Production Checklist

- [ ] Verified email address in SES
- [ ] Requested production access (if sending to unverified emails)
- [ ] Created SMTP credentials
- [ ] Configured `.env` file with correct credentials
- [ ] Set `FRONTEND_URL` to production domain
- [ ] Set strong `JWT_SECRET`
- [ ] Tested email sending
- [ ] Set up CloudWatch monitoring (optional)
- [ ] Configured bounce/complaint handling (optional)

## AWS SES Pricing

- **Free Tier:** 62,000 emails/month (when sending from EC2)
- **After Free Tier:** $0.10 per 1,000 emails
- **Very cost-effective** for email verification

## Security Best Practices

1. **Never commit `.env` to git** - it's already in `.gitignore`
2. **Use IAM roles** in production (instead of SMTP credentials)
3. **Rotate credentials** periodically
4. **Monitor sending** in CloudWatch
5. **Set up bounce/complaint handling** for production

## Additional Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [SES SMTP Settings](https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html)
- [SES Pricing](https://aws.amazon.com/ses/pricing/)
- [SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)

