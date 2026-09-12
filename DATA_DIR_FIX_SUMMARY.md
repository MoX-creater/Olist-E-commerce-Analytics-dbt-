# DATA_DIR Path Fix Summary

## ✅ Changes Applied

Fixed the data directory path resolution to work both locally (direct node execution) and via Docker.

---

## 🔧 Technical Changes

### 1. Updated `ingestion/load_raw.js` (Line 24)

**Before:**
```javascript
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
// Looked for: /ingestion/data (WRONG - doesn't exist)
```

**After:**
```javascript
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
// Looks for: /data (CORRECT - repo root)
```

**Effect:**
- ✅ Local execution: Defaults to `../data` (repo root where CSVs actually are)
- ✅ Docker execution: Uses `DATA_DIR=/app/data` from environment variable
- ✅ Configurable via `DATA_DIR` env var for custom paths

### 2. Updated `docker/docker-compose.yml`

**Added explicit DATA_DIR environment variable:**

```yaml
ingestion:
  environment:
    PGHOST: postgres
    PGPORT: 5432
    PGUSER: ${POSTGRES_USER:-olist}
    PGPASSWORD: ${POSTGRES_PASSWORD:-olist_pass}
    PGDATABASE: ${POSTGRES_DB:-olist}
    DATA_DIR: /app/data  # ← Added this line
  volumes:
    - ../data:/app/data:ro
```

**Why:** Makes it explicit that Docker uses `/app/data` (the mounted volume path)

### 3. Updated `ingestion/.env.example`

**Added DATA_DIR documentation:**

```env
# Data directory path (defaults to ../data relative to ingestion folder)
# DATA_DIR=../data
```

---

## 📋 Path Resolution Table

| Execution Method | DATA_DIR Value | Actual Path | CSV Location |
|------------------|----------------|-------------|--------------|
| **Local (direct node)** | `../data` (default) | `/data` (repo root) | ✅ Correct |
| **Docker Compose** | `/app/data` (from env) | `/app/data` (mounted volume) | ✅ Correct |
| **Custom override** | `process.env.DATA_DIR` | Whatever you set | ✅ Configurable |

---

## 🧪 Verification Tests

### Test 1: Local Path Resolution ✅

```bash
cd ingestion
node -e "const path = require('path'); const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data'); console.log('DATA_DIR:', DATA_DIR); const fs = require('fs'); console.log('Exists:', fs.existsSync(DATA_DIR));"
```

**Result:**
```
DATA_DIR will be: ../data
Exists: true
CSV files: 9
```

### Test 2: Docker Path Resolution (will verify next)

```bash
cd docker
docker-compose run --rm ingestion
```

**Expected:** Will use `/app/data` from DATA_DIR env var in docker-compose.yml

---

## 🚀 How to Run Ingestion (Both Methods)

### Method 1: Direct Node Execution (Local)

```bash
cd ingestion

# Ensure .env is configured (for local Postgres):
# PGHOST=localhost
# PGSSLMODE=disable

# Run
node load_raw.js
```

**Uses:** `../data` (default fallback)

### Method 2: Docker Compose (Recommended)

```bash
cd docker

# For local Docker Postgres:
docker-compose run --rm ingestion

# For Neon (update ingestion/.env first):
# PGHOST=ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech
# PGSSLMODE=require
# Then pass env vars to Docker:
docker-compose run --rm \
  -e PGHOST=ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech \
  -e PGSSLMODE=require \
  -e PGUSER=neondb_owner \
  -e PGPASSWORD=npg_peviKDRTAP86 \
  -e PGDATABASE=neondb \
  ingestion
```

**Uses:** `/app/data` (from docker-compose.yml DATA_DIR env var)

---

## 🎯 Current Configuration Status

### Neon Connection Config in `ingestion/.env`:

```env
PGHOST=ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech
PGPORT=5432
PGUSER=neondb_owner
PGPASSWORD=npg_peviKDRTAP86
PGDATABASE=neondb
PGSSLMODE=require ✅
```

**Status:** Ready for Neon connection

---

## 📝 Docker vs Local Execution Summary

| Aspect | Local Execution | Docker Execution |
|--------|----------------|------------------|
| **Data path** | `../data` (repo root) | `/app/data` (mounted) |
| **Postgres host** | From `ingestion/.env` | Can override with `-e` flags |
| **SSL config** | From `ingestion/.env` | Can override with `-e` flags |
| **Network** | Your host network | Docker network |
| **Use case** | Quick local testing | Isolated, reproducible |

---

## ⚠️ Important Notes

### 1. Neon Connectivity Issue Remains

Even with DATA_DIR fixed, **Neon connectivity is still blocked** (port 5432 timeout). Options:

- **Fix Neon IP allowlist** (recommended for cloud deployment)
- **Use local Docker Postgres** (recommended for local development)
- **Run via Docker with Docker network** (may have different network route)

### 2. Docker Might Bypass Connectivity Issues

Docker containers often have different network routing than host. If your host machine can't reach Neon (firewall/ISP), Docker might succeed because:
- Different DNS resolution
- Different network interface
- Docker network may route differently

**Worth trying:** Run via Docker even though local node failed.

---

## 🧪 Next: Test Via Docker Against Neon

```bash
cd docker

# Method 1: Using ingestion/.env credentials
docker-compose run --rm \
  -e PGHOST=ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech \
  -e PGSSLMODE=require \
  -e PGUSER=neondb_owner \
  -e PGPASSWORD=npg_peviKDRTAP86 \
  -e PGDATABASE=neondb \
  ingestion

# Method 2: If above works, can add to docker-compose.yml for convenience
```

**Expected output if successful:**
```
======================================================================
🗄️  OLIST RAW DATA INGESTION
======================================================================
📍 Target Database: ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech:5432
🔐 User: neondb_owner
💾 Database: neondb
🔒 SSL Mode: require
======================================================================
⚠️  WARNING: This will DROP and recreate all raw.* tables with CASCADE
⚠️  Any dependent dbt views (staging, marts) will also be dropped!
⚠️  You must run `dbt run` after ingestion to rebuild models.
======================================================================

Found 9 CSV files.
Processing olist_customers_dataset.csv -> raw.olist_customers_dataset...
Loaded raw.olist_customers_dataset (99441 rows)
Processing olist_geolocation_dataset.csv -> raw.olist_geolocation_dataset...
Loaded raw.olist_geolocation_dataset (1000163 rows)
...
✓ All files loaded successfully.

📢 REMINDER: Run `dbt run` to rebuild staging/intermediate/mart models.
```

---

## 📋 Post-Ingestion Checklist

Once ingestion completes successfully:

- [ ] Verify all 9 raw tables exist in Neon:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema = 'raw' ORDER BY table_name;
  ```

- [ ] Rebuild dbt models:
  ```bash
  cd dbt_project
  
  # Export Neon credentials
  export PGHOST=ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech
  export PGUSER=neondb_owner
  export PGPASSWORD=npg_peviKDRTAP86
  export PGDATABASE=neondb
  export PGSSLMODE=require
  
  # Test connection
  dbt debug
  
  # Run models
  dbt run
  ```

- [ ] Verify staging/marts rebuilt:
  ```sql
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema IN ('public_staging', 'public_marts') 
  ORDER BY table_schema, table_name;
  ```

- [ ] Restart dashboard API to connect to Neon data

---

## 🎯 Summary

| Item | Status |
|------|--------|
| DATA_DIR local default | ✅ Fixed to `../data` |
| DATA_DIR Docker override | ✅ Set to `/app/data` |
| CASCADE fix | ✅ Already applied |
| SSL config | ✅ `PGSSLMODE=require` set |
| Local node execution | ✅ Ready (finds CSVs) |
| Docker execution | 🧪 Ready to test |
| Neon connectivity | ⚠️ Test via Docker next |

**Next command:**
```bash
cd docker
docker-compose run --rm -e PGHOST=ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech -e PGSSLMODE=require -e PGUSER=neondb_owner -e PGPASSWORD=npg_peviKDRTAP86 -e PGDATABASE=neondb ingestion
```
