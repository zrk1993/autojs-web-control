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

import WebSocketManager from '@/service/WebSocketManager';

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

  WebSocketManager.getInstance().addClientStatusChangeListener((client, status) => {
    if (status === 'connection') {
      WebSocketManager.getInstance().sendMessage(client, { type: 'hello', data: { server_version: 2 } });
    }
  });

  WebSocketManager.getInstance().addDeviceLogListener((client, data) => {
    console.log(client.device.device_name + data.data.log);
    data.data.device = client.device;
    WebSocketManager.getInstance().getClients().forEach((c) => {
      if (c.type === 'admin') {
        WebSocketManager.getInstance().sendMessage(c, data);
      }
    });
  });
}

main();
