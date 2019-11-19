import { ILogger } from '../interfaces';

export class Logger implements ILogger {
  info(message: any, ...args: any[]): void {} // tslint:disable-line
  warn(message: any, ...args: any[]): void {} // tslint:disable-line
  error(message: any, ...args: any[]): void {} // tslint:disable-line
}

export const logger = new Logger();
