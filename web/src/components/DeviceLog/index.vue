<template>
  <div class="log-container">
    <!-- <div class="title">Logcat</div> -->
    <div class="tool-bar">
      <el-select v-model="value" size="mini" placeholder="请选择设备" style="width: 120px;">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select
        v-model="value"
        size="mini"
        placeholder="请选择脚本"
        style="width: 120px; margin-left: 10px;"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select
        v-model="value"
        size="mini"
        placeholder="日志级别"
        style="width: 100px; margin-left: 10px;"
      >
        <el-option label="Verbose" value="Verbose" />
        <el-option label="Debug" value="Debug" />
        <el-option label="Info" value="Info" />
        <el-option label="Warn" value="Warn" />
        <el-option label="Error" value="Error" />
      </el-select>
      <el-input
        v-model="value"
        placeholder="请输入内容"
        size="mini"
        prefix-icon="el-icon-search"
        style="width: 200px; margin-left: 10px;"
      />
      <div class="actions">
        <el-button icon="el-icon-circle-close" plain circle size="mini" @click="clearConsole" />
      </div>
    </div>
    <div
      ref="logScroller"
      v-auto-height:maxHeight="-10"
      class="log-scroller"
      :style="{ 'max-height': maxHeight + 'px' }"
    >
      <div v-for="(item, index) in logs" :key="index">{{ item.log }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
// import request from '@/utils/request';
import WebSocketManager from '@/WebSocketClientManager';

export default {
  name: 'DeviceLog',
  data() {
    return {
      maxHeight: 500,
      messageListener: null,
      options: [
        {
          value: '选项1',
          label: '黄金糕'
        },
        {
          value: '选项2',
          label: '双皮奶'
        },
        {
          value: '选项3',
          label: '蚵仔煎'
        },
        {
          value: '选项4',
          label: '龙须面'
        },
        {
          value: '选项5',
          label: '北京烤鸭'
        }
      ],
      value: '',
      logs: []
    };
  },
  computed: {
    ...mapGetters(['name'])
  },
  created() {
    this.messageListener = message => {
      if (message.type === 'log') {
        this.logs.push(message.data);
        this.$refs.logScroller.scrollTop = this.$refs.logScroller.scrollHeight;
      }
    };
    WebSocketManager.getInstance().addMessageListener(this.messageListener);
  },
  destroyed() {
    WebSocketManager.getInstance().removeMessageListener(this.messageListener);
  },
  methods: {
    clearConsole() {
      this.logs = [];
    }
  }
};
</script>

<style lang="scss" scoped>
.log-container {
  color: #303030;
}
.title {
  background-color: #eeeeee;
  border: 1px solid #5555553b;
  padding: 5px 10px;
}
.tool-bar {
  background-color: #f2f2f2;
  display: flex;
  padding: 10px;
}
.tool-bar .actions {
  flex-grow: 1;
  margin-left: 25px;
  padding-right: 15px;
}
.log-scroller {
  overflow: auto;
  padding: 5px 5px 1.5em 10px;
}
</style>
