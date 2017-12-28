import Vue from 'vue';
import Vuex from 'vuex';

import modules from './modules';

Vue.use(Vuex);

if (process.env.NODE_ENV !== 'production') {
  require('vue-devtools').install();
}

export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production',
});
