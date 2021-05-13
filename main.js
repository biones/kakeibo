import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import ElementUI from "element-ui";


Vue.config.productionTip = false



const firebaseConfig = {

};
import firebase from 'firebase'
import 'firebase/firestore'
firebase.initializeApp(firebaseConfig)


new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')


