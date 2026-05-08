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
    el.value = new Date().toISOString().split("T")[0];
  }
}

/* ================= CATEGORIES ================= */
function loadCategories(){
  const box = document.getElementById("category-boxes");
  if(!box) return;

  const categories = [...new Set(products.map(p => p.category))];

  let html = `<div class="pink-box" onclick="showAll()">ALL</div>`;

  categories.forEach(cat => {
    html += `<div class="pink-box" onclick="filterCategory('${cat}')">${cat}</div>`;
  });

  box.innerHTML = html;
}

function showAll(){
  activeCategory = "ALL";
  applyFilters();
}

function filterCategory(cat){
  activeCategory = cat;
  applyFilters();
}

/* ================= SEARCH ================= */
document.addEventListener("input", (e) => {
  if(e.target.id === "search") applyFilters();
  if(e.target.id === "delivery") updateTotal();
});

function applyFilters(){
  const search = document.getElementById("search")?.value.toLowerCase() || "";

  let filtered = products;

  if(activeCategory !== "ALL"){
    filtered = filtered.filter(p => p.category === activeCategory);
  }

  if(search){
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(search)
    );
  }

  renderProducts(filtered);
}

/* ================= PRODUCTS ================= */
function renderProducts(list){
  const box = document.getElementById("product-list");
  if(!box) return;

  box.innerHTML = list.map(p => `
    <div class="pink-box" onclick="addToInvoice('${p.name}', ${p.price})">
      <strong>${p.name}</strong><br>
      💰 ${p.price} FCFA<br>
      📦 ${p.stock <= 0 ? "🔴 RUPTURE" : p.stock}
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

  currentTotal = total + delivery;

  const el = document.getElementById("grand-total");
  if(el) el.innerText = currentTotal + " FCFA";

  return currentTotal;
}

/* ================= PAYMENT ================= */
function selectPayment(el, method){
  paymentMethod = method;

  document.querySelectorAll(".pay-btn")
    .forEach(b => b.classList.remove("active"));

  el.classList.add("active");
}

function saveSale(){

  const total = updateTotal();

  const clientName = document.getElementById("client-name")?.value || "";
  const clientPhone = document.getElementById("client-phone")?.value || "";
  const clientAddress = document.getElementById("client-address")?.value || "";

  if(!clientName){
    alert("Nom client obligatoire");
    return;
  }

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  const saleObject = {
    id: lastInvoiceId,
    date: document.getElementById("date")?.value || new Date().toLocaleString(),

    client: {
      name: clientName,
      phone: clientPhone,
      address: clientAddress
    },

    items: invoice,

    // ✅ IMPORTANT UNIQUE KEY
    payment: paymentMethod,

    delivery: Number(document.getElementById("delivery")?.value || 0),
    total: total
  };

  sales.push(saleObject);

  localStorage.setItem("sales", JSON.stringify(sales));

  /* ================= CUSTOMERS SYNC ================= */

  let customers = JSON.parse(localStorage.getItem("customers")) || [];

  let existingCustomer = customers.find(c =>
    c.phone === clientPhone
  );

  if(existingCustomer){

    existingCustomer.totalInvoices =
      (existingCustomer.totalInvoices || 0) + 1;

    existingCustomer.totalSpent =
      (existingCustomer.totalSpent || 0) + total;

  } else {

    customers.push({
      name: clientName,
      phone: clientPhone,
      address: clientAddress,
      totalInvoices: 1,
      totalSpent: total
    });

  }

  localStorage.setItem("customers", JSON.stringify(customers));

  updateSalesView();

  alert("✔ Vente sauvegardée");

  resetInvoice();
}

/* ================= SALES TABLE FIX ================= */
function updateSalesView(){

  const table = document.getElementById("sales-table-body");
  if(!table) return;

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  table.innerHTML = sales.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${s.client?.name || "-"}</td>
      <td>${s.client?.phone || "-"}</td>
      <td>${s.payment || "-"}</td>
      <td>${s.delivery || 0}</td>
      <td>${s.total}</td>
    </tr>
  `).join("");
}

/* ================= RESET ================= */
function resetInvoice(){

  // vider panier
  invoice = [];

  // reset UI facture
  renderInvoice();

  // reset livraison
  const delivery = document.getElementById("delivery");
  if(delivery) delivery.value = "";

  // reset client
  const name = document.getElementById("client-name");
  const phone = document.getElementById("client-phone");
  const address = document.getElementById("client-address");

  if(name) name.value = "";
  if(phone) phone.value = "";
  if(address) address.value = "";

  // reset paiement visuel
  document.querySelectorAll(".pay-btn")
    .forEach(b => b.classList.remove("active"));

  paymentMethod = "cash";

  // NOUVEL ID
  lastInvoiceId++;
  localStorage.setItem("invoice_id", lastInvoiceId);

  generateInvoiceId();

  // IMPORTANT : remettre la date actuelle propre
  setInvoiceDate();
}

/* ================= PRINT FIX 5x7 ================= */
function printInvoice(){

  const clientName = document.getElementById("client-name")?.value || "";
  const clientPhone = document.getElementById("client-phone")?.value || "";
  const clientAddress = document.getElementById("client-address")?.value || "";
  const date = document.getElementById("date")?.value || "";
  const invoiceId = document.getElementById("invoice-id")?.innerText || "";
  const delivery = Number(document.getElementById("delivery")?.value || 0);

  let total = 0;

  let itemsHTML = invoice.map(i => {
    const line = i.qty * i.price;
    total += line;

    return `
      <tr>
        <td>${i.name}</td>
        <td>${i.qty}</td>
        <td>${i.price} FCFA</td>
        <td>${line} FCFA</td>
      </tr>
    `;
  }).join("");

  const finalTotal = total + delivery;

  const win = window.open("", "_blank", "width=400,height=700");

  win.document.write(`
    <html>
    <head>
      <style>
        @page { size: 5in 7in; margin: 5mm; }
        body { font-family: Arial; font-size: 12px; }
        h1 { text-align:center; color:#e91e63; }

        table { width:100%; border-collapse:collapse; }
        th,td { border:1px solid #ddd; padding:5px; text-align:center; }

        .footer {
          position: fixed;
          bottom: 10px;
          width: 100%;
          text-align: center;
          font-size: 11px;
        }
      </style>
    </head>

    <body onload="window.print(); window.close();">

      <h1>ÉCLAT DE COCO OFFICIAL</h1>
      <div style="text-align:center;">Abidjan, Côte d’Ivoire</div>

      <div>
        ID: ${invoiceId}<br>
        Date: ${date}
      </div>

      <div>
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

      <h3>
        Livraison: ${delivery} FCFA <br>
        TOTAL: ${finalTotal} FCFA <br>
        Paiement: ${paymentMethod}
      </h3>

      <div class="footer">
        Merci de faire partie de l'univers Éclat de Coco 💖
      </div>

    </body>
    </html>
  `);

  win.document.close();

  setTimeout(() => {
    win.focus();
    win.print();
    win.close();
  }, 600);
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();
  renderProducts(products);
  generateInvoiceId();
  setInvoiceDate();
  updateSalesView();
});
