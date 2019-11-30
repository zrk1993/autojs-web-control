import { EventEmitter } from 'events';
import * as http from 'http';
import * as WebSocket from 'ws';
import getLogger from '@/utils/log4js';

const logger = getLogger('WebSocketManager');

export type IClientRequestListener = (req: http.IncomingMessage) => Promise<{ type: string, extData?: any }>;
export type IClientMessageListener = (client: WebSocketExt, data: WebSocket.Data) => void;
export type IClientStatusChangeListener = (client: WebSocketExt, status: 'open' | 'close' | 'error') => void;
export type IDeviceLogListener = (client: WebSocketExt, log: any) => void;
export interface WebSocketExt extends WebSocket {
  isAlive: boolean;
  ip: string;
  type: 'device' | 'admin';
  extData?: any;
}

const clientRequestListeners: IClientRequestListener[] = [];
const clientMessageListeners: IClientMessageListener[] = [];
const clientStatusChangeListeners: IClientStatusChangeListener[] = [];
const deviceLogListeners: IClientStatusChangeListener[] = [];
const messageAnswer = new Map<object, any>();

export class WebSocketManager extends EventEmitter {

  static instance: WebSocketManager;

  private wss: WebSocket.Server;
  private httpServer: http.Server;
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
    this.httpServer = server;
    this.wss = new WebSocket.Server({ noServer: true });
    this.setListeners();
  }

  private setListeners() {
    this.httpServer.on('upgrade', (request, socket, head) => {
      this.authenticate(request, (authenticateInfo) => {
        if (authenticateInfo.type) {
          this.wss.handleUpgrade(request, socket, head, (ws: any) => {
            ws.type = authenticateInfo.type;
            ws.extData = authenticateInfo.extData;
            this.wss.emit('connection', ws, request);
          });
        }
      });
    });

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

  private async authenticate(req: http.IncomingMessage, cb: (d: { type: string, extData?: any }) => void) {
    let type = '';
    let extData = null;
    for(let i = 0; i < clientRequestListeners.length; i ++) {
      const r = await clientRequestListeners[i](req);
      type = r.type || type;
      extData = r.extData || extData;
    }
    cb({ type, extData });
  }

  private async onWebSocketConnection(client: WebSocketExt, req: http.IncomingMessage) {
    client.ip = req.connection.remoteAddress || (req.headers['x-forwarded-for'] as any || '').split(/\s*,\s*/)[0];
    client.ip = client.ip.replace(/[^0-9\.]/ig, '');
    logger.info('WebSocket.Server connection client ip -> ' + client.ip + ' url -> ' + req.url);

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

    logger.info('WebSocket.Client open ip -> ' + client.ip);
    clientStatusChangeListeners.forEach((listener) => {
      listener(client, 'open');
    });
  }

  public addDeviceLogListener(listener: IDeviceLogListener) {
    deviceLogListeners.push(listener);
  }

  public addClientRequestListeners(listener: IClientRequestListener) {
    clientRequestListeners.push(listener);
  }

  public addClientMessageListener(listener: IClientMessageListener) {
    clientMessageListeners.push(listener);
  }

  public addClientStatusChangeListener(listener: IClientStatusChangeListener) {
    clientStatusChangeListeners.push(listener);
  }

  public sendMessage(client: WebSocket, message: any, cb?: (err: Error, data?: any) => {}) {
    if (client.readyState === WebSocket.OPEN) {
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
