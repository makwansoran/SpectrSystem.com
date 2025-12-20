# Quick Deploy to AWS - One Command

## Prerequisites
- EC2 instance running
- SSH key (.pem file)
- Server IP or hostname

## Deploy Everything

```powershell
.\deploy-complete-to-aws.ps1 `
  -ServerIP "51.20.122.184" `
  -SSHKey "C:\Users\makwa\OneDrive\Skrivebord\spectr-backend-key.pem" `
  -ApiKey "your-anthropic-api-key" `
  -User "ec2-user"
```

## What Gets Deployed

✅ **Backend:**
- All TypeScript code compiled
- All dependencies installed
- PM2 process restarted
- Data directories created

✅ **Frontend:**
- React app built
- Static files copied to nginx directory
- Nginx restarted

✅ **New Features:**
- Datasets Management System
- Company Intelligence Platform
- Folder Import Functionality
- Dashboard Designer
- Admin Page Enhancements

## Verify Deployment

1. **Check Backend:**
   ```bash
   curl https://spectrsystem.com/api/health
   ```

2. **Check Frontend:**
   Open: https://spectrsystem.com

3. **Check Logs:**
   ```bash
   ssh -i your-key.pem ec2-user@your-server-ip
   pm2 logs spectr-backend --lines 50
   ```

## Troubleshooting

**Backend not starting?**
```bash
pm2 logs spectr-backend
pm2 restart spectr-backend
```

**Frontend not loading?**
```bash
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

**Database connection issues?**
- Check `.env` file in `backend/` directory
- Verify database credentials
- Check security groups allow connection

