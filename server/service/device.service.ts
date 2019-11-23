import db from '@/utils/db';
import BaseModel from './base.model';

export const tableName = 't_dsada';
export interface ITableStructure {
  device_id?: number,
  device_name?: string,
  create_time?: string,
  is_online?: number,
};

export class DeviceService extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }
  
}

export default new DeviceService();

