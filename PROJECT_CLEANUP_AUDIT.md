# Project Cleanup Audit

Comprehensive audit of unnecessary files in the Olist E-commerce Analytics project.

**Audit Date:** 2026-09-11  
**Audited By:** Automated file analysis

---

## 🟢 SAFE TO DELETE (High Confidence)

These files are debug/test scripts, build artifacts, or scaffolding that serve no purpose in the final project.

### Debug/Test Scripts (dbt_project/)

| File | Reason | Size |
|------|--------|------|
| `dbt_project/test_connection.py` | Debug script created during auth troubleshooting; no longer needed | ~ 500 bytes |
| `dbt_project/test_connection2.py` | Debug script #2 for testing different passwords; one-off use | ~ 600 bytes |
| `dbt_project/test_connection3.py` | Debug script #3 for testing new user; one-off use | ~ 550 bytes |
| `dbt_project/test_socket.py` | Debug script for raw socket testing; one-off use | ~ 400 bytes |

**Evidence:** All mentioned in PROGRESS.md as troubleshooting steps but never intended for production use. Created 2026-09-10, used once, never referenced in code.

### Orphaned Package Lock Files

| File | Reason | Size |
|------|--------|------|
| `package-lock.json` (root) | No corresponding package.json in root; orphaned | 111 bytes |
| `docker/package-lock.json` | No package.json in docker/; orphaned from earlier attempt | ~ 50KB |
| `dbt_project/package-lock.json` | No package.json in dbt_project/; npm not used here | ~ 50KB |

**Evidence:** `grep` search found ZERO references to these files in documentation. Node.js projects are in dashboard-api/ and dashboard-ui/, not in these locations.

### Build Artifacts (Should be gitignored but may exist)

| File/Directory | Reason | Action |
|----------------|--------|--------|
| `dbt_project/target/.env.local` | Vercel OIDC token (sensitive!), temporary | DELETE immediately |
| `dbt_project/logs/dbt.log` | Build log, regenerated on every run | DELETE (already in .gitignore) |
| `dbt_project/target/` contents | All files except `.gitignore` and `.vercel/` | DELETE contents (keep directory structure) |

**Evidence:** .gitignore already excludes `target/` and `logs/`, but files may exist from before .gitignore was updated. `target/.env.local` contains a Vercel JWT token that should NOT be committed.

### Placeholder .gitkeep Files (Empty Directories)

| File | Reason | Keep Directory? |
|------|--------|-----------------|
| `dbt_project/analyses/.gitkeep` | Directory unused, no analyses created | Yes (dbt convention) |
| `dbt_project/macros/.gitkeep` | Directory unused, no custom macros | Yes (dbt convention) |
| `dbt_project/seeds/.gitkeep` | Directory unused, no seed files | Yes (dbt convention) |
| `dbt_project/snapshots/.gitkeep` | Directory unused, no snapshots | Yes (dbt convention) |
| `dbt_project/tests/.gitkeep` | Directory unused, no custom tests | Yes (dbt convention) |
| `dbt_project/models/intermediate/.gitkeep` | Directory has SQL files now | No (can delete) |
| `dbt_project/models/marts/.gitkeep` | Directory has SQL files now | No (can delete) |
| `dbt_project/models/staging/.gitkeep` | Directory has SQL files now | No (can delete) |

**Evidence:** First 5 are standard dbt scaffolding directories that may be used later. Last 3 have actual SQL models, so .gitkeep is redundant.

---

## 🟡 PROBABLY SAFE TO DELETE (Medium Confidence)

These files are superseded, duplicate documentation, or auto-generated configs never customized.

### Superseded Documentation

| File | Reason | Replacement |
|------|--------|-------------|
| `CREDENTIALS_SUMMARY.md` | Created during auth debugging; superseded by PROGRESS.md | PROGRESS.md covers this |
| `dbt_project/TROUBLESHOOTING_AUTH.md` | Created for auth debugging; issue is resolved | No longer relevant |

**Evidence:** Both created 2026-09-10 during the password authentication debugging phase. Issue is now fixed (profiles.yml uses hardcoded credentials), making these obsolete. PROGRESS.md documents the resolution.

### dbt Auto-Generated Files

| File | Reason | Impact if deleted |
|------|--------|-------------------|
| `dbt_project/.user.yml` | dbt auto-generates this with a random UUID | dbt will recreate it |
| `dbt_project/package-lock.yml` | dbt package manager lock file | Safe if no version conflicts |

**Evidence:** `.user.yml` contains only a UUID used by dbt Cloud (not used in this project). `package-lock.yml` locks dbt_utils to v1.4.1, which is useful for reproducibility but not critical for local dev.

### Unused Docker Artifacts

| File | Reason | Purpose |
|------|--------|---------|
| `docker/init-db/01-create-metabase.sql` | Creates metabase database | Only needed if using Metabase |

**Evidence:** File creates `metabase` database for Metabase service. Metabase is in docker-compose.yml but documentation doesn't mention it as part of the dashboard workflow. If Metabase isn't used, this is vestigial.

---

## 🔴 NEEDS REVIEW (Low Confidence)

These files might be useful or have dependencies that aren't obvious.

### Containerized dbt

| File | Reason | Status |
|------|--------|--------|
| `dbt_project/Dockerfile` | For running dbt in Docker (alternative to local venv) | **KEEP if using Docker dbt** |

**Evidence:** docker-compose.yml references `dbt` service that builds from `dbt_project/Dockerfile`. However, documentation emphasizes local venv setup. Check if Docker dbt workflow is still needed.

**Question:** Is the containerized dbt service still used, or has it been fully replaced by local venv?

### Duplicate .env Templates

| File | Reason | Redundant? |
|------|--------|------------|
| `dashboard-api/.env.local.example` | Template for local overrides | Duplicate of `.env.example`? |
| `dashboard-ui/.env.local.example` | Template for local overrides | Duplicate of `.env.example`? |

**Evidence:** Both API and UI have `.env.example` AND `.env.local.example`. In most projects, only `.env.example` is needed. Check if `.env.local` convention is documented or just accidental duplication.

**Question:** Are `.env.local.example` files intentional (for environment-specific configs) or accidental duplicates?

### Multiple README Files

| File | Purpose | Keep? |
|------|---------|-------|
| Root `README.md` | Main project documentation | ✅ KEEP |
| `dashboard-api/README.md` | API documentation | ✅ KEEP |
| `dashboard-ui/README.md` | Frontend documentation | ✅ KEEP |
| `.github/README.md` | GitHub Actions setup | ✅ KEEP (specific purpose) |

**Evidence:** Each README serves a distinct purpose. All are legitimate.

### Documentation Proliferation

**Count:** 17 Markdown files across the project

| Category | Count | Status |
|----------|-------|--------|
| Root level docs | 6 | Mix of overview and detailed guides |
| API docs | 3 | Endpoint tests, fixes, README |
| UI docs | 3 | Design system, redesign, README |
| dbt docs | 3 | Venv setup, troubleshooting, quickstart |
| GitHub docs | 3 | Workflow, secrets, README |

**Potential Consolidation:**
- `DASHBOARD_QUICKSTART.md` vs `dashboard-api/README.md` + `dashboard-ui/README.md` (overlap?)
- `DASHBOARD_FILE_STRUCTURE.md` vs README tree view (redundant?)
- `DASHBOARD_ARCHITECTURE.md` might be too detailed for most users

**Question:** Should some documentation be consolidated or moved to a `/docs` folder?

---

## 📊 Summary Statistics

| Category | Count | Total Size (est.) |
|----------|-------|-------------------|
| **Safe to delete** | 15 files | ~150 KB |
| **Probably safe** | 4 files | ~15 KB |
| **Needs review** | 6 files | Variable |
| **Keep (legitimate)** | ~50+ files | N/A |

---

## 🎯 Recommended Deletion Commands

### Immediate Cleanup (Safe to delete)

```bash
# Debug/test scripts
rm dbt_project/test_connection.py
rm dbt_project/test_connection2.py
rm dbt_project/test_connection3.py
rm dbt_project/test_socket.py

# Orphaned package-lock.json files
rm package-lock.json
rm docker/package-lock.json
rm dbt_project/package-lock.json

# Sensitive build artifact (IMPORTANT!)
rm dbt_project/target/.env.local

# Redundant .gitkeep files in populated directories
rm dbt_project/models/staging/.gitkeep
rm dbt_project/models/intermediate/.gitkeep
rm dbt_project/models/marts/.gitkeep
```

### Secondary Cleanup (Probably safe)

```bash
# Superseded documentation
rm CREDENTIALS_SUMMARY.md
rm dbt_project/TROUBLESHOOTING_AUTH.md

# dbt auto-generated (will be recreated if needed)
rm dbt_project/.user.yml

# Unused Metabase init script (only if Metabase not used)
# rm docker/init-db/01-create-metabase.sql
```

### Build Artifacts Cleanup (Already gitignored)

```bash
# Clear dbt build artifacts (regenerated on next run)
rm -rf dbt_project/target/*
rm -rf dbt_project/logs/*

# Keep .gitignore and .vercel folder in target/
git checkout dbt_project/target/.gitignore
```

---

## ⚠️ Questions for Review

1. **Containerized dbt:** Is `dbt_project/Dockerfile` and the `dbt` service in docker-compose.yml still needed, or has local venv fully replaced it?

2. **Metabase:** Is Metabase actually being used? If not, remove `metabase` service from docker-compose.yml and `docker/init-db/01-create-metabase.sql`.

3. **`.env.local.example` files:** Are these intentional (for environment-specific overrides) or accidental duplicates of `.env.example`?

4. **Documentation consolidation:** Should detailed docs like `DASHBOARD_ARCHITECTURE.md`, `DASHBOARD_FILE_STRUCTURE.md` be moved to a `/docs` folder for better organization?

5. **`package-lock.yml`:** Keep for dbt package version locking or regenerate as needed?

---

## 🔒 Security Note

**URGENT:** `dbt_project/target/.env.local` contains a Vercel OIDC JWT token. This should be deleted immediately and never committed to git. Check git history to ensure it was never pushed:

```bash
git log --all --full-history -- "dbt_project/target/.env.local"
```

If it was committed, rotate the Vercel token.

---

## 📋 Checklist After Cleanup

- [ ] Run `dbt run` to ensure models still work
- [ ] Run `npm start` in dashboard-api to ensure API works
- [ ] Run `npm run dev` in dashboard-ui to ensure frontend works
- [ ] Verify docker-compose up still works (postgres, ingestion, metabase if used)
- [ ] Check that .gitignore prevents future accidental commits of build artifacts
- [ ] Update README.md if any major files are removed
- [ ] Commit cleanup with message: "chore: remove debug scripts and orphaned files"

---

**Audit completed.** Review questions above before executing cleanup commands.
