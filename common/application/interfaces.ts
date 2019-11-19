/**
 * @Author: kun
 */

import * as Koa from 'koa';

export interface ILogger {
  info(message: any, ...args: any[]): void;
  warn(message: any, ...args: any[]): void;
  error(message: any, ...args: any[]): void;
}

export type IParamConvertFunc = (ctx: Koa.Context, data?: any) => any;
