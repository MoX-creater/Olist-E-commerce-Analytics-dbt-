# Quick Start: dbt with Git Bash on Windows

## 🎯 Copy-Paste Commands

### First Time Setup (Run Once)

```bash
# Navigate to dbt_project
cd "c:/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project"

# Create virtual environment
python -m venv venv

# Activate it (Git Bash on Windows)
source venv/Scripts/activate

# Install dbt
pip install --upgrade pip
pip install dbt-core==1.7.4 dbt-postgres==1.7.4

# Verify
dbt --version
```

---

### Every Time You Open Git Bash

```bash
# 1. Navigate to project
cd "c:/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project"

# 2. Activate venv
source venv/Scripts/activate

# 3. Verify (you should see 'venv' in your prompt)
dbt --version
```

**✅ Success:** Your prompt will show `(venv)` at the beginning

---

## 📝 Common dbt Commands

Once venv is activated:

```bash
# Test connection
dbt debug

# Install packages
dbt deps

# Run all models
dbt run

# Run specific layer
dbt run --select staging
dbt run --select marts

# Test models
dbt test

# Generate docs
dbt docs generate

# View docs locally
dbt docs serve

# When done
deactivate
```

---

## ⚠️ Activation Script Paths (Important!)

**Git Bash on Windows:**
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

## 🔍 Quick Check: Is Venv Active?

```bash
# Method 1: Look for (venv) in prompt
(venv) $  # ✅ Active

# Method 2: Check Python location
which python
# Should show: .../dbt_project/venv/Scripts/python

# Method 3: Check dbt location  
which dbt
# Should show: .../dbt_project/venv/Scripts/dbt
```

---

## 🆘 Troubleshooting One-Liners

```bash
# "dbt: command not found"
source venv/Scripts/activate

# "No such file or directory: venv/Scripts/activate"
python -m venv venv

# Check if venv exists
ls venv/Scripts/activate

# Recreate venv from scratch
rm -rf venv && python -m venv venv && source venv/Scripts/activate && pip install dbt-postgres==1.7.4
```

---

## 💡 Pro Tips

1. **Always look for `(venv)` in your prompt** before running dbt commands
2. **Create an alias** in `~/.bashrc`:
   ```bash
   alias dbt-activate='cd "/c/Users/Lenovo/OneDrive/Desktop/dev/projects/Olist E-commerce Analytics (dbt)/dbt_project" && source venv/Scripts/activate'
   ```
3. **One terminal = one activation** - Each new Git Bash window needs activation
4. **Deactivate when switching projects:** `deactivate`

---

For detailed explanations, see `SETUP_VENV.md`
