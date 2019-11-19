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
    const where = {
      username: body.username,
      password: md5(body.password),
      enable: 1,
    };
    const user = await db.table('user').where(where).find();
    const token = appJwt.sign({
      id: user.id,
      username: user.username,
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

  @Get('/lock')
  @Description('lock')
  async lock(@Ctx() ctx: Koa.Context) {
    const lock = await Lock.getLock('a');
    const a = await db.table('wallet').find();
    console.log(a.frozen);
    await new Promise((resolve, reject) => {
      setTimeout(resolve, 3000* Math.random());
    });
    await db.table('wallet').where({ id: a.id }).update({ frozen: a.frozen + 1 });
    lock.release();
    return ResultUtils.success('1');
  }

  @Get('/info')
  @Description('用户信息')
  @Role(SYS_ROLE.admin, SYS_ROLE.agent, SYS_ROLE.merchant)
  async info(@CurUser() curUser: any) {
    const user = await db.table('user').where({ id: curUser.id, enable: 1 }).find();
    const sql = `
      SELECT R.* FROM role R
      LEFT JOIN user_roles UR ON UR.role_id = R.id
      WHERE UR.user_id = ?
    `;
    const roles = await db.query(sql, [user.id]);
    return ResultUtils.success({
      name: user.username,
      roles: roles.map(r => r.code),
    });
  }
}
