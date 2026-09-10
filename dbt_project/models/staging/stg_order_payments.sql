with source as (
    select * from {{ source('raw', 'olist_order_payments_dataset') }}
),

renamed as (
    select
        order_id::varchar as order_id,
        payment_sequential::int as payment_sequential,
        payment_type::varchar as payment_type,
        payment_installments::int as payment_installments,
        payment_value::numeric(10,2) as payment_value
    from source
)

select * from renamed
