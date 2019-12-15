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
import AdminModel from '@/model/admin.model';

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
    const admin = await AdminModel.getByName(body.username);
    if (!admin || admin.password !== body.password) {
      return ResultUtils.badRequest('账号或密码错误');
    }
    const token = appJwt.sign({
      id: admin.admin_id,
      username: admin.uname,
    });
    ctx.cookies.set('authorization', token);
    return ResultUtils.success({ token });
  }

  @Post('/logout')
  @Description('退出')
  async logout(@Ctx() ctx: Koa.Context) {
    ctx.cookies.set('authorization', '');
    return ResultUtils.success();
  }

  @Get('/info')
  @Description('用户信息')
  @Role(SYS_ROLE.admin)
  async info() {
    return ResultUtils.success({
      roles: ['admin'],
      introduction: 'I am a super administrator',
      avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      name: 'Super Admin'
    });
  }

  @Post('/password')
  @Description('修改密码')
  @Role(SYS_ROLE.admin)
  async password(@CurUser() curUser: any, @Body() body: any,) {
    const admin = await AdminModel.getById(curUser.admin_id)
    await AdminModel.changePassword(admin.admin_id, body.password);
    return ResultUtils.success();
  }
}
