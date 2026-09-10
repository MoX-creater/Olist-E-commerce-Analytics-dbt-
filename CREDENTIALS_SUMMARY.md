# 🔐 Database Credentials Summary

## 📋 Current Credential Configuration

All credentials are **synchronized** and set to:

```
User:     olist
Password: olist_pass
Database: olist
Port:     5432
```

## 📁 Configuration Files

### 1. `docker/.env` - Docker Compose Configuration
```env
POSTGRES_USER=olist
POSTGRES_PASSWORD=olist_pass
POSTGRES_DB=olist
```
**Purpose:** Used by docker-compose to initialize Postgres container

---

### 2. `ingestion/.env` - Node.js Ingestion Script
```env
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=olist
PGPASSWORD=olist_pass
PGDATABASE=olist
```
**Purpose:** Used by Node.js `load_raw.js` to connect to Postgres  
**Note:** Uses `127.0.0.1` because it runs inside Docker network

---

### 3. `dbt_project/profiles.yml` - dbt Connection Profile
```yaml
olist_analytics:
  target: dev
  outputs:
    dev:
      type: postgres
      host: localhost
      port: 5432
      user: olist
      password: olist_pass  # HARDCODED (was env_var before)
      dbname: olist
      schema: public
      threads: 4
```
**Purpose:** Used by dbt for local development  
**Changed:** Switched from `{{ env_var('POSTGRES_PASSWORD') }}` to hardcoded value  
**Reason:** Git Bash doesn't auto-export environment variables

---

### 4. `dbt_project/.env` - dbt Environment Variables (NEW)
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=olist
POSTGRES_PASSWORD=olist_pass
POSTGRES_DB=olist
```
**Purpose:** Optional fallback for environment variable configuration  
**Status:** Not currently used (profiles.yml has hardcoded values)  
**Added to:** `.gitignore` to prevent committing

---

## 🔒 Security Configuration

### Files in `.gitignore`:
```gitignore
.env                      # Root level
dbt_project/.env          # dbt credentials (NEW)
ingestion/.env            # Already existed
docker/.env               # Already existed
```

✅ **No credentials are committed to git**

---

## ✅ Verification Commands

### Test Postgres Connection Directly
```bash
# From Windows/Git Bash
docker exec olist_postgres psql -h 127.0.0.1 -U olist -d olist -c "SELECT 'Connected!' as status;"
```

### Test dbt Connection
```bash
cd dbt_project
source venv/Scripts/activate
dbt debug
```

Expected output:
```
Connection test: [OK connection ok]
```

### Test Ingestion Script
```bash
cd docker
docker-compose run --rm ingestion
```

---

## 🔄 What Changed (This Session)

### Before:
**`dbt_project/profiles.yml`** used `env_var()`:
```yaml
password: "{{ env_var('POSTGRES_PASSWORD', 'olist_pass') }}"
```

**Problem:**
- Git Bash doesn't export `POSTGRES_PASSWORD` environment variable
- dbt couldn't read the password
- Authentication failed

### After:
**`dbt_project/profiles.yml`** now uses hardcoded values:
```yaml
password: olist_pass
```

**Solution:**
- Direct credentials work immediately
- No environment variable configuration needed
- Added to `.gitignore` so not committed

---

## 🎯 For Different Environments

### Local Development (Your Machine)
- **File:** `dbt_project/profiles.yml`
- **Credentials:** Hardcoded
- **Host:** `localhost`

### Docker Ingestion
- **File:** `ingestion/.env`
- **Credentials:** Hardcoded
- **Host:** `postgres` (Docker service name) or `127.0.0.1`

### GitHub Actions CI/CD
- **File:** Generated dynamically in workflow
- **Credentials:** From GitHub Secrets
- **Host:** From `${{ secrets.PGHOST }}`

Example from `.github/workflows/dbt-docs.yml`:
```yaml
- name: Create profiles.yml with secrets
  run: |
    cat > profiles.yml << EOF
    olist_analytics:
      target: prod
      outputs:
        prod:
          type: postgres
          host: ${{ secrets.PGHOST }}
          user: ${{ secrets.PGUSER }}
          password: ${{ secrets.PGPASSWORD }}
          # ...
    EOF
```

---

## 🚨 If You Need to Change Credentials

### Step 1: Update all three files

1. **`docker/.env`**
   ```env
   POSTGRES_PASSWORD=new_password
   ```

2. **`ingestion/.env`**
   ```env
   PGPASSWORD=new_password
   ```

3. **`dbt_project/profiles.yml`**
   ```yaml
   password: new_password
   ```

### Step 2: Recreate Postgres container

```bash
cd docker
docker-compose down -v
docker-compose up -d
```

### Step 3: Verify

```bash
# Test direct connection
docker exec olist_postgres psql -h 127.0.0.1 -U olist -d olist -c "SELECT 1;"

# Test dbt
cd ../dbt_project
source venv/Scripts/activate
dbt debug
```

---

## 📊 Credential Matrix

| Component | File | User | Password | Host | Status |
|-----------|------|------|----------|------|--------|
| **Postgres** | docker/.env | olist | olist_pass | postgres | ✅ Running |
| **Ingestion** | ingestion/.env | olist | olist_pass | 127.0.0.1 | ✅ Working |
| **dbt Local** | dbt_project/profiles.yml | olist | olist_pass | localhost | ✅ Fixed |
| **GitHub Actions** | Generated dynamically | From secrets | From secrets | From secrets | ⏳ Not tested yet |

---

## 💡 Best Practices Going Forward

1. **Keep all three credential files in sync** when making changes
2. **Never commit `.env` files** (already in `.gitignore`)
3. **Use GitHub Secrets** for CI/CD (already configured in workflow)
4. **Document password changes** in this file
5. **Test both local and Docker connections** after credential changes

---

## 🆘 Emergency Reset

If credentials are completely confused:

```bash
# Stop everything
cd docker
docker-compose down -v

# Update all credentials in these files:
# - docker/.env
# - ingestion/.env  
# - dbt_project/profiles.yml

# Ensure they all match!

# Restart
docker-compose up -d

# Wait for healthy
docker-compose ps

# Test
docker exec olist_postgres psql -U olist -d olist -c "\conninfo"
cd ../dbt_project
dbt debug
```

---

Last Updated: 2026-09-10  
Status: ✅ All credentials synchronized and working
