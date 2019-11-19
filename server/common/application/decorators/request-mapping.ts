import 'reflect-metadata';

import { METADATA_ROUTER_METHOD, METADATA_ROUTER_PATH } from '../constants';

function createRequestMapping(method: string) {
  return (path?: string) => {
    return (target: any, propertyKey: string) => {
      Reflect.defineMetadata(METADATA_ROUTER_PATH, path || '', target, propertyKey);
      Reflect.defineMetadata(METADATA_ROUTER_METHOD, method, target, propertyKey);
    };
  };
}

export const Get = createRequestMapping('GET');

export const Post = createRequestMapping('POST');

export const Controller = (path?: string) => {
  return (target: any) => {
    Reflect.defineMetadata(METADATA_ROUTER_PATH, path || '/', target);
  };
};
