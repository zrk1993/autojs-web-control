/**
 * @Author: kun
 * 2019-10-25
 */
require('module-alias/register');
import { createApplication } from '@/common/application';
import { NODE_ENV } from '@/utils/enums';
import getLogger from '@/utils/log4js';
import errorHandle from '@/middleware/error-handle';
import * as koaLogger from 'koa-logger';
import config from './config';
import * as router from './router';

import { WebSocketManager } from '@/service/WebSocketManager';
import { DeviceManager } from '@/service/DeviceManager';
import { AdminSocketManager } from '@/service/AdminSocketManager';
import { SchedulerManager } from '@/service/SchedulerManager';

async function main() {
  const app = await createApplication(__dirname, Object.keys(router).map(k => router[k]), {
    logger: getLogger('app'),
  });

  if (config.env === NODE_ENV.dev) {
    app.use(koaLogger());
  }

  app.use(errorHandle());

  app.listen(config.port);

  WebSocketManager.init(app.getHttpServer());
  DeviceManager.init();
  AdminSocketManager.init();
  await SchedulerManager.init();
}

main();
