#!/usr/bin/env python3
import psycopg2
import sys

try:
    print("Testing with password: testpass123")
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        user="olist",
        password="testpass123",
        database="olist",
        connect_timeout=10
    )
    print("✅ Connection successful with testpass123!")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"❌ Failed with testpass123: {e}")
    
try:
    print("\nTesting with password: olist_pass")
    conn = psycopg2.connect(
        host="127.0.0.1",
        port=5432,
        user="olist",
        password="olist_pass",
        database="olist",
        connect_timeout=10
    )
    print("✅ Connection successful with olist_pass!")
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"❌ Failed with olist_pass: {e}")
    sys.exit(1)
