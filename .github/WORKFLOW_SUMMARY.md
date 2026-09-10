# dbt Docs Workflow Summary

## 📊 Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                   │
│                                                              │
│  Trigger: Push to main (dbt_project/** changes)             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Setup Environment                                   │
│  • Checkout code                                             │
│  • Install Python 3.11                                       │
│  • Install dbt-postgres 1.7.4                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Configure dbt                                       │
│  • Create profiles.yml from GitHub secrets                   │
│  • Run dbt deps (install packages)                           │
│  • Test connection with dbt debug                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Generate Documentation                              │
│  • Run dbt docs generate                                     │
│  • Creates manifest.json, catalog.json, index.html           │
│  • Output saved in dbt_project/target/                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Deploy to Vercel                                    │
│  • Install Vercel CLI                                        │
│  • Create vercel.json config                                 │
│  • Deploy target/ folder to production                       │
│  • Capture deployment URL                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Report Results                                      │
│  • Add deployment summary to Actions UI                      │
│  • Comment on commit with docs URL                           │
│  • ✅ Workflow complete!                                     │
└─────────────────────────────────────────────────────────────┘
```

## 🔑 Required GitHub Secrets (8 total)

### PostgreSQL Connection (5 secrets)
```yaml
PGHOST: "your-db.postgres.database.azure.com"
PGPORT: "5432"
PGUSER: "olist"
PGPASSWORD: "your_secure_password"
PGDATABASE: "olist"
```

### Vercel Deployment (3 secrets)
```yaml
VERCEL_TOKEN: "Your Vercel authentication token"
VERCEL_ORG_ID: "team_xxxxxxxxxxxxxxxxxxxxx"
VERCEL_PROJECT_ID: "prj_xxxxxxxxxxxxxxxxxxxxx"
```

## 🚀 How to Get Started

### Quick Start (5 minutes)

```bash
# 1. Set up Vercel project
npm install -g vercel
cd dbt_project/target
vercel link
# Copy orgId and projectId from .vercel/project.json

# 2. Get Vercel token
# Visit: https://vercel.com/account/tokens
# Click "Create Token" → Copy the token

# 3. Add secrets to GitHub
# Go to: Repo → Settings → Secrets and variables → Actions
# Add all 8 secrets listed above

# 4. Test locally
cd ../..
dbt docs generate --profiles-dir dbt_project

# 5. Push to trigger workflow
git add .github/
git commit -m "Add dbt docs workflow"
git push origin main
```

## 📁 Generated Files

The workflow generates these files in `dbt_project/target/`:

| File | Description | Size |
|------|-------------|------|
| `index.html` | Main documentation interface | ~50 KB |
| `manifest.json` | Complete dbt project metadata | ~500 KB |
| `catalog.json` | Database schema information | ~200 KB |
| `graph.gpickle` | Lineage graph (binary) | ~100 KB |
| `run_results.json` | Latest run statistics | ~10 KB |

## 🌐 Deployment Details

### Vercel Configuration

The workflow creates a `vercel.json` with:
- Clean URLs enabled
- 1-hour cache for static assets
- Automatic index.html routing
- HTTPS enforced

### Deployment Characteristics
- **Build Time:** ~2-3 minutes
- **Deploy Time:** ~30 seconds
- **Total Workflow:** ~3-4 minutes
- **Hosting:** Vercel Edge Network (global CDN)
- **Custom Domain:** Configurable in Vercel dashboard

## 📊 Workflow Triggers

### Automatic Triggers
```yaml
on:
  push:
    branches: [main]
    paths: ['dbt_project/**']
```

**Triggers when:**
- ✅ Any file in `dbt_project/` changes
- ✅ Push is to `main` branch
- ❌ Does NOT trigger on PRs
- ❌ Does NOT trigger for other directory changes

### Manual Trigger
```yaml
on:
  workflow_dispatch:
```

**Allows:**
- Manual workflow runs from Actions tab
- Testing without code changes
- Re-deployment of existing docs

## 🔍 Monitoring & Debugging

### View Workflow Status
```
GitHub Repo → Actions tab → "Generate and Deploy dbt Docs"
```

### Check Logs
Each step shows detailed logs:
- Python/dbt installation
- Database connection test
- Documentation generation output
- Vercel deployment response

### Common Log Messages

**✅ Success:**
```
✅ dbt docs generated successfully
🚀 Deployed to: https://your-project.vercel.app
```

**❌ Failure Examples:**
```
Error: could not connect to server
→ Check PGHOST is not localhost

Error: Invalid token
→ Regenerate VERCEL_TOKEN

Error: Missing required VERCEL_PROJECT_ID
→ Run vercel link locally
```

## 🎯 Success Indicators

After workflow completes successfully:

1. **GitHub Actions:**
   - Green checkmark next to commit
   - Deployment URL in summary
   - Commit comment with link

2. **Vercel Dashboard:**
   - New deployment listed
   - Status: "Ready"
   - Production badge

3. **Documentation Site:**
   - Accessible at Vercel URL
   - Shows all 20 models
   - Lineage graph interactive
   - Search functionality works

## 🔄 Update Workflow

To update documentation after model changes:

```bash
# Method 1: Push to main (automatic)
git add dbt_project/models/
git commit -m "feat: add new mart model"
git push origin main
# Workflow triggers automatically

# Method 2: Manual trigger (no code change)
# Go to Actions → Select workflow → Run workflow
```

## 🎨 Customization Options

### Change Deployment Branch
```yaml
on:
  push:
    branches: [main, develop]  # Add more branches
```

### Add Slack Notification
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "dbt Docs deployed: ${{ env.DEPLOYMENT_URL }}"
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Use GitHub Pages Instead
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v4
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dbt_project/target
```

## 📈 Performance Metrics

Typical workflow execution times:

| Step | Duration | Notes |
|------|----------|-------|
| Checkout & Setup | 30s | Installing Python + dependencies |
| dbt deps | 10s | Installing dbt packages |
| dbt debug | 5s | Testing connection |
| dbt docs generate | 30-60s | Depends on model count |
| Vercel deploy | 30s | Uploading + building |
| **Total** | **~3-4 min** | Full workflow |

## 🔐 Security Best Practices

✅ **DO:**
- Use read-only database credentials
- Rotate secrets every 90 days
- Restrict Vercel token scope
- Enable branch protection on main
- Review workflow logs regularly

❌ **DON'T:**
- Commit secrets to repository
- Share secrets in pull requests
- Use admin database credentials
- Disable secret encryption
- Grant excessive Vercel permissions

## 📞 Support Resources

- **dbt Docs:** https://docs.getdbt.com/docs/collaborate/documentation
- **Vercel CLI:** https://vercel.com/docs/cli
- **GitHub Actions:** https://docs.github.com/en/actions
- **Troubleshooting:** See `.github/README.md`
