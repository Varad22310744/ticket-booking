import Redis from 'ioredis';
const redisUrl = process.env.REDIS_URL;
export const redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: null
});
redisClient.on('connect', () => console.log('Redis connected'));
redisClient.on('error', (err) => console.error('Redis error:', err));
//# sourceMappingURL=redis.js.map