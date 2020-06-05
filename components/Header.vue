<template>
  <v-app-bar>
    シンプル家計簿
    <div style="margin-left:auto;">
      <div v-if="user">
        login as {{ dispname }}
        <v-btn small v-on:click="doLogout">logout</v-btn>
      </div>
      <div v-else>
        <v-btn small v-on:click="doLogin">login</v-btn>
      </div>
    </div>
  </v-app-bar>
</template>

<script>
import firebase from "firebase";

export default {
  name: "Header",
  //props:["user"],
  data() {
    return {
      user: null,
      dispname: null,
    };
  },
  created() {
    firebase.auth().onAuthStateChanged((luser) => {
      console.log(luser);
      //this.user = user ? user: {}
      if (!luser) return false;
      this.user = luser;
      this.dispname = this.user.email;
    });
  },
  methods: {
    // ログイン処理
    doLogin() {
      //const provider = new firebase.auth.TwitterAuthProvider()
      var provider = new firebase.auth.GoogleAuthProvider();
      console.log("dologin");
      //provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      firebase
        .auth()
        .signInWithPopup(provider)
        .then(function(result) {
          // This gives you a Google Access Token. You can use it to access the Google API.
          var token = result.credential.accessToken;
          // The signed-in user info.

          function sleep(waitMsec) {
            var startMsec = new Date();

            // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
            while (new Date() - startMsec < waitMsec);
          }

          console.log("then");
          firebase.auth().onAuthStateChanged((user) => {
            console.log(user);
            firebase
              .firestore()
              .collection("users")
              .doc(user.uid)
              .set({ displayName: user.displayName }, { merge: true });

            sleep(10)
            window.location.reload()
          });
        })
        .catch(function(error) {
          // Handle Errors here.
          console.log(error);
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
    },
    // ログアウト処理
    doLogout() {
      firebase.auth().signOut();
    },
  },
};
</script>
