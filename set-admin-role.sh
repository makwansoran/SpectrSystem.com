#!/bin/bash
cd ~/SpectrSystem.com/backend
source .env 2>/dev/null || true

echo "Setting user makwansoran@outlook.com as admin..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "UPDATE users SET role = 'admin' WHERE email = 'makwansoran@outlook.com';"

echo ""
echo "Verifying update..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT email, name, role FROM users WHERE email = 'makwansoran@outlook.com';"

echo ""
echo "✅ Done! Now log out and log back in to see the admin button."

