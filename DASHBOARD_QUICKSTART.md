# Olist Analytics Dashboard - Quick Start Guide

Complete guide to running the analytics dashboard (API + UI).

## 📋 Prerequisites

- ✅ Node.js 18+ installed
- ✅ PostgreSQL running (Docker container `olist_postgres`)
- ✅ dbt models built (`dbt run` completed)

## 🚀 Backend Setup (API)

### 1. Navigate to API folder

```bash
cd dashboard-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

The `.env` file is already configured with default values:
```env
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=olist
PGPASSWORD=olist_pass
PGDATABASE=olist
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

**Note:** If you're using different credentials, update the `.env` file.

### 4. Start the API server

**Development mode (auto-restart on changes):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
🚀 Olist Analytics API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Server running on: http://localhost:3001
🌐 CORS enabled for: http://localhost:5173
💾 Database: olist@127.0.0.1:5432
```

### 5. Test the API

Open a new terminal and test:
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "database": "olist",
  "server_time": "2026-09-10T12:00:00.000Z"
}
```

---

## 🎨 Frontend Setup (UI)

### 1. Navigate to UI folder (new terminal)

```bash
cd dashboard-ui
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

The dashboard will automatically open at: `http://localhost:5173`

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🎯 Using the Dashboard

Once both servers are running, you'll see 5 interactive charts:

### 1. **Monthly Revenue Trend** (Line Chart)
- Shows revenue and order count over time
- Dual Y-axis for better visualization
- Hover for exact values

### 2. **Order Status Distribution** (Pie Chart)
- Breakdown of orders by status (delivered, shipped, etc.)
- Shows counts and percentages

### 3. **Top Product Categories** (Horizontal Bar)
- Top 10 categories by revenue
- Sorted highest to lowest

### 4. **Delivery Performance** (Bar Chart)
- Average delivery days and late delivery % by state
- Compares top 10 states

### 5. **Review Scores by Delivery** (Grouped Bar)
- Compares review scores for on-time vs late deliveries
- Grouped by product category

---

## 🔧 Troubleshooting

### API won't start

**Error:** "Connection refused" or "ECONNREFUSED"
- Ensure Postgres is running: `docker ps | grep olist_postgres`
- Check credentials in `dashboard-api/.env`
- Test direct connection: `docker exec -it olist_postgres psql -U olist -d olist`

**Error:** "relation does not exist"
- Run dbt models: `cd dbt_project && dbt run`
- Verify tables exist:
  ```bash
  docker exec -it olist_postgres psql -U olist -d olist -c "\dt"
  ```

### Frontend shows errors

**Error:** "Failed to fetch"
- Ensure API is running on port 3001
- Check browser console for CORS errors
- Verify `FRONTEND_ORIGIN` in API's `.env`

**Blank charts:**
- Check API responses in browser Network tab
- Verify data exists: `curl http://localhost:3001/api/revenue/monthly`

### Port conflicts

**Port 3001 already in use:**
```bash
# Change API port in dashboard-api/.env
PORT=3002

# Update frontend config in dashboard-ui/.env
VITE_API_URL=http://localhost:3002
```

**Port 5173 already in use:**
```bash
# Vite will automatically try 5174, 5175, etc.
# Or specify manually in vite.config.js
```

---

## 📦 Production Build

### Build Frontend

```bash
cd dashboard-ui
npm run build
```

Output: `dashboard-ui/dist/`

### Serve Production Build

```bash
npm run preview
```

Or use a static file server:
```bash
npx serve -s dist -p 8080
```

### Deploy API

Use PM2 for process management:
```bash
cd dashboard-api
npm install -g pm2
pm2 start server.js --name olist-api
pm2 save
pm2 startup
```

---

## 🔄 Updating Data

The dashboard shows cached data (5-minute TTL). To see fresh data:

1. **Wait 5 minutes** for cache to expire
2. **Restart API** to clear cache immediately
3. **Refresh browser** after cache expires

---

## 📊 API Endpoints Reference

All endpoints return JSON with this structure:

```json
{
  "success": true,
  "data": [...],
  "cached": false,
  "timestamp": "2026-09-10T12:00:00.000Z"
}
```

### Available Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Health check and DB status |
| `GET /api/revenue/monthly` | Monthly revenue aggregation |
| `GET /api/delivery/performance` | Delivery metrics by state |
| `GET /api/reviews/analysis` | Review scores analysis |
| `GET /api/products/top-categories` | Top 10 categories by revenue |
| `GET /api/orders/status-breakdown` | Order status distribution |

### Example Usage

```bash
# Get monthly revenue
curl http://localhost:3001/api/revenue/monthly

# Get top categories
curl http://localhost:3001/api/products/top-categories
```

---

## 🛑 Stopping the Servers

### Stop API
Press `Ctrl+C` in the terminal running the API

### Stop UI
Press `Ctrl+C` in the terminal running Vite

### Stop with PM2 (if used)
```bash
pm2 stop olist-api
pm2 delete olist-api
```

---

## 📁 Project Structure

```
dashboard-api/              # Backend API
├── server.js              # Express app entry point
├── routes.js              # API endpoints
├── db.js                  # PostgreSQL connection pool
├── cache.js               # In-memory cache
├── package.json           # Dependencies
├── .env                   # Environment config
└── README.md

dashboard-ui/               # Frontend React app
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx           # Main layout
│   │   └── charts/                 # 5 chart components
│   ├── App.jsx                     # Root component
│   ├── config.js                   # API endpoints
│   └── main.jsx                    # Entry point
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎓 Next Steps

Once the dashboard is running:

1. ✅ **Explore the charts** - Interact with the visualizations
2. ✅ **Check the cache** - Look for "Cached" badges
3. ✅ **Customize styling** - Edit CSS files for your brand
4. ✅ **Add more charts** - Follow the existing pattern
5. ✅ **Deploy to production** - Use Vercel, Netlify, or your hosting

---

## 🆘 Need Help?

- Check `dashboard-api/README.md` for API details
- Check `dashboard-ui/README.md` for frontend details
- Review browser console for errors
- Check API logs for backend errors
- Verify Postgres logs: `docker logs olist_postgres`

---

**Happy analyzing! 📊✨**
