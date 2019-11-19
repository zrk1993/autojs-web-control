/**
 * @Author: kun
 * @Date: 2019-10
 */

import * as Redis from 'ioredis';
import getLogger from './log4js';

const logger = getLogger('redis.ts');

export const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  db: 1,
  retryStrategy: times => Math.min(times * 500, 2000),
});

redis.on('ready', () => {
  logger.info('redis connection is established');
});

redis.on('error', (error: Error) => {
  logger.error('redis error: ', error.message);
});
