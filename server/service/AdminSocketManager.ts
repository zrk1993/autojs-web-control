import * as querystring from 'querystring';
import * as http from 'http';
import getLogger from '@/utils/log4js';
import { verifyToken } from '@/middleware/app-jwt';
import { WebSocketManager, WebSocketExt } from './WebSocketManager';

const logger = getLogger('WebSocketManager');

export class AdminSocketManager {
  static instance: AdminSocketManager;

  public static getInstance() {
    if (!AdminSocketManager.instance) {
      logger.info('AdminSocketManager Not initialized!');
    }
    return AdminSocketManager.instance;
  }

  public static init() {
    if (!AdminSocketManager.instance) {
      AdminSocketManager.instance = new AdminSocketManager();
    }

    WebSocketManager.getInstance().addClientRequestListeners(async (req) => {
      const params = querystring.parse(req.url.replace('/?', ''));
      try {
        const data = await verifyToken(params.token as string);
        return { type: 'admin', extData: data };
      } catch (error) {
        return { type: null };
      }
    });

    WebSocketManager.getInstance().addDeviceLogListener((client, data) => {
      console.log(client.extData.device_name + data.data.log);
      data.data.device = client.extData;
      WebSocketManager.getInstance().getClients().forEach((c) => {
        if (c.type === 'admin') {
          WebSocketManager.getInstance().sendMessage(c, data);
        }
      });
    });

    WebSocketManager.getInstance().addClientStatusChangeListener((client, status) => {
      if (client.type === 'device') {
        WebSocketManager.getInstance().getClients().forEach((c) => {
          if (c.type === 'admin') {
            logger.info('WebSocket.Client device_change ip -> ' + client.ip + ' status -> ' + status);
            WebSocketManager.getInstance().sendMessage(c, { type: 'device_change', data: { status } });
          }
        });
      }
    });
  }
}
