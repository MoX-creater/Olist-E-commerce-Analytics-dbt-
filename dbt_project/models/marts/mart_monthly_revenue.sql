with orders as (
    select * from {{ ref('fct_orders') }}
),

monthly_agg as (
    select
        order_year,
        order_month,
        date_trunc('month', order_purchase_timestamp)::date as month_start_date,
        
        count(distinct order_id) as order_count,
        sum(total_payment_value) as total_revenue,
        avg(total_payment_value) as avg_order_value,
        
        -- Payment type breakdown
        sum(case when primary_payment_type = 'credit_card' then total_payment_value else 0 end) as revenue_credit_card,
        sum(case when primary_payment_type = 'boleto' then total_payment_value else 0 end) as revenue_boleto,
        sum(case when primary_payment_type = 'voucher' then total_payment_value else 0 end) as revenue_voucher,
        sum(case when primary_payment_type = 'debit_card' then total_payment_value else 0 end) as revenue_debit_card,
        
        -- Order status breakdown
        count(case when order_status = 'delivered' then 1 end) as orders_delivered,
        count(case when order_status = 'canceled' then 1 end) as orders_canceled,
        count(case when order_status = 'unavailable' then 1 end) as orders_unavailable
        
    from orders
    where order_purchase_timestamp is not null
    group by 1, 2, 3
)

select * from monthly_agg
order by order_year desc, order_month desc
