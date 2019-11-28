import * as querystring from 'querystring';
import * as http from 'http';
import getLogger from '@/utils/log4js';
import DeviceModel from '@/model/device.model';
import { verifyToken } from '@/middleware/app-jwt';
import { WebSocketManager, WebSocketExt } from './WebSocketManager';

const logger = getLogger('WebSocketManager');

export class DeviceManager {
  static instance: DeviceManager;

  public static getInstance() {
    if (!DeviceManager.instance) {
      logger.info('DeviceManager Not initialized!');
    }
    return DeviceManager.instance;
  }

  public static init() {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager();
    }
    WebSocketManager.getInstance().addClientRequestListeners(async (req) => {
      const params = querystring.parse(req.url.replace('/?', ''));
      if (params.device_name && params.connect_code) {
        const device = await DeviceModel.getByDeviceName(params.device_name as string);
        if (!device || device.connect_code != params.connect_code) {
          return { type: null };
        } else {
          return { type: 'device', extData: device };
        }
      } else {
        return { type: 'device', extData: { device_name: '未知设备' } };
      }
    });
  }
}

// if (params.device_name && params.connect_code) {
//   const device = await DeviceModel.getByDeviceName(params.device_name as string);
//   if (!device || device.connect_code != params.connect_code) {
//     client.terminate();
//     return;
//   } else {
//     client.type = 'device';
//     client.device = device;
//   }
// } else if (params.token) {
//   try {
//     const data = await verifyToken(params.token as string);
//     client.type = 'admin';
//     client.admin = data;
//   } catch (error) {
//     client.terminate();
//     return;
//   }
// } else {
//   // client.terminate();
//   // return;
//   client.type = 'device';
//   client.device = { device_name: '未知设备' };
// }
