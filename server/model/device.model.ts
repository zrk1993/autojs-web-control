import BaseModel from './base.model';

export const tableName = 'device';
export interface ITableStructure {
  device_id?: number,
  device_name?: string,
  connect_code?: string,
  create_time?: string,
  is_online?: any,
  [propname: string]: any
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  async getByDeviceName(device_name: string) {
    return this.$db.table(tableName).where({ device_name }).findOrEmpty();
  }

}

export default new DeviceModel();

