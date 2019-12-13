import * as querystring from 'querystring';
import * as http from 'http';
import getLogger from '@/utils/log4js';
import DeviceModel from '@/model/device.model';
import { WebSocketManager, WebSocketExt } from './WebSocketManager';
import moment = require('moment');

const logger = getLogger('DeviceManager');

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
      const ip = (req.connection.remoteAddress || (req.headers['x-forwarded-for'] as any || '').split(/\s*,\s*/)[0]).replace(/[^0-9\.]/ig, '');

      let device = await DeviceModel.getByIp(ip);
      if (!device) {
        await DeviceModel.insert({ name: ip, ip, create_time: moment().format('YYYY-MM-DD HH:mm:ss') });
      }

      device = await DeviceModel.getByIp(ip);
      await DeviceModel.updateById(device.device_id, { connect_time: moment().format('YYYY-MM-DD HH:mm:ss') });

      return { type: 'device', extData: device };
    });

    WebSocketManager.getInstance().addClientStatusChangeListener((client, status) => {
      if (status === 'open' && client.type === 'device') {
        WebSocketManager.getInstance().sendMessage(client, { type: 'hello', data: { server_version: 2 } });
      }
    });

    WebSocketManager.getInstance().addClientMessageListener((client, data) => {
      if (client.type === 'device') {
        const message = JSON.parse(data as string);
        if (message.type === 'hello') {
          // client.extData.device_name = message.data.device_name;
        }
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

  public disconnectDeviceByIp(ip: string) {
    WebSocketManager.getInstance().getClients().forEach((c) => {
      if (c.type === 'device' && c.ip === ip) {
        c.terminate();
      }
    });
  }
}
