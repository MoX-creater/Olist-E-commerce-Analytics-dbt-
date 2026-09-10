with source as (
    select * from {{ source('raw', 'olist_geolocation_dataset') }}
),

renamed as (
    select
        geolocation_zip_code_prefix::varchar as geolocation_zip_code_prefix,
        geolocation_lat::numeric(10,6) as geolocation_lat,
        geolocation_lng::numeric(10,6) as geolocation_lng,
        geolocation_city::varchar as geolocation_city,
        geolocation_state::varchar as geolocation_state
    from source
)

select * from renamed
