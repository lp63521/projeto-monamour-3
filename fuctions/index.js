// functions/index.js (Node 18+)
// Instale: npm i stripe firebase-admin firebase-functions
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret); // configure via firebase functions:config:set stripe.secret="sk_..."

admin.initializeApp();

exports.createCheckout = functions.https.onRequest(async (req,res)=>{
  try{
    const { items } = req.body;
    // Map items to Stripe line_items
    const line_items = items.map(i=>({
      price_data:{
        currency: 'brl',
        product_data:{ name: i.title },
        unit_amount: Math.round(i.price*100)
      },
      quantity: i.q
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: 'https://lp63521.github.io/monamour-secrets?success=1',
      cancel_url: 'https://lp63521.github.io/monamour-secrets?cancel=1'
    });
    res.json({ sessionId: session.id });
  }catch(e){
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
