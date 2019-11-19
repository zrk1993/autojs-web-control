import 'reflect-metadata';
import * as Koa from 'koa';
import * as fs from 'fs';
import * as path from 'path';
import * as mount from 'koa-mount';
import * as koaStatic from 'koa-static';
import * as SwaggerUIDist from 'swagger-ui-dist';
import { Application } from '../application';
import { loadPackage } from '../utils/load-modules';
import {
  METADATA_CRON,
  METADATA_ROUTER_QUERY_SCHAME,
  METADATA_ROUTER_BODY_SCHAME,
  METADATA_ROUTER_METHOD,
  METADATA_ROUTER_PATH,
  METADATA_API_DESCRIPTION,
  METADATA_API_TAG,
} from '../constants';

const convert = loadPackage('joi-to-json-schema');

export interface ISwaggerOption {
  url: string;
  title?: string;
  prefix?: string;
}

export function useSwaggerApi(app: Application, swaggerConfig: ISwaggerOption) {
  const pathToSwaggerUi = SwaggerUIDist.getAbsoluteFSPath();
  app.getKoaInstance().use(
    mount((swaggerConfig.prefix || '/api') + '/index.html', async (ctx: Koa.Context) => {
      const d: string = await new Promise((resolve, reject) => {
        fs.readFile(path.join(pathToSwaggerUi, 'index.html'), (err, data) => {
          if (err) {
            return reject(err.message);
          }
          resolve(data.toString());
        });
      });
      ctx.type = 'text/html';
      ctx.body = d.replace(/url:\s*?"\S*"/gi, `url:"${swaggerConfig.url}",docExpansion: 'none'`);
    }),
  );
  app.getKoaInstance().use(
    mount(swaggerConfig.url, (ctx: Koa.Context) => {
      ctx.body = generateApi(app.getRouters(), swaggerConfig);
    }),
  );
  app.getKoaInstance().use(
    mount(
      swaggerConfig.prefix || '/api',
      koaStatic(pathToSwaggerUi, {
        maxage: 8640000,
      } as any ),
    ),
  );
}

interface IAPI {
  swagger: string;
  paths: { [prop: string]: { [prop: string]: IPath } };
  info: any;
  basePath: string;
  consumes: string[];
  produces: string[];
  schemes: string[];
  tags: Array<{ name: string; description?: string }>;
}

interface IPath {
  summary: string;
  tags: string[];
  produces?: string[];
  responses?: any;
  parameters?: any[];
}

const api: IAPI = {
  swagger: '2.0',
  info: {
    title: '接口文档',
    version: '1.0.0',
  },
  //  the domain of the service
  //  host: 127.0.0.1:3457
  schemes: ['http'],
  basePath: '',
  consumes: ['application/json', 'application/x-www-form-urlencoded'],
  produces: ['application/json'],
  paths: {},
  tags: [],
};

let generated = false;

function generateApi(controllers: any[], swaggerConfig: ISwaggerOption) {
  if (generated) {
    return api;
  }

  api.info.title = swaggerConfig.title || '接口文档';

  controllers.forEach(Controller => {
    const requestMappings = getRequestMappings(Controller.prototype);

    const tag = Reflect.getMetadata(METADATA_API_TAG, Controller) || Controller.name;
    const description = Reflect.getMetadata(METADATA_API_DESCRIPTION, Controller) || '';

    if (!api.tags.find(i => i.name === tag)) {
      api.tags.push({ name: tag, description });
    }

    requestMappings.forEach(prop => {
      const requestPath: string = [
        Reflect.getMetadata(METADATA_ROUTER_PATH, Controller),
        Reflect.getMetadata(METADATA_ROUTER_PATH, Controller.prototype, prop),
      ]
        .join('')
        .replace('//', '/');

      const requestMethod: string = Reflect.getMetadata(METADATA_ROUTER_METHOD, Controller.prototype, prop);

      const methodDesc = Reflect.getMetadata(METADATA_API_DESCRIPTION, Controller.prototype, prop) || '';

      let cronJobInfo = '';
      if (Reflect.hasMetadata(METADATA_CRON, Controller.prototype, prop)) {
        const { cronTime, options } = Reflect.getMetadata(METADATA_CRON, Controller.prototype, prop);
        cronJobInfo = `【计划任务：${cronTime}】${options.onlyRunMaster ? '（onlyRunMaster）' : ''}`;
      }

      const method: IPath = {
        summary: methodDesc + cronJobInfo,
        tags: [tag],
        produces: ['application/json', 'application/x-www-form-urlencoded'],
        parameters: [],
        responses: { default: { description: 'successful operation' } },
      };

      const validQuerySchame = Reflect.getMetadata(METADATA_ROUTER_QUERY_SCHAME, Controller.prototype, prop);
      if (validQuerySchame) {
        const schema = convert(validQuerySchame);
        Object.keys(schema.properties).forEach(key => {
          const property = schema.properties[key];
          method.parameters.push({
            name: key,
            in: 'query',
            type: property.type,
            required: !!(schema.required || []).find((i: string) => i === key),
            description: key,
          });
        });
      }

      const validBodySchame = Reflect.getMetadata(METADATA_ROUTER_BODY_SCHAME, Controller.prototype, prop);
      if (validBodySchame) {
        const schema = convert(validBodySchame);
        method.parameters.push({
          description: '',
          in: 'body',
          name: 'body',
          required: true,
          schema,
        });
      }

      api.paths[requestPath] = { [requestMethod.toLowerCase()]: method };
    });
  });

  generated = true;
  return api;
}

function getRequestMappings(router: any): string[] {
  return Object.getOwnPropertyNames(router).filter(prop => {
    return (
      prop !== 'constructor' &&
      typeof router[prop] === 'function' &&
      Reflect.hasMetadata(METADATA_ROUTER_METHOD, router, prop)
    );
  });
}
