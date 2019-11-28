import { WebSocketManager } from './WebSocketManager';

export default class ScriptExecutor {
  private static instance: ScriptExecutor;
  static getInstance() {
    if (!ScriptExecutor.instance) {
      ScriptExecutor.instance = new ScriptExecutor();
    }
    return ScriptExecutor.instance;
  }

  public run(fileName: string, script: string) {
    WebSocketManager.getInstance().broadcast({
      type: 'command',
      data: {
        command: 'run',
        id: fileName,
        view_id: fileName,
        name: fileName,
        script: script,
      }
    });
  } 
}