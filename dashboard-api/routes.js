import express from 'express';
import { query } from './db.js';
import { getCached, setCached } from './cache.js';

const router = express.Router();

// Helper to wrap endpoint with caching
function cachedEndpoint(cacheKey, queryFn) {
  return async (req, res) => {
    try {
      // Check cache first
      const cached = getCached(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true,
          timestamp: new Date().toISOString()
        });
      }

      // Execute query
      const result = await queryFn(req);
      
      // Cache the result
      setCached(cacheKey, result.rows);
      
      res.json({
        success: true,
        data: result.rows,
        cached: false,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error in ${cacheKey}:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
}

// 1. Monthly Revenue Trend
router.get('/revenue/monthly', cachedEndpoint(
  'revenue_monthly',
  async () => {
    return await query(`
      SELECT 
        month_start_date as month,
        total_revenue,
        order_count,
        avg_order_value
      FROM public_marts.mart_monthly_revenue
      ORDER BY month_start_date
    `);
  }
));

// 2. Delivery Performance by Seller State
router.get('/delivery/performance', cachedEndpoint(
  'delivery_performance',
  async () => {
    return await query(`
      SELECT 
        seller_state,
        SUM(total_orders) as total_orders,
        AVG(avg_delivery_days) as avg_delivery_days,
        AVG(pct_late_deliveries) as pct_late_deliveries
      FROM public_marts.mart_delivery_performance
      WHERE seller_state IS NOT NULL
      GROUP BY seller_state
      ORDER BY SUM(total_orders) DESC
      LIMIT 20
    `);
  }
));

// 3. Review Analysis
router.get('/reviews/analysis', cachedEndpoint(
  'reviews_analysis',
  async () => {
    return await query(`
      SELECT 
        product_category_name as product_category_english,
        SUM(CASE WHEN is_late = false THEN avg_review_score * review_count ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN is_late = false THEN review_count ELSE 0 END), 0) as onTime_score,
        SUM(CASE WHEN is_late = true THEN avg_review_score * review_count ELSE 0 END) / 
          NULLIF(SUM(CASE WHEN is_late = true THEN review_count ELSE 0 END), 0) as late_score,
        SUM(CASE WHEN is_late = false THEN review_count ELSE 0 END) as ontime_count,
        SUM(CASE WHEN is_late = true THEN review_count ELSE 0 END) as late_count,
        SUM(review_count) as total_reviews
      FROM public_marts.mart_review_analysis
      WHERE product_category_name IS NOT NULL
      GROUP BY product_category_name
      HAVING SUM(review_count) >= 20
      ORDER BY SUM(review_count) DESC
      LIMIT 15
    `);
  }
));

// 4. Top Product Categories by Revenue
router.get('/products/top-categories', cachedEndpoint(
  'top_categories',
  async () => {
    return await query(`
      SELECT 
        p.product_category_name_english as product_category_english,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.price) as total_revenue,
        AVG(oi.price) as avg_item_price,
        COUNT(oi.order_item_id) as items_sold
      FROM public_marts.fct_order_items oi
      JOIN public_marts.dim_products p ON oi.product_id = p.product_id
      WHERE p.product_category_name_english IS NOT NULL
      GROUP BY p.product_category_name_english
      ORDER BY total_revenue DESC
      LIMIT 10
    `);
  }
));

// 5. Order Status Breakdown
router.get('/orders/status-breakdown', cachedEndpoint(
  'order_status',
  async () => {
    return await query(`
      SELECT 
        order_status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
      FROM public_marts.fct_orders
      GROUP BY order_status
      ORDER BY count DESC
    `);
  }
));

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const result = await query('SELECT NOW() as server_time, current_database() as database');
    res.json({
      success: true,
      status: 'healthy',
      database: result.rows[0].database,
      server_time: result.rows[0].server_time
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
