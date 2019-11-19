/**
 * @Author: kun
 * @Date: 2019-10
 */

import * as Koa from 'koa';
import { Application } from '../application';

export class ResponseHandler {
  private readonly appInstance: Application;

  constructor(appInstance: Application) {
    this.appInstance = appInstance;
  }

  responseJson(ctx: Koa.Context, response: any) {
    ctx.body = response;
  }

  async responseHtml(ctx: Koa.Context, response: any, view: string) {
    await ctx.render(view, response);
  }
}
