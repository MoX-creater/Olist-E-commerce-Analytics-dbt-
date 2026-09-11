# SSL Connection Configuration for Neon

## ✅ Changes Applied

All Postgres connection configurations have been updated to support Neon (SSL required) with conditional fallback to local Docker Postgres.

---

## 📝 Files Modified

### 1. `ingestion/load_raw.js`
**Changed:** Added conditional SSL to the Pool configuration
```javascript
const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
});
```

### 2. `dashboard-api/db.js`
**Changed:** Added conditional SSL to the Pool configuration
```javascript
const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: process.env.PGPORT || 5432,
  user: process.env.PGUSER || 'olist',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'olist',
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. `ingestion/.env.example`
**Added:** `PGSSLMODE` environment variable with examples
```env
PGHOST=localhost
PGPORT=5432
PGUSER=olist
PGPASSWORD=olist_pass
PGDATABASE=olist
PGSSLMODE=disable

# For Neon or other cloud Postgres (requires SSL):
# PGHOST=your-neon-host.neon.tech
# PGPORT=5432
# PGUSER=your-user
# PGPASSWORD=your-password
# PGDATABASE=your-database
# PGSSLMODE=require
```

### 4. `dashboard-api/.env.example`
**Added:** `PGSSLMODE` environment variable with examples
```env
# Database Connection
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=olist
PGPASSWORD=olist_pass
PGDATABASE=olist
PGSSLMODE=disable

# For Neon or other cloud Postgres (requires SSL):
# PGHOST=your-neon-host.neon.tech
# PGPORT=5432
# PGUSER=your-user
# PGPASSWORD=your-password
# PGDATABASE=your-database
# PGSSLMODE=require
```

### 5. `dbt_project/profiles.yml`
**Added:** `sslmode` configuration with environment variable support
```yaml
olist_analytics:
  target: dev
  outputs:
    dev:
      type: postgres
      host: "{{ env_var('PGHOST', '127.0.0.1') }}"
      port: "{{ env_var('PGPORT', '5432') | int }}"
      user: "{{ env_var('PGUSER', 'olist') }}"
      password: "{{ env_var('PGPASSWORD', 'olist_pass') }}"
      dbname: "{{ env_var('PGDATABASE', 'olist') }}"
      schema: public
      threads: 4
      sslmode: "{{ env_var('PGSSLMODE', 'disable') }}"
```

---

## 🔧 Configuration Guide

### SSL Mode Options

| Value | Behavior | Use Case |
|-------|----------|----------|
| `disable` | No SSL connection | Local Docker Postgres |
| `require` | SSL required, accepts self-signed certs | Neon, most cloud providers |
| `prefer` | Try SSL first, fallback to non-SSL | Mixed environments |

**Note:** The code uses `{ rejectUnauthorized: false }` when SSL is required, which accepts self-signed certificates. This is standard for managed Postgres services like Neon.

---

## 🚀 Setup Instructions

### For Local Docker Postgres (Default)

1. Copy `.env.example` to `.env` in both `ingestion/` and `dashboard-api/`:
   ```bash
   cp ingestion/.env.example ingestion/.env
   cp dashboard-api/.env.example dashboard-api/.env
   ```

2. Keep `PGSSLMODE=disable` (or omit it entirely, defaults to false)

3. Set dbt environment (optional, defaults to disable):
   ```bash
   export PGSSLMODE=disable
   ```

### For Neon (or other SSL-required cloud Postgres)

1. Update `ingestion/.env`:
   ```env
   PGHOST=your-neon-host.neon.tech
   PGPORT=5432
   PGUSER=your-neon-user
   PGPASSWORD=your-neon-password
   PGDATABASE=your-database
   PGSSLMODE=require
   ```

2. Update `dashboard-api/.env`:
   ```env
   PGHOST=your-neon-host.neon.tech
   PGPORT=5432
   PGUSER=your-neon-user
   PGPASSWORD=your-neon-password
   PGDATABASE=your-database
   PGSSLMODE=require
   
   PORT=3001
   FRONTEND_ORIGIN=http://localhost:5173
   ```

3. Export dbt environment variables (required for dbt):
   ```bash
   export PGHOST=your-neon-host.neon.tech
   export PGPORT=5432
   export PGUSER=your-neon-user
   export PGPASSWORD=your-neon-password
   export PGDATABASE=your-database
   export PGSSLMODE=require
   ```

   **Windows (PowerShell):**
   ```powershell
   $env:PGHOST="your-neon-host.neon.tech"
   $env:PGPORT="5432"
   $env:PGUSER="your-neon-user"
   $env:PGPASSWORD="your-neon-password"
   $env:PGDATABASE="your-database"
   $env:PGSSLMODE="require"
   ```

---

## 🧪 Testing Instructions

### Test 1: Ingestion Script

```bash
cd ingestion
node load_raw.js
```

**Expected output:**
- `Found X CSV files.`
- `Processing <filename>.csv -> raw.<tablename>...`
- `Loaded raw.<tablename> (X rows)`
- `✓ All files loaded successfully.`

**If SSL fails:**
- Check `PGSSLMODE=require` is set in `ingestion/.env`
- Verify Neon credentials are correct
- Confirm Neon database allows connections from your IP

### Test 2: Dashboard API

```bash
cd dashboard-api
npm start
```

**Expected output:**
- `✅ Database connection established`
- `Dashboard API listening on port 3001`

**Test connection:**
```bash
curl http://localhost:3001/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-09-11T..."
}
```

### Test 3: dbt Connection

```bash
cd dbt_project
dbt debug
```

**Expected output:**
```
...
Connection test: [OK connection ok]
...
All checks passed!
```

**If connection fails:**
- Ensure `PGSSLMODE=require` is exported in your shell
- dbt does NOT read .env files automatically - you must export variables
- Run `echo $PGSSLMODE` (bash) or `echo $env:PGSSLMODE` (PowerShell) to verify

### Test 4: dbt Run (Full Integration)

```bash
cd dbt_project
dbt run
```

**Expected output:**
- All models should compile and run successfully
- Check for `Completed successfully` at the end

---

## 🔍 Troubleshooting

### Error: "SSL connection required"

**Cause:** Neon requires SSL but `PGSSLMODE` is not set to `require`

**Fix:**
```bash
# Add to .env files
PGSSLMODE=require

# Export for dbt (shell session)
export PGSSLMODE=require  # bash
$env:PGSSLMODE="require"   # PowerShell
```

### Error: "self signed certificate in certificate chain"

**Cause:** SSL is enabled but rejecting self-signed certificates

**Fix:** This should NOT happen with our config (we use `rejectUnauthorized: false`). If it does, check that the code changes were applied correctly.

### Error: "Connection timeout"

**Cause:** Firewall, network issue, or incorrect host

**Fix:**
- Verify Neon host is correct (check Neon dashboard)
- Check that your IP is allowed (Neon may have IP restrictions)
- Try `ping your-neon-host.neon.tech` to test connectivity

### dbt says "password authentication failed"

**Cause:** Environment variables not exported for dbt session

**Fix:** dbt requires variables to be exported in the shell, not just in .env files:
```bash
# Export all variables for dbt
export PGHOST=your-neon-host.neon.tech
export PGUSER=your-neon-user
export PGPASSWORD=your-neon-password
export PGDATABASE=your-database
export PGSSLMODE=require

# Then run dbt
dbt debug
```

---

## 🔄 Switching Between Local and Neon

### Quick Switch Script (bash)

Create `scripts/use-local.sh`:
```bash
#!/bin/bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=olist
export PGPASSWORD=olist_pass
export PGDATABASE=olist
export PGSSLMODE=disable
echo "Switched to local Postgres (Docker)"
```

Create `scripts/use-neon.sh`:
```bash
#!/bin/bash
export PGHOST=your-neon-host.neon.tech
export PGPORT=5432
export PGUSER=your-neon-user
export PGPASSWORD=your-neon-password
export PGDATABASE=your-database
export PGSSLMODE=require
echo "Switched to Neon Postgres"
```

**Usage:**
```bash
source scripts/use-local.sh  # Switch to local
source scripts/use-neon.sh   # Switch to Neon
```

### PowerShell Version

Create `scripts/use-local.ps1`:
```powershell
$env:PGHOST="localhost"
$env:PGPORT="5432"
$env:PGUSER="olist"
$env:PGPASSWORD="olist_pass"
$env:PGDATABASE="olist"
$env:PGSSLMODE="disable"
Write-Host "Switched to local Postgres (Docker)"
```

Create `scripts/use-neon.ps1`:
```powershell
$env:PGHOST="your-neon-host.neon.tech"
$env:PGPORT="5432"
$env:PGUSER="your-neon-user"
$env:PGPASSWORD="your-neon-password"
$env:PGDATABASE="your-database"
$env:PGSSLMODE="require"
Write-Host "Switched to Neon Postgres"
```

**Usage:**
```powershell
. .\scripts\use-local.ps1  # Switch to local
. .\scripts\use-neon.ps1   # Switch to Neon
```

---

## 📋 Pre-Flight Checklist

Before running ingestion/dbt against Neon:

- [ ] Neon database is created and accessible
- [ ] `raw` schema exists in Neon database (or will be created by ingestion script)
- [ ] All CSV files are in `data/` directory
- [ ] `PGSSLMODE=require` is set in both `.env` files
- [ ] Environment variables are exported for dbt session
- [ ] Test connection with `dbt debug` shows `[OK connection ok]`
- [ ] Dashboard API health check returns `"database": "connected"`

---

## 🎯 Next Steps

1. **Update your actual `.env` files** with Neon credentials (don't commit these!)
2. **Test each component** using the testing instructions above
3. **Run ingestion** to load raw data into Neon
4. **Run dbt** to build staging/intermediate/mart models
5. **Start dashboard** to visualize data from Neon

---

**Configuration complete!** All three components (ingestion, dashboard-api, dbt) now support conditional SSL for Neon compatibility while maintaining local Docker Postgres fallback.
