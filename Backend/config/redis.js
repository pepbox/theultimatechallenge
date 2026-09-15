const Redis = require('ioredis');
const { createAdapter } = require('@socket.io/redis-adapter');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const GAME_PREFIX = process.env.REDIS_KEY_PREFIX || 'ultimate-challenge';

const redisOptions = {
  lazyConnect: true,
  connectTimeout: 5000,
  retryStrategy: (times) => {
    if (times > 5) {
      console.error('❌ Redis max connection attempts reached');
      return null; // Stop retrying
    }
    return Math.min(times * 200, 2000);
  },
};

// General Redis client - presence tracking, caching, room monitoring
const redis = new Redis(REDIS_URL, redisOptions);

// Dedicated publish client for Socket.IO adapter
const pubClient = new Redis(REDIS_URL, redisOptions);

// Dedicated subscribe client for Socket.IO adapter
const subClient = new Redis(REDIS_URL, redisOptions);

redis.on('error', (err) => console.error('Redis (main) error:', err.message));
pubClient.on('error', (err) => console.error('Redis (pubClient) error:', err.message));
subClient.on('error', (err) => console.error('Redis (subClient) error:', err.message));

/**
 * Connect all three Redis clients before the server starts accepting connections.
 * Attach the Redis adapter to the Socket.IO server.
 */
async function connectRedis(io) {
  if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ No REDIS_URL specified in production. Running in single-instance memory mode.');
    return;
  }

  try {
    console.log(`🔌 Connecting to Redis at ${REDIS_URL.replace(/:[^:@]+@/, ':****@')}...`);
    await Promise.all([
      redis.connect().then(() => console.log('✅ Redis connected (main)')),
      pubClient.connect().then(() => console.log('✅ Redis connected (pubClient)')),
      subClient.connect().then(() => console.log('✅ Redis connected (subClient)')),
    ]);

    if (io) {
      io.adapter(createAdapter(pubClient, subClient, { key: `${GAME_PREFIX}:socket.io` }));
      console.log(`🚀 Socket.IO Redis Adapter attached successfully with prefix "${GAME_PREFIX}"`);
    }
  } catch (error) {
    console.warn(`⚠️ Redis connection failed (${error.message}). Continuing in single-instance memory mode.`);
  }
}

module.exports = {
  redis,
  pubClient,
  subClient,
  connectRedis,
  GAME_PREFIX
};
