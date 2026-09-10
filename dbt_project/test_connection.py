#!/usr/bin/env python3
import psycopg2
import sys

try:
    print("Attempting to connect to Postgres...")
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        user="olist",
        password="olist_pass",
        database="olist",
        connect_timeout=10
    )
    print("✅ Connection successful!")
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()
    print(f"PostgreSQL version: {version[0]}")
    cursor.close()
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)
