with source as (
    select * from {{ source('raw', 'olist_order_items_dataset') }}
),

renamed as (
    select
        order_id::varchar as order_id,
        order_item_id::int as order_item_id,
        product_id::varchar as product_id,
        seller_id::varchar as seller_id,
        shipping_limit_date::timestamp as shipping_limit_date,
        price::numeric(10,2) as price,
        freight_value::numeric(10,2) as freight_value
    from source
)

select * from renamed
