let cart = [];
let orderNumber = generateOrderNumber();
let currentDate = new Date().toISOString().split("T")[0];

let products = JSON.parse(localStorage.getItem("products")) || [];
let discount = 0;

const subtotalEl = document.getElementById("subtotal");
const totalFinalEl = document.getElementById("total-final");
const deliveryInput = document.getElementById("delivery");
const invoiceDateInput = document.getElementById("invoice-date");
const invoiceIdEl = document.getElementById("invoice-id");

const searchInput = document.getElementById("search");
const resultsBox = document.getElementById("results");

// ===== INIT =====
invoiceIdEl.innerText = orderNumber;
invoiceDateInput.value = currentDate;
updateInvoice();

// ===== SEARCH PRODUITS =====
if(searchInput){
searchInput.addEventListener("input", () => {
  let val = searchInput.value.toLowerCase();
  resultsBox.innerHTML = "";

  let found = products.filter(p =>
    p.name.toLowerCase().includes(val) ||
    p.code.toLowerCase().includes(val)
  );

  found.forEach(p=>{
    let div = document.createElement("div");
    div.className = "result";
    div.innerText = `${p.code} - ${p.name} (${p.price} FCFA)`;

    div.onclick = () => addToCart(p.name, 1, p.price);

    resultsBox.appendChild(div);
  });
});
}

// ===== AJOUT AU PANIER =====
function addToCart(name, qty, price){
  let existing = cart.find(p => p.name === name);

  if(existing){
    existing.qty += qty;
  } else {
    cart.push({name, qty, price});
  }

  updateInvoice();
}

// ===== UPDATE FACTURE =====
function updateInvoice(){
  const tbody = document.querySelector(".right-panel tbody");
  tbody.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item, i)=>{
    let total = item.qty * item.price;
    subtotal += total;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price.toLocaleString()} FCFA</td>
      <td>${total.toLocaleString()} FCFA</td>
      <td><button onclick="removeItem(${i})">X</button></td>
    `;
    tbody.appendChild(tr);
  });

  if(cart.length === 0){
    tbody.innerHTML = `<tr><td colspan="5">Aucun article</td></tr>`;
  }

  let delivery = parseInt(deliveryInput.value) || 0;

  let total = subtotal + delivery;
  let final = total - (total * discount / 100);

  subtotalEl.innerText = subtotal.toLocaleString() + " FCFA";
  totalFinalEl.innerText = final.toLocaleString() + " FCFA";
}

// ===== SUPPRIMER =====
function removeItem(index){
  cart.splice(index,1);
  updateInvoice();
}

// ===== LIVRAISON =====
deliveryInput.addEventListener("input", updateInvoice);

// ===== REMISE =====
function setDiscount(p){
  discount = p;
  updateInvoice();
}

// ===== PRINT =====
document.getElementById("print-btn").addEventListener("click", ()=>{
  window.print();
});

// ===== SAVE =====
document.getElementById("save-btn").addEventListener("click", ()=>{
  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  let delivery = parseInt(deliveryInput.value) || 0;
  let subtotal = cart.reduce((a,b)=>a + b.qty*b.price,0);
  let total = subtotal + delivery;
  let final = total - (total * discount / 100);

  sales.push({
    id: orderNumber,
    date: invoiceDateInput.value,
    cart,
    delivery,
    discount,
    total: final
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  alert("Facture sauvegardée !");

  cart = [];
  discount = 0;
  orderNumber = generateOrderNumber();

  invoiceIdEl.innerText = orderNumber;
  deliveryInput.value = "";
  updateInvoice();
});

// ===== NUMBER =====
function generateOrderNumber(){
  let year = new Date().getFullYear();
  let last = parseInt(localStorage.getItem("lastInvoice")) || 0;
  last++;
  localStorage.setItem("lastInvoice", last);
  return `${year}${String(last).padStart(3,"0")}`;
}
