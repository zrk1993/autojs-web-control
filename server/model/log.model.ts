import BaseModel from './base.model';

export const tableName = 't_divice';
export interface ITableStructure {
  task_id?: number,
  task_name?: string, // 任务名
  device_id?: number, // 设备
  script_id?: number, // 脚本
  script_args?: string, // 运行参数
  create_time?: string,
  start_time?: string,
  finish_time?: string,
  status?: string,
  task_result?: string, // 运行结果
  batch_number?: string, // 任务批次号
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

}

export default new DeviceModel();

