import 'reflect-metadata';
import * as joi from 'joi';
import { METADATA_ROUTER_BODY_SCHAME, METADATA_ROUTER_QUERY_SCHAME } from '../constants';

function create(type: symbol) {
  return (schemaMap: joi.SchemaMap) => {
    Object.keys(schemaMap).forEach(k => {
      const v: any = schemaMap[k];
      if (v._flags.presence !== 'required') {
        schemaMap[k] = v.allow.call(v, '', null);
      }
    });
    return (target: any, propertyKey?: string) => {
      Reflect.defineMetadata(type, joi.object().keys(schemaMap), target, propertyKey);
    };
  };
}

export const BodySchame = create(METADATA_ROUTER_BODY_SCHAME);

export const QuerySchame = create(METADATA_ROUTER_QUERY_SCHAME);
