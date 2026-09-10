with order_items_enriched as (
    select * from {{ ref('int_order_items_enriched') }}
),

final as (
    select
        order_id,
        order_item_id,
        product_id,
        seller_id,
        shipping_limit_date,
        price,
        freight_value,
        price + freight_value as total_item_value,
        
        -- Product attributes
        product_category_name,
        product_weight_g,
        product_volume_cm3,
        
        -- Seller attributes
        seller_city,
        seller_state
        
    from (
        select
            *,
            (product_length_cm * product_height_cm * product_width_cm) as product_volume_cm3
        from order_items_enriched
    ) enriched
)

select * from final
