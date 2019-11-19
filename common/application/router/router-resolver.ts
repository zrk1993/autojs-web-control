import 'reflect-metadata';
import * as KoaRouter from 'koa-router';
import * as Koa from 'koa';
import { CronJob } from 'cron';
import { ExecutionContex } from './execution-contex';
import { ResponseHandler } from './response-handler';
import { Application } from '../application';
import { ParamValidate } from '../middlewares/param-validate';
import { ILogger } from '../interfaces';
import isMaster from '../utils/is-master';
import {
  METADATA_CRON,
  METADATA_ROUTER_METHOD,
  METADATA_ROUTER_PATH,
  METADATA_ROUTER_MIDDLEWARE,
  METADATA_ROUTER_BODY_SCHAME,
  METADATA_ROUTER_QUERY_SCHAME,
} from '../constants';

export class RouterResolver {
  private readonly routers: any[];
  private readonly appInstance: Application;
  private readonly koaRouter: KoaRouter;
  private readonly responseHandler: ResponseHandler;
  private readonly logger: ILogger;

  constructor(routers: any[], appInstance: Application, options?: object) {
    this.routers = routers;
    this.appInstance = appInstance;
    this.koaRouter = new KoaRouter();
    this.logger = appInstance.getLogger();
    this.responseHandler = new ResponseHandler(this.appInstance);
  }

  resolve() {
    this.routers.forEach((router: any) => {
      this.registerRouter(router);
      this.registerCronJob(router);
    });

    this.appInstance
      .getKoaInstance()
      .use(this.koaRouter.routes())
      .use(this.koaRouter.allowedMethods());
  }

  private registerRouter(Router: any) {
    this.logger.info('路由 %s', Router.name);

    const executionContex = new ExecutionContex(this.appInstance, this.responseHandler, Router);

    const routerMiddlewares = this.getMiddlewares(Router);

    const requestMappings = this.getRequestMappings(Router.prototype);

    requestMappings.forEach(prop => {
      const requestPath: string = [
        Reflect.getMetadata(METADATA_ROUTER_PATH, Router),
        Reflect.getMetadata(METADATA_ROUTER_PATH, Router.prototype, prop),
      ]
        .join('')
        .replace('//', '/');
      const requestMethod: string = Reflect.getMetadata(METADATA_ROUTER_METHOD, Router.prototype, prop);

      const propMiddlewares = this.getMiddlewares(Router.prototype, prop);

      const allMiddlewares = [].concat(routerMiddlewares).concat(propMiddlewares);

      const validQuerySchame = Reflect.getMetadata(METADATA_ROUTER_QUERY_SCHAME, Router.prototype, prop);
      if (validQuerySchame) {
        allMiddlewares.push(ParamValidate(validQuerySchame, { type: 'query' }));
      }

      const validBodySchame = Reflect.getMetadata(METADATA_ROUTER_BODY_SCHAME, Router.prototype, prop);
      if (validBodySchame) {
        allMiddlewares.push(ParamValidate(validBodySchame, { type: 'body' }));
      }

      this.koaRouterRegisterHelper(requestMethod)(requestPath, ...allMiddlewares, executionContex.create(prop));
    });
  }

  private registerCronJob(Router: any) {
    const cronJobs = Object.getOwnPropertyNames(Router.prototype).filter(prop => {
      return (
        prop !== 'constructor' &&
        typeof Router.prototype[prop] === 'function' &&
        Reflect.hasMetadata(METADATA_CRON, Router.prototype, prop)
      );
    });

    cronJobs.forEach(prop => {
      const { cronTime, options } = Reflect.getMetadata(METADATA_CRON, Router.prototype, prop);

      if (options.onlyRunMaster && !isMaster()) {
        return;
      }

      this.logger.info('创建计划任务 %s.%s cron：%s', Router.name, prop, cronTime);
      const job = new CronJob(cronTime, Router.prototype[prop].bind(Router.prototype));
      job.start();
    });
  }

  private getMiddlewares(target: any, propertyKey?: string): Koa.Middleware[] {
    const middlewares: Koa.Middleware[] = Reflect.getMetadata(METADATA_ROUTER_MIDDLEWARE, target, propertyKey) || [];

    return middlewares.reverse();
  }

  private koaRouterRegisterHelper(m: string) {
    switch (m) {
      case 'POST':
        return this.koaRouter.post.bind(this.koaRouter);
      default:
        return this.koaRouter.get.bind(this.koaRouter);
    }
  }

  private getRequestMappings(router: any): string[] {
    return Object.getOwnPropertyNames(router).filter(prop => {
      return (
        prop !== 'constructor' &&
        typeof router[prop] === 'function' &&
        Reflect.hasMetadata(METADATA_ROUTER_METHOD, router, prop)
      );
    });
  }
}
