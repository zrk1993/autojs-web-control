/**
 * @Author: kun
 * @Date: 2019-3
 */

import 'reflect-metadata';
import * as Koa from 'koa';
import { METADATA_ROUTER_MIDDLEWARE } from '../constants';

export function Use(mid: Koa.Middleware) {
  return (target: any, propertyKey?: string) => {
    if (!Reflect.hasMetadata(METADATA_ROUTER_MIDDLEWARE, target, propertyKey)) {
      Reflect.defineMetadata(METADATA_ROUTER_MIDDLEWARE, [], target, propertyKey);
    }

    const middlewares: any[] = Reflect.getMetadata(METADATA_ROUTER_MIDDLEWARE, target, propertyKey);

    middlewares.push(mid);

    Reflect.defineMetadata(METADATA_ROUTER_MIDDLEWARE, middlewares, target, propertyKey);
  };
}
