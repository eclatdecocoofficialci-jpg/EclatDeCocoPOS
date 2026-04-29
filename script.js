let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, category:"Savon"},
  {name:"Lotion Vanille", price:5000, category:"Lotion"}
];

let invoice = [];
let discount = 0;

/* ================= INVOICE NUMBER ================= */
function generateInvoiceNumber(){
  let last = localStorage.getItem("invoiceNumber");
  last = last ? parseInt(last) + 1 : 1;
  localStorage.setItem("invoiceNumber", last);

  return "2026" + String(last).padStart(3, "0");
}

/* ================= INIT ================= */
window.addEventListener("DOMContentLoaded", () => {

  const inv = document.getElementById("invoice-id");
  if(inv) inv.innerText = generateInvoiceNumber();

  applyLang();
  renderInvoice();
});

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

  let table = document.getElementById("invoice-body");
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

  let deliveryEl = document.getElementById("delivery");
  let delivery = deliveryEl ? parseFloat(deliveryEl.value) || 0 : 0;

  total += delivery;

  let final = total - (total * discount / 100);

  let grand = document.getElementById("grand-total");
  if(grand){
    grand.innerText = formatMoney(final);
  }
}

/* ================= DISCOUNT ================= */
function setDiscount(p){
  discount = p;
  renderInvoice();
}

/* ================= SAVE SALE (OFFLINE SAFE) ================= */
function saveSale(){

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  const data = {
    id: document.getElementById("invoice-id")?.innerText || "",
    date: document.getElementById("date")?.value || "",
    client: {
      name: document.getElementById("client-name")?.value || "",
      phone: document.getElementById("client-phone")?.value || "",
      address: document.getElementById("client-address")?.value || ""
    },
    cart: invoice,
    total: document.getElementById("grand-total")?.innerText || "0"
  };

  sales.push(data);
  localStorage.setItem("sales", JSON.stringify(sales));

  // reset
  invoice = [];
  renderInvoice();

  const inv = document.getElementById("invoice-id");
  if(inv) inv.innerText = generateInvoiceNumber();

  alert("💗 Facture sauvegardée");
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
  }catch(e){
    alert("Erreur calcul");
  }
}

/* ================= DELIVERY LIVE UPDATE ================= */
const deliveryInput = document.getElementById("delivery");
if(deliveryInput){
  deliveryInput.addEventListener("input", renderInvoice);
}

/* ================= LANGUAGE SYSTEM ================= */
let lang = localStorage.getItem("lang") ||
  (navigator.language.startsWith("fr") ? "fr" : "en");

let currency = localStorage.getItem("currency") || "FCFA";

const translations = {
  fr: {
    products
