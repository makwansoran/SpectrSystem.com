# Fix AWS SES Email Verification Issue

## Problem
Only one email works for signup because AWS SES is in **sandbox mode**, which only allows sending to/from verified email addresses.

## Solution 1: Verify More Email Addresses (Quick Fix)

### Steps:
1. **Go to AWS Console:**
   - Navigate to: https://console.aws.amazon.com/ses
   - Make sure you're in the **EU-NORTH-1** region (your error shows this region)

2. **Verify Email Addresses:**
   - Click **"Verified identities"** in the left sidebar
   - Click **"Create identity"**
   - Select **"Email address"**
   - Enter the email address you want to verify (e.g., `makwan.ism@gmail.com`)
   - Click **"Create identity"**
   - Check that email inbox and click the verification link
   - Repeat for each email address you need

3. **Verify Domain (Better Option):**
   - Instead of verifying individual emails, verify your entire domain
   - Click **"Create identity"** → **"Domain"**
   - Enter: `spectrsystem.com`
   - Add the DNS records AWS provides to your domain's DNS
   - Once verified, you can send from ANY email @spectrsystem.com

## Solution 2: Request Production Access (Recommended)

This allows sending to ANY email address without verification.

### Steps:
1. **Go to AWS SES Console:**
   - Navigate to: https://console.aws.amazon.com/ses
   - Click **"Account dashboard"** in the left sidebar

2. **Request Production Access:**
   - Look for **"Sending limits"** section
   - Click **"Request production access"**
   - Fill out the form:
     - **Mail Type:** Transactional
     - **Website URL:** https://spectrsystem.com
     - **Use case description:** "Sending email verification and password reset emails for user authentication"
     - **Expected sending volume:** Enter your estimate (e.g., 1000 emails/month)
     - **Compliance:** Check the boxes for anti-spam compliance
   - Click **"Submit"**

3. **Wait for Approval:**
   - Usually takes 24-48 hours
   - AWS will email you when approved
   - Once approved, you can send to any email address

## Solution 3: Use Different Email Service

If you want to avoid AWS SES restrictions, switch to:

### Gmail (Free, Easy Setup):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Generate from Google Account settings
SMTP_FROM=your-email@gmail.com
```

### SendGrid (Free tier: 100 emails/day):
- Sign up at https://sendgrid.com
- Get API key
- Update SMTP settings

### Mailgun (Free tier: 5,000 emails/month):
- Sign up at https://mailgun.com
- Get SMTP credentials
- Update SMTP settings

## Current Configuration

Your current AWS SES setup:
- **SMTP Host:** email-smtp.eu-north-1.amazonaws.com
- **Region:** EU-NORTH-1
- **From Address:** noreply@spectrsystem.com

## Quick Fix Right Now

To allow signups with any email, you need to either:

1. **Verify each email address** users want to sign up with (not practical)
2. **Verify your domain** so you can send from any @spectrsystem.com address
3. **Request production access** to send to any email address

## Recommended Action

**Best solution:** Request production access in AWS SES. This is the proper way to handle transactional emails for a production application.

