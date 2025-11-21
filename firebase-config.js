<!-- firebase-config.js -->
<script>
/*
  Coloque este arquivo como JS que define as libs Firebase.
  Substitua os valores do objeto firebaseConfig com os dados do seu projeto Firebase.
  Exemplo:
  const firebaseConfig = {
    apiKey: "AKIAXXX",
    authDomain: "monamoursecrets.firebaseapp.com",
    projectId: "monamoursecrets",
    storageBucket: "monamoursecrets.appspot.com",
    messagingSenderId: "xxxxx",
    appId: "1:xxxxx:web:xxxxx"
  };
*/
window.firebaseApp = false;
(function(){
  // carregue o SDK do Firebase (CDN)
  const s = document.createElement("script");
  s.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"; s.onload = init;
  document.head.appendChild(s);
  function init(){
    const a = document.createElement("script");
    a.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"; a.onload = ()=>{};
    document.head.appendChild(a);
    const b = document.createElement("script");
    b.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"; b.onload = ()=>{};
    document.head.appendChild(b);
    b.onload = () => { setup(); };
  }
  function setup(){
    // TODO: substitua este objeto com suas credenciais do Firebase
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
    window.firebaseApp = true;
    window.firebase = firebase;
    // opcional: deixar key pública do Stripe aqui
    window.STRIPE_PUBLIC_KEY = ""; // preencha se usar Stripe
  }
})();
</script>
