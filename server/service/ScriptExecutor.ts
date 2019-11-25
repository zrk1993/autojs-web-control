export default class ScriptExecutor {
  private static instance: ScriptExecutor;
  static getInstance() {
    if (!ScriptExecutor.instance) {
      ScriptExecutor.instance = new ScriptExecutor();
    }
    return ScriptExecutor.instance;
  }

  public run() {}
}