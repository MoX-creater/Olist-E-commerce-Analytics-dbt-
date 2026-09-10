with orders as (
    select * from {{ ref('stg_orders') }}
),

payments as (
    select * from {{ ref('stg_order_payments') }}
),

aggregated_payments as (
    select
        order_id,
        sum(payment_value) as total_payment_value,
        -- Get primary payment type (the one with highest value)
        max(payment_type) as primary_payment_type,
        max(payment_installments) as max_installments,
        count(*) as payment_count
    from payments
    group by order_id
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
        coalesce(p.total_payment_value, 0) as total_payment_value,
        p.primary_payment_type,
        p.max_installments,
        coalesce(p.payment_count, 0) as payment_count
    from orders o
    left join aggregated_payments p on o.order_id = p.order_id
)

select * from final
