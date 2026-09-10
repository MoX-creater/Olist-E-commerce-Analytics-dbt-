with orders_with_payments as (
    select * from {{ ref('int_orders_with_payments') }}
),

delivery_times as (
    select * from {{ ref('int_delivery_times') }}
),

final as (
    select
        o.order_id,
        o.customer_id,
        o.order_status,
        o.order_purchase_timestamp,
        o.order_approved_at,
        o.order_delivered_carrier_date,
        o.order_delivered_customer_date,
        o.order_estimated_delivery_date,
        o.total_payment_value,
        o.primary_payment_type,
        o.max_installments,
        o.payment_count,
        
        -- Delivery metrics
        d.delivery_days,
        d.estimated_vs_actual_delta,
        d.is_late,
        
        -- Date dimensions
        date(o.order_purchase_timestamp) as order_date,
        extract(year from o.order_purchase_timestamp) as order_year,
        extract(month from o.order_purchase_timestamp) as order_month,
        extract(quarter from o.order_purchase_timestamp) as order_quarter,
        extract(dow from o.order_purchase_timestamp) as order_day_of_week
        
    from orders_with_payments o
    left join delivery_times d on o.order_id = d.order_id
)

select * from final
