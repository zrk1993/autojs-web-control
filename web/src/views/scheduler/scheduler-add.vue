<template>
  <div class="dialog">
    <div class="dialog-cont tac">
      <el-form ref="form" :model="form" label-width="130px" size="mini">
        <el-form-item
          label="计划名称："
          prop="scheduler_name"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-input v-model="form.scheduler_name" />
        </el-form-item>
        <el-form-item
          label="cron time："
          prop="cron_time"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-input v-model="form.cron_time" />
        </el-form-item>
        <el-form-item label="下次执行时间：">
          <div v-if="valid_cron_time" class="tal">{{ nextRunTime | time }}</div>
          <div v-else class="tal">{{ nextRunTime }}</div>
        </el-form-item>
        <el-form-item
          label="执行脚本："
          prop="script_id"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-select v-model="form.script_id" size="mini" placeholder="选择脚本" style="width: 100%;">
            <el-option
              v-for="item in scripts"
              :key="item.script_id"
              :label="item.script_name"
              :value="item.script_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="执行设备："
          prop="device_ids"
          :rules="[
            { required: true, message: '请输入', trigger: ['blur', 'change'] },
          ]"
        >
          <el-select v-model="form.device_ids" size="mini" placeholder="选择设备" style="width: 100%;">
            <el-option label="全部设备" value="0" />
            <el-option
              v-for="item in $store.state.device.list.filter(i => i.is_online)"
              :key="item.device_id"
              :label="item.name"
              :value="item.device_id"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="tar">
      <el-button size="mini" @click="cancel">取 消</el-button>
      <el-button size="mini" type="primary" :list-loading="listLoading" @click="confirm">确 定</el-button>
    </div>
  </div>
</template>

<script>
import request from "@/utils/request";
import parser from "cron-parser";

export default {
  data() {
    return {
      listLoading: false,
      valid_cron_time: false,
      scripts: [],
      form: {
        cron_time: "* * * * *"
      }
    };
  },
  computed: {
    nextRunTime() {
      try {
        const interval = parser.parseExpression(this.form.cron_time);
        this.valid_cron_time = true;
        return interval.next().toString();
      } catch (err) {
        this.valid_cron_time = false;
        return err.message;
      }
    }
  },
  created() {
    this.getScripts();
  },
  methods: {
    cancel(data) {
      this.$emit("callback", data);
    },
    confirm() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return false;
        }
        if (!this.valid_cron_time) {
          return;
        }
        this.listLoading = true;
        request({
          url: "/scheduler/add_scheduler",
          method: "post",
          data: {
            scheduler_name: this.form.scheduler_name,
            cron_time: this.form.cron_time,
            script_id: this.form.script_id,
            device_ids: this.form.device_ids
          }
        }).then(res => {
          this.listLoading = false;
          this.cancel(res);
          this.$message({
            message: "操作成功！",
            type: "success"
          });
        });
      });
    },
    getScripts() {
      this.listLoading = true;
      request({
        url: "/script/get_script_list",
        method: "get",
        params: {}
      }).then(res => {
        this.scripts = res.data.scripts;
        this.listLoading = false;
      });
    }
  }
};
</script>
