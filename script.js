let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, category:"Savon", stock:10},
  {name:"Lotion Vanille", price:5000, category:"Lotion", stock:8}
];

let invoice = [];
let discount = 0;

/* ================= FACTURE NUMBER ================= */
function generateInvoiceNumber(){
  let last = localStorage.getItem("invoiceNumber");
  last = last ? parseInt(last) + 1 : 1;
  localStorage.setItem("invoiceNumber", last);
  return "2026" + String(last).padStart(3,"0");
}

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", () => {

  const inv = document.getElementById("invoice-id");
  if(inv) inv.innerText = generateInvoiceNumber();

  renderCategories();
  renderProducts();
  renderInvoice();
});

/* ================= CATEGORIES ================= */
function renderCategories(){
  const box = document.getElementById("category-boxes");
  if(!box) return;

  const cats = [...new Set(products.map(p => p.category))];

  box.innerHTML = "";

  cats.forEach(cat => {
    let div = document.createElement("div");
    div.className = "category";
    div.innerText = cat;

    div.onclick = () => filterByCategory(cat);

    box.appendChild(div);
  });
}

function filterByCategory(cat){
  const list = document.getElementById("product-list");
  if(!list) return;

  list.innerHTML = "";
  products
    .filter(p => p.category === cat)
    .forEach(renderProduct);
}

/* ================= PRODUCTS ================= */
function renderProducts(){
  const list = document.getElementById("product-list");
  if(!list) return;

  list.innerHTML = "";
  products.forEach(renderProduct);
}

function renderProduct(p){
  const list = document.getElementById("product-list");
  if(!list) return;

  let div = document.createElement("div");
  div.className = "product";

  div.innerHTML = `
    <strong>${p.name}</strong><br>
    ${p.price} FCFA<br>
    Stock: ${p.stock ?? 0}
  `;

  div.onclick = () => addToCart(p.name, p.price);

  list.appendChild(div);
}

/* ================= SEARCH ================= */
function searchProduct(){
  const val = document.getElementById("search")?.value.toLowerCase();
  const list = document.getElementById("product-list");
  if(!list) return;

  list.innerHTML = "";

  products
    .filter(p => p.name.toLowerCase().includes(val))
    .forEach(renderProduct);
}

/* ================= CART ================= */
function addToCart(name, price){

  let item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  } else {
    invoice.push({name, price, qty:1});
  }

  renderInvoice();
}

/* ================= RENDER INVOICE ================= */
function renderInvoice(){

  const table = document.getElementById("invoice-body");
  if(!table) return;

  table.innerHTML = "";

  let total = 0;

  invoice.forEach(i => {
    let t = i.qty * i.price;
    total += t;

    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${t} FCFA</td>
    `;

    table.appendChild(tr);
  });

  let delivery = parseFloat(document.getElementById("delivery")?.value) || 0;
  total += delivery;

  let final = total - (total * discount / 100);

  const grand = document.getElementById("grand-total");
  if(grand){
    grand.innerText = final + " FCFA";
  }
}

/* ================= SAVE SALE ================= */
function saveSale(){

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  let data = {
    id: document.getElementById("invoice-id")?.innerText,
    date: document.getElementById("date")?.value,
    client: {
      name: document.getElementById("client-name")?.value,
      phone: document.getElementById("client-phone")?.value,
      address: document.getElementById("client-address")?.value
    },
    cart: invoice,
    total: document.getElementById("grand-total")?.innerText
  };

  sales.push(data);

  localStorage.setItem("sales", JSON.stringify(sales));

  // reset
  invoice = [];
  renderInvoice();

  const inv = document.getElementById("invoice-id");
  if(inv) inv.innerText = generateInvoiceNumber();

  alert("💗 Facture sauvegardée avec succès");
}

/* ================= CALCULATOR ================= */
function press(v){
  const d = document.getElementById("display");
  if(d) d.value += v;
}

function clearCalc(){
  const d = document.getElementById("display");
  if(d) d.value = "";
}

function calculate(){
  const d = document.getElementById("display");
  if(!d) return;

  try{
    d.value = Function("return " + d.value)();
  } catch(e){
    alert("Erreur calcul");
  }
}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js", { scope: "/" })
      .then(() => console.log("SW OK"))
      .catch(() => console.log("SW ERROR"));
  });
}
