/**
 * @Author: kun
 * @Date: 2019-3
 */

import * as http from 'http';
import * as Koa from 'koa';
import { RouterResolver } from './router/router-resolver';
import { ILogger } from './interfaces';

export class Application {
  private readonly httpServer: http.Server;
  private readonly koaInstance: Koa;
  private readonly routers: any[];
  private readonly logger: ILogger;

  constructor(routers: any[], options: { logger: ILogger }) {
    this.routers = routers;
    this.logger = options.logger;
    this.koaInstance = new Koa();
    this.httpServer = this.createHttpServer();
  }

  private createHttpServer(): http.Server {
    return http.createServer(this.koaInstance.callback());
  }

  private registerRouter() {
    const routerResolver = new RouterResolver(this.routers, this);
    routerResolver.resolve();
  }

  use(mid: Koa.Middleware) {
    this.koaInstance.use(mid);
  }

  listen(port: number) {
    this.registerRouter();
    this.httpServer.listen(port);
    this.logger.info('Listening at %d', port);
  }

  getKoaInstance(): Koa {
    return this.koaInstance;
  }

  getHttpServer(): http.Server {
    return this.httpServer;
  }

  getRouters(): any[] {
    return this.routers;
  }

  getLogger(): ILogger {
    return this.logger;
  }
}
