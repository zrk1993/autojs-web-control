import db from '@/utils/db';

/**
 * 数据模型
 */
export interface IDeviceModel {
  device_id?: number,
  device_name?: string,
  create_time?: string,
  is_online?: number,
};

/**
 * 获取设备列表
 */
export async function getDeviceList(): Promise<IDeviceModel[]> {
  return await db.query('SELECT * FROM t_device');
}

/**
 * 增加设备
 * @param device_id 设备ID
 */
export async function addDevice(deviceInfo: IDeviceModel) {
  return await db.table('device').insert(deviceInfo);
}

/**
 * 更新设备信息
 * @param device_id 设备ID
 */
export async function updateDevice(device_id: string, newDeviceInfo: IDeviceModel) {
  return await db.table('device').where({ device_id }).update(newDeviceInfo);
}

/**
 * 移除设备
 * @param device_id 设备ID
 */
export async function removeDevice(device_id: string) {
  return await db.table('device').where({ device_id }).delete();
}