import request from '@/utils/request';

const state = {
  list: [],
};

const mutations = {
  UPDATE_ONLINES: (state, devices) => {
    state.list = devices;
  }
};

const actions = {
  updateOnlineDevices({ commit }) {
    request({
      url: "/device/get_device_list",
      method: "get",
      params: {}
    }).then(res => {
      commit('UPDATE_ONLINES', res.data.devices);
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
