import { EventEmitter } from 'events';
import * as http from 'http';
import * as WebSocket from 'ws';
import getLogger from '@/utils/log4js';

const logger = getLogger('WebSocketManager');

type IClientMessageListener = (client: WebSocket, data: WebSocket.Data) => void;
type IClientStatusChangeListener = (client: WebSocket, status: 'connection' | 'close' | 'error') => void;
type IDeviceLogListener = (client: WebSocket, log: any) => void;

const ipToClient = new Map<string, WebSocket>();
const clientMessageListeners: IClientMessageListener[] = [];
const clientStatusChangeListeners: IClientStatusChangeListener[] = [];
const deviceLogListeners: IClientStatusChangeListener[] = [];
const messageAnswer = new Map<object, any>();

export default class WebSocketManager extends EventEmitter {

  static instance: WebSocketManager;

  private wss: WebSocket.Server;

  public static init(server: http.Server) {
    if (!WebSocketManager.instance) {
      return WebSocketManager.instance = new WebSocketManager(server);
    }
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

  private onWebSocketConnection(client: WebSocket, req: http.IncomingMessage) {
    const ip = req.connection.remoteAddress || (req.headers['x-forwarded-for'] as any).split(/\s*,\s*/)[0];
    logger.info('WebSocket.Server connection client ip -> ' + ip);
    ipToClient.set(ip, client);

    clientStatusChangeListeners.forEach((listener) => {
      listener(client, 'connection');
    });

    client.addListener('close', (code: number, message: string) => {
      logger.info('WebSocket.Client close ip -> ' + ip + ' code -> ' + code + ' message-> ' + message);
      ipToClient.delete(ip);

      clientStatusChangeListeners.forEach((listener) => {
        listener(client, 'close');
      });
    });

    client.addListener('error', (err: Error) => {
      logger.info('WebSocket.Client error ip -> ' + ip + ' message-> ' + err.message);
      ipToClient.delete(ip);

      clientStatusChangeListeners.forEach((listener) => {
        listener(client, 'error');
      });
    });

    client.addListener('pong', (data: Buffer) => {});

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
    for(const ws of ipToClient.values()) {
      this.sendMessage(ws, message);
    }
  }

  public sendMessageToClients(clients: WebSocket[], message: object) {
    clients.forEach((client) => {
      this.sendMessage(client, message);
    });
  }
}