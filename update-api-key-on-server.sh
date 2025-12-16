#!/bin/bash
# Script to update ANTHROPIC_API_KEY on the server
# Run this on your EC2 server

# API key should be provided as environment variable or first argument
NEW_API_KEY="${1:-${ANTHROPIC_API_KEY}}"

if [ -z "$NEW_API_KEY" ]; then
    echo "❌ Error: API key not provided"
    echo "Usage: $0 <api-key>"
    echo "   OR: ANTHROPIC_API_KEY=<api-key> $0"
    exit 1
fi

cd ~/chainCommands/backend 2>/dev/null || cd backend 2>/dev/null || { echo "Error: Could not find backend directory"; exit 1; }

echo "🔑 Updating ANTHROPIC_API_KEY..."

# Remove old ANTHROPIC_API_KEY if it exists
if [ -f ".env" ]; then
    # Remove any existing ANTHROPIC_API_KEY line
    sed -i '/^ANTHROPIC_API_KEY=/d' .env
    echo "✓ Removed old ANTHROPIC_API_KEY"
fi

# Add new API key
echo "ANTHROPIC_API_KEY=$NEW_API_KEY" >> .env
echo "✓ Added new ANTHROPIC_API_KEY"

# Verify it was added
if grep -q "^ANTHROPIC_API_KEY=" .env; then
    echo "✓ Verification: API key is set in .env"
    KEY_LENGTH=$(grep "^ANTHROPIC_API_KEY=" .env | cut -d '=' -f2- | wc -c)
    echo "  Key length: $((KEY_LENGTH-1)) characters"
else
    echo "✗ Error: API key was not added correctly"
    exit 1
fi

echo ""
echo "🔄 Restarting backend..."
pm2 restart spectr-backend

echo ""
echo "✅ API key updated and backend restarted!"
echo ""
echo "Test the endpoint:"
echo "  curl https://spectrsystem.com/api/agent/test"

