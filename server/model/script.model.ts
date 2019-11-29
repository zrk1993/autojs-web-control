import BaseModel from './base.model';

export const tableName = 'script';
export interface ITableStructure {
  [propname: string]: any
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

}

export default new DeviceModel();

