import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import DeviceModel from '@/model/device.model';
import * as joi from 'joi';
import ScriptExecutor from '@/service/ScriptExecutor';

@Controller('/script')
@Description('脚本')
export class Script {
  @Post('/run')
  @Description('执行脚本')
  @BodySchame({
    fileName: joi.string(),
    script: joi.string(),
  })
  async run(@Body() body: any) {
    ScriptExecutor.getInstance().run(body.fileName, body.script);
    return ResultUtils.success();
  }
}
