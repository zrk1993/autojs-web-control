import * as joi from 'joi';
import * as Koa from 'koa';
import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description, Tag } from '@/common/application';
import { SYS_ROLE } from '@/utils/enums';
import { ResultUtils } from '@/utils/result-utils';
import db from '@/utils/db';
import * as Lock from '@/utils/lock';
import md5 from '@/utils/md5';
import * as appJwt from '@/middleware/app-jwt';
import Role from '@/decorators/role';
import CurUser from '@/decorators/cur-user';

@Controller('/auth')
@Description('auth')
export class Auth {
  @Post('/login')
  @Description('用户登陆')
  @BodySchame({
    username: joi.string().required(),
    password: joi.string().required(),
  })
  async login(@Body() body: any, @Ctx() ctx: Koa.Context) {
    const token = appJwt.sign({
      id: 'user.id',
      username: 'user.username',
    });
    ctx.cookies.set('authorization', token);
    return ResultUtils.success({ token });
  }

  @Get('/logout')
  @Description('退出')
  async logout(@Ctx() ctx: Koa.Context) {
    ctx.cookies.set('authorization', '');
    return ResultUtils.success();
  }

  @Get('/info')
  @Description('用户信息')
  @Role(SYS_ROLE.admin, SYS_ROLE.agent, SYS_ROLE.merchant)
  async info() {
    return ResultUtils.success({
      roles: ['admin'],
      introduction: 'I am a super administrator',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      name: 'Super Admin'
    });
  }
}
