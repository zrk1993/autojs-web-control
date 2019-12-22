<template>
  <div class="dashboard-container">
    <div>
      <el-button type="primary" @click="run">执行养号脚本</el-button><el-button type="primary" @click="stopAllScript">停止所有脚本</el-button>
    </div>
    <div class="my20">
      已连接设备&nbsp;{{ $store.state.device.list.filter(i => i.is_online).length }}
    </div>
    <hr>
    <div>
        <div>
            观看时间<el-input v-model="looktime1" style="width: 120px;"></el-input>秒，到<el-input v-model="looktime2" style="width: 120px;"></el-input>秒
        </div>
        <div>
            每次观看关注人<el-input v-model="guanzhuvideonum1" style="width: 120px;"></el-input>到<el-input v-model="guanzhuvideonum2" style="width: 120px;"></el-input>个视频
        </div>
        <div>
            每轮关注
            <el-input v-model="guanzhunum" style="width: 120px;"></el-input>人
        </div>
        <div>
            点赞概率
            <el-input v-model="likePercent" style="width: 120px;"></el-input>
        </div>
        <div>
            主页浏览视频数 <el-input v-model="looknum1" style="width: 120px;"></el-input> 到 <el-input v-model="looknum2" style="width: 120px;"></el-input> 个
        </div>
    </div>
    <hr>
    <div class="my15">
      <input type="file" ref="input" @change="upload" />
    </div>
    <div>共{{ uids.length }}</div>
    <div>
      <!-- <div v-for="uid in uids" :key="uid">
        <div>{{ uid }}</div>
      </div> -->
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
      looktime1: localStorage.getItem('yh_looktime1') || 10,
      looktime2: localStorage.getItem('yh_looktime2') || 20,
      guanzhuvideonum1: localStorage.getItem('yh_guanzhuvideonum1') || 1,
      guanzhuvideonum2: localStorage.getItem('yh_guanzhuvideonum2') || 1,
      looknum1: localStorage.getItem('yh_looknum1') || 5,
      looknum2: localStorage.getItem('yh_looknum2') || 5,
      guanzhunum: localStorage.getItem('yh_guanzhunum') || 5,
      likePercent: localStorage.getItem('yh_likePercent') || 0.5,
    };
  },
  computed: {
    ...mapGetters(["name"])
  },
  methods: {
    upload() {
      const that = this;
      const input = this.$refs.input;
      const file = input.files[0];
      const filename = file.name.split(".")[0];
      const reader = new FileReader();
      reader.onload = function() {
        that.showUids(this.result);
      };
      reader.readAsText(file);
    },
    showUids(result) {
      const uidList = result.split(/\r\n/gi);
      var uids = [];
      for (var i = 0; i < uidList.length; i++) {
        if (uidList[i].length > 4) {
          uids.push(uidList[i]);
        }
      }
      this.uids = uids;
    },
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
      if (!this.uids.length) {
        return this.$message({
          message: "请选择UID文件",
          type: "warning"
        });
      }

      localStorage.setItem('yh_looktime1', this.looktime1);
      localStorage.setItem('yh_looktime2', this.looktime2);
      localStorage.setItem('yh_guanzhuvideonum1', this.guanzhuvideonum1);
      localStorage.setItem('yh_guanzhuvideonum2', this.guanzhuvideonum2);
      localStorage.setItem('yh_looknum1', this.looknum1);
      localStorage.setItem('yh_looknum2', this.looknum2);
      localStorage.setItem('yh_guanzhunum', this.guanzhunum);
      localStorage.setItem('yh_likePercent', this.likePercent);

      request
        .post("/money/douyin_yanghao", {
          uids: this.uids,
          looktime1: this.looktime1,
          looktime2: this.looktime2,
          guanzhuvideonum1: this.guanzhuvideonum1,
          guanzhuvideonum2: this.guanzhuvideonum2,
          looknum1: this.looknum1,
          looknum2: this.looknum2,
          guanzhunum: this.guanzhunum,
          likePercent: this.likePercent,
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
