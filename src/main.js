import Vue from 'vue';
import App from './App.vue';
import './mathlive/mathlive.min';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');

