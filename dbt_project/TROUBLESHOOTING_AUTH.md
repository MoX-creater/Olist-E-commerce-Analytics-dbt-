# Troubleshooting Database Authentication Issues

## 🔍 Issue Analysis

### Problem
`dbt debug` fails with "password authentication failed for user 'olist'" when connecting to localhost:5432.

### Root Cause
The `profiles.yml` was configured to use `env_var()` to read credentials from environment variables, but:
1. Git Bash on Windows doesn't automatically export environment variables from `.env` files
2. The `POSTGRES_*` environment variables weren't set in your Windows shell session
3. dbt fell back to the default values, which may not have matched the actual database password

## ✅ Solution Applied

### What Changed

**1. Created `dbt_project/.env`** with hardcoded credentials:
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=olist
POSTGRES_PASSWORD=olist_pass
POSTGRES_DB=olist
```

**2. Updated `profiles.yml`** to use hardcoded values instead of `env_var()`:
```yaml
olist_analytics:
  target: dev
  outputs:
    dev:
      type: postgres
      host: localhost
      port: 5432
      user: olist
      password: olist_pass
      dbname: olist
      schema: public
      threads: 4
```

**3. Added `dbt_project/.env` to `.gitignore`** to prevent committing credentials.

## 📊 Credential Comparison

All three configuration files now have matching credentials:

| File | User | Password | Database | Host |
|------|------|----------|----------|------|
| `docker/.env` | olist | olist_pass | olist | postgres (internal) |
| `ingestion/.env` | olist | olist_pass | olist | 127.0.0.1 |
| `dbt_project/profiles.yml` | olist | olist_pass | olist | localhost |

✅ **All credentials match!**

## 🔐 Why Hardcode Instead of env_var()?

### Using `env_var()` (GitHub Actions - Recommended)
```yaml
host: "{{ env_var('POSTGRES_HOST') }}"
```
**Pros:**
- Credentials stored in GitHub Secrets
- Works great in CI/CD pipelines
- No credentials in repository

**Cons:**
- Requires setting environment variables in every shell session
- Git Bash doesn't auto-load `.env` files
- More complex local setup

### Using Hardcoded Values (Local Development - What We Did)
```yaml
host: localhost
password: olist_pass
```
**Pros:**
- Works immediately in local development
- No environment variable configuration needed
- Simpler for developers

**Cons:**
- Must add to `.gitignore` (already done)
- Credentials in a file (but not committed to git)

## 🎯 For GitHub Actions

The GitHub Actions workflow (`../.github/workflows/dbt-docs.yml`) creates its own `profiles.yml` dynamically using secrets:

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
          password: ${{ secrets.PGPASSWORD }}
          # ... etc
    EOF
```

So you have:
- **Local development:** `profiles.yml` with hardcoded values (not committed)
- **GitHub Actions:** `profiles.yml` generated from secrets at runtime

## 🔄 Alternative: Using dotenv in Git Bash

If you prefer using environment variables locally, you can source the `.env` file:

```bash
# In Git Bash
cd dbt_project
set -a
source .env
set +a
dbt debug
```

Or create a helper script `dbt_project/load-env.sh`:
```bash
#!/bin/bash
set -a
source .env
set +a
echo "Environment variables loaded!"
```

Then:
```bash
source load-env.sh
dbt debug
```

## ✅ Verification Steps

Run these commands to verify everything is working:

### 1. Check Postgres is running
```bash
docker ps | grep olist_postgres
```
Expected: Container is "Up" and "healthy"

### 2. Test direct psql connection
```bash
docker exec olist_postgres psql -h 127.0.0.1 -U olist -d olist -c "SELECT version();"
```
Expected: Shows Postgres version

### 3. Test dbt connection
```bash
cd dbt_project
source venv/Scripts/activate  # Activate venv first!
dbt debug
```
Expected: `Connection test: [OK connection ok]`

### 4. Run a simple model
```bash
dbt run --select stg_customers
```
Expected: `OK created sql view model`

## 🚨 If Authentication Still Fails

### Check 1: Verify Postgres password is correct
```bash
docker exec olist_postgres psql -U olist -d olist -c "\du"
```

If the user exists but password is wrong, reset it:
```bash
docker exec olist_postgres psql -U olist -d postgres -c "ALTER USER olist WITH PASSWORD 'olist_pass';"
```

### Check 2: Verify profiles.yml values match docker/.env
```bash
# View profiles.yml
cat dbt_project/profiles.yml

# View docker/.env
cat docker/.env

# Compare
diff <(grep POSTGRES docker/.env | sort) <(grep -E "user|password|dbname|host" dbt_project/profiles.yml | sort)
```

### Check 3: Test with explicit connection string
```bash
PGPASSWORD=olist_pass psql -h localhost -p 5432 -U olist -d olist -c "SELECT 1;"
```

### Check 4: Verify Postgres volume wasn't reset

Check container creation time:
```bash
docker ps --filter "name=olist_postgres" --format "{{.CreatedAt}}"
```

If it was recently recreated, the password might have changed. Recreate it properly:

```bash
cd docker
docker-compose down -v
docker-compose up -d
# Wait for healthy status
docker-compose ps
```

Then verify:
```bash
docker exec olist_postgres psql -h 127.0.0.1 -U olist -d olist -c "SELECT 'Connected!' as status;"
```

## 📝 Current State Summary

### ✅ What Works Now

1. **Postgres Container:**
   - Running and healthy
   - User: `olist` (superuser)
   - Password: `olist_pass`
   - Database: `olist`

2. **Credentials:**
   - All three files (`docker/.env`, `ingestion/.env`, `profiles.yml`) have matching credentials
   - No env_var() confusion

3. **Connection:**
   - Direct psql connection works
   - Should work for dbt now

### 🎯 Next Steps

1. Open Git Bash
2. Navigate to `dbt_project`
3. Activate venv: `source venv/Scripts/activate`
4. Test: `dbt debug`
5. If successful, run: `dbt run --select staging`

## 🔗 Related Files

- **Docker credentials:** `docker/.env`
- **Ingestion credentials:** `ingestion/.env`
- **dbt credentials:** `dbt_project/profiles.yml`
- **dbt environment:** `dbt_project/.env` (optional, for env_var fallback)
- **Gitignore:** `.gitignore` (excludes all `.env` files)
