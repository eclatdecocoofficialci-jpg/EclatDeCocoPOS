let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, category:"Savon", stock:10},
  {name:"Lotion Vanille", price:5000, category:"Lotion", stock:8}
];

let invoice = [];
let discount = 0;

let sales = JSON.parse(localStorage.getItem("sales")) || [];

let paymentMethod = "cash";
let checkoutMode = false;

let currentCalcResult = 0;

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

  let total = 0;

  invoice.forEach((i, index) => {

    let t = i.qty * i.price;
    total += t;

    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${i.name}</td>

      <td onclick="updateQty(${index})" style="cursor:pointer;color:#e91e63;font-weight:bold;">
        ${i.qty}
      </td>

      <td onclick="updatePrice(${index})" style="cursor:pointer;color:#7b1fa2;font-weight:bold;">
        ${i.price} FCFA
      </td>

      <td>${t} FCFA</td>
    `;

    table.appendChild(tr);
  });

  let delivery = parseFloat(document.getElementById("delivery")?.value);
  if(isNaN(delivery)) delivery = 0;

  let final = total + delivery;
  final = final - (final * discount / 100);

  document.getElementById("grand-total").innerText = final + " FCFA";
}

/* ================= EDIT QTY ================= */
function updateQty(index){

  let newQty = prompt("Nouvelle quantité:");
  if(newQty === null) return;

  newQty = parseInt(newQty);
  if(isNaN(newQty) || newQty <= 0) return;

  invoice[index].qty = newQty;
  renderInvoice();
}

/* ================= EDIT PRICE ================= */
function updatePrice(index){

  let newPrice = prompt("Nouveau prix:");
  if(newPrice === null) return;

  newPrice = parseFloat(newPrice);
  if(isNaN(newPrice) || newPrice <= 0) return;

  invoice[index].price = newPrice;
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
function setPayment(method){
  paymentMethod = method;
}

/* ================= MODE RAPIDE ================= */
function toggleCheckoutMode(){
  checkoutMode = !checkoutMode;
  alert(checkoutMode ? "⚡ Mode rapide activé" : "Mode normal");
}

/* ================= CALCULATRICE ================= */
function press(v){
  const d = document.getElementById("display");
  if(d) d.value += v;
}

function clearCalc(){
  const d = document.getElementById("display");
  if(d) d.value = "";
  currentCalcResult = 0;
}

function backspace(){
  const d = document.getElementById("display");
  if(d) d.value = d.value.slice(0, -1);
}

function calculate(){

  const d = document.getElementById("display");
  if(!d) return;

  try {
    currentCalcResult = Function("return " + d.value)();

    d.value = currentCalcResult;

    invoice.push({
      name: "Calculatrice",
      price: Number(currentCalcResult),
      qty: 1
    });

    renderInvoice();

  } catch(e){
    alert("Erreur calcul");
  }
}

/* ================= SAVE SALE ================= */
function saveSale(){

  let total = document.getElementById("grand-total")?.innerText || "0";

  let sale = {
    id: document.getElementById("invoice-id")?.innerText,
    date: document.getElementById("date")?.value,
    client: {
      name: document.getElementById("client-name")?.value,
      phone: document.getElementById("client-phone")?.value,
      address: document.getElementById("client-address")?.value
    },
    cart: invoice,
    discount: discount + "%",
    paymentMethod: paymentMethod,
    total: total
  };

  sales.push(sale);
  localStorage.setItem("sales", JSON.stringify(sales));

  invoice = [];
  discount = 0;

  renderInvoice();

  document.getElementById("invoice-id").innerText = generateInvoiceNumber();

  alert("💗 Vente enregistrée (" + paymentMethod + ")");
}

/* ================= KEYBOARD FIX ================= */
document.addEventListener("keydown", function(e){

  const display = document.getElementById("display");

  if(e.key === "Enter" && document.activeElement === display){
    calculate();
  }

  if(e.key === "Backspace" && document.activeElement === display){
    backspace();
  }
});

/* ================= SW ================= */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js");
  });
}
