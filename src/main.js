import Vue from 'vue'
import App from './App.vue'
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import VueRouter from 'vue-router';

Vue.use(VueRouter);
Vue.config.productionTip = false
Vue.use(iView);
new Vue({
  render: h => h(App),
}).$mount('#app')
