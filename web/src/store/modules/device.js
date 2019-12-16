import request from '@/utils/request';

const state = {
  list: [],
  category: []
};

const mutations = {
  UPDATE_ONLINES: (state, devices) => {
    state.list = devices;
    state.category = [];
    state.list.forEach((it) => {
      if (!state.category.includes(it.category)) {
        state.category.push(it.category);
      }
    });
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
