# Clear All Users from AWS Database

This guide shows you how to remove all users from your AWS PostgreSQL database.

## Option 1: Run on AWS Server (Recommended)

This is the easiest method since the server already has the database credentials configured.

### Steps:

1. **SSH into your AWS server:**
   ```bash
   ssh -i your-key.pem ec2-user@your-server-ip
   ```

2. **Navigate to the backend directory:**
   ```bash
   cd ~/chainCommands/backend
   ```

3. **Run the script:**
   ```bash
   node scripts/clear-aws-users.js
   ```

   The script will automatically use the `.env` file on the server which contains your database credentials.

## Option 2: Run Locally with AWS Credentials

If you have AWS database credentials locally, you can run the script from your machine.

### Steps:

1. **Create or update `.env` file in `backend/` directory:**
   ```bash
   DB_TYPE=postgresql
   DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=your-database-name
   DB_USER=your-db-username
   DB_PASSWORD=your-db-password
   ```

2. **Run the script:**
   ```bash
   cd backend
   node scripts/clear-aws-users.js
   ```

## What Gets Deleted

The script will remove:
- All users
- All organizations
- All email verification tokens
- All password reset tokens
- All user-organization links

## Finding Your AWS Database Credentials

If you don't know your database credentials:

1. **Check AWS RDS Console:**
   - Go to AWS Console → RDS
   - Find your database instance
   - Check the endpoint (DB_HOST) and port
   - The database name and credentials are set when you created the instance

2. **Check your server's `.env` file:**
   ```bash
   ssh -i your-key.pem ec2-user@your-server-ip
   cat ~/chainCommands/backend/.env | grep DB_
   ```

3. **Check PM2 environment:**
   ```bash
   ssh -i your-key.pem ec2-user@your-server-ip
   pm2 env spectr-backend | grep DB_
   ```

## Security Note

⚠️ **This action is irreversible!** Make sure you want to delete all users before running the script.

## Troubleshooting

### Connection Refused
- Check that your IP is allowed in RDS security groups
- Verify DB_HOST is correct
- Check that RDS instance is running

### Authentication Failed
- Verify DB_USER and DB_PASSWORD are correct
- Check that the user has DELETE permissions

### Script Not Found
- Make sure you're in the correct directory
- The script should be at: `backend/scripts/clear-aws-users.js`

