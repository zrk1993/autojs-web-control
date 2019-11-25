<template>
  <div class="script-container">
    <article id="code"></article>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  },
  mounted() {
    var editor = CodeMirror(document.getElementById("code"), {
      value: 'console.log("Hello world")',
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
  beforeDestroy() {
    
  }
}
</script>

<style lang="scss" scoped>

</style>
