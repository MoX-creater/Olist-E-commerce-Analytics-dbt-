# Olist Dashboard UI

React-based analytics dashboard for visualizing Olist e-commerce data.

## Features

- ✅ 5 interactive charts using Recharts
- ✅ Real-time data from dbt marts via API
- ✅ Responsive grid layout
- ✅ Dark theme optimized for readability
- ✅ Loading states and error handling
- ✅ Cache indicators

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Charting library
- **CSS3** - Styling (no CSS frameworks needed)

## Setup

### 1. Install Dependencies

```bash
cd dashboard-ui
npm install
```

### 2. Configure Environment (Optional)

Create `.env` file if you need to customize the API URL:

```bash
cp .env.example .env
```

Default API URL is `http://localhost:3001`

### 3. Start Development Server

```bash
npm run dev
```

The dashboard will open at `http://localhost:5173`

## Charts

### 1. Revenue Trend Chart (Line)
- **Endpoint:** `/api/revenue/monthly`
- **Shows:** Monthly revenue and order count over time
- **Dual Y-axis:** Revenue (left) and Order count (right)

### 2. Order Status Chart (Pie)
- **Endpoint:** `/api/orders/status-breakdown`
- **Shows:** Distribution of orders by status
- **Interactive:** Hover for counts and percentages

### 3. Top Categories Chart (Horizontal Bar)
- **Endpoint:** `/api/products/top-categories`
- **Shows:** Top 10 product categories by revenue
- **Sorted:** Highest revenue first

### 4. Delivery Performance Chart (Bar)
- **Endpoint:** `/api/delivery/performance`
- **Shows:** Average delivery days and late delivery % by state
- **Top 10 states** by order volume

### 5. Review Score Chart (Grouped Bar)
- **Endpoint:** `/api/reviews/analysis`
- **Shows:** Review scores comparing on-time vs late deliveries
- **Grouped by:** Product category (top 10)

## Project Structure

```
dashboard-ui/
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   ├── ChartWrapper.jsx        # Reusable wrapper with loading/error states
│   │   │   ├── RevenueTrendChart.jsx
│   │   │   ├── DeliveryPerformanceChart.jsx
│   │   │   ├── ReviewScoreChart.jsx
│   │   │   ├── TopCategoriesChart.jsx
│   │   │   └── OrderStatusChart.jsx
│   │   ├── Dashboard.jsx               # Main dashboard layout
│   │   └── Dashboard.css
│   ├── App.jsx                         # Root component
│   ├── App.css
│   ├── config.js                       # API endpoints configuration
│   ├── main.jsx                        # React entry point
│   └── index.css                       # Global styles
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Build for Production

```bash
npm run build
```

Output will be in `dist/` directory.

Preview production build:

```bash
npm run preview
```

## Customization

### Change Color Theme

Edit colors in `src/App.css` and `src/components/Dashboard.css`:

```css
/* Primary gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Chart card background */
background: #1a1f3a;
```

### Modify Chart Colors

Edit color constants in each chart component:

```jsx
// In TopCategoriesChart.jsx
<Bar fill="#667eea" />

// In OrderStatusChart.jsx
const COLORS = ['#667eea', '#10b981', '#f59e0b', ...];
```

### Adjust Grid Layout

Modify grid settings in `src/components/Dashboard.css`:

```css
.dashboard-grid {
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 2rem;
}
```

## Troubleshooting

### Charts not loading

1. **Check API is running:**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check browser console** for CORS errors

3. **Verify API URL** in `.env` or `src/config.js`

### CORS errors

Ensure the API's `FRONTEND_ORIGIN` in `dashboard-api/.env` matches your dev server URL:

```env
FRONTEND_ORIGIN=http://localhost:5173
```

### Blank charts

- Check that dbt models have been run (`dbt run`)
- Verify database has data
- Check API endpoint responses in Network tab

## Performance

- **Caching:** API responses are cached for 5 minutes
- **Cache indicator:** Shows "Cached" badge when data is from cache
- **Automatic refresh:** Charts fetch fresh data on component mount
- **Responsive:** Optimized for desktop, tablet, and mobile

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

Potential additions:
- [ ] Date range filters
- [ ] Auto-refresh toggle
- [ ] Export charts as images
- [ ] Drill-down details on click
- [ ] Additional metrics (customer lifetime value, churn, etc.)
- [ ] Real-time updates via WebSocket
- [ ] User authentication
- [ ] Saved dashboard views

## License

MIT
