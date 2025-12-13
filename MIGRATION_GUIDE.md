# Database Migration Guide: SQLite to PostgreSQL

This guide will help you migrate your SPECTR SYSTEMS database from SQLite to PostgreSQL (AWS RDS).

## Prerequisites

- ✅ AWS RDS PostgreSQL database created (see `AWS_RDS_SETUP.md`)
- ✅ PostgreSQL connection details ready
- ✅ Backend dependencies installed (`pg` package)
- ✅ Backup of current SQLite database

## Step 1: Backup Current SQLite Database

```bash
cd backend
cp data/spectr-systems.db data/spectr-systems.db.backup
```

## Step 2: Install Migration Tools

```bash
cd backend
npm install pg sqlite3
```

## Step 3: Run Migration Script

We'll create a migration script that:
1. Reads all data from SQLite
2. Creates tables in PostgreSQL
3. Transfers all data
4. Verifies the migration

### Create Migration Script

The migration script is located at: `backend/scripts/migrate-to-postgresql.js`

Run it:
```bash
cd backend
node scripts/migrate-to-postgresql.js
```

## Step 4: Verify Migration

After migration completes:

1. **Check row counts match:**
   - Compare table row counts between SQLite and PostgreSQL
   - The script will show a comparison

2. **Test application:**
   - Start backend: `npm run dev`
   - Test login, workflows, executions
   - Verify all features work

3. **Check data integrity:**
   - Verify workflows are intact
   - Check user accounts
   - Verify execution history

## Step 5: Update Backend to Use PostgreSQL

The backend has been updated to support both SQLite and PostgreSQL based on environment variables.

**In `backend/.env`:**
```env
DB_TYPE=postgresql
DB_HOST=your-rds-endpoint
DB_PORT=5432
DB_NAME=spectrsystems
DB_USER=spectr_admin
DB_PASSWORD=your-password
```

## Step 6: Switch to PostgreSQL

1. **Stop the backend** (if running)

2. **Update .env** with PostgreSQL credentials

3. **Start backend:**
   ```bash
   npm run dev
   ```

4. **Verify connection:**
   - Look for: `✅ Database initialized successfully`
   - Check for any connection errors

## Migration Script Details

The migration script (`migrate-to-postgresql.js`) will:

1. **Connect to both databases**
   - SQLite (source)
   - PostgreSQL (destination)

2. **Create PostgreSQL schema**
   - All tables with proper types
   - Indexes
   - Foreign keys

3. **Transfer data table by table:**
   - `users`
   - `workflows`
   - `executions`
   - `data_store`
   - `organizations`
   - `user_organizations`
   - `email_verification_tokens`
   - `password_reset_tokens`
   - `intelligence_cases`
   - `intelligence_findings`
   - `intelligence_entities`
   - `intelligence_entity_relationships`
   - `intelligence_timeline`
   - `intelligence_sources`

4. **Handle data type conversions:**
   - SQLite INTEGER → PostgreSQL INTEGER/BOOLEAN
   - SQLite TEXT → PostgreSQL TEXT/TIMESTAMP
   - SQLite JSON → PostgreSQL JSONB

5. **Preserve relationships:**
   - Foreign keys
   - Indexes
   - Unique constraints

## Rollback Plan

If migration fails or issues occur:

1. **Keep SQLite backup:**
   ```bash
   # Restore from backup
   cp data/spectr-systems.db.backup data/spectr-systems.db
   ```

2. **Revert .env:**
   ```env
   DB_TYPE=sqlite
   # Remove PostgreSQL variables
   ```

3. **Restart backend:**
   ```bash
   npm run dev
   ```

## Post-Migration Checklist

- [ ] All users can log in
- [ ] Workflows are accessible
- [ ] Execution history is preserved
- [ ] Intelligence cases are intact
- [ ] Data store values are correct
- [ ] No errors in backend logs
- [ ] Performance is acceptable
- [ ] Backups are configured on RDS

## Troubleshooting

### Migration Script Errors

**"Connection refused"**
- Check RDS endpoint and port
- Verify security group allows your IP
- Check if database is in "available" status

**"Authentication failed"**
- Verify username and password
- Check if user has proper permissions

**"Table already exists"**
- Drop existing tables in PostgreSQL
- Or modify script to handle existing tables

**"Data type mismatch"**
- Check migration script handles all data types
- Verify JSON fields are properly converted

### Application Errors After Migration

**"Cannot connect to database"**
- Verify `.env` file has correct credentials
- Check backend logs for connection errors
- Test connection with `psql` or pgAdmin

**"Table does not exist"**
- Run migration script again
- Check if tables were created in correct database

**"Foreign key constraint failed"**
- Verify data was migrated in correct order
- Check if all referenced records exist

## Next Steps

After successful migration:

1. ✅ Monitor application for 24-48 hours
2. ✅ Verify backups are working on RDS
3. ✅ Set up CloudWatch alarms (optional)
4. ✅ Document any custom configurations
5. ✅ Keep SQLite backup for 30 days (safety)

## Support

If you encounter issues:
- Check backend logs: `backend/logs/` (if logging enabled)
- Review RDS CloudWatch metrics
- Check PostgreSQL logs in RDS console

