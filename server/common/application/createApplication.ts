/**
 * @Author: kun
 * @Date: 2019-3
 */

import * as Path from 'path';
import * as Bodyparser from 'koa-bodyparser';
import * as koaStatic from 'koa-static';
import * as helmet from 'koa-helmet';
import * as mount from 'koa-mount';
import cors = require('@koa/cors');
import { logger as voidLogger } from './utils/logger';
import { Application } from './application';
import { useSwaggerApi } from './middlewares/swagger-doc';
import { ILogger } from './interfaces';

export interface ApplicationOptions {
  logger?: ILogger;
  staticAssets?: { root: string; prefix?: string } | object;
  swagger?: { url: string; prefix?: string } | boolean;
  bodyparser?: Bodyparser.Options | boolean;
  helmet?: object | boolean;
  cors?: object | boolean;
}

export async function createApplication(
  root: string,
  globsOrControllers: any[],
  options: ApplicationOptions = {},
): Promise<Application> {
  const logger = options.logger || voidLogger;

  logger.info('application starting ...');

  const routers = globsOrControllers;

  logger.info('find %d routes', routers.length);

  const app = new Application(routers, { logger });

  if (options.helmet !== false) {
    logger.info('应用全局中间件 %s', 'koa-helmet');
    app.use(helmet());
  }

  if (options.cors !== false) {
    logger.info('应用全局中间件 %s', 'koa-cors');
    const corsOptions = { credentials: true };
    app.use(cors(Object.assign(corsOptions, options.cors)));
  }

  const staticAssetsOptions = Object.assign(
    {
      root: Path.join(root, '..', 'public'),
      prefix: '/public',
      maxage: 86400000,
    },
    options.staticAssets,
  );
  logger.info('站点资源目录public');
  app.use(mount(staticAssetsOptions.prefix, koaStatic(staticAssetsOptions.root, staticAssetsOptions as any)));

  if (options.bodyparser !== false) {
    const bodyparserOptions = Object.assign(
      {
        enableTypes: ['json', 'form'],
        textLimit: '1mb',
        jsonLimit: '1mb',
      },
      options.bodyparser,
    );
    logger.info('应用全局中间件 %s', 'koa-bodyparser');
    app.use(Bodyparser(bodyparserOptions));
  }

  if (options.swagger !== false) {
    const swaggerOptions = Object.assign(
      {
        url: '/swagger-api/doc',
        prefix: '/swagger-ui',
      },
      options.swagger,
    );
    logger.info('应用swagger接口文档 访问路劲：%s%s', swaggerOptions.prefix, '/index.html');
    useSwaggerApi(app, swaggerOptions);
  }

  return app;
}
