#!/bin/bash
# Simple script to check API keys on the server
# Run this on your EC2 server: bash check-server-api-key.sh

echo "🔍 Checking for Claude AI API Keys on Server..."
echo ""

cd ~/chainCommands/backend 2>/dev/null || cd backend 2>/dev/null || { echo "Error: Could not find backend directory"; exit 1; }

if [ -f ".env" ]; then
    echo "✓ .env file exists"
    echo ""
    
    # Check ANTHROPIC_API_KEY
    if grep -q "^ANTHROPIC_API_KEY=" .env; then
        KEY_VALUE=$(grep "^ANTHROPIC_API_KEY=" .env | cut -d '=' -f2- | tr -d ' ' | tr -d '"' | tr -d "'")
        KEY_LENGTH=${#KEY_VALUE}
        if [ $KEY_LENGTH -gt 20 ] && [ "$KEY_VALUE" != "your-claude-api-key" ]; then
            echo "✓ ANTHROPIC_API_KEY is set (length: $KEY_LENGTH characters)"
            echo "  First 10 chars: ${KEY_VALUE:0:10}..."
        else
            echo "⚠ ANTHROPIC_API_KEY is set but appears to be invalid or placeholder"
        fi
    else
        echo "✗ ANTHROPIC_API_KEY not found in .env"
    fi
    
    # Check AI_API_KEY
    if grep -q "^AI_API_KEY=" .env; then
        KEY_VALUE=$(grep "^AI_API_KEY=" .env | cut -d '=' -f2- | tr -d ' ' | tr -d '"' | tr -d "'")
        KEY_LENGTH=${#KEY_VALUE}
        if [ $KEY_LENGTH -gt 20 ] && [ "$KEY_VALUE" != "your-claude-api-key" ]; then
            echo "✓ AI_API_KEY is set (length: $KEY_LENGTH characters)"
            echo "  First 10 chars: ${KEY_VALUE:0:10}..."
        else
            echo "⚠ AI_API_KEY is set but appears to be invalid or placeholder"
        fi
    else
        echo "✗ AI_API_KEY not found in .env"
    fi
    
    echo ""
    echo "📋 Current .env file location: $(pwd)/.env"
else
    echo "✗ .env file not found in backend directory"
    echo ""
    echo "Current directory: $(pwd)"
    echo ""
    echo "To create .env file, run:"
    echo "  echo 'ANTHROPIC_API_KEY=your-api-key-here' > .env"
    echo "  # Then restart PM2: pm2 restart spectr-backend"
fi

echo ""
echo "Checking if PM2 process can see the environment variables..."
pm2 describe spectr-backend 2>/dev/null | grep -E "ANTHROPIC_API_KEY|AI_API_KEY" || echo "  (PM2 environment variables not visible in this check)"

echo ""
echo "✅ Check complete!"

