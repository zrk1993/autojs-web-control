import BaseModel from "./base.model";

export interface ITableStructure {
  device_id?: number,
  device_name?: string,
  create_time?: string,
  is_online?: number,
};

export const tableName = '';

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  aa() {
    this.tableStructure.create_time;
  }
}

export default new DeviceModel();

