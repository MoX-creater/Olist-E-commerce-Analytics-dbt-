# Staging Models

This directory contains staging models that provide a clean, typed interface to the raw Olist e-commerce data.

## Models

All staging models follow the `stg_<entity>` naming convention and are materialized as views in the `public_staging` schema.

### Available Models

1. **stg_customers** - Customer information including location data
2. **stg_orders** - Core order information with status and timestamps  
3. **stg_order_items** - Line items for each order with product and seller information
4. **stg_order_payments** - Payment information (orders can have multiple payment methods)
5. **stg_order_reviews** - Customer reviews and ratings
6. **stg_products** - Product catalog with categories and dimensions
7. **stg_sellers** - Seller information including location
8. **stg_geolocation** - Brazilian zip code geolocation data
9. **stg_product_category_translation** - Product category translations from Portuguese to English

## Design Principles

- **1:1 passthrough** - No business logic, joins, or aggregations
- **Type casting** - All columns explicitly cast to appropriate types:
  - IDs (order_id, customer_id, etc.) cast to VARCHAR (they're hash-like strings, not integers)
  - Numeric columns cast to appropriate precision
  - Timestamps explicitly cast
- **Column renaming** - Standardized to snake_case (though Olist data is already snake_case)
- **No filtering** - All source data rows passed through

## Known Data Quality Issues

### Duplicate Review IDs
The `stg_order_reviews` model contains 789 duplicate `review_id` values that exist in the source data. This violates the unique constraint test.

**Impact:** The `review_id` column cannot be used as a reliable primary key.

**Recommendation:** Use `(review_id, order_id)` as a composite key, or implement deduplication logic in the intermediate layer.

**Example duplicates:**
```sql
SELECT review_id, COUNT(*) as cnt 
FROM raw.olist_order_reviews_dataset 
GROUP BY review_id 
HAVING COUNT(*) > 1
LIMIT 5;
```

## Running the Models

From the project root using Docker:

```bash
# Run all staging models
cd docker
docker-compose run --rm dbt dbt run --select staging

# Run a specific model
docker-compose run --rm dbt dbt run --select stg_orders

# Test all staging models
docker-compose run --rm dbt dbt test --select staging
```

## Test Results

**Pass Rate:** 34/35 tests (97%)

- ✅ All `not_null` tests passed
- ✅ All `unique` tests passed except `review_id`  
- ✅ All `accepted_values` tests passed
- ❌ `unique_stg_order_reviews_review_id` failed due to source data duplicates

## Sources

All models source from the `raw` schema in Postgres. See `_sources.yml` for complete source definitions and column descriptions.
