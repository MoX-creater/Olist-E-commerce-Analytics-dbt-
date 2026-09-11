// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getCached(key) {
  const item = cache.get(key);
  
  if (!item) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  console.log(`✅ Cache HIT: ${key}`);
  return item.data;
}

export function setCached(key, data, ttl = CACHE_TTL) {
  const expiry = Date.now() + ttl;
  cache.set(key, { data, expiry });
  console.log(`📦 Cache SET: ${key} (expires in ${ttl}ms)`);
}

export function clearCache(key) {
  if (key) {
    cache.delete(key);
    console.log(`🗑️  Cache CLEAR: ${key}`);
  } else {
    cache.clear();
    console.log('🗑️  Cache CLEAR ALL');
  }
}

// Cleanup expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  let removed = 0;
  
  for (const [key, item] of cache.entries()) {
    if (now > item.expiry) {
      cache.delete(key);
      removed++;
    }
  }
  
  if (removed > 0) {
    console.log(`🧹 Cache cleanup: removed ${removed} expired entries`);
  }
}, 10 * 60 * 1000);
