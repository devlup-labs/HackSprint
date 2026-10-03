// Thin Redis wrapper that fails open: if Redis is down, reads miss and writes
// are dropped, so a cache outage only makes requests slower, never broken.
export class CacheService {
  constructor(redisClient, logger) {
    this.redisClient = redisClient;
    this.logger = logger;
  }

  get ready() {
    return !!this.redisClient?.isReady;
  }

  async get(key) {
    if (!this.ready) return null;
    try {
      const value = await this.redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      this.logger.warn({ err, key }, "Cache read failed");
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.ready) return;
    try {
      await this.redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      this.logger.warn({ err, key }, "Cache write failed");
    }
  }

  async del(...keys) {
    if (!this.ready || !keys.length) return;
    try {
      await this.redisClient.del(keys);
    } catch (err) {
      this.logger.warn({ err, keys }, "Cache delete failed");
    }
  }

  // Read-through: cached value if present, otherwise load, store and return.
  async remember(key, ttlSeconds, loader) {
    const cached = await this.get(key);
    if (cached !== null) return cached;
    const fresh = await loader();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}
