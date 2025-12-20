# Complete Deployment Guide - AWS

This guide covers deploying the entire SPECTR SYSTEMS application to AWS, including all new features:
- ✅ Datasets Management
- ✅ Company Intelligence System
- ✅ Folder Import Functionality
- ✅ Dashboard Designer
- ✅ Admin Page Enhancements

## Prerequisites

1. **AWS EC2 Instance** running Linux (Amazon Linux 2 or Ubuntu)
2. **SSH Key** (.pem file) for accessing your EC2 instance
3. **Domain Name** configured to point to your EC2 instance (optional but recommended)
4. **Node.js 20+** installed on the server
5. **PM2** installed globally (`npm install -g pm2`)
6. **Nginx** installed and configured

## Quick Deploy

### Option 1: Automated Script (Recommended)

```powershell
.\deploy-complete-to-aws.ps1 `
  -ServerIP "your-server-ip-or-hostname" `
  -SSHKey "C:\path\to\your-key.pem" `
  -ApiKey "your-anthropic-api-key" `
  -User "ec2-user"
```

### Option 2: Manual Deployment

#### Step 1: Build Frontend Locally

```powershell
cd frontend
npm install
npm run build
cd ..
```

#### Step 2: SSH into Server

```bash
ssh -i your-key.pem ec2-user@your-server-ip
```

#### Step 3: Deploy Backend

```bash
cd ~/chainCommands
git pull

cd backend

# Update environment variables
nano .env
# Ensure these are set:
# - DB_TYPE=postgresql (or sqlite)
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (if PostgreSQL)
# - ANTHROPIC_API_KEY=your-key
# - RESEND_API_KEY=your-resend-key
# - FRONTEND_URL=https://spectrsystem.com
# - PORT=3001

# Install dependencies
npm install --production

# Build TypeScript
npm run build

# Create data directories
mkdir -p data
mkdir -p src/services/company-intelligence/data/raw

# Restart with PM2
pm2 restart spectr-backend || pm2 start ecosystem.config.js
pm2 save
```

#### Step 4: Deploy Frontend

```bash
cd ~/chainCommands/frontend

# Install dependencies
npm install

# Build frontend
npm run build

# Copy to web server directory
sudo mkdir -p /var/www/spectrsystem.com
sudo cp -r dist/* /var/www/spectrsystem.com/
sudo chown -R nginx:nginx /var/www/spectrsystem.com

# Restart nginx
sudo systemctl restart nginx
```

## Server Setup (First Time)

If this is your first deployment, you need to set up the server:

### 1. Install Node.js

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
# Or for Ubuntu:
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
# sudo apt-get install -y nodejs
```

### 2. Install PM2

```bash
sudo npm install -g pm2
```

### 3. Install Nginx

```bash
# Amazon Linux 2
sudo yum install -y nginx

# Ubuntu
sudo apt-get install -y nginx
```

### 4. Configure Nginx

Create `/etc/nginx/conf.d/spectrsystem.conf`:

```nginx
server {
    listen 80;
    server_name spectrsystem.com www.spectrsystem.com;

    # Frontend
    location / {
        root /var/www/spectrsystem.com;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Restart nginx:
```bash
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. Setup SSL (Let's Encrypt)

```bash
sudo yum install -y certbot python3-certbot-nginx
# Or Ubuntu:
# sudo apt-get install -y certbot python3-certbot-nginx

sudo certbot --nginx -d spectrsystem.com -d www.spectrsystem.com
```

## Environment Variables

Create `backend/.env` file with:

```env
# Database
DB_TYPE=postgresql
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=spectr_systems
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Or for SQLite:
# DB_TYPE=sqlite
# DB_PATH=./data/spectr.db

# API Keys
ANTHROPIC_API_KEY=your-anthropic-key
RESEND_API_KEY=your-resend-key
RESEND_FROM=noreply@spectrsystem.com

# Application
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://spectrsystem.com
CORS_ORIGIN=https://spectrsystem.com

# JWT
JWT_SECRET=your-secret-key-change-this

# Email
EMAIL_FROM=noreply@spectrsystem.com
```

## Database Setup

### Option 1: PostgreSQL (RDS) - Recommended for Production

1. Create RDS PostgreSQL instance in AWS
2. Update `.env` with RDS connection details
3. The application will automatically create tables on first run

### Option 2: SQLite - For Development/Testing

1. Set `DB_TYPE=sqlite` in `.env`
2. The database file will be created automatically at `backend/data/spectr.db`

## PM2 Configuration

Create `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'spectr-backend',
    script: 'dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
```

## Verify Deployment

1. **Check Backend:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check Frontend:**
   Open https://spectrsystem.com in browser

3. **Check PM2:**
   ```bash
   pm2 status
   pm2 logs spectr-backend --lines 50
   ```

4. **Check Nginx:**
   ```bash
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/error.log
   ```

## Troubleshooting

### Backend won't start
- Check logs: `pm2 logs spectr-backend`
- Verify `.env` file exists and has correct values
- Check database connection
- Ensure port 3001 is not in use

### Frontend not loading
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Verify files in `/var/www/spectrsystem.com`
- Check nginx configuration: `sudo nginx -t`

### Database connection errors
- Verify database credentials in `.env`
- Check security groups allow connection from EC2
- For RDS, ensure VPC security group allows inbound on port 5432

## New Features Included

✅ **Datasets Management**
- Create, edit, publish datasets
- API, Folder Import, and Company Intelligence data sources
- Public/Private visibility control

✅ **Company Intelligence System**
- Full company data management
- Source-backed data with provenance
- Versioning and audit trails

✅ **Folder Import**
- Import data from local folders
- Support for CSV, JSON, and text files
- File pattern matching

✅ **Dashboard Designer**
- Design custom dashboards
- Multiple widget types
- Real-time data visualization

## Security Notes

1. **Never commit `.env` files** to git
2. **Use strong JWT_SECRET** in production
3. **Enable HTTPS** with Let's Encrypt
4. **Restrict database access** to EC2 security group only
5. **Keep dependencies updated** regularly

## Maintenance

### Update Application

```bash
cd ~/chainCommands
git pull
cd backend && npm install --production && npm run build && pm2 restart spectr-backend
cd ../frontend && npm install && npm run build && sudo cp -r dist/* /var/www/spectrsystem.com/
```

### View Logs

```bash
# Backend logs
pm2 logs spectr-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Database

```bash
# PostgreSQL
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > backup_$(date +%Y%m%d).sql

# SQLite
cp backend/data/spectr.db backup_$(date +%Y%m%d).db
```

