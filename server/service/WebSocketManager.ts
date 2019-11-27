import { EventEmitter } from 'events';
import * as http from 'http';
import * as WebSocket from 'ws';
import * as querystring from 'querystring';
import getLogger from '@/utils/log4js';
import DeviceModel from '@/model/device.model';

import { verifyToken } from '@/middleware/app-jwt';

const logger = getLogger('WebSocketManager');

export type IClientMessageListener = (client: WebSocketExt, data: WebSocket.Data) => void;
export type IClientStatusChangeListener = (client: WebSocketExt, status: 'connection' | 'close' | 'error') => void;
export type IDeviceLogListener = (client: WebSocketExt, log: any) => void;
export interface WebSocketExt extends WebSocket {
  isAlive: boolean;
  ip: string;
  type: 'device' | 'admin';
  device?: any;
  admin?: any;
}

const clientMessageListeners: IClientMessageListener[] = [];
const clientStatusChangeListeners: IClientStatusChangeListener[] = [];
const deviceLogListeners: IClientStatusChangeListener[] = [];
const messageAnswer = new Map<object, any>();

export default class WebSocketManager extends EventEmitter {

  static instance: WebSocketManager;

  private wss: WebSocket.Server;
  private pingTimeout: NodeJS.Timeout;

  public static init(server: http.Server) {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager(server);
    }
    WebSocketManager.instance.ping();
    return WebSocketManager.instance;
  }

  public static getInstance() {
    if (!WebSocketManager.instance) {
      logger.info('WebSocketManager Not initialized!');
    }
    return WebSocketManager.instance;
  }

  private constructor(server: http.Server) {
    super();
    this.wss = new WebSocket.Server({ server });
    this.setListeners();
  }

  private setListeners() {
    this.wss.addListener('connection', this.onWebSocketConnection.bind(this));

    this.wss.addListener('error', (err: Error) => {
      logger.error('WebSocket.Server error -> ' + err.message);
    });
  }

  private ping() {
    if(!this.pingTimeout) {
      this.pingTimeout = setInterval(() => {
        this.wss.clients.forEach((ws: WebSocketExt) => {
          if (ws.isAlive === false) return ws.terminate();
          ws.isAlive = false;
          ws.ping(() => {});
        });
      }, 3000);
    }
  }

  private async onWebSocketConnection(client: WebSocketExt, req: http.IncomingMessage) {
    const params = querystring.parse(req.url.replace('/?', ''));

    if (params.device_name && params.connect_code) {
      const device = await DeviceModel.getByDeviceName(params.device_name as string);
      if (!device || device.connect_code != params.connect_code) {
        client.terminate();
        return;
      } else {
        client.type = 'device';
        client.device = device;
      }
    } else if (params.token) {
      try {
        const data = await verifyToken(params.token as string);
        client.type = 'admin';
        client.admin = data;
      } catch (error) {
        client.terminate();
        return;
      }
    } else {
      // client.terminate();
      // return;
      client.type = 'device';
      client.device = { device_name: '未知设备' };
    }

    client.ip = req.connection.remoteAddress || (req.headers['x-forwarded-for'] as any || '').split(/\s*,\s*/)[0];
    logger.info('WebSocket.Server connection client ip -> ' + client.ip);

    clientStatusChangeListeners.forEach((listener) => {
      listener(client, 'connection');
    });

    client.addListener('close', (code: number, message: string) => {
      logger.info('WebSocket.Client close ip -> ' + client.ip + ' code -> ' + code + ' message-> ' + message);

      clientStatusChangeListeners.forEach((listener) => {
        listener(client, 'close');
      });
    });

    client.addListener('error', (err: Error) => {
      logger.info('WebSocket.Client error ip -> ' + client.ip + ' message-> ' + err.message);

      clientStatusChangeListeners.forEach((listener) => {
        listener(client, 'error');
      });
    });

    client.addListener('message', (data: WebSocket.Data) => {
      const message = JSON.parse(data as string);
      if (message.type === 'respond') {
        const answer = messageAnswer.get(message.message_id);
        answer && answer(null, message);
      } else if (message.type === 'log') {
        deviceLogListeners.forEach((listener) => {
          listener(client, message);
        });
      } else {
        clientMessageListeners.forEach((listener) => {
          listener(client, data);
        });
      }
    });

    client.isAlive = true;
    client.addEventListener('pong', () => {
      client.isAlive = true;
    });
  }

  public addDeviceLogListener(listener: IDeviceLogListener) {
    deviceLogListeners.push(listener);
  }

  public addClientMessageListener(listener: IClientMessageListener) {
    clientMessageListeners.push(listener);
  }

  public addClientStatusChangeListener(listener: IClientStatusChangeListener) {
    clientStatusChangeListeners.push(listener);
  }

  public sendMessage(client: WebSocket, message: any, cb?: (err: Error, data?: any) => {}) {
    message.message_id = `${Date.now()}_${Math.random()}`;
    client.send(JSON.stringify(message), (err: Error) => {
      if (err) {
        logger.error(`send message appear error, message -> ${err.message}`);
        cb(err);
      } else {
        messageAnswer.set(message.message_id, cb);
      }
    });
  }

  public broadcast(message: object) {
    for(const ws of this.wss.clients.values()) {
      this.sendMessage(ws, message);
    }
  }

  public sendMessageToClients(clients: WebSocket[], message: object) {
    clients.forEach((client) => {
      this.sendMessage(client, message);
    });
  }

  public getClients() {
    return this.wss.clients as Set<WebSocketExt>;
  }
}