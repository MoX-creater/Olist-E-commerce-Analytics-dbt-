# 🛒 Olist E-commerce Analytics Pipeline

An end-to-end data engineering portfolio project that transforms raw [Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) e-commerce data into analytics-ready models using **dbt**, **Postgres (Neon)**, and a custom **Node.js/React analytics dashboard**.

**Live dbt Documentation:** [https://olist-e-commerce-analytics-dbt.vercel.app](https://olist-e-commerce-analytics-dbt.vercel.app/)

---

## Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Olist CSVs  │─────▶│   Node.js    │─────▶│   Postgres   │─────▶│  Dashboard   │
│  (Kaggle)    │      │  Ingestion   │      │  (Neon) +dbt │      │  API + UI    │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                       load_raw.js           raw → staging          Express API +
                       (containerized)       → intermediate         React/Recharts
                                             → marts
```

dbt documentation and lineage graphs are generated on every push via GitHub Actions and deployed statically to Vercel (link above).

## Project Structure

```
├── data/                    # Raw Olist CSV files (gitignored)
├── docker/
│   └── docker-compose.yml   # Local Postgres, ingestion, dashboard-api services
├── ingestion/
│   ├── .env.example         # DB connection template
│   ├── load_raw.js          # CSV → Postgres raw schema
│   ├── Dockerfile
│   └── package.json
├── dbt_project/
│   ├── dbt_project.yml
│   ├── profiles.yml
│   ├── packages.yml
│   └── models/
│       ├── staging/         # 1:1 with raw sources, renamed/retyped
│       ├── intermediate/    # Business logic joins
│       └── marts/           # Final fact & dimension tables
├── dashboard-api/
│   ├── server.js            # Express server
│   ├── routes.js            # 5 analytics endpoints querying dbt marts
│   ├── db.js                # Postgres connection (Neon, SSL)
│   ├── Dockerfile
│   └── package.json
├── dashboard-ui/
│   ├── src/                 # React + Recharts dashboard
│   └── package.json
├── .github/workflows/
│   └── dbt-docs.yml         # CI: generates & deploys dbt docs to Vercel
├── .gitignore
└── README.md
```

## dbt Model Layers

| Layer            | Materialization | Schema (on Neon) | Purpose                                 |
|-------------------|-----------------|-------------------|------------------------------------------|
| **Staging**        | View            | `public_staging`  | Light cleaning, renaming, type casting  |
| **Intermediate**   | Ephemeral       | —                  | Business logic, joins, aggregations     |
| **Marts**          | Table           | `public_marts`     | Final fact/dimension tables + aggregates powering the dashboard |

> Schema names are prefixed with `public_` because dbt appends the custom schema onto the profile's base target schema (`public`) by default.

Key mart models: `fct_orders`, `fct_order_items`, `dim_customers`, `dim_products`, `dim_sellers`, `mart_monthly_revenue`, `mart_delivery_performance`, `mart_review_analysis`.

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js (v16+)
- dbt-core + dbt-postgres (recommended: install inside a Python venv — `pip install dbt-postgres`)
- A [Neon](https://neon.tech) Postgres project (free tier, no card required)

> **Note:** On some Windows setups, Node's `pg` client can fail to reach Neon directly (DNS/timeout issues) even though `dbt` connects fine from a Python venv. If you hit this, run ingestion and the dashboard API via Docker instead of directly with `node` — see below.

### 1. Set up Neon

Create a free project at [neon.tech](https://neon.tech) and copy your connection details (host, user, password, database). Neon requires SSL (`sslmode=require`) on all connections.

### 2. Download Data

Download the [Brazilian E-Commerce dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) from Kaggle and extract the CSV files into a `/data` folder at the project root.

### 3. Ingest Raw Data

```bash
cd docker
docker-compose run --rm \
  -e PGHOST=<your-neon-host> \
  -e PGSSLMODE=require \
  -e PGUSER=<your-neon-user> \
  -e PGPASSWORD=<your-neon-password> \
  -e PGDATABASE=<your-neon-db> \
  ingestion
```

This creates a `raw` schema in Postgres and loads each CSV as a separate table (using `DROP TABLE ... CASCADE` on re-runs, so dbt models get rebuilt automatically afterward).

### 4. Run dbt

```bash
cd dbt_project
export PGHOST=<your-neon-host>
export PGUSER=<your-neon-user>
export PGPASSWORD=<your-neon-password>
export PGDATABASE=<your-neon-db>
export PGSSLMODE=require

dbt deps
dbt debug
dbt run
dbt test
dbt docs generate   # optional locally; CI handles this on push to main
```

### 5. Run the Dashboard

**Backend** (via Docker, recommended on Windows):
```bash
cd docker
docker-compose up -d dashboard-api
```

**Frontend:**
```bash
cd dashboard-ui
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the dashboard: monthly revenue trend, order status breakdown, top product categories, delivery performance by state, and review scores by delivery status.

---

## Environment Variables

| Variable      | Description                          | Notes                          |
|----------------|----------------------------------------|----------------------------------|
| `PGHOST`       | Postgres host (Neon pooler endpoint)  | e.g. `ep-xxxx-pooler.region.aws.neon.tech` |
| `PGPORT`       | Postgres port                          | `5432`                          |
| `PGUSER`       | Postgres user                          | e.g. `neondb_owner`             |
| `PGPASSWORD`   | Postgres password                      | rotate if ever exposed in logs  |
| `PGDATABASE`   | Postgres database                      | e.g. `neondb`                   |
| `PGSSLMODE`    | SSL mode                               | must be `require` for Neon      |

Used consistently across `ingestion/`, `dashboard-api/`, and `dbt_project/profiles.yml`.

---

## Status

- [x] Ingestion pipeline (Node.js → Postgres raw schema, containerized)
- [x] Staging models (1:1 with raw sources)
- [x] Intermediate models (orders enriched with payments, delivery timing)
- [x] Mart models (fact/dimension tables + aggregates)
- [x] dbt tests (not_null, unique, relationships, accepted_values)
- [x] dbt docs + lineage graph, deployed via CI to Vercel
- [x] Migrated from local Postgres to hosted Neon
- [x] Custom analytics dashboard (Express API + React/Recharts) — replaces Metabase, which hit memory limits on free-tier hosting
- [ ] Deploy dashboard-api (Render) and dashboard-ui (Vercel) live
- [ ] Scheduled pipeline refresh (GitHub Actions cron for `dbt run`/`dbt test`)

---

## Why not Metabase?

The original plan used Metabase for the BI layer. Metabase requires 1GB+ RAM to run reliably, which exceeds what's available on card-free hosting tiers (Render, Koyeb — both cap free tiers at 512MB). Rather than requiring a credit card for a heavier host, the dashboard layer was rebuilt as a lightweight custom Express API + React/Recharts frontend, querying the same dbt mart tables directly.

## Dataset

This project uses the [Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce), which contains ~100k orders from 2016–2018 across multiple marketplaces in Brazil.

## License

MIT
