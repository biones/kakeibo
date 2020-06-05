import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import ElementUI from "element-ui";


Vue.config.productionTip = false



const firebaseConfig = {
  apiKey: "AIzaSyAuj1NTt9MyhGRv393WhQGqwHwD5HVVb6w",
  authDomain: "kakeibo9.firebaseapp.com",
  databaseURL: "https://kakeibo9.firebaseio.com",
  projectId: "kakeibo9",
  storageBucket: "kakeibo9.appspot.com",
  messagingSenderId: "175219230955",
  appId: "1:175219230955:web:fd8b8494d2b94ce5eb56ae",
  measurementId: "G-V0SNC3MWV0"
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


