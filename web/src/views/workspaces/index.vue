<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="mt15 px5">
      <el-col :span="12">
        <div class="checkbox-container">
          <div class="checkbox-header">
            <el-checkbox
              :indeterminate="isDevicesIndeterminate"
              v-model="checkAllDevice"
              @change="handleDeviceCheckAllChange"
            >设备列表</el-checkbox>
          </div>
          <div class="checkbox-group">
            <el-checkbox-group v-model="checkedDevices" @change="handleCheckedDeviceChange">
              <div class="checkbox-item" v-for="item in devices" :key="item.device_id">
                <el-checkbox
                  :label="item.device_id"
                >{{item.name}} {{ item.is_online ? '' : `（离线）` }}</el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="checkbox-container">
          <div class="checkbox-header">
            <span style="color: #606266; font-size: 14px; font-weight: 500;">脚本列表</span>
          </div>
          <div class="checkbox-group" v-loading="listLoading">
            <div class="checkbox-item" v-for="item in scripts" :key="item.script_id">
              <el-radio v-model="checkedScript" :label="item.script_id">{{item.script_name}}</el-radio>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <device-log class="device_log mt15">
      <div>
        <el-button icon="el-icon-caret-right" plain circle size="mini" @click="runScript" />
        <slot />
      </div>
    </device-log>
  </div>
</template>

<script>
import request from "@/utils/request";
import DeviceLog from "@/components/DeviceLog";
import { mapGetters } from "vuex";
export default {
  name: "Dashboard",
  data() {
    return {
      checkAllDevice: false,
      checkedDevices: [],
      isDevicesIndeterminate: true,
      checkAllScript: false,
      checkedScript: null,
      isScriptsIndeterminate: true,
      scripts: []
    };
  },
  components: {
    DeviceLog
  },
  computed: {
    ...mapGetters(["name"]),
    devices() {
      return this.$store.state.device.list;
    }
  },
  created() {
    this.getScripts();
  },
  methods: {
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
    },
    handleDeviceCheckAllChange(val) {
      console.log(val);
      this.checkedDevices = val ? this.devices.map(i => i.device_id) : [];
      this.isDevicesIndeterminate = false;
    },
    handleCheckedDeviceChange(value) {
      let checkedCount = value.length;
      this.checkAllDevice = checkedCount === this.devices.length;
      this.isDevicesIndeterminate =
        checkedCount > 0 && checkedCount < this.devices.length;
    },
    handleCheckedScriptChange(value) {
      console.log(value);
      let checkedCount = value.length;
      this.checkAllScript = checkedCount === this.scripts.length;
      this.isScriptsIndeterminate =
        checkedCount > 0 && checkedCount < this.scripts.length;
    },
    runScript() {
      request
        .post("/script/run2", {
          script_id: this.checkedScript,
          devices: this.checkedDevices
        })
        .then(res => {
          console.log(res);
        })
        .finally(() => {
          this.bustling = false;
        });
    }
  }
};
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 0px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.checkbox-container {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.checkbox-header {
  height: 40px;
  line-height: 40px;
  background: #f5f7fa;
  margin: 0;
  padding-left: 15px;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
  color: #000;
}
.checkbox-group {
  padding: 5px 15px 15px 15px;
  height: 300px;
  overflow: auto;
}
.checkbox-item {
  margin-top: 10px;
  display: block;
}
</style>
