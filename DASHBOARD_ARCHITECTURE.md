# Olist Analytics Dashboard - Architecture

Technical documentation for the analytics dashboard stack.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (User)                           │
│                  http://localhost:5173                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ HTTP/Fetch API
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              React Frontend (Vite)                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Dashboard.jsx (Layout)                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐          │   │
│  │  │ RevenueTrend    │  │ OrderStatus     │          │   │
│  │  │ Chart (Line)    │  │ Chart (Pie)     │          │   │
│  │  └─────────────────┘  └─────────────────┘          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐          │   │
│  │  │ TopCategories   │  │ DeliveryPerf    │          │   │
│  │  │ Chart (H-Bar)   │  │ Chart (Bar)     │          │   │
│  │  └─────────────────┘  └─────────────────┘          │   │
│  │  ┌─────────────────┐                                │   │
│  │  │ ReviewScore     │                                │   │
│  │  │ Chart (G-Bar)   │                                │   │
│  │  └─────────────────┘                                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ REST API Calls
                      │ (CORS enabled)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│            Express API Server (Node.js)                     │
│               http://localhost:3001                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Routes Layer (routes.js)                           │   │
│  │  • GET /api/revenue/monthly                         │   │
│  │  • GET /api/delivery/performance                    │   │
│  │  • GET /api/reviews/analysis                        │   │
│  │  • GET /api/products/top-categories                 │   │
│  │  • GET /api/orders/status-breakdown                 │   │
│  │  • GET /api/health                                  │   │
│  └─────────────────┬───────────────────────────────────┘   │
│                    │                                        │
│  ┌─────────────────▼───────────────────────────────────┐   │
│  │  Cache Layer (cache.js)                             │   │
│  │  • In-memory Map with TTL (5 min)                   │   │
│  │  • Per-endpoint keys                                │   │
│  │  • Auto-cleanup expired entries                     │   │
│  └─────────────────┬───────────────────────────────────┘   │
│                    │ Cache miss                             │
│  ┌─────────────────▼───────────────────────────────────┐   │
│  │  Database Layer (db.js)                             │   │
│  │  • PostgreSQL connection pool (pg)                  │   │
│  │  • Max 20 connections                               │   │
│  │  • Query logging with timing                        │   │
│  └─────────────────┬───────────────────────────────────┘   │
└────────────────────┼───────────────────────────────────────┘
                     │
                     │ SQL Queries
                     │
┌────────────────────▼───────────────────────────────────────┐
│         PostgreSQL Database (Docker)                       │
│               127.0.0.1:5432                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  public schema                                      │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  dbt Marts (tables)                         │   │  │
│  │  │  • mart_monthly_revenue                     │   │  │
│  │  │  • mart_delivery_performance                │   │  │
│  │  │  • mart_review_analysis                     │   │  │
│  │  │  • fct_orders                               │   │  │
│  │  │  • fct_order_items                          │   │  │
│  │  │  • dim_products                             │   │  │
│  │  │  • dim_customers                            │   │  │
│  │  │  • dim_sellers                              │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 🔧 Technology Stack

### Backend (dashboard-api/)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Node.js | 18+ | JavaScript execution |
| Framework | Express | ^4.18.2 | HTTP server & routing |
| Database Client | pg | ^8.11.3 | PostgreSQL driver |
| Config | dotenv | ^16.3.1 | Environment variables |
| CORS | cors | ^2.8.5 | Cross-origin requests |

### Frontend (dashboard-ui/)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Framework | React | ^18.2.0 | UI components |
| Build Tool | Vite | ^5.0.8 | Dev server & bundler |
| Charts | Recharts | ^2.10.3 | Data visualization |
| Styling | CSS3 | Native | Dark theme |

---

## 📊 Data Flow

### 1. User Request Flow

```
User clicks page
  → Component mounts (useEffect)
    → fetch(ENDPOINT)
      → API receives request
        → Check cache
          ├─ HIT: Return cached data (fast)
          └─ MISS: Query database
              → Execute SQL
              → Store in cache
              → Return fresh data
        → Send JSON response
      → Component receives data
    → Update state
  → Recharts renders visualization
```

### 2. Cache Strategy

```javascript
// Per-endpoint cache with TTL
const cache = Map {
  'revenue_monthly' => { data: [...], expiry: timestamp },
  'top_categories' => { data: [...], expiry: timestamp },
  ...
}

// Cache lifecycle
Request → Check cache
  ├─ Exists & Fresh → Return immediately
  ├─ Exists & Expired → Delete, Query DB, Cache new
  └─ Not exists → Query DB, Cache result

// Auto-cleanup every 10 minutes
setInterval(cleanup, 10 * 60 * 1000)
```

### 3. Database Queries

Each endpoint executes a specific SQL query:

**Revenue Trend:**
```sql
SELECT month, total_revenue, order_count, avg_order_value
FROM public.mart_monthly_revenue
ORDER BY month
```

**Top Categories:**
```sql
SELECT 
  p.product_category_english,
  COUNT(DISTINCT oi.order_id) as order_count,
  SUM(oi.price) as total_revenue,
  AVG(oi.price) as avg_item_price,
  COUNT(oi.order_item_id) as items_sold
FROM public.fct_order_items oi
JOIN public.dim_products p ON oi.product_id = p.product_id
WHERE p.product_category_english IS NOT NULL
GROUP BY p.product_category_english
ORDER BY total_revenue DESC
LIMIT 10
```

---

## 🎨 Frontend Component Architecture

### Component Hierarchy

```
App.jsx
├── Header (title, subtitle)
└── Dashboard.jsx
    ├── RevenueTrendChart.jsx
    │   └── ChartWrapper.jsx
    │       ├── Loading state (spinner)
    │       ├── Error state (message)
    │       └── LineChart (Recharts)
    ├── OrderStatusChart.jsx
    │   └── ChartWrapper.jsx → PieChart
    ├── TopCategoriesChart.jsx
    │   └── ChartWrapper.jsx → BarChart (horizontal)
    ├── DeliveryPerformanceChart.jsx
    │   └── ChartWrapper.jsx → BarChart (dual Y-axis)
    └── ReviewScoreChart.jsx
        └── ChartWrapper.jsx → BarChart (grouped)
```

### Chart Component Pattern

All charts follow this pattern:

```javascript
function ChartComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINT);
      const json = await response.json();
      
      if (json.success) {
        setData(formatData(json.data));
        setCached(json.cached);
      } else {
        setError(json.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ChartWrapper loading={loading} error={error} cached={cached}>
      <ResponsiveContainer>
        <ChartType data={data} {...config} />
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
```

---

## 🔐 Security Considerations

### Current Implementation (Development)

- ✅ CORS restricted to specific origin
- ✅ Read-only database queries
- ✅ Connection pooling with limits
- ✅ Error messages don't expose internals
- ⚠️ Database credentials in `.env` (gitignored)

### Production Recommendations

- [ ] Add authentication (JWT, OAuth, API keys)
- [ ] Rate limiting per IP/user
- [ ] HTTPS only (TLS certificates)
- [ ] Prepared statements for all queries (already using `pg` safely)
- [ ] Input validation (if adding POST endpoints)
- [ ] SQL injection protection (pg library handles this)
- [ ] Environment-specific configs (dev/staging/prod)
- [ ] Audit logging for sensitive operations

---

## ⚡ Performance Optimization

### Current Optimizations

1. **Caching Layer**
   - 5-minute TTL reduces DB load
   - In-memory storage (fast access)
   - Per-endpoint keys (granular control)

2. **Database Connection Pool**
   - Max 20 connections (prevents exhaustion)
   - Idle timeout: 30 seconds
   - Connection reuse (no overhead per request)

3. **Frontend**
   - Code splitting (Vite default)
   - Lazy loading (React lazy imports available)
   - Responsive charts (automatic resize)

4. **SQL Queries**
   - Pre-aggregated marts (dbt handles heavy lifting)
   - Indexed primary keys
   - LIMIT clauses on large result sets

### Potential Improvements

- [ ] Redis for distributed caching
- [ ] WebSocket for real-time updates
- [ ] Query result streaming for large datasets
- [ ] CDN for static assets
- [ ] Compression (gzip/brotli)
- [ ] Database read replicas
- [ ] GraphQL for flexible querying

---

## 🧪 Testing Strategy

### Recommended Tests

**Backend:**
```javascript
// Unit tests (Jest)
- Cache get/set/clear operations
- Database connection handling
- Route handlers with mocked DB

// Integration tests
- API endpoints return correct status codes
- Cache expiration works correctly
- Database queries execute successfully

// Load tests (Artillery, k6)
- Concurrent requests handling
- Cache effectiveness under load
- Connection pool behavior
```

**Frontend:**
```javascript
// Unit tests (Vitest, React Testing Library)
- Component rendering
- Data fetching and state updates
- Error handling

// E2E tests (Playwright, Cypress)
- Charts load and display data
- Loading states appear
- Error states display correctly
- Cache badges show when appropriate
```

---

## 📦 Deployment Options

### Option 1: Traditional Hosting

**Backend:**
- Deploy to: AWS EC2, DigitalOcean Droplet, Heroku
- Process manager: PM2
- Reverse proxy: Nginx
- Domain: api.olist-analytics.com

**Frontend:**
- Deploy to: Vercel, Netlify, AWS S3 + CloudFront
- Build command: `npm run build`
- Output: `dist/` directory
- Domain: olist-analytics.com

### Option 2: Containerized (Docker)

```yaml
# docker-compose.yml
services:
  api:
    build: ./dashboard-api
    environment:
      - PGHOST=postgres
    ports:
      - "3001:3001"
    depends_on:
      - postgres
  
  ui:
    build: ./dashboard-ui
    ports:
      - "8080:80"
    depends_on:
      - api
```

### Option 3: Serverless

**Backend:**
- AWS Lambda + API Gateway
- Function per endpoint
- DynamoDB for caching

**Frontend:**
- Static site on S3 + CloudFront
- No server needed

---

## 🔄 Future Enhancements

### High Priority
- [ ] User authentication and authorization
- [ ] Date range filters for charts
- [ ] Export functionality (CSV, PNG, PDF)
- [ ] Mobile responsive optimization

### Medium Priority
- [ ] Real-time data updates (WebSocket)
- [ ] Custom dashboard builder (drag-and-drop)
- [ ] Saved views and bookmarks
- [ ] Email/Slack alerts for KPI thresholds

### Low Priority
- [ ] Dark/light theme toggle
- [ ] Internationalization (i18n)
- [ ] A/B testing framework
- [ ] Advanced analytics (ML predictions)

---

## 📚 Related Documentation

- [Backend API README](dashboard-api/README.md)
- [Frontend UI README](dashboard-ui/README.md)
- [Quick Start Guide](DASHBOARD_QUICKSTART.md)
- [Main Project README](README.md)

---

## 🆘 Troubleshooting

### High memory usage

**Cause:** Cache accumulating too much data

**Solution:**
- Reduce cache TTL in `cache.js`
- Add max cache size limit
- Clear cache periodically

### Slow queries

**Cause:** Missing indexes or complex joins

**Solution:**
- Check `dbt_project/models/` for optimization opportunities
- Add indexes in Postgres
- Use `EXPLAIN ANALYZE` to debug

### CORS errors

**Cause:** Frontend origin doesn't match API's FRONTEND_ORIGIN

**Solution:**
- Update `dashboard-api/.env`
- Ensure both servers are running
- Check browser console for exact origin

---

**Last Updated:** 2026-09-10  
**Version:** 1.0.0
