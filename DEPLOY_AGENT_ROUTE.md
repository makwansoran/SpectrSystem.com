# Deploy Agent Route to AWS

## Quick Deployment Steps

The agent route has been updated with Claude AI support. Here's how to deploy:

### Option 1: Deploy via Git (Recommended)

If your code is in a git repository:

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add Claude AI support to agent route and AI nodes"
   git push
   ```

2. **SSH into your EC2 server:**
   ```bash
   ssh -i your-key.pem ec2-user@your-server-ip
   ```

3. **Pull the latest code:**
   ```bash
   cd ~/chainCommands
   git pull
   ```

4. **Deploy the backend:**
   ```bash
   cd backend
   npm install --production
   npm run build
   pm2 restart spectr-backend
   ```

### Option 2: Direct File Transfer

If you prefer to transfer files directly:

1. **Build the TypeScript (on your local machine):**
   ```bash
   cd backend
   npm run build
   ```

2. **Transfer the built files to your server:**
   ```bash
   # Using SCP (from project root)
   scp -i your-key.pem -r backend/dist/* ec2-user@your-server-ip:~/chainCommands/backend/dist/
   scp -i your-key.pem backend/src/routes/agent.ts ec2-user@your-server-ip:~/chainCommands/backend/src/routes/agent.ts
   scp -i your-key.pem backend/src/services/nodes/ai/ai-agent.ts ec2-user@your-server-ip:~/chainCommands/backend/src/services/nodes/ai/ai-agent.ts
   scp -i your-key.pem backend/src/index.ts ec2-user@your-server-ip:~/chainCommands/backend/src/index.ts
   ```

3. **SSH into server and restart:**
   ```bash
   ssh -i your-key.pem ec2-user@your-server-ip
   cd ~/chainCommands/backend
   npm run build  # Rebuild on server
   pm2 restart spectr-backend
   ```

### Option 3: Use the PowerShell Script

Run the provided PowerShell script:

```powershell
.\deploy-backend-to-aws.ps1
```

You'll be prompted for:
- EC2 server IP or hostname
- Path to your SSH key (.pem file)

## Verify Deployment

After deployment, test the endpoints:

1. **Test endpoint (no auth required):**
   ```bash
   curl https://spectrsystem.com/api/agent/test
   ```
   Should return: `{"success":true,"message":"Agent route is working",...}`

2. **Check PM2 status:**
   ```bash
   ssh -i your-key.pem ec2-user@your-server-ip
   pm2 status spectr-backend
   pm2 logs spectr-backend --lines 50
   ```

3. **Test agent chat (requires authentication):**
   - Open https://spectrsystem.com/app
   - Open the agent chat
   - Send a message

## Environment Variables

Make sure your `.env` file on the server has:

```bash
ANTHROPIC_API_KEY=your-claude-api-key
# OR
AI_API_KEY=your-claude-api-key

# Optional (defaults shown):
AI_PROVIDER=anthropic
AI_MODEL=claude-3-5-haiku-20241022
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
```

## Troubleshooting

If you get a 404 error:

1. **Check if the route is registered:**
   ```bash
   pm2 logs spectr-backend | grep "agent"
   ```

2. **Verify the route file exists:**
   ```bash
   ls -la ~/chainCommands/backend/src/routes/agent.ts
   ```

3. **Check nginx configuration:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **Restart the backend:**
   ```bash
   pm2 restart spectr-backend
   ```

## Files Changed

The following files were updated:
- `backend/src/routes/agent.ts` - Added test endpoint and improved logging
- `backend/src/services/nodes/ai/ai-agent.ts` - Updated Anthropic API version and added API key fallback
- `backend/src/index.ts` - Updated server startup message

