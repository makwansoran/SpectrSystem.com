# Migration from AWS SES to Resend

## ✅ What Has Been Changed

1. **Email Service Updated** (`backend/src/services/email.ts`)
   - Replaced `nodemailer` (SMTP) with `resend` API
   - Changed email design from **black background/white text** to **white background/black text**
   - All email templates updated (verification, password reset, contact sales)

2. **Package Dependencies** (`backend/package.json`)
   - Added `resend` package (v3.2.0)

3. **Documentation Updated**
   - Updated `EMAIL_VERIFICATION_FIXES.md` with new environment variables

## 🔧 Next Steps

### 1. Install the Resend Package

On your server, run:
```bash
cd backend
npm install
```

Or locally:
```bash
cd backend
npm install
npm run build
```

### 2. Get Your Resend API Key

1. Go to https://resend.com
2. Log in to your account
3. Navigate to **API Keys** section
4. Create a new API key (or use existing one)
5. Copy the API key (starts with `re_`)

### 3. Update Environment Variables

Update your `.env` file on the server with:

```bash
# Remove old SMTP variables (no longer needed):
# SMTP_HOST=...
# SMTP_PORT=...
# SMTP_USER=...
# SMTP_PASS=...

# Add new Resend variables:
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM=noreply@spectrsystem.com
FRONTEND_URL=https://spectrsystem.com
SALES_EMAIL=sales@spectrsystem.com  # Optional
```

**Important:** 
- `RESEND_FROM` must be an email from your verified domain (`spectrsystem.com`)
- Make sure your domain is verified in Resend (DNS records should already be set up)

### 4. Restart Your Backend

After updating environment variables:

```bash
# On your server
pm2 restart spectr-backend
```

Or check logs:
```bash
pm2 logs spectr-backend --lines 50
```

You should see: `✅ Email service configured successfully (Resend)`

### 5. Test Email Sending

1. Try signing up a new user
2. Check that verification email is received
3. Verify the email has white background with black text

## 📧 Email Design Changes

All emails now use:
- **Background:** White (`#fff`)
- **Text:** Black (`#000`)
- **Borders:** Light gray (`#e5e5e5`)
- **Buttons:** Black background with white text
- **Same structure and content** as before, just different colors

## 🔍 Verification Checklist

- [ ] Resend package installed (`npm install` completed)
- [ ] `RESEND_API_KEY` added to `.env` file
- [ ] `RESEND_FROM` set to `noreply@spectrsystem.com` (or verified email)
- [ ] Domain verified in Resend dashboard
- [ ] Backend restarted
- [ ] Test email sent successfully
- [ ] Email design shows white background with black text

## 🆘 Troubleshooting

### Email not sending?
- Check that `RESEND_API_KEY` is set correctly
- Verify domain is verified in Resend
- Check backend logs: `pm2 logs spectr-backend`
- Ensure `RESEND_FROM` email is from verified domain

### Domain not verified?
- Go to Resend dashboard → Domains
- Check DNS records are properly configured in AWS Route 53
- Wait 5-10 minutes after adding DNS records

### Still using old design?
- Clear browser cache
- Check that backend was restarted after changes
- Verify new code is deployed: `pm2 logs spectr-backend | grep "Email service"`

## 📝 Old vs New Environment Variables

**Old (SMTP):**
```bash
SMTP_HOST=email-smtp.eu-north-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
SMTP_FROM=noreply@spectrsystem.com
```

**New (Resend):**
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM=noreply@spectrsystem.com
FRONTEND_URL=https://spectrsystem.com
```

