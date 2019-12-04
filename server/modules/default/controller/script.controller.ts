import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import * as joi from 'joi';
import * as moment from 'moment';
import ScriptExecutor from '@/service/ScriptExecutor';
import ScriptModel from '@/model/script.model';

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
    ScriptExecutor.getInstance().run(body.devices, body.fileName, body.script);
    return ResultUtils.success();
  }

  @Post('/run2')
  @Description('执行脚本2')
  @BodySchame({
    script_id: joi.any(),
    devices: joi.array().items(joi.any()),
  })
  async run2(@Body() body: any) {
    const script = await ScriptModel.getById(body.script_id);
    ScriptExecutor.getInstance().run(body.devices, script.script_name, script.script);
    return ResultUtils.success();
  }

  @Post('/stop_all')
  @Description('执行脚本2')
  @BodySchame({
    devices: joi.array().items(joi.any()),
  })
  async stopAll(@Body() body: any) {
    ScriptExecutor.getInstance().stopAll(body.devices);
    return ResultUtils.success();
  }

  @Get('/get_script')
  @Description('获取脚本列表')
  async get_script(@Query() query: any) {
    const script = await ScriptModel.getById(query.id);
    return ResultUtils.success(script);
  }

  @Get('/get_script_list')
  @Description('获取脚本列表')
  async get_device_list() {
    const scripts = await ScriptModel.getAll();
    return ResultUtils.success({ scripts });
  }

  @Post('/add_script')
  @Description('新建脚本')
  async add_device(@Body() body: any) {
    const res = await ScriptModel.insert(body)
    return ResultUtils.success({ script_id: res.insertId });
  }

  @Post('/update_script')
  @Description('脚本保存')
  async update_device(@Body() body: any) {
    body.create_time = moment(body.create_time || new Date()).format('YYYY-MM-DD HH:mm:ss');
    body.update_time = moment(body.update_time || new Date()).format('YYYY-MM-DD HH:mm:ss');
    await ScriptModel.updateById(body.script_id, body);
    return ResultUtils.success();
  }

  @Post('/remove_script')
  @Description('删除脚本')
  async remove_device(@Body() body: any) {
    await ScriptModel.deleteById(body.script_id);
    return ResultUtils.success();
  }

}
