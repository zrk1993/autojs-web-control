import * as Koa from 'koa';
import { PARAM_VALIDATIONE_RROR } from '@/common/application';
import getLogger from '@/utils/log4js';
import { ResultUtils } from '@/utils/result-utils';

const logger = getLogger('error-handle.ts');

export default () => {
  return async (ctx: Koa.Context, next: () => void) => {
    try {
      await next();
    } catch (error) {
      if (error.name === PARAM_VALIDATIONE_RROR) {
        return (ctx.body = ResultUtils.badRequest(error.message));
      }

      if (error.name === 'TokenExpiredError') {
        return (ctx.body = ResultUtils.forbidden('登陆过期，请重新登陆！'));
      }

      ctx.body = ResultUtils.internalServerError(error.message);
      logger.error('server error：', error);
    }
  };
};
