import IORedis from 'ioredis';
import { env } from './env.js';

// maxRetriesPerRequest: null is required by BullMQ
export const redis = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });
redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (e) => console.error('Redis error:', e.message));