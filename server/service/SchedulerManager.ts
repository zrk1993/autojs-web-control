import * as querystring from 'querystring';
import * as http from 'http';
import { CronJob } from 'cron';
import getLogger from '@/utils/log4js';
import schedulerModel from '@/model/scheduler.model';
import ScriptModel from '@/model/script.model';
import ScriptExecutor from './ScriptExecutor';

const logger = getLogger('SchedulerManager');

const jobs = new Map<any, CronJob>();

export class SchedulerManager {
  static instance: SchedulerManager;

  public static getInstance() {
    if (!SchedulerManager.instance) {
      logger.info('SchedulerManager Not initialized!');
    }
    return SchedulerManager.instance;
  }

  public static async init() {
    SchedulerManager.instance = new SchedulerManager();

    await SchedulerManager.instance.initJobFromDb();
  }

  public async initJobFromDb() {
    jobs.clear();
    const schedulers = await schedulerModel.getAll();
    for (let i in schedulers) {
      if (schedulers[i].active) await SchedulerManager.getInstance().addCronJob(schedulers[i].scheduler_id);
    }
  }

  public removeCronJonb(scheduler_id: number) {
    if (!jobs.has(scheduler_id)) return;
    const job =jobs.get(scheduler_id);
    job.stop();
    jobs.delete(scheduler_id);
  }

  public async addCronJob(scheduler_id: number) {
    if (jobs.has(scheduler_id)) {
      return;
    }
    const scheduler = await schedulerModel.getById(scheduler_id);
    try {
      const job = new CronJob(scheduler.cron_time, this.onTick.bind(this, scheduler.scheduler_id));
      jobs.set(scheduler.scheduler_id, job);
      logger.info(`定时任务${scheduler.scheduler_name}添加成功，将于${job.nextDate().format('YY-MM-DD HH:mm')}执行`);
      job.start();
    } catch (error) {
      throw new Error('时间格式错误');
    }
  }

  private async onTick(scheduler_id: number) {
    const scheduler = await schedulerModel.getById(scheduler_id);

    if (!scheduler.active) {
      this.removeCronJonb(scheduler.scheduler_id);
    }

    const job = jobs.get(scheduler_id);
    logger.info(`执行定时任务${scheduler.scheduler_name}`);
    const script = await ScriptModel.getById(scheduler.script_id);
    ScriptExecutor.getInstance().run(scheduler.device_ids, `${scheduler.scheduler_name}-${script.script_name}`, script.script);
    
    if (job.nextDate().isBefore(new Date())) {
      logger.info(`最后一次执行该任务`);
    }
  }
}
