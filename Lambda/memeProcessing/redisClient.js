const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
  connectTimeout: 5000,
  maxRetriesPerRequest: 1
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = redis;