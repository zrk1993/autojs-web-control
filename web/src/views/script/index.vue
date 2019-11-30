<template>
  <div class="script-container">
    <div class="script-header">
      <div style="align-self: center;cursor: pointer;" @click="changeName">
        <i
          class="el-icon-edit-outline"
          style="font-size: 15px;font-weight: 600; margin: 0 5px 0 3px;"
        />
        <span>{{ scriptData.script_name }}.js</span>
      </div>
      <div class="actions"></div>
      <div class="mr20">
        <el-button
          v-loading="bustling"
          icon="el-icon-suitcase"
          plain
          circle
          size="mini"
          @click="saveScript"
        />
      </div>
    </div>
    <div style="position: relative;">
      <article
        id="code"
        ref="code"
        v-loading="listLoading"
        :style="{ height: codeHeight }"
        element-loading-text="Loading"
      />
      <div ref="divide" class="divide">Logcat</div>
      <device-log class="device_log" :showRun="true" @run="runScript" />
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
      listLoading: false,
      bustling: false,
      codeMirror: null,
      saveListener: null,
      codeHeight: document.body.clientHeight * 0.6 + "px",
      scriptData: {
        script_id: null,
        script_name: "新建脚本",
        script: "",
        script_args: ""
      }
    };
  },
  computed: {
    ...mapGetters(["name"])
  },
  created() {
    this.scriptData.script_id = this.$route.query.id;
    this.saveListener = e => {
      if (
        e.keyCode === 83 &&
        (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
      ) {
        e.preventDefault();
        this.saveScript();
      }
    };
  },
  mounted() {
    if (this.scriptData.script_id) {
      this.fetchData();
    } else {
      this.createCodeMirror();
    }
    this.dragDivide();
    document.addEventListener("keydown", this.saveListener);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.saveListener);
  },
  methods: {
    fetchData() {
      this.listLoading = true;
      request({
        url: "/script/get_script",
        method: "get",
        params: { id: this.scriptData.script_id }
      })
        .then(res => {
          this.scriptData = res.data;
          this.createCodeMirror();
        })
        .finally(() => {
          this.listLoading = false;
        });
    },
    saveScript() {
      this.bustling = true;
      this.scriptData.script = this.codeMirror.getValue();
      request({
        url: this.scriptData.script_id
          ? "/script/update_script"
          : "/script/add_script",
        method: "post",
        data: this.scriptData
      })
        .then(res => {
          if (this.scriptData.script_id) {
            this.$message({
              message: "恭喜你，脚本已更新！",
              type: "success"
            });
          } else {
            this.$message({
              message: "恭喜你，脚本新建成功！",
              type: "success"
            });
            this.$router.replace({
              path: "/script/edit",
              query: { id: res.data.script_id }
            });
          }
        })
        .finally(() => {
          this.bustling = false;
        });
    },
    createCodeMirror() {
      this.codeMirror = window.CodeMirror(document.getElementById("code"), {
        value: this.scriptData.script,
        lineNumbers: true,
        mode: "javascript",
        keyMap: "sublime",
        autoCloseBrackets: true,
        matchBrackets: true,
        showCursorWhenSelecting: true,
        // theme: "monokai",
        tabSize: 2
      });
    },
    runScript(devices) {
      this.bustling = true;
      var script = this.codeMirror.getValue();
      request
        .post("/script/run", { script, fileName: this.scriptData.script_name, devices })
        .then(res => {
          console.log(res);
        })
        .finally(() => {
          this.bustling = false;
        });
    },
    changeName() {
      this.$prompt("请输入脚本名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputErrorMessage: "邮箱格式不正确"
      })
        .then(({ value }) => {
          this.scriptData.script_name = value;
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "取消输入"
          });
        });
    },
    dragDivide() {
      const codeMirrorWrapEle = this.$refs.code;
      const divideRef = this.$refs.divide;
      // var mouseDownX;
      var mouseDownY;
      // var initX;
      var initY;
      var doc_onmousemove;
      var doc_onmouseup;
      var flag = false;
      var isMoving = false;

      divideRef.onmousedown = function(e) {
        var obj = divideRef; // 移动目标元素
        // 表示鼠标已按下
        flag = true;

        // 鼠标按下时的鼠标所在的X，Y坐标
        // mouseDownX = e.clientX;
        mouseDownY = e.clientY;

        // 初始位置的X，Y 坐标
        // initX = obj.offsetLeft;
        initY = obj.offsetTop;

        // 保存原来绑定在document的事件
        doc_onmousemove = document.onmousemove;
        doc_onmouseup = document.onmouseup;

        document.onmousemove = move;
        document.onmouseup = obj.onMouseOut = stop;

        function move(e) {
          if (flag && !isMoving) {
            // obj.style.left =
            //   parseInt(e.clientX) - parseInt(mouseDownX) + parseInt(initX) + "px";
            codeMirrorWrapEle.style.height =
              parseInt(e.clientY) -
              parseInt(mouseDownY) +
              parseInt(initY) +
              "px";

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
          document.onmousemove = doc_onmousemove; // 原来的事件回复绑定
          document.onmouseup = doc_onmouseup;
        }
        return false; // 可以防止在拖动的时候选中文本
      };
    }
  }
};
</script>

<style lang="css">
.CodeMirror {
  height: 100%;
  font-size: 14px;
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
