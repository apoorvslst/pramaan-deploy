/**
 * Redis Client Configuration (Optional / Fallback Support)
 * PRAMAN uses Redis for BullMQ async background verification queues.
 * If Redis is offline, the system falls back gracefully to in-process async processing.
 */
let redisClient = null;

export const getRedisClient = async () => {
  if (redisClient) return redisClient;

  try {
    const { default: Redis } = await import('ioredis');
    const client = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // Do not infinite retry if offline
      lazyConnect: true,
    });

    await client.connect();
    console.log('\x1b[32m[Redis Connected]\x1b[0m Redis is ready for BullMQ queues.');
    redisClient = client;
    return redisClient;
  } catch (err) {
    console.warn('\x1b[33m[Redis Offline]\x1b[0m Redis server not detected. Verification will execute via in-process async pipeline.');
    return null;
  }
};

export default getRedisClient;
