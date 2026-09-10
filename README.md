# 🛒 Olist E-commerce Analytics Pipeline

An end-to-end data engineering portfolio project that transforms raw [Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) e-commerce data into analytics-ready models using **dbt**, **Postgres**, and **Metabase**.

---

## Architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Olist CSVs  │─────▶│   Node.js    │─────▶│   Postgres   │─────▶│   Metabase   │
│  (Kaggle)    │      │  Ingestion   │      │  + dbt       │      │  Dashboards  │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                       load_raw.js           raw → staging          BI layer
                                             → intermediate         localhost:3000
                                             → marts
```

## Project Structure

```
├── data/                    # Raw Olist CSV files (gitignored)
├── docker/
│   └── docker-compose.yml   # Postgres 15 + Metabase
├── ingestion/
│   ├── .env.example         # DB connection template
│   ├── load_raw.js          # CSV → Postgres raw schema
│   └── package.json
├── dbt_project/
│   ├── dbt_project.yml
│   ├── profiles.yml
│   ├── packages.yml
│   └── models/
│       ├── staging/         # 1:1 with raw sources, renamed/retyped
│       ├── intermediate/    # Business logic joins
│       └── marts/           # Final fact & dimension tables
├── .gitignore
└── README.md
```

## dbt Model Layers

| Layer          | Materialization | Schema        | Purpose                                 |
|----------------|-----------------|---------------|-----------------------------------------|
| **Staging**    | View            | `staging`     | Light cleaning, renaming, type casting  |
| **Intermediate** | Ephemeral    | —             | Business logic, joins, aggregations     |
| **Marts**      | Table           | `marts`       | Final analytics tables for Metabase     |

---

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js (v16+)
- dbt-core + dbt-postgres (`pip install dbt-postgres`)

### 1. Start Infrastructure

```bash
cd docker
docker compose up -d
```

This starts:
- **Postgres 15** on `localhost:5432` (user: `olist`, password: `olist_pass`, db: `olist`)
- **Metabase** on `localhost:3000`

### 2. Download Data

Download the [Brazilian E-Commerce dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) from Kaggle and extract the CSV files into a `/data` folder at the project root.

### 3. Ingest Raw Data

```bash
cd ingestion
cp .env.example .env          # adjust if needed
npm install
node load_raw.js
```

This creates a `raw` schema in Postgres and loads each CSV as a separate table.

### 4. Run dbt

```bash
cd dbt_project
dbt deps                      # install dbt packages
dbt debug --profiles-dir .    # verify connection
dbt run --profiles-dir .      # build models
dbt test --profiles-dir .     # run tests
```

### 5. Explore in Metabase

Open [http://localhost:3000](http://localhost:3000), connect to the Postgres database, and start building dashboards on the `marts` schema.

---

## Environment Variables

| Variable     | Default       | Description          |
|--------------|---------------|----------------------|
| `PGHOST`     | `localhost`   | Postgres host        |
| `PGPORT`     | `5432`        | Postgres port        |
| `PGUSER`     | `olist`       | Postgres user        |
| `PGPASSWORD` | `olist_pass`  | Postgres password    |
| `PGDATABASE` | `olist`       | Postgres database    |

---

## Roadmap

- [ ] Build staging models (one per source table)
- [ ] Add intermediate models (orders enriched with payments, reviews)
- [ ] Create mart models (fct_orders, dim_customers, dim_products)
- [ ] Add dbt tests & documentation
- [ ] Build Metabase dashboards
- [ ] Add CI with GitHub Actions

---

## Dataset

This project uses the [Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce), which contains ~100k orders from 2016–2018 across multiple marketplaces in Brazil.

## License

MIT
