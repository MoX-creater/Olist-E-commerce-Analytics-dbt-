# Olist Dashboard API

Backend API for the Olist analytics dashboard. Provides read-only access to dbt marts data.

## Features

- ✅ 5 analytics endpoints querying dbt marts
- ✅ In-memory caching with 5-minute TTL
- ✅ PostgreSQL connection pooling
- ✅ CORS enabled for frontend
- ✅ Health check endpoint
- ✅ Request logging

## Setup

### 1. Install Dependencies

```bash
cd dashboard-api
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PGHOST=127.0.0.1
PGPORT=5432
PGUSER=olist
PGPASSWORD=olist_pass
PGDATABASE=olist

PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

### 3. Ensure dbt Models Are Built

The API queries the following tables from the `public` schema:
- `mart_monthly_revenue`
- `mart_delivery_performance`
- `mart_review_analysis`
- `fct_order_items`
- `fct_orders`
- `dim_products`

Make sure you've run `dbt run` to create these tables.

### 4. Start the Server

**Development (with auto-restart):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /api/health
```
Returns database connection status and server time.

### Monthly Revenue
```
GET /api/revenue/monthly
```
Returns monthly aggregated revenue, order count, and average order value.

### Delivery Performance
```
GET /api/delivery/performance
```
Returns delivery metrics by seller state (top 20 by order count).

### Review Analysis
```
GET /api/reviews/analysis
```
Returns average review scores grouped by product category, delivery status, and payment type.

### Top Product Categories
```
GET /api/products/top-categories
```
Returns top 10 product categories by total revenue.

### Order Status Breakdown
```
GET /api/orders/status-breakdown
```
Returns order counts and percentages by status.

## Response Format

All endpoints return JSON in this format:

```json
{
  "success": true,
  "data": [...],
  "cached": false,
  "timestamp": "2026-09-10T12:00:00.000Z"
}
```

## Caching

- Cache duration: 5 minutes per endpoint
- Cache key: endpoint-specific (e.g., `revenue_monthly`)
- Automatic cleanup of expired entries every 10 minutes

## Error Handling

Errors return HTTP status 500 with:

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-09-10T12:00:00.000Z"
}
```

## Testing

Test the API with curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Monthly revenue
curl http://localhost:3001/api/revenue/monthly

# Top categories
curl http://localhost:3001/api/products/top-categories
```

## Architecture

```
dashboard-api/
├── server.js       # Express app setup, middleware, error handling
├── routes.js       # API route definitions and query logic
├── db.js           # PostgreSQL connection pool
├── cache.js        # In-memory cache implementation
├── package.json    # Dependencies
├── .env            # Environment variables (gitignored)
└── .env.example    # Environment template
```

## Dependencies

- **express** - Web framework
- **pg** - PostgreSQL client
- **dotenv** - Environment variable loader
- **cors** - CORS middleware

## Troubleshooting

### "Connection refused" error
- Ensure PostgreSQL container is running: `docker ps`
- Check connection details in `.env`

### "relation does not exist" error
- Run `dbt run` to create the mart tables
- Verify tables exist: `docker exec -it olist_postgres psql -U olist -d olist -c "\dt"`

### Cache not working
- Check server logs for cache HIT/MISS messages
- Cache expires after 5 minutes automatically
