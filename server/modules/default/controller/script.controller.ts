import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import DeviceModel from '@/model/device.model';
import * as joi from 'joi';

@Controller('/script')
@Description('脚本')
export class Script {
  @Post('/run')
  @Description('执行脚本')
  @BodySchame({
    code: joi.string(),
    device: joi.string(),
  })
  async run(@Body() body: any) {
    const devices = await DeviceModel.getAll();
    return ResultUtils.success({ devices });
  }
}
