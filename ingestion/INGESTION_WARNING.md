# ⚠️ Ingestion Script Safety Information

## What load_raw.js Does

The ingestion script (`load_raw.js`) performs these operations:

1. **Reads all CSV files** from `../data/` directory
2. **Drops existing raw.* tables** using `DROP TABLE ... CASCADE`
3. **Creates fresh raw.* tables** with inferred column types
4. **Loads CSV data** into the raw tables

---

## ⚠️ CASCADE Drop Behavior

The script uses `DROP TABLE IF EXISTS raw.<table> CASCADE` which means:

- ✅ Removes the raw table itself
- ✅ **Also removes ALL dependent database objects**, including:
  - dbt staging views (e.g., `public_staging.stg_customers`)
  - dbt intermediate views/tables
  - dbt mart views/tables (if they depend on raw tables via staging)
  - Any other views, foreign keys, or triggers

**This is intentional and expected behavior** - it ensures a clean slate for fresh data ingestion.

---

## 🔄 Required Follow-Up Actions

After running `load_raw.js`, you **MUST** rebuild your dbt models:

```bash
cd ../dbt_project
dbt run
```

This will recreate all the dropped staging/intermediate/mart models.

---

## 🎯 Target Database Identification

The script now displays prominent warnings at startup showing:

```
======================================================================
🗄️  OLIST RAW DATA INGESTION
======================================================================
📍 Target Database: your-host:5432
🔐 User: your-user
💾 Database: your-database
🔒 SSL Mode: require
======================================================================
⚠️  WARNING: This will DROP and recreate all raw.* tables with CASCADE
⚠️  Any dependent dbt views (staging, marts) will also be dropped!
⚠️  You must run `dbt run` after ingestion to rebuild models.
======================================================================
```

**Always verify the target database before proceeding!**

---

## 🔍 Current Configuration Check

You are currently configured to connect to:

**Host:** `ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech`  
**SSL Mode:** `disabled` ⚠️ **INCORRECT - Neon requires SSL!**

### Fix Required:

Update `ingestion/.env`:

```env
PGSSLMODE=require
```

Without this, the connection to Neon will fail.

---

## 🚦 Safe Workflow

### Option 1: Local Development (Docker Postgres)

```bash
# 1. Ensure .env points to local Docker
cd ingestion
# Edit .env:
#   PGHOST=localhost
#   PGPORT=5432
#   PGUSER=olist
#   PGPASSWORD=olist_pass
#   PGDATABASE=olist
#   PGSSLMODE=disable

# 2. Run ingestion
node load_raw.js

# 3. Rebuild dbt models
cd ../dbt_project
dbt run
```

### Option 2: Neon Cloud Database

```bash
# 1. Ensure .env points to Neon
cd ingestion
# Edit .env:
#   PGHOST=ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech
#   PGPORT=5432
#   PGUSER=your-neon-user
#   PGPASSWORD=your-neon-password
#   PGDATABASE=your-database
#   PGSSLMODE=require  ⬅️ MUST BE 'require'

# 2. Run ingestion
node load_raw.js
# Check the banner - confirm it shows your Neon host!

# 3. Export env vars for dbt
export PGHOST=ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech
export PGUSER=your-neon-user
export PGPASSWORD=your-neon-password
export PGDATABASE=your-database
export PGSSLMODE=require

# 4. Rebuild dbt models
cd ../dbt_project
dbt run
```

---

## 🐛 Common Issues

### Issue: "cannot drop table ... because other objects depend on it"

**Cause:** Script was using `DROP TABLE` without CASCADE (now fixed)

**Fix:** Update applied - script now uses `DROP TABLE ... CASCADE`

### Issue: Connection fails to Neon

**Cause:** `PGSSLMODE` not set to `require`

**Fix:** Add `PGSSLMODE=require` to `ingestion/.env`

### Issue: dbt models missing after ingestion

**Cause:** CASCADE drop removed dependent views (expected behavior)

**Fix:** Run `dbt run` to rebuild models (always required after ingestion)

---

## 📋 Checklist Before Running Ingestion

- [ ] Verify target database in banner (local vs Neon)
- [ ] Confirm `PGSSLMODE` matches database type
  - `disable` for local Docker
  - `require` for Neon
- [ ] CSV files exist in `../data/` directory
- [ ] You are prepared to run `dbt run` afterward
- [ ] (Optional) Back up existing data if needed

---

## 💾 Data Preservation Note

The ingestion script **completely replaces** raw table data. If you need to preserve existing data:

1. Export current data before ingestion:
   ```bash
   pg_dump -h localhost -U olist -d olist -n raw -f backup_raw_schema.sql
   ```

2. Run ingestion (drops and recreates tables)

3. If needed, restore from backup

---

**Summary:** The script is now safe to run against either local or Neon Postgres. It will clearly identify the target database and warn about CASCADE drops. Always run `dbt run` after ingestion completes.
