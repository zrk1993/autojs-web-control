/**
 * @Author: kun
 * @Date: 2019-10
 */

import 'reflect-metadata';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { ResponseHandler } from './response-handler';
import { Application } from '../application';
import { METADATA_ROUTER_PARAMS, METADATA_ROUTER_RENDER_VIEW } from '../constants';
import { IParamConvertFunc } from '../interfaces';

export class ExecutionContex {
  private readonly appInstance: Application;
  private readonly contextInstance: any;
  private readonly ContextClass: any;
  private readonly responseHandler: ResponseHandler;

  constructor(
    appInstance: Application,
    responseHandler: ResponseHandler,
    ContextClass: any,
    ContextClassArgs: any[] = [],
  ) {
    this.appInstance = appInstance;
    this.ContextClass = ContextClass;
    this.responseHandler = responseHandler;
    this.contextInstance = new ContextClass(...ContextClassArgs);
  }

  create(propertyKey: string): any {
    const renderViewPath = Reflect.getMetadata(METADATA_ROUTER_RENDER_VIEW, this.ContextClass.prototype, propertyKey);

    return async (ctx: any, next: () => void) => {
      const params: any[] = this.getRouterHandlerParams(ctx, propertyKey) || [];

      const response = await this.contextInstance[propertyKey].call(this.contextInstance, ...params);

      if (ctx.body === undefined) {
        if (renderViewPath) {
          await this.responseHandler.responseHtml(ctx, response, renderViewPath);
        } else {
          this.responseHandler.responseJson(ctx, response);
        }
      }
    };
  }

  private getRouterHandlerParams(ctx: Koa.Context, propertyKey: string): any[] {
    const results: any[] = [];
    const routerParams: any[] =
      Reflect.getMetadata(METADATA_ROUTER_PARAMS, this.ContextClass.prototype, propertyKey) || [];

    routerParams.forEach((param: { index: number; convertFunc: IParamConvertFunc; data: any }) => {
      results[param.index] = this.convertParamDecorator(param, ctx);
    });

    return results;
  }

  private convertParamDecorator(
    param: { index: number; convertFunc: IParamConvertFunc; data: any },
    ctx: Koa.Context | any,
  ): any {
    return param.convertFunc(ctx);
  }
}
