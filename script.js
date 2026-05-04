let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, category:"Savon", stock:10},
  {name:"Lotion Vanille", price:5000, category:"Lotion", stock:8}
];

let invoice = [];
let discount = 0;
let sales = JSON.parse(localStorage.getItem("sales")) || [];

let paymentMethod = "cash";
let checkoutMode = false;

/* ================= INVOICE NUMBER ================= */
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

/* ================= DELIVERY LIVE ================= */
document.addEventListener("input", (e)=>{
  if(e.target.id === "delivery"){
    renderInvoice();
  }
});

/* ================= CATEGORIES ================= */
function renderCategories(){
  const box = document.getElementById("category-boxes");
  if(!box) return;

  const cats = [...new Set(products.map(p => p.category))];

  box.innerHTML = "";

  let all = document.createElement("div");
  all.className = "category";
  all.innerText = "Tous";
  all.onclick = renderProducts;
  box.appendChild(all);

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

  if(!val){
    renderProducts();
    return;
  }

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

  if(checkoutMode){
    saveSale();
    return;
  }

  renderInvoice();
}

/* ================= INVOICE ================= */
function renderInvoice(){
  const table = document.getElementById("invoice-body");
  if(!table) return;

  table.innerHTML = "";

  let subtotal = 0;

  invoice.forEach((i, index) => {
    let t = i.qty * i.price;
    subtotal += t;

    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i.name}</td>
      <td onclick="updateQty(${index})" style="cursor:pointer;color:#e91e63;font-weight:bold;">${i.qty}</td>
      <td onclick="updatePrice(${index})" style="cursor:pointer;color:#7b1fa2;font-weight:bold;">${i.price}</td>
      <td>${t}</td>
    `;

    table.appendChild(tr);
  });

  let delivery = Number(document.getElementById("delivery")?.value || 0);

  let subTotal = subtotal;
  let total = subTotal + delivery;

  total = total - (total * discount / 100);

  document.getElementById("grand-total").innerText =
    Math.round(total) + " FCFA";

  // remise UI
  const disc = document.getElementById("discount-value");
  if(disc) disc.innerText = discount + "%";
}

/* ================= EDIT ================= */
function updateQty(i){
  let v = parseInt(prompt("Quantité"));
  if(v > 0) invoice[i].qty = v;
  renderInvoice();
}

function updatePrice(i){
  let v = parseFloat(prompt("Prix"));
  if(v > 0) invoice[i].price = v;
  renderInvoice();
}

/* ================= DISCOUNT ================= */
function setDiscount(p){
  discount = p;
  renderInvoice();
}
function discount20(){ setDiscount(20); }
function discount50(){ setDiscount(50); }

/* ================= PAYMENT ================= */
function selectPayment(el, method){
  paymentMethod = method;

  document.querySelectorAll(".pay-btn").forEach(b=>{
    b.classList.remove("active");
  });

  el.classList.add("active");
}

/* ================= CALCULATOR ================= */
function calculate(){
  const d = document.getElementById("display");
  if(!d) return;

  try{
    let res = Function("return " + d.value)();

    invoice.push({
      name:"Calculatrice",
      price:Number(res),
      qty:1
    });

    d.value = res;
    renderInvoice();

  }catch(e){
    alert("Erreur calcul");
  }
}

/* ================= SAVE ================= */
function saveSale(){

  let sale = {
    id: document.getElementById("invoice-id")?.innerText,
    date: document.getElementById("date")?.value,
    client:{
      name:document.getElementById("client-name")?.value,
      phone:document.getElementById("client-phone")?.value,
      address:document.getElementById("client-address")?.value
    },
    cart:invoice,
    discount:discount + "%",
    paymentMethod:paymentMethod,
    delivery:Number(document.getElementById("delivery")?.value || 0),
    total:document.getElementById("grand-total")?.innerText
  };

  sales.push(sale);
  localStorage.setItem("sales", JSON.stringify(sales));

  invoice = [];
  discount = 0;

  renderInvoice();

  document.getElementById("invoice-id").innerText = generateInvoiceNumber();

  const del = document.getElementById("delivery");
  if(del) del.value = "";

  alert("💗 Vente enregistrée (" + paymentMethod + ")");
}

/* ================= PRINT (IMPORTANT FIX) ================= */
function printInvoice(){
  window.print();
}

/* ================= SW ================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
