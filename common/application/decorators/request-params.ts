import { createParamDecorator } from './param-decorator-tool';

export const Ctx = createParamDecorator(ctx => {
  return ctx;
});

export const Request = createParamDecorator(ctx => {
  return ctx.request;
});

export const Response = createParamDecorator(ctx => {
  return ctx.response;
});

export const Query = createParamDecorator((ctx, data) => {
  return data && ctx.request.query ? ctx.request.query[data] : ctx.request.query;
});

export const Body = createParamDecorator((ctx, data) => {
  const body = ctx.request.body;
  return data && body ? body[data] : body;
});
