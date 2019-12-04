<template>
  <div class="app-container">
    <div class="header">
      <span>
        当前运行中的任务:
        <em>{{ avaliableJob.length }}</em>
      </span>
      <span>
        <el-button type="primary" size="mini" @click="schedulerAdd">新增计划</el-button>
      </span>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="计划ID" align="center">
        <template slot-scope="scope">{{ scope.row.scheduler_id }}</template>
      </el-table-column>
      <el-table-column label="计划名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.scheduler_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="脚本名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.script_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="CRON TIME" align="center">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.cron_time }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="create_time" label="下次执行时间">
        <template slot-scope="scope">
          <span>{{ nextRunTime(scope.row.cron_time) | time }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="active" label="计划状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.active == 1" type="success">计划执行中</el-tag>
          <el-tag v-else type="warning">已停止</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="device_ids" label="执行设备">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.device_ids && scope.row.device_ids != 0" type="success">{{ scope.row.device_ids }}</el-tag>
          <el-tag v-else type="success">全部设备</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-popover v-model="scope.row.visible" placement="top" width="120">
            <p class="tac">您确定删除吗？</p>
            <div class="tac m0">
              <el-button size="mini" type="text" @click="scope.row.visible = false">取消</el-button>
              <el-button
                type="primary"
                size="mini"
                @click="removeScheduler(scope.row.scheduler_id)"
              >确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" circle size="mini" />
          </el-popover>

          <el-button
            class="ml10"
            type="warning"
            icon="el-icon-video-pause"
            circle
            size="mini"
            @click="stopScheduler(scope.row.scheduler_id)"
          />
          <el-button
            class="ml5"
            type="primary"
            icon="el-icon-video-play"
            circle
            size="mini"
            @click="startScheduler(scope.row.scheduler_id)"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="DLschedulerAdd.title" :visible.sync="DLschedulerAdd.visible" width="600px">
      <scheduler-add v-if="DLschedulerAdd.visible" @callback="schedulerAddCb" />
    </el-dialog>
  </div>
</template>

<script>
import parser from "cron-parser";
import request from "@/utils/request";
import SchedulerAdd from "./scheduler-add";

export default {
  filters: {
    statusFilter(status) {
      return status ? "success" : "gray";
    }
  },
  components: {
    SchedulerAdd
  },
  data() {
    return {
      list: [],
      listLoading: true,
      DLschedulerAdd: {
        title: "新增计划任务",
        visible: false
      }
    };
  },
  computed: {
    avaliableJob() {
      return this.list.filter(i => !!i.active);
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    nextRunTime(cron_time) {
      try {
        const interval = parser.parseExpression(cron_time);
        return interval.next().toString();
      } catch (err) {
        return err.message;
      }
    },
    schedulerAdd() {
      this.DLschedulerAdd.visible = true;
    },
    schedulerAddCb(data) {
      this.DLschedulerAdd.visible = false;
      if (data) this.fetchData();
    },
    fetchData() {
      this.listLoading = true;
      request({
        url: "/scheduler/get_scheduler_list",
        method: "get",
        params: {}
      }).then(res => {
        this.list = res.data.schedulers;
        this.listLoading = false;
      });
    },
    editScript(id) {
      this.$router.push({ path: "/scheduler/edit", query: { id }});
    },
    removeScheduler(id) {
      this.listLoading = true;
      request({
        url: "/scheduler/remove_scheduler",
        method: "post",
        data: { scheduler_id: id }
      })
        .then(res => {
          this.fetchData();
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    stopScheduler(id) {
      this.listLoading = true;
      request({
        url: "/scheduler/stop_scheduler",
        method: "post",
        data: { scheduler_id: id }
      })
        .then(res => {
          this.$message({
            message: "计划已停止！",
            type: "success"
          });
          this.fetchData();
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    startScheduler(id) {
      this.listLoading = true;
      request({
        url: "/scheduler/start_scheduler",
        method: "post",
        data: { scheduler_id: id }
      })
        .then(res => {
          this.fetchData();
          this.$message({
            message: "计划开始成功！",
            type: "success"
          });
        })
        .finally(() => {
          this.listLoading = false;
        });
    }
  }
};
</script>

<style scoped>
.header {
  font-weight: 600;
  font-size: 16px;
  color: #909399;
  display: flex;
  padding: 5px 0;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style>
