with reviews as (
    select * from {{ ref('stg_order_reviews') }}
),

orders as (
    select * from {{ ref('fct_orders') }}
),

order_items as (
    select * from {{ ref('fct_order_items') }}
),

review_metrics as (
    select
        -- By product category
        oi.product_category_name,
        
        -- By delivery performance
        o.is_late,
        
        -- By payment type
        o.primary_payment_type,
        
        -- Review metrics
        count(r.review_id) as review_count,
        avg(r.review_score) as avg_review_score,
        
        -- Score distribution
        count(case when r.review_score = 5 then 1 end) as score_5_count,
        count(case when r.review_score = 4 then 1 end) as score_4_count,
        count(case when r.review_score = 3 then 1 end) as score_3_count,
        count(case when r.review_score = 2 then 1 end) as score_2_count,
        count(case when r.review_score = 1 then 1 end) as score_1_count,
        
        -- Percentage with comments
        count(case when r.review_comment_message is not null then 1 end)::numeric / count(*)::numeric * 100 as pct_with_comments
        
    from reviews r
    inner join orders o on r.order_id = o.order_id
    left join (
        select distinct order_id, product_category_name
        from order_items
    ) oi on r.order_id = oi.order_id
    group by 1, 2, 3
)

select * from review_metrics
where review_count >= 10  -- Filter for statistical significance
order by avg_review_score desc
