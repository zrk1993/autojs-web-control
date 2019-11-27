<template>
  <div class="script-container">
    <div class="script-header">
      <div style="align-self: center;">
        <i
          class="el-icon-edit-outline"
          style="font-size: 15px;font-weight: 600; margin: 0 5px 0 3px;"
        ></i>
        <span>新建脚本.js</span>
      </div>
      <div class="actions">
        <el-button @click="runScript" icon="el-icon-delete" plain circle size="mini"></el-button>&nbsp;&nbsp;
        <el-button @click="runScript" icon="el-icon-upload" plain circle size="mini"></el-button>&nbsp;&nbsp;
        <el-button @click="runScript" icon="el-icon-caret-right" type="success" plain circle size="mini"></el-button>
      </div>
      <div></div>
    </div>
    <div style="position: relative;">
      <article id="code" ref="code" :style="{ height: codeHeight }" />
      <div class="divide" ref="divide">Logcat</div>
      <device-log class="device_log" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import request from "@/utils/request";
import DeviceLog from "@/components/DeviceLog";

export default {
  name: "Dashboard",
  components: {
    DeviceLog
  },
  data() {
    return {
      codeMirror: null,
      codeHeight: document.body.clientHeight * 0.6 + "px"
    };
  },
  computed: {
    ...mapGetters(["name"])
  },
  mounted() {
    this.codeMirror = window.CodeMirror(document.getElementById("code"), {
      value: 'toastLog("Hello world")',
      lineNumbers: true,
      mode: "javascript",
      keyMap: "sublime",
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      // theme: "monokai",
      tabSize: 2
    });

    const codeMirrorWrapEle = this.$refs.code;
    const divideRef = this.$refs.divide;
    var mouseDownX,
      mouseDownY,
      initX,
      initY,
      doc_onmousemove,
      doc_onmouseup,
      flag = false,
      isMoving = false;

    divideRef.onmousedown = function(e) {
      var obj = divideRef; //移动目标元素
      //表示鼠标已按下
      flag = true;

      //鼠标按下时的鼠标所在的X，Y坐标
      mouseDownX = e.clientX;
      mouseDownY = e.clientY;

      //初始位置的X，Y 坐标
      initX = obj.offsetLeft;
      initY = obj.offsetTop;

      //保存原来绑定在document的事件
      doc_onmousemove = document.onmousemove;
      doc_onmouseup = document.onmouseup;

      document.onmousemove = move;
      document.onmouseup = obj.onMouseOut = stop;

      function move(e) {
        if (flag && !isMoving) {
          // obj.style.left =
          //   parseInt(e.clientX) - parseInt(mouseDownX) + parseInt(initX) + "px";
          codeMirrorWrapEle.style.height =
            parseInt(e.clientY) - parseInt(mouseDownY) + parseInt(initY) + "px";

          window.dispatchEvent(new Event("resize"));
          isMoving = true;
          setTimeout(function() {
            isMoving = false;
          }, 10);
        }
        return false;
      }
      function stop() {
        flag = false;
        document.onmousemove = doc_onmousemove; //原来的事件回复绑定
        document.onmouseup = doc_onmouseup;
      }
      return false; //可以防止在拖动的时候选中文本
    };
  },
  beforeDestroy() {},
  methods: {
    runScript() {
      var script = this.codeMirror.getValue();
      request
        .post("/script/run", { script, fileName: "[remote]" })
        .then(res => {
          console.log(res);
        });
    }
  }
};
</script>

<style lang="css">
.CodeMirror {
  height: 100%;
}
</style>

<style lang="scss" scoped>
.script-container {
  position: relative;
}
.script-header {
  font-size: 13px;
  padding: 6px 0 6px 10px;
  border-right: 1px solid #ddd;
  background-color: #f6f6f6;
  color: #303133;
  display: flex;
  justify-content: space-between;
}
.script-header .actions {
  padding-right: 15px;
}
.divide {
  font-size: 13px;
  padding: 6px 0 6px 10px;
  background: #e8e8e8;
  color: #303133;
  cursor: ns-resize;
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
}
</style>
