import 'reflect-metadata';
import { METADATA_API_TAG, METADATA_API_DESCRIPTION } from '../constants';

export const Tag = (tag: string) => {
  return (target: object, propertyKey?: string) => {
    Reflect.defineMetadata(METADATA_API_TAG, tag, target, propertyKey);
  };
};

export const Description = (description: string) => {
  return (target: object, propertyKey?: string) => {
    const des: string = Reflect.getMetadata(METADATA_API_DESCRIPTION, target, propertyKey) || '';
    Reflect.defineMetadata(METADATA_API_DESCRIPTION, description + ' ' + des, target, propertyKey);
  };
};
