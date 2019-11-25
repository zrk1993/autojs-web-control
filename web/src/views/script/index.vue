<template>
  <div class="script-container">
    <el-button @click="runScript">运行</el-button>
    <article id="code"></article>
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
      value: 'console.log("Hello world")',
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
      var code = this.codeMirror.getValue();
      request.post('/script/run', { code, decice_id: 1 }).then((res) => {
        console.log(res);
      });
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
