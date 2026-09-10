# Olist Data Ingestion

This directory contains the Node.js script for loading CSV data from the `/data` folder into Postgres.

## Prerequisites

- Docker and Docker Compose installed
- Postgres container running (via `docker-compose up` in the `/docker` directory)

## Running the Ingestion

The ingestion script runs inside a Docker container to avoid Windows/WSL2 networking issues with SCRAM-SHA-256 authentication.

### One-time ingestion (recommended):

```bash
cd docker
docker-compose run --rm ingestion
```

This command will:
- Start the Postgres container if not already running
- Wait for Postgres to be healthy
- Run the ingestion script once
- Automatically remove the container after completion (`--rm` flag)

### Re-run ingestion (to reload data):

```bash
cd docker
docker-compose run --rm ingestion
```

The script will drop and recreate tables, so you can run it multiple times safely.

## Configuration

Environment variables are set in `/docker/.env`:
- `POSTGRES_USER=olist`
- `POSTGRES_PASSWORD=olist_pass`
- `POSTGRES_DB=olist`

The ingestion service automatically connects to the `postgres` service using these credentials.

## Data Location

CSV files are mounted from `../data` (read-only) into the container at `/app/data`.

## Tables Created

All tables are created in the `raw` schema:
- `raw.olist_customers_dataset`
- `raw.olist_geolocation_dataset`
- `raw.olist_order_items_dataset`
- `raw.olist_order_payments_dataset`
- `raw.olist_order_reviews_dataset`
- `raw.olist_orders_dataset`
- `raw.olist_products_dataset`
- `raw.olist_sellers_dataset`
- `raw.product_category_name_translation`

## Troubleshooting

If you need to rebuild the image after code changes:

```bash
cd docker
docker-compose build ingestion
docker-compose run --rm ingestion
```
