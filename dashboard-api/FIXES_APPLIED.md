# Dashboard Data Fixes

## Issues Identified and Resolved

---

## ✅ Fix 1: Delivery Performance by State

### **Problem**
Chart showed "SP" for all 10 x-axis labels instead of different states.

### **Root Cause**
The `mart_delivery_performance` dbt model groups by `seller_id, seller_state, seller_city`, creating **one row per seller** (not per state). The API query was returning the top 20 sellers (who all happened to be from São Paulo), not the top 20 states.

### **Solution**
Updated the API query to **aggregate by state** using `GROUP BY seller_state`:

```sql
-- BEFORE (wrong - groups by seller_id)
SELECT 
  seller_state,
  total_orders,
  avg_delivery_days,
  pct_late_deliveries
FROM public_marts.mart_delivery_performance
WHERE seller_state IS NOT NULL
ORDER BY total_orders DESC
LIMIT 20

-- AFTER (correct - aggregates by state)
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
```

### **Result - Top 10 States by Order Volume**

| State | Total Orders | Avg Delivery Days | Late Delivery % |
|-------|-------------|-------------------|-----------------|
| **SP** (São Paulo) | 69,395 | 11.78 | 9.54% |
| **MG** (Minas Gerais) | 7,745 | 12.77 | 6.37% |
| **PR** (Paraná) | 7,556 | 12.04 | 5.08% |
| **RJ** (Rio de Janeiro) | 4,229 | 11.73 | 10.44% |
| **SC** (Santa Catarina) | 3,608 | 12.88 | 5.70% |
| **RS** (Rio Grande do Sul) | 1,964 | 13.45 | 6.74% |
| **DF** (Distrito Federal) | 808 | 13.15 | 9.85% |
| **BA** (Bahia) | 550 | 15.95 | 4.66% |
| **GO** (Goiás) | 451 | 14.40 | 9.71% |
| **PE** (Pernambuco) | 403 | 13.62 | 6.98% |

**Key Insights:**
- ✅ São Paulo dominates with 69K orders (73% of top 10 total)
- ✅ RJ has the highest late delivery rate (10.44%)
- ✅ BA has the longest delivery time (15.95 days on average)
- ✅ PR has the lowest late delivery rate (5.08%)

---

## ✅ Fix 2: Review Scores by Delivery Status

### **Problem**
Chart showed uniform ~5.0 bars with no visible difference between on-time and late deliveries, despite the legend showing both series.

### **Root Cause**
The API was returning data in a **granular format** (one row per `category + is_late + payment_type` combination):
```json
[
  {"category": "cama_mesa_banho", "is_late": false, "payment_type": "credit_card", "score": 4.1, "count": 66},
  {"category": "cama_mesa_banho", "is_late": true, "payment_type": "credit_card", "score": 2.5, "count": 15},
  {"category": "cama_mesa_banho", "is_late": false, "payment_type": "boleto", "score": 4.2, "count": 12},
  ...
]
```

But the chart expected **aggregated format** (one row per category with separate on-time/late columns):
```json
[
  {"category": "cama_mesa_banho", "onTime": 4.1, "late": 2.49}
]
```

The frontend was trying to aggregate this client-side, but the logic was incorrect.

### **Solution**
Updated the API query to **pre-aggregate** the data correctly:

```sql
-- BEFORE (wrong - granular data)
SELECT 
  product_category_name as product_category_english,
  is_late,
  primary_payment_type as payment_type,
  avg_review_score,
  review_count
FROM public_marts.mart_review_analysis
WHERE product_category_name IS NOT NULL
ORDER BY review_count DESC
LIMIT 50

-- AFTER (correct - aggregated by category)
SELECT 
  product_category_name as product_category_english,
  -- Weighted average for on-time deliveries
  SUM(CASE WHEN is_late = false THEN avg_review_score * review_count ELSE 0 END) / 
    NULLIF(SUM(CASE WHEN is_late = false THEN review_count ELSE 0 END), 0) as onTime_score,
  -- Weighted average for late deliveries
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
```

Also simplified the frontend component to use the pre-aggregated data directly.

### **Result - Top 10 Categories: On-Time vs Late Review Scores**

| Category | On-Time Score | Late Score | Difference | Total Reviews |
|----------|---------------|------------|------------|---------------|
| **cama_mesa_banho** (bed/bath/table) | 4.10 | 2.49 | **-1.61** | 9,424 |
| **beleza_saude** (health/beauty) | 4.33 | 2.67 | **-1.66** | 8,825 |
| **esporte_lazer** (sports/leisure) | 4.30 | 2.49 | **-1.81** | 7,718 |
| **informatica_acessorios** (computers) | 4.14 | 2.56 | **-1.58** | 6,695 |
| **moveis_decoracao** (furniture) | 4.13 | 2.57 | **-1.56** | 6,453 |
| **utilidades_domesticas** (housewares) | 4.24 | 2.71 | **-1.53** | 5,865 |
| **relogios_presentes** (watches/gifts) | 4.21 | 2.42 | **-1.79** | 5,584 |
| **telefonia** (telecom) | 4.12 | 2.69 | **-1.43** | 4,169 |
| **automotivo** (automotive) | 4.23 | 2.56 | **-1.67** | 3,890 |
| **brinquedos** (toys) | 4.33 | 2.43 | **-1.90** | 3,847 |

**Key Insights:**
- ✅ **Massive impact of late delivery on reviews**: 1.4-1.9 point drop (out of 5)
- ✅ On-time deliveries consistently get **4.1-4.3 stars** (good)
- ✅ Late deliveries consistently get **2.4-2.7 stars** (poor)
- ✅ Biggest impact on **toys** (-1.90 points) and **sports/leisure** (-1.81 points)
- ✅ Smallest impact on **telecom** (-1.43 points)

---

## 📊 Chart Output Comparison

### Fix 1: Delivery Performance Chart

**Before:**
```
X-axis: SP, SP, SP, SP, SP, SP, SP, SP, SP, SP
(All sellers from São Paulo)
```

**After:**
```
X-axis: SP, MG, PR, RJ, SC, RS, DF, BA, GO, PE
(10 different Brazilian states)
```

### Fix 2: Review Score Chart

**Before:**
```
All bars ~5.0 (uniform height)
No visible difference between on-time and late
```

**After:**
```
On-Time bars: 4.1-4.3 (green, tall)
Late bars:    2.4-2.7 (orange, short)
Clear visual difference showing impact of late delivery
```

---

## 🔧 Technical Changes

### Files Modified

1. **`dashboard-api/routes.js`**
   - Updated `/api/delivery/performance` endpoint with `GROUP BY seller_state`
   - Updated `/api/reviews/analysis` endpoint with weighted average calculation

2. **`dashboard-ui/src/components/charts/ReviewScoreChart.jsx`**
   - Simplified data transformation (API now pre-aggregates)
   - Removed client-side Map-based aggregation logic

### No Changes Needed

- ❌ `mart_delivery_performance.sql` - dbt model is correct (per-seller granularity is intentional)
- ❌ `mart_review_analysis.sql` - dbt model is correct (granular data allows multiple analyses)

**Why?** The dbt models are designed to be **granular** (detailed) to support multiple use cases. The API layer is responsible for aggregating the data appropriately for each specific visualization.

---

## ✅ Verification

Both endpoints tested and verified:

```bash
# Test delivery performance
curl http://localhost:3001/api/delivery/performance

# Test review analysis
curl http://localhost:3001/api/reviews/analysis
```

**Status:** ✅ All charts now display correct, aggregated data

---

## 📈 Business Impact

### Delivery Performance Insights
- São Paulo dominates e-commerce (69K orders)
- Late delivery rates vary 2x between states (4.66% to 10.44%)
- Delivery times vary significantly by geography (11.7 to 16 days)

### Review Score Insights
- **Late delivery destroys customer satisfaction**
- Average drop: **1.65 points** (39% decrease)
- This translates to:
  - On-time: Happy customers (4+ stars)
  - Late: Unhappy customers (2-3 stars)

**Recommendation:** Prioritize delivery speed optimization to improve review scores and customer retention.

---

**Last Updated:** 2026-09-11  
**Status:** 🟢 All fixes deployed and tested
