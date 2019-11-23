import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import DeviceService from '@/service/device.service';

@Controller('/device')
@Description('设备')
export class Auth {
  @Get('/get_device_list')
  @Description('获取设备列表')
  async get_device_list() {
     const devices = await DeviceService.getAll();
    return ResultUtils.success({ devices });
  }

  @Post('/add_device')
  @Description('新增设备')
  async add_device(@Body() body: any) {
    await DeviceService.insert(body)
    return ResultUtils.success();
  }

  @Post('/update_device')
  @Description('编辑设备')
  async update_device(@Body() body: any) {
    await DeviceService.updateById(body.devicd_id, body);
    return ResultUtils.success();
  }

  @Post('/remove_device')
  @Description('删除设备')
  async remove_device(@Body() body: any) {
    await DeviceService.deleteById(body.devicd_id);
    return ResultUtils.success();
  }
}
