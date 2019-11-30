import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import DeviceModel from '@/model/device.model';
import { DeviceManager } from '@/service/DeviceManager';

@Controller('/device')
@Description('设备')
export class Device {
  @Get('/get_device_list')
  @Description('获取设备列表')
  async get_device_list() {
    const devices = await DeviceModel.getAll();
    const onlineDevices = DeviceManager.getInstance().getOnlineDevices();
    devices.forEach((d) => {
      const ol = onlineDevices.find(i => i.ip === d.ip);
      if (ol) {
        d.is_online = true;
      }
    });
    return ResultUtils.success({ devices });
  }

  @Post('/add_device')
  @Description('新增设备')
  async add_device(@Body() body: any) {
    await DeviceModel.insert(body)
    return ResultUtils.success();
  }

  @Post('/update_device')
  @Description('编辑设备')
  async update_device(@Body() body: any) {
    await DeviceModel.updateById(body.devicd_id, body);
    return ResultUtils.success();
  }

  @Post('/remove_device')
  @Description('删除设备')
  async remove_device(@Body() body: any) {
    const devide = await DeviceModel.getById(body.devicd_id);
    await DeviceModel.deleteById(body.devicd_id);
    DeviceManager.getInstance().disconnectDeviceByIp(devide.ip);
    return ResultUtils.success();
  }

  @Get('/online/list')
  @Description('已连接设备列表')
  async onlineList(@Body() body: any) {
    const onlineDevices = DeviceManager.getInstance().getOnlineDevices();
    return ResultUtils.success(onlineDevices);
  }
}
