import BaseModel from './base.model';

export const tableName = 'device';
export interface ITableStructure {
  device_id?: number,
  name?: string,
  category?: string,
  ip?: string,
  create_time?: string,
  connect_time?: string,
  [propname: string]: any
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  async getByDeviceName(device_name: string) {
    return this.$db.table(tableName).where({ device_name }).findOrEmpty();
  }

  async getByIp(ip: string) {
    return this.$db.table(tableName).where({ ip }).findOrEmpty();
  }

}

export default new DeviceModel();

