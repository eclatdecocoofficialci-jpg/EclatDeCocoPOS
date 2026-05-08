let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, stock:10, category:"Savon"},
  {name:"Savon Coco", price:3500, stock:8, category:"Savon"},
  {name:"Lotion Vanille", price:5000, stock:5, category:"Lotion"},
  {name:"Beurre Karité", price:4000, stock:7, category:"Beurre"}
];

let invoice = [];
let activeCategory = "ALL";
let paymentMethod = "cash";
let currentTotal = 0;

/* ================= INVOICE ID ================= */
let lastInvoiceId = Number(localStorage.getItem("invoice_id") || 20206000);

function generateInvoiceId(){
  const el = document.getElementById("invoice-id");
  if(el) el.innerText = lastInvoiceId;
}

/* ================= DATE ================= */
function setInvoiceDate(){
  const el = document.getElementById("date");
  if(el){
    const d = new Date();
    el.value = d.toISOString().split("T")[0];
  }
}

/* ================= PRODUCTS ================= */
function loadCategories(){
  const box = document.getElementById("category-boxes");
  if(!box) return;

  const categories = [...new Set(products.map(p => p.category))];

  box.innerHTML =
    `<div class="pink-box" onclick="showAll()">ALL</div>` +
    categories.map(cat =>
      `<div class="pink-box" onclick="filterProducts('${cat}')">${cat}</div>`
    ).join("");
}

function showAll(){
  activeCategory = "ALL";
  renderProducts(products);
}

function filterProducts(cat){
  activeCategory = cat;
  renderProducts(products.filter(p => p.category === cat));
}

function searchProducts(v){
  const value = v.toLowerCase();

  let base = activeCategory === "ALL"
    ? products
    : products.filter(p => p.category === activeCategory);

  renderProducts(base.filter(p => p.name.toLowerCase().includes(value)));
}

function renderProducts(list){
  const box = document.getElementById("product-list");
  if(!box) return;

  box.innerHTML = list.map(p => `
    <div class="pink-box" onclick="addToInvoice('${p.name}', ${p.price})">
      <strong>${p.name}</strong><br>
      💰 ${p.price} FCFA<br>
      📦 ${p.stock}
    </div>
  `).join("");
}

/* ================= INVOICE ================= */
function addToInvoice(name, price){

  const item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  } else {
    invoice.push({name, price, qty:1});
  }

  renderInvoice();
}

function renderInvoice(){

  const body = document.getElementById("invoice-body");
  if(!body) return;

  body.innerHTML = invoice.map((i,index)=>`
    <tr>
      <td>${i.name}</td>
      <td><input type="number" value="${i.qty}" onchange="updateQty(${index},this.value)"></td>
      <td><input type="number" value="${i.price}" onchange="updatePrice(${index},this.value)"></td>
      <td>${i.qty * i.price}</td>
      <td><button onclick="removeItem(${index})">❌</button></td>
    </tr>
  `).join("");

  updateTotal();
}

/* ================= UPDATE ================= */
function updateQty(i,v){
  invoice[i].qty = Math.max(1, Number(v));
  renderInvoice();
}

function updatePrice(i,v){
  invoice[i].price = Number(v);
  renderInvoice();
}

function removeItem(i){
  invoice.splice(i,1);
  renderInvoice();
}

/* ================= TOTAL ================= */
function updateTotal(){

  let total = 0;

  invoice.forEach(i=>{
    total += i.qty * i.price;
  });

  const delivery = Number(document.getElementById("delivery")?.value || 0);

  currentTotal = total + delivery;

  const display = document.getElementById("grand-total");
  if(display){
    display.innerText = currentTotal + " FCFA";
  }

  return currentTotal;
}

/* ================= PAYMENT ================= */
function selectPayment(el, method){
  paymentMethod = method;

  document.querySelectorAll(".pay-btn")
    .forEach(b => b.classList.remove("active"));

  el.classList.add("active");
}

/* ================= SAVE SALE (CORRIGÉ IMPORTANT) ================= */
function saveSale(){

  const total = updateTotal();
  const id = lastInvoiceId;

  const clientName = document.getElementById("client-name")?.value || "";
  const clientPhone = document.getElementById("client-phone")?.value || "";
  const clientAddress = document.getElementById("client-address")?.value || "";
  const delivery = Number(document.getElementById("delivery")?.value || 0);

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  sales.push({
    id,
    date: new Date(),

    client: {
      name: clientName,
      phone: clientPhone,
      address: clientAddress
    },

    items: invoice,
    payment: paymentMethod,
    delivery: delivery,
    total: total
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  alert("✔ Vente sauvegardée complète");

  resetInvoice();
}

/* ================= RESET ================= */
function resetInvoice(){

  invoice = [];

  const delivery = document.getElementById("delivery");
  if(delivery) delivery.value = "";

  lastInvoiceId++;
  localStorage.setItem("invoice_id", lastInvoiceId);

  renderInvoice();
  generateInvoiceId();
}

/* ================= PRINT ================= */
function printInvoice(){

  const clientName = document.getElementById("client-name")?.value || "";
  const clientPhone = document.getElementById("client-phone")?.value || "";
  const clientAddress = document.getElementById("client-address")?.value || "";
  const date = document.getElementById("date")?.value || "";
  const invoiceId = document.getElementById("invoice-id")?.innerText || "";
  const delivery = Number(document.getElementById("delivery")?.value || 0);

  let total = 0;
  let itemsHTML = "";

  invoice.forEach(i => {
    const line = i.qty * i.price;
    total += line;

    itemsHTML += `
      <tr>
        <td>${i.name}</td>
        <td>${i.qty}</td>
        <td>${i.price}</td>
        <td>${line}</td>
      </tr>
    `;
  });

  const finalTotal = total + delivery;

  const win = window.open("", "_blank", "width=400,height=700");

  win.document.write(`
    <html>
    <head>
      <title>Éclat de Coco</title>

      <style>
        @page { size: 5in 7in; margin: 5mm; }

        body { font-family: Arial; font-size: 12px; }

        h1 { text-align: center; color:#e91e63; }

        .info,.client { text-align:center; font-size:11px; }

        table { width:100%; border-collapse:collapse; }

        th,td { border:1px solid #ddd; padding:4px; text-align:center; }

        th { background:#f8c8d8; }

        .total { text-align:right; font-weight:bold; color:#e91e63; }

        .footer { text-align:center; margin-top:10px; }

      </style>
    </head>

    <body onload="window.print(); window.close();">

      <h1>ÉCLAT DE COCO OFFICIAL</h1>

      <div class="info">
        Abidjan - Côte d’Ivoire <br>
        ${date} <br>
        ID: ${invoiceId}
      </div>

      <div class="client">
        ${clientName}<br>
        ${clientPhone}<br>
        ${clientAddress}
      </div>

      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Qté</th>
            <th>Prix</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${itemsHTML}</tbody>
      </table>

      <div class="total">
        Livraison: ${delivery} FCFA <br>
        TOTAL: ${finalTotal} FCFA
      </div>

      <div class="footer">
        Merci de faire parti de l`univers  Éclat de Coco
      </div>

    </body>
    </html>
  `);

  win.document.close();
  setTimeout(()=>{ win.print(); win.close(); }, 500);
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", ()=>{

  loadCategories();
  renderProducts(products);
  generateInvoiceId();
  setInvoiceDate();

  document.getElementById("search")
    ?.addEventListener("input", e => searchProducts(e.target.value));
});
