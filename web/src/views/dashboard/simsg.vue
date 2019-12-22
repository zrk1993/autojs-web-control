<template>
  <div class="dashboard-container">
    <div>
      <el-button type="primary" @click="run">执行私信脚本</el-button><el-button type="primary" @click="stopAllScript">停止所有脚本</el-button>
    </div>
    <div class="my20">
      已连接设备&nbsp;{{ $store.state.device.list.filter(i => i.is_online).length }}
    </div>
    <hr>
    <div>
        <div>
            私信1<el-input v-model="msg1" style="width: 220px;"></el-input>
        </div>
                <div>
            私信2<el-input v-model="msg2" style="width: 220px;"></el-input>
        </div>
                <div>
            私信3<el-input v-model="msg3" style="width: 220px;"></el-input>
        </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";



import request from "@/utils/request";
export default {
  name: "Dashboard",
  data() {
    return {
      uids: [],
      msg1: localStorage.getItem('dssx_msg1') || "你好1",
      msg2: localStorage.getItem('dssx_msg2') || "你好2",
      msg3: localStorage.getItem('dssx_msg3') || "你好3",
    };
  },
  computed: {
    ...mapGetters(["name"])
  },
  methods: {
    stopAllScript() {
      request
        .post("/script/stop_all", {
          devices: this.checkedDevices
        })
        .then(res => {
          this.$message({
            message: "操作成功！",
            type: "success"
          });
        })
        .finally(() => {});
    },
    run() {
      localStorage.setItem('dssx_msg1', this.msg1);
      localStorage.setItem('dssx_msg2', this.msg2);
      localStorage.setItem('dssx_msg3', this.msg3);

      request
        .post("/money/duosan_msg", {
          msg1: this.msg1,
          msg2: this.msg2,
          msg3: this.msg3
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
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
    margin-top: 2em;
    text-align: center;
  }
}
</style>
