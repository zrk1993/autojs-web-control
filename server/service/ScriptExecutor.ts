import { WebSocketManager } from './WebSocketManager';
import { DeviceManager } from './DeviceManager';

export default class ScriptExecutor {
  private static instance: ScriptExecutor;
  static getInstance() {
    if (!ScriptExecutor.instance) {
      ScriptExecutor.instance = new ScriptExecutor();
    }
    return ScriptExecutor.instance;
  }

  public run(devices: string, fileName: string, script: string) {
    const ol = DeviceManager.getInstance().getOnlineDevices();

    if (ol.length === 0) {
      throw new Error('没有在线设备');
    }

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

  public stopAll(devices: string) {
    const ol = DeviceManager.getInstance().getOnlineDevices();

    if (ol.length === 0) {
      throw new Error('没有在线设备');
    }

    WebSocketManager.getInstance().broadcast({
      type: 'command',
      data: {
        command: 'stopAll'
      }
    });
  }
}