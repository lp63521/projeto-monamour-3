// app.js
const PRODUCTS_SRC = "products.json"; // fallback to file or Firestore if configured

let PRODUCTS = [];
const cart = JSON.parse(localStorage.getItem("ms_cart")||"[]");

function formatBRL(v){ return v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }

async function loadProducts(){
  try{
    const r = await fetch(PRODUCTS_SRC);
    PRODUCTS = await r.json();
  }catch(e){
    PRODUCTS = []; console.error("Erro ao carregar produtos",e);
  }
  renderProducts();
  updateCartCount();
}

function renderProducts(){
  const grid = document.getElementById("productsGrid");
  grid.innerHTML = "";
  PRODUCTS.forEach(p=>{
    const el = document.createElement("div");
    el.className="card";
    el.innerHTML = `<h3>${p.title}</h3><p>${p.desc}</p><p style="margin-top:12px;font-weight:700">${formatBRL(p.price)}</p>
      <button class="add-to-cart" data-id="${p.id}">Adicionar ao carrinho</button>`;
    grid.appendChild(el);
  });
  document.querySelectorAll(".add-to-cart").forEach(btn=>{
    btn.onclick = ()=>{ addToCart(btn.dataset.id); };
  });
}

function addToCart(id){
  const prod = PRODUCTS.find(p=>p.id===id);
  if(!prod) return;
  const existing = cart.find(i=>i.id===id);
  if(existing) existing.q++;
  else cart.push({id:prod.id,title:prod.title,price:prod.price,q:1});
  saveCart();
  updateCartCount();
  alert("Adicionado ao carrinho");
}

function saveCart(){ localStorage.setItem("ms_cart", JSON.stringify(cart)); }

function updateCartCount(){ document.getElementById("cartCount").textContent = cart.reduce((s,i)=>s+i.q,0); }

document.getElementById("cartBtn").onclick = showCart;
document.getElementById("closeCart").onclick = ()=>document.getElementById("cartModal").classList.add("hidden");
document.getElementById("clearCart").onclick = ()=>{ cart.length=0; saveCart(); renderCart(); updateCartCount(); };
document.getElementById("toCheckout").onclick = ()=>{ document.getElementById("cartModal").classList.add("hidden"); window.location.href="#contato"; };

function showCart(){
  renderCart();
  document.getElementById("cartModal").classList.remove("hidden");
}

function renderCart(){
  const out = document.getElementById("cartItems");
  out.innerHTML = "";
  if(cart.length===0) { out.innerHTML = "<p>Seu carrinho está vazio.</p>"; document.getElementById("cartTotal").textContent = formatBRL(0); return; }
  let total = 0;
  cart.forEach(item=>{
    total += item.price * item.q;
    const div = document.createElement("div");
    div.style.display="flex";div.style.justifyContent="space-between";div.style.marginBottom="8px";
    div.innerHTML = <div>${item.title} <span style="opacity:0.8">x${item.q}</span></div><div>${formatBRL(item.price*item.q)}</div>;
    out.appendChild(div);
  });
  document.getElementById("cartTotal").textContent = formatBRL(total);
}

// CHECKOUT: WhatsApp fallback
document.getElementById("checkoutWhats").onclick = () => {
  const name = document.getElementById("custName").value || "Cliente";
  const phone = document.getElementById("custPhone").value || "";
  if(cart.length===0){ alert("Carrinho vazio"); return; }
  let text = Olá, sou ${name}%0AQuero comprar:%0A;
  cart.forEach(i=> text += - ${i.title} x${i.q} => ${formatBRL(i.price*i.q)}%0A);
  text += %0ATotal: ${formatBRL(cart.reduce((s,i)=>s+i.q*i.price,0))}%0ATelefone: ${phone};
  const wa = https://wa.me/55${phone.replace(/\D/g,"")}?text=${text};
  window.open(wa,"_blank");
};

// PIX fallback (simple copy text)
const PIX_KEY = "00000000-0000-0000-0000-000000000000"; // replace in config or admin
document.getElementById("checkoutPix").onclick = ()=>{
  if(cart.length===0){ alert("Carrinho vazio"); return; }
  const total = cart.reduce((s,i)=>s+i.q*i.price,0);
  const instr = Total: ${formatBRL(total)}\nChave Pix: ${PIX_KEY}\nEnvie o comprovante via WhatsApp.;
  navigator.clipboard?.writeText(instr).then(()=> alert("Instruções Pix copiadas. Envie comprovante via WhatsApp.") );
};

// Stripe checkout (calls backend function)
document.getElementById("checkoutStripe").onclick = async ()=>{
  if(cart.length===0){ alert("Carrinho vazio"); return; }
  // Try to call serverless endpoint (Firebase Functions) at /create-checkout-session
  try{
    const res = await fetch("/.netlify/functions/createCheckout", { // placeholder: depends on deployment
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({items:cart})
    });
    const j = await res.json();
    if(j.sessionId){
      // redirect to stripe checkout (frontend-only flow requires Stripe.js + public key)
      const stripePublicKey = window.STRIPE_PUBLIC_KEY || "";
      if(!stripePublicKey){ alert("Stripe não configurado no front-end."); return; }
      const stripe = Stripe(stripePublicKey);
      stripe.redirectToCheckout({ sessionId: j.sessionId });
    } else {
      alert("Erro ao criar sessão de pagamento. Usar WhatsApp como alternativa.");
    }
  }catch(e){
    console.error(e);
    alert("Backend de pagamento não disponível. Use WhatsApp/Pix.");
  }
};

window.addEventListener("load", loadProducts);
