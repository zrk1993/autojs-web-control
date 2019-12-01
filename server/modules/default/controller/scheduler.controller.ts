import { Controller, Get, QuerySchame, Query, Ctx, Post, BodySchame, Body, Description } from '@/common/application';
import { ResultUtils } from '@/utils/result-utils';
import SchedulerModel from '@/model/scheduler.model';
import { SchedulerManager } from '@/service/SchedulerManager';

@Controller('/scheduler')
@Description('计划')
export class Scheduler {
  @Get('/get_scheduler_list')
  @Description('获取计划列表')
  async get_scheduler_list() {
    const schedulers = await SchedulerModel.getSchedulerList();
    return ResultUtils.success({ schedulers });
  }

  @Post('/add_scheduler')
  @Description('新增计划')
  async add_scheduler(@Body() body: any) {
    const res = await SchedulerModel.insert(body);
    SchedulerManager.getInstance().addCronJob(res.insertId);
    return ResultUtils.success();
  }

  @Post('/start_scheduler')
  @Description('停止计划')
  async start_scheduler(@Body() body: any) {
    await SchedulerModel.updateById(body.scheduler_id, { active: 1 });
    SchedulerManager.getInstance().addCronJob(body.scheduler_id);
    return ResultUtils.success();
  }

  @Post('/stop_scheduler')
  @Description('停止计划')
  async update_scheduler(@Body() body: any) {
    await SchedulerModel.updateById(body.scheduler_id, { active: 0 });
    SchedulerManager.getInstance().removeCronJonb(body.scheduler_id);
    return ResultUtils.success();
  }

  @Post('/remove_scheduler')
  @Description('删除计划')
  async remove_scheduler(@Body() body: any) {
    const scheduler = await SchedulerModel.getById(body.scheduler_id);
    await SchedulerModel.deleteById(scheduler.scheduler_id);
    SchedulerManager.getInstance().removeCronJonb(scheduler.scheduler_id);
    return ResultUtils.success();
  }
}
