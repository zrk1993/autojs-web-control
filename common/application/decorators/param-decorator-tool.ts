import 'reflect-metadata';
import { METADATA_ROUTER_PARAMS } from '../constants';
import { IParamConvertFunc } from '../interfaces';

export function createParamDecorator(convertFunc: IParamConvertFunc) {
  return (data?: any) => {
    return (target: object, propertyKey: string | symbol, parameterIndex: number) => {
      const routerParams: any[] = Reflect.getMetadata(METADATA_ROUTER_PARAMS, target, propertyKey) || [];

      routerParams.push({
        index: parameterIndex,
        convertFunc,
        data,
      });

      Reflect.defineMetadata(METADATA_ROUTER_PARAMS, routerParams, target, propertyKey);
    };
  };
}
