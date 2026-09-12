-- Cleanup Script for Neon Database
-- Removes orphaned types and recreates clean raw schema
-- 
-- Usage with psql:
-- psql "postgresql://neondb_owner:npg_peviKDRTAP86@ep-cool-morning-axr0aa1n-pooler.c-4.us-east-2.aws.neon.tech:5432/neondb?sslmode=require" -f cleanup_neon_schema.sql

-- Step 1: Drop entire raw schema with CASCADE
-- This removes all tables, views, and dependent objects
DROP SCHEMA IF EXISTS raw CASCADE;

-- Step 2: Recreate clean raw schema
CREATE SCHEMA raw;

-- Step 3: Verify no orphaned types remain
-- Should return 0 rows after cleanup
SELECT typname, typnamespace 
FROM pg_type 
WHERE typname LIKE 'olist%'
ORDER BY typname;

-- Step 4: Show current schemas
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name NOT LIKE 'pg_%' 
  AND schema_name != 'information_schema'
ORDER BY schema_name;

-- Expected output after this script:
-- DROP SCHEMA
-- CREATE SCHEMA
--  typname | typnamespace 
-- ---------+--------------
-- (0 rows)
-- 
--  schema_name 
-- --------------
--  public
--  raw
-- (2 rows if staging/marts don't exist yet)
