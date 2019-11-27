import { getToken } from '@/utils/auth';
const wshost = process.env.VUE_APP_WS_HOST;

export default class WebSocketManager {
  static instance = null;

  constructor() {
    this.messageListeners = [];
    this.connectStatusListeners = [];
    this.connect();
  }

  static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  connect() {
    console.log('WebSocketManager 正在连接 -> ' + wshost);
    this.ws = new WebSocket(`${wshost}?token=${getToken()}`);

    this.ws.onopen = () => {
      console.log('WebSocketManager 连接成功！');
      this.connectStatusListeners.forEach((listener) => {
        listener('connect');
      });
    };

    this.ws.onmessage = (e) => {
      this.messageListeners.forEach((listener) => {
        listener(JSON.parse(e.data));
      });
    };

    this.ws.onclose = () => {
      console.warn('WebSocketManager 连接断开！3s后自动重连');
      this.connectStatusListeners.forEach((listener) => {
        listener('close');
      });
      setTimeout(() => {
        this.connect();
      }, 3 * 1000);
    };

    this.ws.onerror = (err) => {
      console.error(err);
      this.connectStatusListeners.forEach((listener) => {
        listener('error');
      });
    };
  }

  sendMessage(msg) {
    this.ws.send(JSON.stringify(msg));
  }

  addMessageListener(listener) {
    this.messageListeners.push(listener);
  }

  removeMessageListener(listener) {
    let i = this.messageListeners.length;
    while (i--) {
      if (this.messageListeners[i] === listener) {
        this.messageListeners.splice(i, 1);
      }
    }
  }

  addConnectStatusListener(listener) {
    this.connectStatusListeners.push(listener);
  }

  removeConnectStatusListener(listener) {
    let i = this.connectStatusListeners.length;
    while (i--) {
      if (this.connectStatusListeners[i] === listener) {
        this.connectStatusListeners.splice(i, 1);
      }
    }
  }
}
