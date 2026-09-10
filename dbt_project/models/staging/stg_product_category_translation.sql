select
    col1::varchar as product_category_name,
    col2::varchar as product_category_name_english
from (
    select 
        *
    from {{ source('raw', 'product_category_name_translation') }}
) as source (col1, col2)
