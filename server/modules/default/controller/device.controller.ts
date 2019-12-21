import * as joi from 'joi';
import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import DeviceModel from '@/model/device.model';
import Role from '@/decorators/role';
import { DeviceManager } from '@/service/DeviceManager';

@Controller('/device')
@Description('设备')
@Role()
export class Device {
  @Get('/get_device_list')
  @Description('获取设备列表')
  async get_device_list() {
    const devices = await DeviceModel.getAll();
    const onlineDevices = DeviceManager.getInstance().getOnlineDevices();
    devices.forEach((d) => {
      const ol = onlineDevices.find(i => i.device_name === d.name);
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
    const isRepeat = await DeviceModel.getByDeviceName(body.name);
    if (isRepeat) {
      // return ResultUtils.badRequest('该设备名已被占用！');
    }
    await DeviceModel.updateById(body.device_id, body);
    return ResultUtils.success();
  }

  @Post('/remove_device')
  @Description('删除设备')
  @BodySchame({
    device_id: joi.number()
  })
  async remove_device(@Body() body: any) {
    const device = await DeviceModel.getById(body.device_id);
    await DeviceModel.deleteById(body.device_id);
    DeviceManager.getInstance().disconnectDeviceByIp(device.ip);
    return ResultUtils.success();
  }

  @Post('/disconnect_device')
  @Description('断开连接')
  @BodySchame({
    device_id: joi.number()
  })
  async disconnect_device(@Body() body: any) {
    const device = await DeviceModel.getById(body.device_id);
    DeviceManager.getInstance().disconnectDeviceByIp(device.ip);
    return ResultUtils.success();
  }

  @Get('/online/list')
  @Description('已连接设备列表')
  async onlineList(@Body() body: any) {
    const onlineDevices = DeviceManager.getInstance().getOnlineDevices();
    return ResultUtils.success(onlineDevices);
  }
}
