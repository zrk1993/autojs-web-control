import * as querystring from 'querystring';
import * as http from 'http';
import getLogger from '@/utils/log4js';
import { WebSocketManager, WebSocketExt } from './WebSocketManager';

const logger = getLogger('LogcatManager');

export class LogcatManager {
  static instance: LogcatManager;

  public static getInstance() {
    if (!LogcatManager.instance) {
      logger.info('LogcatManager Not initialized!');
    }
    return LogcatManager.instance;
  }

  public static init() {}

  public log() {}

  public addListener(listener: any) {}
}