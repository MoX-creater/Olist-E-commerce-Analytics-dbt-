# GitHub Actions Setup for dbt Documentation

This directory contains GitHub Actions workflows for the Olist E-commerce Analytics project.

## Workflows

### `dbt-docs.yml` - Generate and Deploy dbt Documentation

**Trigger:** 
- Push to `main` branch when files in `dbt_project/**` change
- Manual trigger via GitHub Actions UI (workflow_dispatch)

**What it does:**
1. Installs dbt-postgres 1.7.4
2. Connects to your hosted Postgres database
3. Runs `dbt deps` to install packages
4. Generates dbt documentation (`dbt docs generate`)
5. Deploys the documentation site to Vercel

## Required GitHub Secrets

You must add the following secrets to your GitHub repository before the workflow can run:

### Navigation to Secrets
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Required Secrets

#### PostgreSQL Connection (5 secrets)

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `PGHOST` | Postgres host address | `your-db.postgres.database.azure.com` |
| `PGPORT` | Postgres port | `5432` |
| `PGUSER` | Postgres username | `olist` |
| `PGPASSWORD` | Postgres password | `your_secure_password` |
| `PGDATABASE` | Database name | `olist` |

⚠️ **Important:** These should point to your **hosted/production** Postgres instance, not `localhost`.

#### Vercel Deployment (3 secrets)

| Secret Name | Description | How to Get It |
|------------|-------------|---------------|
| `VERCEL_TOKEN` | Vercel authentication token | 1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)<br>2. Click "Create Token"<br>3. Name it "GitHub Actions"<br>4. Copy the token |
| `VERCEL_ORG_ID` | Your Vercel organization/team ID | Run `vercel link` locally, then check `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Run `vercel link` locally, then check `.vercel/project.json` |

### Getting Vercel IDs

#### Method 1: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to your dbt_project/target directory
cd dbt_project/target

# Link to Vercel (creates a new project)
vercel link

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? [select your account/team]
# - Link to existing project? No (if first time) or Yes (if project exists)
# - What's your project's name? olist-dbt-docs
# - In which directory is your code located? ./

# View your IDs
cat .vercel/project.json
```

The `.vercel/project.json` file will contain:
```json
{
  "orgId": "team_xxxxxxxxxxxxxxxxxxxxx",
  "projectId": "prj_xxxxxxxxxxxxxxxxxxxxx"
}
```

#### Method 2: From Vercel Dashboard

1. **VERCEL_ORG_ID:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click your profile → Settings → General
   - Your Team/Org ID is shown under "Team ID"

2. **VERCEL_PROJECT_ID:**
   - Create a new project in Vercel Dashboard
   - Go to Project Settings → General
   - The Project ID is in the URL: `vercel.com/[team]/[project]/settings`

## Testing the Workflow

### Test Locally First

Before pushing to GitHub, test the dbt docs generation locally:

```bash
cd dbt_project

# Test connection to your hosted database
dbt debug

# Generate docs
dbt docs generate

# Serve docs locally to verify
dbt docs serve
```

### Trigger the Workflow

#### Option 1: Push to main (automatic)
```bash
# Make any change to dbt_project/
echo "# Updated" >> dbt_project/README.md

git add dbt_project/
git commit -m "docs: trigger dbt docs generation"
git push origin main
```

#### Option 2: Manual trigger
1. Go to GitHub → Actions
2. Select "Generate and Deploy dbt Docs"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

## Workflow Output

When the workflow completes successfully, you'll see:

1. **GitHub Actions Summary:**
   - ✅ Deployment URL
   - Commit SHA and timestamp
   - Next steps

2. **Commit Comment:**
   - Automatic comment on the commit with deployment URL

3. **Vercel Dashboard:**
   - New deployment visible in your Vercel project

### Example Output

```
📊 dbt Documentation Deployed Successfully!

🔗 Live Documentation: https://olist-dbt-docs.vercel.app

📈 Deployment Details
- Trigger: Push to main branch
- Commit: abc1234
- Branch: main
- Timestamp: 2026-09-10 12:00:00 UTC
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: could not connect to server
```
**Solution:** 
- Verify `PGHOST` is a public IP/hostname, not `localhost`
- Check firewall rules allow GitHub Actions IPs
- Verify credentials in GitHub secrets

#### 2. Vercel Deployment Failed
```
Error: Invalid token
```
**Solution:**
- Regenerate `VERCEL_TOKEN` in Vercel dashboard
- Update the secret in GitHub
- Ensure token has not expired

#### 3. Missing Vercel Project IDs
```
Error: Missing required VERCEL_PROJECT_ID
```
**Solution:**
- Run `vercel link` locally to create `.vercel/project.json`
- Copy the IDs to GitHub secrets

#### 4. Permission Denied
```
Error: You don't have access to this project
```
**Solution:**
- Ensure your Vercel token has correct scope
- Verify you're a member of the Vercel team/org
- Use a personal account token instead of team token

### Debug Mode

To enable verbose logging, add this to the workflow:

```yaml
- name: Generate dbt documentation
  working-directory: dbt_project
  run: |
    dbt --debug docs generate --profiles-dir .
```

## Security Best Practices

1. **Never commit secrets** to the repository
2. **Rotate secrets regularly** (every 90 days recommended)
3. **Use read-only database credentials** if possible
4. **Restrict Vercel token scope** to only necessary projects
5. **Enable branch protection** on `main` to prevent unauthorized pushes

## Updating the Workflow

To modify the workflow:

1. Edit `.github/workflows/dbt-docs.yml`
2. Test changes on a feature branch
3. Create a pull request
4. Verify workflow runs successfully
5. Merge to main

## Alternative: Using GitHub Pages

If you prefer GitHub Pages instead of Vercel, replace the deployment step with:

```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dbt_project/target
    cname: docs.yourdomain.com  # Optional
```

## Resources

- [dbt Documentation](https://docs.getdbt.com/)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
