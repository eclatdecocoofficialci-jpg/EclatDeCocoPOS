// ===== VARIABLES =====
let cart = [];
let orderNumber = generateOrderNumber();
let currentDate = new Date().toISOString().split('T')[0];

const subtotalEl = document.getElementById("subtotal");
const totalFinalEl = document.getElementById("total-final");
const deliveryInput = document.getElementById("delivery");
const invoiceDateInput = document.getElementById("invoice-date");
const invoiceIdEl = document.getElementById("invoice-id");
const productsListEl = document.getElementById("products-list");

// ===== INITIALISATION =====
invoiceIdEl.innerText = orderNumber;
invoiceDateInput.value = currentDate;
updateInvoice();

// ===== PRODUITS (exemple statique, tu peux ajouter dynamiquement) =====
const products = [
  {code:'SA001', name:'Rose Vanille', price:3000, category:'Savon'},
  {code:'SA002', name:'Velours de café', price:3000, category:'Savon'}
];

function renderProducts(filter=''){
  productsListEl.innerHTML = '';
  const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || p.category.toLowerCase().includes(filter.toLowerCase()));
  filtered.forEach(p=>{
    const card = document.createElement('div');
    card.className='product-card';
    card.innerHTML=`
      <div><strong>${p.name}</strong><br><small>${p.category}</small></div>
      <div>
        <span><strong>${p.price.toLocaleString()} FCFA</strong></span>
        <input type="number" value="1" style="width:60px;">
        <button>Add</button>
      </div>
    `;
    card.querySelector('button').addEventListener('click', ()=>{
      const qty=parseInt(card.querySelector('input').value);
      addToCart(p.name,qty,p.price);
    });
    productsListEl.appendChild(card);
  });
}
renderProducts();

// ===== RECHERCHE PRODUITS =====
document.getElementById("search-product").addEventListener('input', e=>{
  renderProducts(e.target.value);
});

// ===== AJOUT AU PANIER =====
function addToCart(name, qty, price){
  const existing = cart.find(p=>p.name===name);
  if(existing){ existing.qty+=qty; } 
  else{ cart.push({name, qty, price}); }
  updateInvoice();
}

// ===== GESTION FACTURE =====
function updateInvoice(){
  const tbody=document.querySelector(".right-panel tbody");
  tbody.innerHTML='';
  let subtotal=0;

  cart.forEach((item,i)=>{
    const total=item.qty*item.price;
    subtotal+=total;
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${item.name}</td><td>${item.qty}</td><td>${item.price.toLocaleString()} FCFA</td><td>${total.toLocaleString()} FCFA</td><td><button onclick="removeItem(${i})">X</button></td>`;
    tbody.appendChild(tr);
  });

  if(cart.length===0){
    const row=document.createElement('tr');
    row.innerHTML=`<td colspan="5">Aucun article</td>`;
    tbody.appendChild(row);
  }

  const delivery=parseInt(deliveryInput.value)||0;
  subtotalEl.innerText=`${subtotal.toLocaleString()} FCFA`;
  totalFinalEl.innerText=`${(subtotal+delivery).toLocaleString()} FCFA`;
}

// ===== RETIRER ITEM =====
function removeItem(i){ cart.splice(i,1); updateInvoice(); }

// ===== LIVRAISON =====
deliveryInput.addEventListener("input", updateInvoice);

// ===== IMPRIMER =====
document.getElementById("print-btn").addEventListener("click", ()=>{
  updateInvoice();
  window.print();
});

// ===== SAUVEGARDER =====
document.getElementById("save-btn").addEventListener("click", ()=>{
  const invoiceDate=invoiceDateInput.value||currentDate;
  let sales=JSON.parse(localStorage.getItem("sales")||"[]");
  sales.push({
    id:orderNumber,
    date:invoiceDate,
    cart,
    delivery:parseInt(deliveryInput.value)||0,
    total: cart.reduce((acc,i)=>acc+i.qty*i.price,0)+(parseInt(deliveryInput.value)||0)
  });
  localStorage.setItem("sales",JSON.stringify(sales));
  alert(`Facture ${orderNumber} sauvegardée !`);

  cart=[];
  orderNumber=generateOrderNumber();
  invoiceIdEl.innerText=orderNumber;
  invoiceDateInput.value=currentDate;
  deliveryInput.value="";
  updateInvoice();
});

// ===== GENERATION NUMERO FACTURE =====
function generateOrderNumber(){
  const year=new Date().getFullYear();
  const lastNumber=parseInt(localStorage.getItem("lastInvoice")||0);
  const nextNumber=lastNumber+1;
  localStorage.setItem("lastInvoice",nextNumber);
  return `${year}${String(nextNumber).padStart(2,'0')}`;
}

// ===== CALCULATRICE =====
const display=document.getElementById("calc-display");
let calcValue="";
document.querySelectorAll(".calc-grid button").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const val=btn.innerText;
    if(val==="C"){ calcValue=""; display.value="0"; return;}
    if(val==="="){
      try{ display.value=eval(calcValue.replace("×","*").replace("÷","/")); calcValue=display.value; }
      catch(e){ display.value="Erreur"; calcValue=""; }
      return;
    }
    calcValue+=val; display.value=calcValue;
  });
});
