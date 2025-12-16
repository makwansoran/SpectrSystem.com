#!/bin/bash
# Script to check if ANTHROPIC_API_KEY or AI_API_KEY is configured
# Run this on your EC2 server

echo "🔍 Checking for Claude AI API Keys..."
echo ""

# Check if .env file exists
if [ -f "backend/.env" ]; then
    echo "✓ Found .env file"
    echo ""
    echo "Checking for API keys in .env file:"
    
    if grep -q "ANTHROPIC_API_KEY" backend/.env; then
        ANTHROPIC_KEY=$(grep "ANTHROPIC_API_KEY" backend/.env | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
        if [ -n "$ANTHROPIC_KEY" ] && [ "$ANTHROPIC_KEY" != "your-claude-api-key" ]; then
            echo "  ✓ ANTHROPIC_API_KEY is set (length: ${#ANTHROPIC_KEY} characters)"
        else
            echo "  ⚠ ANTHROPIC_API_KEY is set but appears to be a placeholder"
        fi
    else
        echo "  ✗ ANTHROPIC_API_KEY not found"
    fi
    
    if grep -q "AI_API_KEY" backend/.env; then
        AI_KEY=$(grep "AI_API_KEY" backend/.env | cut -d '=' -f2 | tr -d ' ' | tr -d '"')
        if [ -n "$AI_KEY" ] && [ "$AI_KEY" != "your-claude-api-key" ]; then
            echo "  ✓ AI_API_KEY is set (length: ${#AI_KEY} characters)"
        else
            echo "  ⚠ AI_API_KEY is set but appears to be a placeholder"
        fi
    else
        echo "  ✗ AI_API_KEY not found"
    fi
else
    echo "✗ .env file not found in backend directory"
    echo ""
    echo "Please create backend/.env file with:"
    echo "  ANTHROPIC_API_KEY=your-actual-api-key"
    echo "  OR"
    echo "  AI_API_KEY=your-actual-api-key"
fi

echo ""
echo "Checking PM2 environment variables:"
pm2 env spectr-backend | grep -E "ANTHROPIC_API_KEY|AI_API_KEY" || echo "  No API keys found in PM2 environment"

echo ""
echo "Checking system environment variables:"
if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "  ✓ ANTHROPIC_API_KEY is set in system environment"
else
    echo "  ✗ ANTHROPIC_API_KEY not set in system environment"
fi

if [ -n "$AI_API_KEY" ]; then
    echo "  ✓ AI_API_KEY is set in system environment"
else
    echo "  ✗ AI_API_KEY not set in system environment"
fi

echo ""
echo "📋 Summary:"
echo "The application will use (in order of priority):"
echo "  1. AI_API_KEY from .env or environment"
echo "  2. ANTHROPIC_API_KEY from .env or environment"
echo ""
echo "If neither is set, the agent chat will return an error."
