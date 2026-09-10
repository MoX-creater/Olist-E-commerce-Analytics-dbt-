#!/usr/bin/env python3
import socket
import sys

try:
    print("Testing TCP socket connection to 127.0.0.1:5432...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(5)
    result = sock.connect_ex(('127.0.0.1', 5432))
    
    if result == 0:
        print("✅ TCP socket connection successful!")
        
        # Try to read the Postgres startup message
        data = sock.recv(1024)
        print(f"Received {len(data)} bytes from server")
        print(f"Data (hex): {data[:20].hex()}")
        
        sock.close()
        sys.exit(0)
    else:
        print(f"❌ TCP socket connection failed with error code: {result}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Socket error: {e}")
    sys.exit(1)
