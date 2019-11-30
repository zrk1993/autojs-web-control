import moment from 'moment';
const MyPlugin = {};

MyPlugin.install = function(Vue, options) {
  Vue.filter('time', function(value) {
    if (!value) return '';
    return moment(value).format('YY-MM-DD HH:mm:ss');
  });
};

export default MyPlugin;
