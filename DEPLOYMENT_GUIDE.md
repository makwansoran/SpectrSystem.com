# SPECTR SYSTEMS Deployment Guide

Complete guide to deploy SPECTR SYSTEMS to AWS.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Infrastructure Setup](#aws-infrastructure-setup)
3. [Database Migration](#database-migration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Environment Configuration](#environment-configuration)
7. [Testing & Verification](#testing--verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

- ✅ AWS Account
- ✅ AWS RDS PostgreSQL database created (see `AWS_RDS_SETUP.md`)
- ✅ AWS SES configured (see `AWS_SES_SETUP.md`)
- ✅ Domain name (optional, for production)
- ✅ AWS CLI installed and configured (optional)

## AWS Infrastructure Setup

### 1. RDS Database

Follow `AWS_RDS_SETUP.md` to create your PostgreSQL database.

**Save these details:**
- Endpoint: `your-db.xxxxx.region.rds.amazonaws.com`
- Port: `5432`
- Database name: `spectrsystems`
- Username: `spectr_admin`
- Password: `your-secure-password`

### 2. EC2 Instance (Backend)

**Option A: EC2 Instance (Recommended for simplicity)**

1. **Launch EC2 Instance**
   - Go to EC2 Console → Launch Instance
   - **Name:** `spectr-systems-backend`
   - **AMI:** Amazon Linux 2023 or Ubuntu 22.04 LTS
   - **Instance type:** `t3.small` or `t3.medium` (for production)
   - **Key pair:** Create or select existing
   - **Network settings:** 
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)
     - Allow custom TCP (port 3001 for backend)
   - **Storage:** 20 GB gp3
   - Launch instance

2. **Configure Security Group**
   - Allow inbound:
     - SSH (22) from your IP
     - HTTP (80) from anywhere
     - HTTPS (443) from anywhere
     - Custom TCP (3001) from your frontend/load balancer

3. **Connect to Instance**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

**Option B: Elastic Beanstalk (Easier deployment)**

1. Go to Elastic Beanstalk Console
2. Create new application: `spectr-systems`
3. Create environment: `backend-prod`
4. Platform: Node.js
5. Upload your backend code
6. Configure environment variables

**Option C: ECS/Fargate (Container-based)**

- More complex but scalable
- Requires Docker setup
- Better for production at scale

### 3. S3 + CloudFront (Frontend)

1. **Create S3 Bucket**
   - Name: `spectr-systems-frontend` (or your domain)
   - Region: Same as your backend
   - Block public access: Disable (for static hosting)
   - Enable static website hosting

2. **Create CloudFront Distribution**
   - Origin: Your S3 bucket
   - Viewer protocol: Redirect HTTP to HTTPS
   - Default root object: `index.html`
   - Price class: Use all edge locations (or cheapest)

3. **Configure Custom Domain (Optional)**
   - Add your domain to CloudFront
   - Update DNS records

## Database Migration

### Step 1: Backup SQLite Database

```bash
cd backend
cp data/spectr-systems.db data/spectr-systems.db.backup
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

### Step 3: Run Migration Script

1. **Update `.env` with PostgreSQL credentials:**
   ```env
   DB_TYPE=postgresql
   DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
   DB_PORT=5432
   DB_NAME=spectrsystems
   DB_USER=spectr_admin
   DB_PASSWORD=your-password
   ```

2. **Run migration:**
   ```bash
   node scripts/migrate-to-postgresql.js
   ```

3. **Verify migration:**
   - Check row counts match
   - Test application functionality

## Backend Deployment

### Option 1: Manual Deployment (EC2)

1. **Install Node.js on EC2:**
   ```bash
   # Amazon Linux 2023
   sudo dnf install -y nodejs npm
   
   # Ubuntu
   sudo apt update
   sudo apt install -y nodejs npm
   ```

2. **Install PM2 (Process Manager):**
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone Repository:**
   ```bash
   git clone https://github.com/makwansoran/SpectrSystem.com.git
   cd SpectrSystem.com/backend
   ```

4. **Install Dependencies:**
   ```bash
   npm install
   npm run build
   ```

5. **Create `.env` file:**
   ```bash
   nano .env
   ```
   Add all environment variables (see Environment Configuration section)

6. **Start with PM2:**
   ```bash
   pm2 start dist/index.js --name spectr-backend
   pm2 save
   pm2 startup  # Enable auto-start on reboot
   ```

7. **Configure Nginx (Reverse Proxy):**
   ```bash
   sudo dnf install -y nginx  # Amazon Linux
   # or
   sudo apt install -y nginx  # Ubuntu
   ```

   Create `/etc/nginx/conf.d/spectr-backend.conf`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### Option 2: Elastic Beanstalk

1. **Prepare Deployment Package:**
   ```bash
   cd backend
   npm install --production
   npm run build
   zip -r ../backend-deploy.zip . -x "*.git*" "node_modules/.cache/*"
   ```

2. **Deploy to Elastic Beanstalk:**
   - Go to Elastic Beanstalk Console
   - Upload `backend-deploy.zip`
   - Configure environment variables
   - Deploy

### Option 3: Docker (ECS/Fargate)

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3001
   CMD ["node", "dist/index.js"]
   ```

2. **Build and Push:**
   ```bash
   docker build -t spectr-backend .
   docker tag spectr-backend:latest your-ecr-repo/spectr-backend:latest
   docker push your-ecr-repo/spectr-backend:latest
   ```

## Frontend Deployment

### Step 1: Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` folder with production-ready files.

### Step 2: Deploy to S3

**Option A: AWS Console**
1. Go to S3 Console
2. Select your bucket
3. Upload all files from `frontend/dist/`
4. Set permissions: Make files public
5. Enable static website hosting

**Option B: AWS CLI**
```bash
aws s3 sync frontend/dist s3://spectr-systems-frontend --delete
aws s3 website s3://spectr-systems-frontend --index-document index.html
```

### Step 3: Configure CloudFront

1. Create CloudFront distribution
2. Origin: Your S3 bucket
3. Default root object: `index.html`
4. Error pages: 404 → `/index.html` (for React Router)
5. Deploy

### Step 4: Update Frontend API URL

Before building, update `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-domain.com/api';
```

Or set `VITE_API_URL` in build process:
```bash
VITE_API_URL=https://your-backend.com/api npm run build
```

## Environment Configuration

### Backend `.env` File

```env
# Database
DB_TYPE=postgresql
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=5432
DB_NAME=spectrsystems
DB_USER=spectr_admin
DB_PASSWORD=your-secure-password
DB_SSL=false

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Email (AWS SES)
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# CORS (if needed)
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend Environment Variables

Create `.env.production`:
```env
VITE_API_URL=https://your-backend-domain.com/api
```

## Testing & Verification

### 1. Test Backend

```bash
# Health check
curl https://your-backend.com/api/health

# Should return:
# {"success":true,"message":"SPECTR SYSTEMS API is running",...}
```

### 2. Test Frontend

- Visit your CloudFront URL
- Test login/registration
- Create a workflow
- Execute a workflow
- Check execution history

### 3. Test Database Connection

```bash
# On backend server
cd backend
node -e "
const { pool } = require('./dist/database/postgresql');
pool.query('SELECT NOW()').then(r => {
  console.log('Database connected:', r.rows[0]);
  process.exit(0);
});
"
```

### 4. Monitor Logs

```bash
# PM2 logs
pm2 logs spectr-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Monitoring & Maintenance

### 1. Set Up CloudWatch Alarms

- RDS CPU utilization
- RDS connection count
- EC2 CPU utilization
- Application errors

### 2. Enable RDS Automated Backups

- Already configured during RDS setup
- Retention: 7-30 days
- Backup window: Off-peak hours

### 3. SSL/TLS Certificates

Use AWS Certificate Manager (ACM) for HTTPS:
1. Request certificate in ACM
2. Validate domain
3. Attach to CloudFront and Load Balancer

### 4. Regular Updates

```bash
# Update application
git pull
npm install
npm run build
pm2 restart spectr-backend

# Update system
sudo dnf update  # Amazon Linux
sudo apt update && sudo apt upgrade  # Ubuntu
```

### 5. Backup Strategy

- **Database:** RDS automated backups
- **Application code:** Git repository
- **Environment variables:** Store in AWS Secrets Manager
- **User uploads:** Store in S3 (if applicable)

## Cost Optimization

### Estimated Monthly Costs

**Small Scale (Free Tier Eligible):**
- RDS db.t3.micro: $0 (first year)
- EC2 t3.micro: $0 (first year)
- S3 + CloudFront: ~$1-5/month
- **Total: ~$1-5/month**

**Production Scale:**
- RDS db.t3.small: ~$15-20/month
- EC2 t3.small: ~$15/month
- S3 + CloudFront: ~$5-10/month
- **Total: ~$35-45/month**

### Cost Saving Tips

1. Use Reserved Instances for predictable workloads
2. Enable RDS storage autoscaling
3. Use CloudFront caching to reduce S3 requests
4. Monitor and right-size instances
5. Use Spot Instances for non-critical workloads

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
pm2 logs spectr-backend

# Check environment variables
pm2 env spectr-backend

# Test database connection
node scripts/check-db.js
```

### Database Connection Issues

- Verify security group allows EC2 IP
- Check RDS endpoint and credentials
- Test connection with `psql` or `pgAdmin`

### Frontend Not Loading

- Check S3 bucket permissions
- Verify CloudFront distribution status
- Check browser console for errors
- Verify API URL in frontend config

## Security Checklist

- [ ] RDS not publicly accessible (use VPC)
- [ ] Security groups properly configured
- [ ] SSL/TLS enabled (HTTPS)
- [ ] Environment variables secured (not in code)
- [ ] Database passwords strong and rotated
- [ ] JWT secret is strong and unique
- [ ] CORS properly configured
- [ ] Regular security updates applied
- [ ] Backups enabled and tested
- [ ] Monitoring and alerts configured

## Support

For issues:
- Check application logs
- Review AWS CloudWatch metrics
- Check RDS performance insights
- Review security group rules
- Verify environment variables

## Next Steps

1. ✅ Complete deployment
2. ✅ Test all functionality
3. ✅ Set up monitoring
4. ✅ Configure backups
5. ✅ Document custom configurations
6. ✅ Set up CI/CD (optional)
7. ✅ Load testing (optional)

---

**Congratulations!** Your SPECTR SYSTEMS application is now deployed on AWS! 🎉

