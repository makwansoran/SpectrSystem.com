#!/bin/bash
cd ~/SpectrSystem.com/backend
source .env 2>/dev/null || true

echo "Checking user role..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT email, role FROM users WHERE email = 'makwansoran@outlook.com';"

echo ""
echo "✅ If role shows 'admin', then:"
echo "   1. Log out of the web app"
echo "   2. Log back in"
echo "   3. Hard refresh (Ctrl+Shift+R)"
echo "   4. The admin button should appear in the sidebar"

