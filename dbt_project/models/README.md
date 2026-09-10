# Olist E-commerce Analytics - dbt Models

This dbt project transforms raw Olist e-commerce data into analytical models following the medallion architecture pattern.

## Architecture Overview

```
RAW LAYER (Postgres raw schema)
    ↓
STAGING LAYER (9 models - views in public_staging)
    ↓
INTERMEDIATE LAYER (3 models - ephemeral CTEs)
    ↓
MARTS LAYER (8 models - tables in public_marts)
```

## Model Layers

### 🥉 Staging Layer (`models/staging/`)

**Purpose:** Clean, typed 1:1 passthrough of raw data

**Materialization:** Views

**Models (9):**
- `stg_customers` - Customer demographics
- `stg_orders` - Order lifecycle
- `stg_order_items` - Line items
- `stg_order_payments` - Payments
- `stg_order_reviews` - Reviews
- `stg_products` - Product catalog
- `stg_sellers` - Seller info
- `stg_geolocation` - Zip code coordinates
- `stg_product_category_translation` - Category translations

**Design Principles:**
- No joins or business logic
- Explicit type casting (IDs as VARCHAR, numerics with precision)
- Standardized column naming
- Full data passthrough

### 🥈 Intermediate Layer (`models/intermediate/`)

**Purpose:** Business logic transformations and enrichment

**Materialization:** Ephemeral (compiled into downstream queries)

**Models (3):**

1. **`int_orders_with_payments`**
   - Joins orders with aggregated payment data
   - Calculates total_payment_value per order
   - Identifies primary payment type

2. **`int_delivery_times`**
   - Calculates delivery_days from purchase to delivery
   - Computes estimated_vs_actual_delta
   - Flags late deliveries (is_late boolean)

3. **`int_order_items_enriched`**
   - Joins order items with products and sellers
   - Enriches with category, seller location
   - Preserves all item-level detail

### 🥇 Marts Layer (`models/marts/`)

**Purpose:** Business-ready dimensional models and aggregated analytics

**Materialization:** Tables (for query performance)

**Dimensional Models (3):**

1. **`dim_customers`** - Customer dimension
   - Grain: One row per customer_id
   - Rows: 99,441
   - Contains location information

2. **`dim_products`** - Product dimension
   - Grain: One row per product_id
   - Rows: 32,951
   - Includes English category names, volume calculations

3. **`dim_sellers`** - Seller dimension
   - Grain: One row per seller_id
   - Rows: 3,095
   - Contains seller location

**Fact Tables (2):**

1. **`fct_orders`** - Central fact table
   - Grain: One row per order
   - Rows: 99,441
   - Combines payment amounts, delivery metrics, status
   - Date dimensions (year, month, quarter, day_of_week)
   - Foreign key: customer_id → dim_customers

2. **`fct_order_items`** - Line item details
   - Grain: One row per order line item
   - Rows: 112,650
   - Price, freight, total item value
   - Product volume calculations
   - Foreign keys: order_id → fct_orders, product_id → dim_products, seller_id → dim_sellers

**Analytical Marts (3):**

1. **`mart_monthly_revenue`**
   - Monthly aggregated revenue metrics
   - Rows: 25 months
   - Metrics: order_count, total_revenue, avg_order_value
   - Breakdown by payment type

2. **`mart_delivery_performance`**
   - Seller delivery performance metrics
   - Rows: 2,970 sellers
   - Metrics: pct_late_deliveries, avg_delivery_days, total_revenue
   - Aggregated by seller and region

3. **`mart_review_analysis`**
   - Review scores by category, delivery performance, payment type
   - Rows: 273 combinations (filtered for ≥10 reviews)
   - Metrics: avg_review_score, score distribution, pct_with_comments

## Running the Project

### Prerequisites

- Docker and Docker Compose installed
- Postgres container running with raw data loaded
- dbt Docker service built

### Commands

```bash
cd docker

# Install dbt dependencies
docker-compose run --rm dbt dbt deps

# Run all models
docker-compose run --rm dbt dbt run

# Run specific layer
docker-compose run --rm dbt dbt run --select staging
docker-compose run --rm dbt dbt run --select marts

# Run specific model
docker-compose run --rm dbt dbt run --select fct_orders

# Test all models
docker-compose run --rm dbt dbt test

# Test specific model
docker-compose run --rm dbt dbt test --select fct_orders

# Generate documentation
docker-compose run --rm dbt dbt docs generate
```

## Test Coverage

**Total Tests:** 75
**Pass Rate:** 98.7% (74/75 passing)

### Test Types

- ✅ **not_null** tests on all primary/foreign keys and required fields (57 tests)
- ✅ **unique** tests on all dimension keys and fact grain columns (14 tests)
- ✅ **relationships** tests linking facts to dimensions (4 tests)
- ✅ **accepted_values** tests on categorical fields (3 tests)

### Known Issues

❌ **unique_stg_order_reviews_review_id** - 789 duplicate review_ids in source data
- **Impact:** review_id cannot be used as primary key
- **Workaround:** Use composite key (review_id, order_id) in downstream models
- **Status:** Documented as data quality issue

## Schema Summary

```
Staging:     9 models  (views)
Intermediate: 3 models  (ephemeral)
Marts:       8 models  (tables)
─────────────────────────────
Total:       20 models
```

## Data Quality Metrics

| Layer        | Models | Tests | Pass Rate |
|--------------|--------|-------|-----------|
| Staging      | 9      | 35    | 97.1%     |
| Intermediate | 3      | 6     | 100%      |
| Marts        | 8      | 34    | 100%      |
| **Total**    | **20** | **75**| **98.7%** |

## Sample Queries

### Monthly Revenue Trend
```sql
SELECT 
    order_year,
    order_month,
    order_count,
    ROUND(total_revenue, 2) as revenue,
    ROUND(avg_order_value, 2) as aov
FROM public_marts.mart_monthly_revenue
ORDER BY order_year DESC, order_month DESC;
```

### Top Performing Sellers
```sql
SELECT 
    seller_state,
    COUNT(*) as seller_count,
    ROUND(AVG(pct_late_deliveries), 2) as avg_late_pct,
    ROUND(AVG(avg_delivery_days), 1) as avg_days
FROM public_marts.mart_delivery_performance
GROUP BY seller_state
ORDER BY avg_late_pct ASC
LIMIT 10;
```

### Review Scores by Delivery Performance
```sql
SELECT 
    is_late,
    COUNT(*) as segment_count,
    ROUND(AVG(avg_review_score), 2) as avg_score,
    SUM(review_count) as total_reviews
FROM public_marts.mart_review_analysis
GROUP BY is_late;
```

## Expected Output

### dbt run
```
11:05:40  1 of 17 START sql view model public_staging.stg_customers ........... [RUN]
11:05:40  1 of 17 OK created sql view model public_staging.stg_customers ...... [CREATE VIEW in 0.37s]
...
11:05:44  17 of 17 OK created sql table model public_marts.mart_review_analysis [SELECT 273 in 0.88s]
11:05:44  Completed successfully
11:05:44  Done. PASS=17 WARN=0 ERROR=0 SKIP=0 TOTAL=17
```

### dbt test
```
11:06:09  1 of 75 PASS accepted_values_fct_orders_order_status__delivered... [PASS in 0.19s]
...
11:06:09  74 of 75 PASS unique_stg_products_product_id ..................... [PASS in 0.10s]
11:06:09  71 of 75 FAIL 789 unique_stg_order_reviews_review_id ............. [FAIL 789 in 0.15s]
11:06:09  Completed with 1 error and 0 warnings
11:06:09  Done. PASS=74 WARN=0 ERROR=1 SKIP=0 TOTAL=75
```

## Next Steps

1. **Incremental Models** - Convert large fact tables to incremental for better performance
2. **Snapshots** - Track slowly changing dimensions (e.g., product prices, seller locations)
3. **Data Quality Rules** - Add custom tests for business rule validation
4. **Documentation** - Add model descriptions and column lineage
5. **Exposures** - Define BI dashboards that consume these models
