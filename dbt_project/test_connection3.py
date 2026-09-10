#!/usr/bin/env python3
import psycopg2
import sys

try:
    print("Testing with NEW user dbt_user / dbt123")
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        user="dbt_user",
        password="dbt123",
        database="olist",
        connect_timeout=10
    )
    print("✅ Connection successful with dbt_user!")
    cursor = conn.cursor()
    cursor.execute("SELECT current_user, current_database();")
    result = cursor.fetchone()
    print(f"Connected as: {result[0]} to database: {result[1]}")
    cursor.close()
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"❌ Failed: {e}")
    sys.exit(1)
