import Vue from 'vue';

import 'normalize.css/normalize.css'; // A modern alternative to CSS resets

import ElementUI from 'element-ui';
import { Message } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import locale from 'element-ui/lib/locale/lang/en'; // lang i18n

import '@/styles/index.scss'; // global css

import App from './App';
import store from './store';
import router from './router';
import WebSocketClientManager from './WebSocketClientManager';
import autoHeight from './utils/auto-height';

import '@/icons'; // icon
import '@/permission'; // permission control

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online! ! !
 */
// import { mockXHR } from '../mock'
// if (process.env.NODE_ENV === 'production') {
//   mockXHR();
// }

// set ElementUI lang to EN
Vue.use(ElementUI, { locale });
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.directive('auto-height', autoHeight);

Vue.config.productionTip = false;

WebSocketClientManager.getInstance().addConnectStatusListener((status) => {
  Message({
    message: 'websocket connect status : ' + status,
    type: status === 'connect' ? 'success' : 'info',
    duration: 5 * 1000
  });
});

WebSocketClientManager.getInstance().addMessageListener((msg) => {
  if (msg.type === 'log') {
    console.log(msg.data.device.device_name + msg.data.log);
  }
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
