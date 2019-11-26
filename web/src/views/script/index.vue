<template>
  <div class="script-container">
    <el-button @click="runScript">运行</el-button>
    <article id="code" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import request from '@/utils/request';

export default {
  name: 'Dashboard',
  data() {
    return {
      codeMirror: null,
    };
  },
  computed: {
    ...mapGetters([
      'name',
    ]),
  },
  mounted() {
    this.codeMirror = window.CodeMirror(document.getElementById('code'), {
      value: 'toastLog("Hello world")',
      lineNumbers: true,
      mode: 'javascript',
      keyMap: 'sublime',
      autoCloseBrackets: true,
      matchBrackets: true,
      showCursorWhenSelecting: true,
      // theme: "monokai",
      tabSize: 2
    });
  },
  beforeDestroy() {
  },
  methods: {
    runScript() {
      var script = this.codeMirror.getValue();
      request.post('/script/run', { script, fileName: '[remote]' }).then((res) => {
        console.log(res);
      });
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
