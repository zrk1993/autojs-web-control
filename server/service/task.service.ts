import db from '@/utils/db';

/**
 * 数据库表模型
 */
export interface ITaskModel {
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

/**
 * 获取任务列表
 */
export async function getTasks(): Promise<ITaskModel[]> {
  return await db.query('SELECT * FROM t_task');
}

/**
 * 新增任务
 * @param taskInfo
 */
export async function addTask(taskInfo: ITaskModel) {
  return await db.table('task').insert(taskInfo);
}

/**
 * 更新任务信息
 * @param task_id
 */
export async function updateTask(task_id: string, newTaskInfo: ITaskModel) {
  return await db.table('task').where({ task_id }).update(newTaskInfo);
}

/**
 * 删除任务
 * @param task_id
 */
export async function removeTask(task_id: string) {
  return await db.table('task').where({ task_id }).delete();
}