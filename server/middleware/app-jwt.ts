import * as jwt from 'jsonwebtoken';
import * as Koa from 'koa';
import * as moment from 'moment';
import unless = require('koa-unless');
// import { redis } from '../utils/redis';
import { ResultUtils } from '@/utils/result-utils';

export const secret = 'hahahahahah' + moment().format('YYYYMMDD');

export const sign = (data: any): string => {
  const token = jwt.sign(data, secret, { expiresIn: '6h' });
  return token;
};

const JWTTokenError = {
  TokenExpiredError: '登录过期,请重新登录！',
  JsonWebTokenError: '权限验证失败，请重新登录！',
  NotBeforeError: 'jwt not active！',
};

export const verify = (ctx: Koa.Context): Promise<string | any> => {
  const token = ctx.query.token || ctx.header.authorization || ctx.cookies.get('authorization');
  return verifyToken(token);
};

export async function verifyToken(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (error: Error, decoded: any) => {
      if (error) {
        error.message = JWTTokenError[error.name];
        error.name = 'JWTTokenError';
        reject(error);
      } else {
        resolve(decoded);
      }
    });
  });
}

export const middleware: any = async (ctx: Koa.Context, next: () => void) => {
  try {
    const data = await verify(ctx);
    // const sess = (await redis.get(token)) || '{}';
    // ctx.session = JSON.parse(sess);
    await next();
    // await redis.set(token, JSON.stringify(ctx.session), 'PX', 1000 * 60 * 60 * 2);
  } catch (error) {
    ctx.body = ResultUtils.forbidden(error.meaasge);
  }
};

export const appJwt = () => {
  middleware.unless = unless;
  return middleware.unless({ method: 'OPTIONS', path: [/^\/static/, /^\/user\/login/] });
};
