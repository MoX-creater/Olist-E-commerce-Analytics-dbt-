# Python Virtual Environment Setup for dbt (Git Bash on Windows)

This guide shows how to set up a Python virtual environment for running dbt locally on Windows using Git Bash.

## ⚠️ Important: Git Bash Specific

These commands are for **Git Bash on Windows**. The activation script path is different from PowerShell or cmd.

---

## 🚀 One-Time Setup

Run these commands **once** to create and set up your virtual environment:

### Step 1: Navigate to dbt_project directory

```bash
cd "c:/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project"
```

### Step 2: Create virtual environment

```bash
python -m venv venv
```

This creates a `venv/` folder with an isolated Python environment.

### Step 3: Activate the virtual environment (Git Bash)

**Git Bash on Windows uses a different activation script:**

```bash
source venv/Scripts/activate
```

**✅ Success indicator:** Your prompt will change to show `(venv)` at the beginning:
```bash
(venv) user@computer MINGW64 ~/projects/Olist E-commerce Analytics (dbt)/dbt_project
$
```

### Step 4: Upgrade pip

```bash
pip install --upgrade pip
```

### Step 5: Install dbt-postgres

```bash
pip install dbt-core==1.7.4 dbt-postgres==1.7.4
```

This installs both:
- `dbt-core` - The core dbt framework
- `dbt-postgres` - PostgreSQL adapter for dbt

**Installation will take 1-2 minutes** and install ~50 dependencies.

### Step 6: Verify installation

```bash
dbt --version
```

**Expected output:**
```
Core:
  - installed: 1.7.4
  - latest:    1.7.4 - Up to date!

Plugins:
  - postgres: 1.7.4 - Up to date!
```

---

## 🔄 Daily Usage (Every Time You Open Git Bash)

The virtual environment is **NOT automatically activated** when you open a new terminal. You must activate it each time.

### Quick Start Commands (Copy & Paste)

```bash
# Navigate to dbt_project
cd "c:/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project"

# Activate venv (Git Bash on Windows)
source venv/Scripts/activate

# Now you can run dbt commands
dbt --version
dbt debug
dbt run
dbt test
```

---

## 📝 Common Commands

Once activated, you can run:

```bash
# Test database connection
dbt debug

# Install dbt packages
dbt deps

# Run all models
dbt run

# Run specific model
dbt run --select stg_orders

# Test all models
dbt test

# Generate documentation
dbt docs generate

# Serve documentation locally
dbt docs serve

# Deactivate venv (when done)
deactivate
```

---

## ❌ Troubleshooting

### Issue: "bash: dbt: command not found"

**Cause:** Virtual environment is not activated.

**Solution:**
```bash
source venv/Scripts/activate
```

**Verify:** Your prompt should show `(venv)` at the start.

---

### Issue: "source: venv/Scripts/activate: No such file or directory"

**Cause:** You're not in the `dbt_project` directory, or venv wasn't created.

**Solution:**
```bash
# Navigate to correct directory
cd "c:/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project"

# Verify venv exists
ls -la venv/Scripts/activate

# If it doesn't exist, create it
python -m venv venv
```

---

### Issue: Different activation path on PowerShell or cmd

**Git Bash:**
```bash
source venv/Scripts/activate
```

**PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**cmd:**
```cmd
venv\Scripts\activate.bat
```

---

## 🔍 Checking If Venv Is Active

### Method 1: Check prompt
Your prompt should start with `(venv)`:
```
(venv) $
```

### Method 2: Check Python path
```bash
which python
```

**Expected output (venv active):**
```
/c/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project/venv/Scripts/python
```

**Wrong output (venv NOT active):**
```
/c/Users/Lenovo/AppData/Local/Programs/Python/Python310/python
```

### Method 3: Check dbt location
```bash
which dbt
```

**Expected output (venv active):**
```
/c/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project/venv/Scripts/dbt
```

---

## 💡 Why Do I Need to Reactivate Every Time?

This is **normal Python behavior**, not a bug:

1. **Virtual environments are session-specific** - They don't persist across terminal sessions
2. **Isolation is by design** - Prevents conflicts between different Python projects
3. **PATH modification is temporary** - The activation script modifies your PATH only for the current session

**Think of it like:**
- Opening a new terminal = new environment
- Activating venv = telling that terminal "use this project's Python and packages"

---

## 🎯 Best Practices

### Create an alias for quick activation

Add to your `~/.bashrc` or `~/.bash_profile`:

```bash
alias dbt-activate='cd "/c/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project" && source venv/Scripts/activate'
```

Then you can just type:
```bash
dbt-activate
```

### Always check venv is active before running dbt

Look for `(venv)` in your prompt!

### Deactivate when done

```bash
deactivate
```

This returns you to the system Python.

---

## 📦 What's Installed in the Venv?

After running `pip install dbt-postgres`, you get:

```
dbt-core              Core dbt functionality
dbt-postgres          PostgreSQL adapter
psycopg2-binary       PostgreSQL Python driver
Jinja2                Template engine
networkx              Dependency graph
sqlparse              SQL parsing
pyyaml                YAML parsing
... and ~45 more dependencies
```

View all installed packages:
```bash
pip list
```

---

## 🗑️ Starting Over (If Needed)

If something goes wrong, you can delete and recreate:

```bash
# Deactivate if active
deactivate

# Delete venv folder
rm -rf venv/

# Recreate
python -m venv venv
source venv/Scripts/activate
pip install --upgrade pip
pip install dbt-core==1.7.4 dbt-postgres==1.7.4
```

---

## ✅ Quick Verification Checklist

- [ ] `venv/` folder exists in `dbt_project/`
- [ ] `source venv/Scripts/activate` works
- [ ] Prompt shows `(venv)` prefix
- [ ] `which python` points to venv path
- [ ] `dbt --version` shows 1.7.4
- [ ] `dbt debug` connects to database
- [ ] `venv/` is in `.gitignore`

---

## 🔗 Related Documentation

- **dbt Installation:** https://docs.getdbt.com/docs/core/installation
- **Python venv:** https://docs.python.org/3/library/venv.html
- **Git Bash on Windows:** https://git-scm.com/download/win

---

## 📞 Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| `dbt: command not found` | Run `source venv/Scripts/activate` |
| `No module named 'dbt'` | Activate venv, then `pip install dbt-postgres` |
| Wrong activation script | Use `venv/Scripts/activate` not `venv/bin/activate` |
| Permission denied | Run Git Bash as administrator |
| `python: command not found` | Install Python from python.org |
