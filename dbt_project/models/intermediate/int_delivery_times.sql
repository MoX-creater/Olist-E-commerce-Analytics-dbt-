with orders as (
    select * from {{ ref('stg_orders') }}
),

final as (
    select
        order_id,
        order_status,
        order_purchase_timestamp,
        order_delivered_customer_date,
        order_estimated_delivery_date,
        
        -- Calculate delivery time in days
        case 
            when order_delivered_customer_date is not null 
            then extract(epoch from (order_delivered_customer_date - order_purchase_timestamp)) / 86400.0
            else null
        end as delivery_days,
        
        -- Calculate difference between actual and estimated delivery
        case 
            when order_delivered_customer_date is not null 
                and order_estimated_delivery_date is not null
            then extract(epoch from (order_delivered_customer_date - order_estimated_delivery_date)) / 86400.0
            else null
        end as estimated_vs_actual_delta,
        
        -- Flag for late deliveries
        case 
            when order_delivered_customer_date is not null 
                and order_estimated_delivery_date is not null
                and order_delivered_customer_date > order_estimated_delivery_date
            then true
            else false
        end as is_late
        
    from orders
)

select * from final
