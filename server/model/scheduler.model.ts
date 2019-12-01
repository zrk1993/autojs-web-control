import BaseModel from './base.model';

export const tableName = 'scheduler';
export interface ITableStructure {
  scheduler_id?: number,
  scheduler_name?: string, // 任务名
  cron_time?: string, // 运行参数
  last_execute_time?: string,
  script_id?: string,
  device_ids?: string,
  active: number, // 是否执行
};

export class DeviceModel extends BaseModel<ITableStructure> {

  constructor() {
    super({ tableName });
  }

  getSchedulerList() {
    const sql = `
    SELECT * FROM t_scheduler sd
    LEFT JOIN t_script sc ON sc.script_id = sd.script_id`;
    return this.$db.query(sql);
  }

}

export default new DeviceModel();

