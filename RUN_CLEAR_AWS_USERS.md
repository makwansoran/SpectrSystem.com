# Clear Users from AWS Database - Quick Guide

## ✅ Already Done Locally
- ✅ Cleared all users from your **local SQLite database**

## 🚀 To Clear Users from AWS Database

Since SSH connection from this machine timed out, here are your options:

### Option 1: Run on AWS Server (Easiest)

1. **SSH into your AWS server:**
   ```bash
   ssh -i "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem" ec2-user@YOUR_SERVER_IP
   ```
   
   (Replace `YOUR_SERVER_IP` with your actual EC2 instance IP from AWS Console)

2. **Navigate to backend and run the script:**
   ```bash
   cd ~/chainCommands/backend
   node scripts/clear-aws-users.js
   ```

   The script will automatically use the `.env` file on the server which has your database credentials.

### Option 2: Run Locally with AWS Credentials

If you have AWS RDS database credentials, you can run it locally:

1. **Create `backend/.env` file with:**
   ```
   DB_TYPE=postgresql
   DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-db-username
   DB_PASSWORD=your-db-password
   ```

2. **Run the script:**
   ```powershell
   cd backend
   node scripts/clear-aws-users.js
   ```

### Option 3: Get Credentials from Server

If you can SSH in, get the credentials first:

```bash
ssh -i "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem" ec2-user@YOUR_SERVER_IP
cat ~/chainCommands/backend/.env | grep DB_
```

Then use those credentials in Option 2.

## 📋 What the Script Does

The script will:
- Show you how many users/orgs/tokens exist
- Delete all password reset tokens
- Delete all email verification tokens  
- Delete all user-organization links
- Delete all organizations
- Delete all users

## 🔍 Finding Your Server IP

1. Go to [AWS Console → EC2](https://console.aws.amazon.com/ec2)
2. Click **Instances** in the left sidebar
3. Find your instance
4. Copy the **Public IPv4 address**

## ⚠️ Security Note

This action is **irreversible**! Make sure you want to delete all users before running.

