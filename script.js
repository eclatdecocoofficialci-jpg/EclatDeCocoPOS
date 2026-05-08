let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, stock:10, category:"Savon"},
  {name:"Savon Coco", price:3500, stock:8, category:"Savon"},
  {name:"Lotion Vanille", price:5000, stock:5, category:"Lotion"},
  {name:"Beurre Karité", price:4000, stock:7, category:"Beurre"}
];

let invoice = [];
let activeCategory = "ALL";
let paymentMethod = "cash";

/* ================= INVOICE ID ================= */
let lastInvoiceId = Number(localStorage.getItem("invoice_id") || 20206000);

function generateInvoiceId(){
  const el = document.getElementById("invoice-id");
  if(el) el.innerText = lastInvoiceId;
}

/* ================= DATE ================= */
function setInvoiceDate(){
  const el = document.getElementById("invoice-date");
  if(el){
    const d = new Date();
    el.innerText = d.toLocaleString("fr-FR");
  }
}

/* ================= QR CODE ================= */
function generateQR(total, id){

  const container = document.getElementById("qrcode");
  if(!container) return;

  container.innerHTML = "";

  new QRCode(container, {
    text: `FACTURE: ${id} | TOTAL: ${total} FCFA`,
    width: 100,
    height: 100
  });
}

/* ================= DELIVERY LIVE ================= */
document.addEventListener("input", (e)=>{
  if(e.target.id === "delivery"){
    updateTotal();
  }
});

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

  renderProducts(
    base.filter(p =>
      p.name.toLowerCase().includes(value)
    )
  );
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

  total += delivery;

  document.getElementById("grand-total").innerText =
    Math.round(total) + " FCFA";

  return total;
}

/* ================= CLIENT SYSTEM ================= */
function saveClientFromPOS(total, invoiceId){

  const name = document.getElementById("client-name")?.value || "";
  const phone = document.getElementById("client-phone")?.value || "";
  const address = document.getElementById("client-address")?.value || "";

  if(!phone) return;

  let clients = JSON.parse(localStorage.getItem("clients")) || [];

  let client = clients.find(c => c.phone === phone);

  if(!client){
    client = {
      id: "CL" + String(clients.length + 1).padStart(3,"0"),
      name,
      phone,
      address,
      totalInvoices: 0,
      sales: []
    };
    clients.push(client);
  }

  client.totalInvoices += 1;

  client.sales.push({
    id: invoiceId,
    date: new Date(),
    total: total
  });

  localStorage.setItem("clients", JSON.stringify(clients));
}

/* ================= PAYMENT ================= */
function selectPayment(el, method){
  paymentMethod = method;

  document.querySelectorAll(".pay-btn")
    .forEach(b=>b.classList.remove("active"));

  el.classList.add("active");
}

/* ================= SAVE SALE ================= */
function saveSale(){

  const total = updateTotal();
  const id = lastInvoiceId;

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  sales.push({
    id,
    date: new Date(),
    items: invoice,
    total,
    payment: paymentMethod
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  /* CLIENT LINK */
  saveClientFromPOS(total, id);

  /* QR + DATE */
  setInvoiceDate();
  generateQR(total, id);

  alert("✔ Vente sauvegardée");

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

function printInvoice() {

  const clientName = document.getElementById("client-name")?.value || "";
  const clientPhone = document.getElementById("client-phone")?.value || "";
  const clientAddress = document.getElementById("client-address")?.value || "";
  const date = document.getElementById("date")?.value || "";
  const invoiceId = document.getElementById("invoice-id")?.innerText || "";
  const delivery = document.getElementById("delivery")?.value || 0;
  const total = document.getElementById("grand-total")?.innerText || "0 FCFA";

  const rows = document.querySelectorAll("#invoice-body tr");

  let itemsHTML = "";

  rows.forEach(row => {
    const cols = row.querySelectorAll("td");

    if (cols.length >= 4) {
      itemsHTML += `
        <tr>
          <td>${cols[0].innerText}</td>
          <td>${cols[1].innerText}</td>
          <td>${cols[2].innerText}</td>
          <td>${cols[3].innerText}</td>
        </tr>
      `;
    }
  });

  const win = window.open("", "", "width=400,height=700");

  win.document.write(`
    <html>
    <head>
      <title>Ticket</title>

      <style>
        @page {
          size: 5in 7in;
          margin: 5mm;
        }

        body {
          font-family: Arial;
          font-size: 12px;
          width: 100%;
        }

        h1 {
          text-align: center;
          color: #e91e63;
          font-size: 18px;
          margin-bottom: 2px;
        }

        .info, .client {
          text-align: center;
          font-size: 11px;
          margin-bottom: 8px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 4px;
          text-align: center;
        }

        th {
          background: #f8c8d8;
        }

        .total {
          text-align: right;
          margin-top: 8px;
          font-size: 13px;
          font-weight: bold;
          color: #e91e63;
        }

        .footer {
          margin-top: 12px;
          text-align: center;
          font-size: 11px;
        }

        .message {
          text-align: center;
          font-style: italic;
          font-size: 10px;
          margin-top: 5px;
        }
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
        ${clientName} <br>
        ${clientPhone} <br>
        ${clientAddress}
      </div>

      <table>
        <thead>
          <tr>
            <th>Prod</th>
            <th>Qté</th>
            <th>Prix</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="total">
        Livraison: ${delivery} FCFA <br>
        Total: ${total}
      </div>

      <div class="footer">
        Merci de faire partie de l’univers Éclat de Coco 💖
      </div>

      <div class="message">
        Naturel • Luxe • Respect de la peau 🌿
      </div>

    </body>
    </html>
  `);

  win.document.close();
}
    </head>

    <body onload="window.print(); window.close();">

      <h1>ÉCLAT DE COCO OFFICIAL</h1>

      <div class="info">
        Abidjan - Côte d’Ivoire <br>
        Date: ${date} <br>
        Facture ID: ${invoiceId}
      </div>

      <div class="client">
        <strong>Client :</strong> ${clientName} <br>
        <strong>Téléphone :</strong> ${clientPhone} <br>
        <strong>Adresse :</strong> ${clientAddress} <br>
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

        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="total">
        Livraison: ${delivery} FCFA <br>
        Total Final: ${total}
      </div>

      <div class="footer">
        Merci de faire partie de l’univers Éclat de Coco 💖
      </div>

      <div class="message">
        Produits naturels - respect de la peau et de la nature 🌿
      </div>

    </body>
    </html>
  `);

  win.document.close();
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", ()=>{

  loadCategories();
  renderProducts(products);
  generateInvoiceId();

  document.getElementById("search")
    ?.addEventListener("input", e => searchProducts(e.target.value));

  const d = document.getElementById("date");
  if(d) d.valueAsDate = new Date();
});
