import 'reflect-metadata';
import { METADATA_ROUTER_RENDER_VIEW } from '../constants';

export function Render(view: string) {
  return (target: any, propertyKey?: string) => {
    Reflect.defineMetadata(METADATA_ROUTER_RENDER_VIEW, view, target, propertyKey);
  };
}
