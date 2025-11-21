// admin.js
// Needs firebase SDK loaded in firebase-config.js
async function initAdmin(){
  if(!window.firebaseApp){ console.warn("Firebase não configurado"); return; }
  const auth = firebase.auth();
  const db = firebase.firestore();

  auth.onAuthStateChanged(user=>{
    if(!user){ window.location.href = "login.html"; return; }
    loadProducts();
  });

  document.getElementById("addProd").onclick = async ()=>{
    const t = document.getElementById("pTitle").value;
    const d = document.getElementById("pDesc").value;
    const p = parseFloat(document.getElementById("pPrice").value);
    if(!t||!d||isNaN(p)) return alert("Preencha todos os campos.");
    await db.collection("products").add({title:t,desc:d,price:p,created:Date.now()});
    document.getElementById("pTitle").value="";
    document.getElementById("pDesc").value="";
    document.getElementById("pPrice").value="";
    loadProducts();
  };

  document.getElementById("signOut").onclick = ()=> auth.signOut();
}

async function loadProducts(){
  const db = firebase.firestore();
  const list = document.getElementById("prodList");
  list.innerHTML = "<p>Carregando...</p>";
  const snap = await db.collection("products").orderBy("created","desc").get();
  list.innerHTML = "";
  snap.forEach(doc=>{
    const d = doc.data();
    const el = document.createElement("div");
    el.className="card";
    el.innerHTML = `<h3>${d.title}</h3><p>${d.desc}</p><p>${d.price}</p>
      <button data-id="${doc.id}" class="del">Excluir</button>`;
    list.appendChild(el);
  });
  document.querySelectorAll(".del").forEach(b=>{
    b.onclick = async ()=>{ await firebase.firestore().collection("products").doc(b.dataset.id).delete(); loadProducts(); };
  });
}

window.addEventListener("load", initAdmin);
