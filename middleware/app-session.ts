import * as Koa from 'koa';
import * as session from 'koa-session';

import { redis } from '@/utils/redis';

const store: session.stores = {
  /**
   * get session object by key
   */
  async get(key: string) {
    const sess = await redis.get(key);
    return JSON.parse(sess);
  },

  /**
   * set session object for key, with a maxAge (in ms)
   */
  async set(key: string, sess: any, maxAge: number) {
    await redis.set(key, JSON.stringify(sess), 'PX', maxAge);
  },

  /**
   * destroy session for key
   */
  async destroy(key: string) {
    await redis.del(key);
  },
};

const CONFIG = {
  key: 'j:sess' /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 1000 * 60 * 60 * 2,
  autoCommit: true /** (boolean) automatically commit headers (default true) */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: false,
  renew: false,
  store,
};

export default (koaInstance: Koa) => {
  koaInstance.keys = [CONFIG.key];
  return session(CONFIG, koaInstance);
};
