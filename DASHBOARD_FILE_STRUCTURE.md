# Dashboard File Structure

Complete file tree for the analytics dashboard.

## 📁 Full Project Structure

```
Olist E-commerce Analytics (dbt)/
│
├── 📊 DASHBOARD BACKEND (Node.js/Express API)
├── dashboard-api/
│   ├── server.js                    # Express app entry point
│   ├── routes.js                    # API endpoint definitions
│   ├── db.js                        # PostgreSQL connection pool
│   ├── cache.js                     # In-memory caching with TTL
│   ├── package.json                 # Dependencies (express, pg, cors, dotenv)
│   ├── .env                         # DB credentials (gitignored)
│   ├── .env.example                 # Environment template
│   ├── .gitignore                   # Node/env ignores
│   └── README.md                    # API documentation
│
├── 🎨 DASHBOARD FRONTEND (React/Vite)
├── dashboard-ui/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx        # Main dashboard layout
│   │   │   ├── Dashboard.css        # Dashboard styling
│   │   │   └── charts/
│   │   │       ├── ChartWrapper.jsx            # Reusable wrapper with loading/error
│   │   │       ├── RevenueTrendChart.jsx       # Line chart (monthly revenue)
│   │   │       ├── OrderStatusChart.jsx        # Pie chart (status distribution)
│   │   │       ├── TopCategoriesChart.jsx      # Horizontal bar (top 10 categories)
│   │   │       ├── DeliveryPerformanceChart.jsx # Bar chart (delivery metrics)
│   │   │       └── ReviewScoreChart.jsx        # Grouped bar (review scores)
│   │   ├── App.jsx                  # Root component
│   │   ├── App.css                  # App styling (header, gradient)
│   │   ├── config.js                # API endpoint URLs
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles (dark theme base)
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite configuration
│   ├── package.json                 # Dependencies (react, recharts, vite)
│   ├── .env.example                 # Environment template
│   ├── .gitignore                   # Node/build ignores
│   └── README.md                    # Frontend documentation
│
├── 📚 DOCUMENTATION
├── DASHBOARD_QUICKSTART.md          # Complete setup guide (API + UI)
├── DASHBOARD_ARCHITECTURE.md        # Technical architecture docs
├── DASHBOARD_FILE_STRUCTURE.md      # This file
│
├── 🗂️ EXISTING PROJECT FILES
├── data/                            # 9 CSV files (Olist dataset)
├── dbt_project/                     # dbt models (staging/intermediate/marts)
├── docker/                          # docker-compose.yml + Postgres
├── ingestion/                       # Node.js data loader
├── .gitignore                       # Updated with dashboard ignores
├── PROGRESS.md                      # Project progress tracker
└── README.md                        # Main project README
```

---

## 🔍 File Breakdown by Category

### Backend API Files (6 core files)

| File | Lines | Purpose |
|------|-------|---------|
| `server.js` | ~80 | Express server setup, middleware, startup logic |
| `routes.js` | ~120 | 5 API endpoints + health check, query logic |
| `db.js` | ~40 | PostgreSQL connection pool with pg library |
| `cache.js` | ~50 | In-memory Map cache with TTL and cleanup |
| `package.json` | ~20 | Dependencies and npm scripts |
| `.env` | ~10 | Database credentials and API config |

**Total:** ~320 lines of backend code

### Frontend UI Files (12 components + config)

| File | Lines | Purpose |
|------|-------|---------|
| `App.jsx` | ~20 | Root component with header |
| `Dashboard.jsx` | ~40 | Layout grid for 5 charts |
| `ChartWrapper.jsx` | ~50 | Reusable loading/error/cache wrapper |
| `RevenueTrendChart.jsx` | ~90 | Line chart with dual Y-axis |
| `OrderStatusChart.jsx` | ~70 | Pie chart with percentages |
| `TopCategoriesChart.jsx` | ~80 | Horizontal bar chart |
| `DeliveryPerformanceChart.jsx` | ~75 | Bar chart with dual Y-axis |
| `ReviewScoreChart.jsx` | ~85 | Grouped bar chart |
| `config.js` | ~10 | API endpoint constants |
| `App.css` | ~30 | Header and gradient styling |
| `Dashboard.css` | ~120 | Grid, cards, loading, error states |
| `index.css` | ~20 | Global dark theme base |
| `main.jsx` | ~10 | React DOM mounting |

**Total:** ~700 lines of frontend code

---

## 📦 Dependencies

### Backend (dashboard-api)

```json
{
  "dependencies": {
    "express": "^4.18.2",    // Web framework
    "pg": "^8.11.3",         // PostgreSQL driver
    "dotenv": "^16.3.1",     // Env var loader
    "cors": "^2.8.5"         // CORS middleware
  }
}
```

**Bundle size:** ~15 MB (node_modules)

### Frontend (dashboard-ui)

```json
{
  "dependencies": {
    "react": "^18.2.0",           // UI library
    "react-dom": "^18.2.0",       // React renderer
    "recharts": "^2.10.3"         // Chart library
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",  // Vite React plugin
    "vite": "^5.0.8"                   // Build tool
  }
}
```

**Bundle size (dev):** ~250 MB (node_modules)  
**Build output:** ~500 KB (dist/)

---

## 🎯 API Endpoints Mapping

Each endpoint maps to a specific chart:

| Endpoint | Chart Component | Chart Type | Data Source |
|----------|----------------|------------|-------------|
| `/api/revenue/monthly` | `RevenueTrendChart` | Line | `mart_monthly_revenue` |
| `/api/orders/status-breakdown` | `OrderStatusChart` | Pie | `fct_orders` |
| `/api/products/top-categories` | `TopCategoriesChart` | H-Bar | `fct_order_items` + `dim_products` |
| `/api/delivery/performance` | `DeliveryPerformanceChart` | Bar | `mart_delivery_performance` |
| `/api/reviews/analysis` | `ReviewScoreChart` | Grouped Bar | `mart_review_analysis` |

---

## 🗄️ Database Tables Used

### Direct Queries (3 marts)
- ✅ `public.mart_monthly_revenue`
- ✅ `public.mart_delivery_performance`
- ✅ `public.mart_review_analysis`

### Join Queries (3 tables)
- ✅ `public.fct_orders`
- ✅ `public.fct_order_items`
- ✅ `public.dim_products`

**Not Used (but available):**
- `dim_customers`
- `dim_sellers`
- Staging models (in `raw` schema)

---

## 🎨 Styling Architecture

### CSS Files Hierarchy

```
index.css                    # Global: body, #root, dark background
  └─ App.css                # Header: gradient banner, title, subtitle
      └─ Dashboard.css      # Grid: cards, loading, error, cache badge
          └─ Inline styles  # Recharts: tooltips, axes, colors
```

### Color Palette

```css
/* Primary */
--primary-purple: #667eea;
--primary-violet: #764ba2;

/* Status Colors */
--success-green: #10b981;
--warning-orange: #f59e0b;
--error-red: #ef4444;
--info-blue: #06b6d4;

/* Neutrals */
--bg-dark: #0a0e27;
--card-bg: #1a1f3a;
--border: #374151;
--text-primary: #e4e4e7;
--text-secondary: #a1a1aa;
```

---

## 🔧 Configuration Files

### Backend Config
```
dashboard-api/
├── .env              # Runtime: DB credentials, PORT, CORS origin
└── package.json      # Build: dependencies, scripts
```

### Frontend Config
```
dashboard-ui/
├── .env              # Runtime: VITE_API_URL
├── vite.config.js    # Build: Vite plugin, dev server
├── package.json      # Build: dependencies, scripts
└── src/config.js     # Runtime: API endpoint URLs
```

---

## 📊 Size Breakdown

### Source Code (uncompressed)

| Component | Files | Lines | Size |
|-----------|-------|-------|------|
| **Backend** | 6 | ~320 | ~12 KB |
| **Frontend** | 13 | ~700 | ~28 KB |
| **Documentation** | 4 | ~800 | ~35 KB |
| **Total** | 23 | ~1,820 | ~75 KB |

### Node Modules (installed)

| Component | Packages | Size |
|-----------|----------|------|
| **Backend** | 60+ | ~15 MB |
| **Frontend** | 200+ | ~250 MB |

### Build Output

| Component | Format | Size |
|-----------|--------|------|
| **Frontend (dist/)** | Minified JS/CSS | ~500 KB |
| **Backend** | No build (Node.js) | N/A |

---

## 🚀 Quick File Access

### To edit chart styling:
```
dashboard-ui/src/components/Dashboard.css
```

### To add a new endpoint:
```
dashboard-api/routes.js
```

### To add a new chart:
```
1. Create: dashboard-ui/src/components/charts/NewChart.jsx
2. Import: dashboard-ui/src/components/Dashboard.jsx
3. Add endpoint: dashboard-api/routes.js (if needed)
```

### To change API URL:
```
dashboard-ui/.env  (or)
dashboard-ui/src/config.js
```

### To change cache TTL:
```
dashboard-api/cache.js
const CACHE_TTL = 5 * 60 * 1000;  // Change this
```

---

## 🔒 Gitignored Files

These files are NOT committed to git:

```
# Backend
dashboard-api/node_modules/
dashboard-api/.env

# Frontend
dashboard-ui/node_modules/
dashboard-ui/dist/
dashboard-ui/.env
dashboard-ui/.env.local
```

**Reason:** Contains credentials, dependencies (can be reinstalled), and build outputs.

---

## 📝 Documentation Files

| File | Lines | Purpose |
|------|-------|---------|
| `DASHBOARD_QUICKSTART.md` | ~300 | Setup and usage guide |
| `DASHBOARD_ARCHITECTURE.md` | ~400 | Technical deep-dive |
| `DASHBOARD_FILE_STRUCTURE.md` | ~200 | This file (tree structure) |
| `dashboard-api/README.md` | ~150 | Backend API docs |
| `dashboard-ui/README.md` | ~200 | Frontend UI docs |

**Total:** ~1,250 lines of documentation

---

## 🎯 Entry Points

### Start Backend:
```bash
cd dashboard-api
npm install
npm run dev
```
**Entry file:** `server.js`

### Start Frontend:
```bash
cd dashboard-ui
npm install
npm run dev
```
**Entry file:** `index.html` → `src/main.jsx` → `src/App.jsx`

---

**Last Updated:** 2026-09-10  
**Version:** 1.0.0
