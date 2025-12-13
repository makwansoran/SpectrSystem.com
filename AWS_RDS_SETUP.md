# AWS RDS PostgreSQL Setup Guide

Complete guide to set up AWS RDS PostgreSQL database for SPECTR SYSTEMS.

## Prerequisites

- AWS Account
- AWS CLI configured (optional, but helpful)
- Basic understanding of AWS RDS

## Step 1: Create RDS PostgreSQL Database

### Via AWS Console:

1. **Navigate to RDS**
   - Go to [AWS Console](https://console.aws.amazon.com)
   - Search for "RDS" in the top search bar
   - Click on "RDS"

2. **Create Database**
   - Click **"Create database"** button
   - Choose **"Standard create"** (not Easy create for more control)

3. **Database Configuration**
   - **Engine type:** PostgreSQL
   - **Version:** PostgreSQL 15.x or 16.x (recommended)
   - **Templates:** 
     - For development/testing: **Free tier** (if eligible)
     - For production: **Production** or **Dev/Test**

4. **Settings**
   - **DB instance identifier:** `spectr-systems-db`
   - **Master username:** `spectr_admin` (or your preferred username)
   - **Master password:** Create a strong password (save this securely!)
   - **Confirm password:** Re-enter the password

5. **Instance Configuration**
   - **DB instance class:** 
     - Free tier: `db.t3.micro` or `db.t4g.micro`
     - Production: `db.t3.small` or larger (based on needs)
   - **Storage:** 
     - **Storage type:** General Purpose SSD (gp3)
     - **Allocated storage:** 20 GB (minimum, increase as needed)
     - **Storage autoscaling:** Enable (recommended for production)

6. **Connectivity**
   - **VPC:** Use default VPC (or your custom VPC)
   - **Subnet group:** Default (or create custom)
   - **Public access:** 
     - **YES** for development/testing (easier connection)
     - **NO** for production (use VPC peering or VPN)
   - **VPC security group:** Create new or use existing
   - **Availability Zone:** No preference (or select specific)
   - **Port:** 5432 (default PostgreSQL port)

7. **Database Authentication**
   - **Password authentication:** Enabled

8. **Additional Configuration**
   - **Initial database name:** `spectrsystems`
   - **DB parameter group:** Default
   - **Backup retention period:** 
     - Development: 1 day
     - Production: 7-30 days
   - **Backup window:** Use default or set preferred time
   - **Enable encryption:** YES (recommended for production)
   - **Performance Insights:** Enable for production (optional)
   - **Enhanced monitoring:** Optional

9. **Create Database**
   - Click **"Create database"**
   - Wait 5-10 minutes for database to be created

## Step 2: Configure Security Group

1. **Find Your RDS Instance**
   - Go to RDS Dashboard
   - Click on your database instance (`spectr-systems-db`)

2. **Open Security Group**
   - Scroll to **"Connectivity & security"**
   - Click on the **Security group** link

3. **Edit Inbound Rules**
   - Click **"Edit inbound rules"**
   - Click **"Add rule"**
   - **Type:** PostgreSQL
   - **Port:** 5432
   - **Source:** 
     - For development: `My IP` (your current IP)
     - For production: Specific IP or security group
   - Click **"Save rules"**

## Step 3: Get Connection Details

1. **Endpoint & Port**
   - In RDS Dashboard, select your database
   - Under **"Connectivity & security"**, find:
     - **Endpoint:** `spectr-systems-db.xxxxx.us-east-1.rds.amazonaws.com`
     - **Port:** `5432`

2. **Save These Details:**
   ```
   DB_HOST=spectr-systems-db.xxxxx.us-east-1.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=spectrsystems
   DB_USER=spectr_admin
   DB_PASSWORD=your-password-here
   ```

## Step 4: Test Connection (Optional)

### Using psql (if installed):
```bash
psql -h spectr-systems-db.xxxxx.us-east-1.rds.amazonaws.com -U spectr_admin -d spectrsystems -p 5432
```

### Using pgAdmin or DBeaver:
- Create new PostgreSQL connection
- Use the endpoint, port, database name, username, and password from Step 3

## Step 5: Update Backend Configuration

1. **Install PostgreSQL Driver**
   ```bash
   cd backend
   npm install pg
   npm install --save-dev @types/pg
   ```

2. **Update .env File**
   Add these variables to `backend/.env`:
   ```env
   # Database Configuration
   DB_TYPE=postgresql
   DB_HOST=spectr-systems-db.xxxxx.us-east-1.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=spectrsystems
   DB_USER=spectr_admin
   DB_PASSWORD=your-password-here
   
   # Keep existing variables
   SMTP_HOST=...
   SMTP_PORT=...
   # etc.
   ```

## Step 6: Run Database Migration

See `MIGRATION_GUIDE.md` for detailed migration steps from SQLite to PostgreSQL.

## Cost Estimation

### Free Tier (First 12 months):
- **db.t3.micro** instance: Free
- **20 GB storage:** Free
- **20 GB backup:** Free

### After Free Tier (Production):
- **db.t3.small:** ~$15-20/month
- **db.t3.medium:** ~$30-40/month
- **Storage:** ~$0.115/GB/month
- **Backups:** ~$0.095/GB/month

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Enable encryption at rest** - Protects data on disk
3. **Use SSL/TLS connections** - Encrypts data in transit
4. **Restrict public access** - Use VPC for production
5. **Regular backups** - Enable automated backups
6. **Rotate passwords** - Change master password periodically
7. **Use IAM database authentication** - More secure (advanced)

## Troubleshooting

### Can't Connect to Database
- Check security group allows your IP
- Verify endpoint and port are correct
- Check if database is in "available" status
- Verify username and password

### Connection Timeout
- Check VPC and subnet configuration
- Verify security group rules
- Check if public access is enabled (if needed)

### Performance Issues
- Upgrade instance class
- Enable Performance Insights
- Check connection pooling
- Review slow query logs

## Next Steps

1. ✅ Complete RDS setup
2. ✅ Update backend configuration
3. ✅ Run database migration (see `MIGRATION_GUIDE.md`)
4. ✅ Test application with PostgreSQL
5. ✅ Deploy to production

## Support

For issues:
- AWS RDS Documentation: https://docs.aws.amazon.com/rds/
- PostgreSQL Documentation: https://www.postgresql.org/docs/

