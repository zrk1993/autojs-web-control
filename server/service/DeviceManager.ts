import * as querystring from 'querystring';
import * as http from 'http';
import getLogger from '@/utils/log4js';
import DeviceModel from '@/model/device.model';
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
      if (params.token) {
        return { type: null };
      }
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

    WebSocketManager.getInstance().addClientStatusChangeListener((client, status) => {
      if (status === 'open') {
        WebSocketManager.getInstance().sendMessage(client, { type: 'hello', data: { server_version: 2 } });
      }
    });
  }

  public getOnlineDevices() {
    const deviceClients = [];
    WebSocketManager.getInstance().getClients().forEach((c) => {
      if (c.type === 'device') {
        deviceClients.push({
          ip: c.ip,
          device_name: c.extData.device_name,
        });
      }
    });
    return deviceClients;
  }
}
