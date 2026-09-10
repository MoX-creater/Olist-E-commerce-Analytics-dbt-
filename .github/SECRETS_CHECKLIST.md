# GitHub Secrets Checklist

Use this checklist to ensure all required secrets are configured before running the workflow.

## ✅ Setup Checklist

### Step 1: Prepare Database Information
- [ ] Get your hosted Postgres hostname (not `localhost`)
- [ ] Verify database port (usually `5432`)
- [ ] Get database username
- [ ] Get database password
- [ ] Get database name

### Step 2: Set Up Vercel
- [ ] Create Vercel account at [vercel.com](https://vercel.com)
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Run `vercel link` in your `dbt_project/target` directory
- [ ] Copy `orgId` and `projectId` from `.vercel/project.json`
- [ ] Generate Vercel token at [vercel.com/account/tokens](https://vercel.com/account/tokens)

### Step 3: Add Secrets to GitHub
Go to: `GitHub Repo → Settings → Secrets and variables → Actions → New repository secret`

#### PostgreSQL Secrets (5)
- [ ] `PGHOST` = Your Postgres host
- [ ] `PGPORT` = `5432`
- [ ] `PGUSER` = Your Postgres username
- [ ] `PGPASSWORD` = Your Postgres password
- [ ] `PGDATABASE` = Your database name

#### Vercel Secrets (3)
- [ ] `VERCEL_TOKEN` = Token from Vercel dashboard
- [ ] `VERCEL_ORG_ID` = From `.vercel/project.json` (starts with `team_` or `user_`)
- [ ] `VERCEL_PROJECT_ID` = From `.vercel/project.json` (starts with `prj_`)

### Step 4: Test Locally
- [ ] Run `dbt debug` to test database connection
- [ ] Run `dbt docs generate` to verify docs generation
- [ ] Review generated files in `dbt_project/target/`

### Step 5: Trigger Workflow
- [ ] Make a change to `dbt_project/`
- [ ] Commit and push to `main` branch
- [ ] Monitor workflow at `Actions` tab
- [ ] Check for deployment URL in workflow summary

## 🔒 Secret Format Reference

### Example Values (DO NOT USE THESE EXACT VALUES)

```
PGHOST=mydb.postgres.database.azure.com
PGPORT=5432
PGUSER=olist_admin
PGPASSWORD=SuperSecret123!
PGDATABASE=olist_production

VERCEL_TOKEN=AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
VERCEL_ORG_ID=team_abc123xyz456def789
VERCEL_PROJECT_ID=prj_xyz789abc123def456
```

## 🚨 Common Mistakes

❌ Using `localhost` for `PGHOST`
   ✅ Use public hostname or IP address

❌ Forgetting to run `vercel link` first
   ✅ Run it to generate project IDs

❌ Using expired Vercel token
   ✅ Generate fresh token with no expiration

❌ Wrong secret names (typos)
   ✅ Copy names exactly as shown above

❌ Committing secrets to repository
   ✅ Only add via GitHub Settings → Secrets

## 📝 Verification Commands

After adding secrets, verify locally:

```bash
# Test database connection with actual credentials
PGHOST=your-host PGPORT=5432 PGUSER=your-user \
PGPASSWORD=your-password PGDATABASE=your-db \
dbt debug --profiles-dir dbt_project

# Test Vercel authentication
vercel whoami --token YOUR_VERCEL_TOKEN

# Test Vercel project access
vercel ls --token YOUR_VERCEL_TOKEN
```

## 🎯 Success Criteria

You'll know the setup is complete when:

1. ✅ All 8 secrets are added to GitHub
2. ✅ Local `dbt debug` succeeds with production credentials
3. ✅ `vercel whoami` returns your username
4. ✅ Workflow runs without errors
5. ✅ Documentation is accessible at the Vercel URL

## 📞 Need Help?

If you encounter issues:

1. Check workflow logs in GitHub Actions tab
2. Review the troubleshooting section in `.github/README.md`
3. Verify each secret is spelled correctly
4. Test database connection and Vercel access locally first
5. Ensure your Postgres allows connections from GitHub Actions IPs

## 🔐 Security Notes

- Secrets are encrypted by GitHub
- Secrets are never exposed in logs
- Only workflow runs can access secrets
- Rotate secrets every 90 days
- Use read-only DB credentials if possible
- Restrict Vercel token to specific projects
