with order_items as (
    select * from {{ ref('fct_order_items') }}
),

orders as (
    select * from {{ ref('fct_orders') }}
),

seller_performance as (
    select
        oi.seller_id,
        oi.seller_state,
        oi.seller_city,
        
        count(distinct o.order_id) as total_orders,
        count(distinct case when o.is_late then o.order_id end) as late_orders,
        
        -- Percentage of late deliveries
        case 
            when count(distinct o.order_id) > 0 
            then (count(distinct case when o.is_late then o.order_id end)::numeric / count(distinct o.order_id)::numeric) * 100
            else 0 
        end as pct_late_deliveries,
        
        -- Average delivery time
        avg(o.delivery_days) as avg_delivery_days,
        
        -- Revenue metrics
        sum(oi.total_item_value) as total_revenue,
        count(oi.order_item_id) as total_items_sold
        
    from order_items oi
    inner join orders o on oi.order_id = o.order_id
    where o.order_status = 'delivered'
        and o.delivery_days is not null
    group by 1, 2, 3
)

select * from seller_performance
order by total_revenue desc
