let activeCategory = "ALL";
let searchValue = "";

/* ================= CATEGORIES FIXED ================= */

function loadCategories() {
  const box = document.getElementById("category-boxes");
  if (!box) return;

  const categories = [...new Set(products.map(p => p.category))];

  box.innerHTML = `
    <div class="pink-box" onclick="showAll()">ALL</div>
    ${categories.map(cat => `
      <div class="pink-box" onclick="filterCategory('${cat}')">
        ${cat}
      </div>
    `).join("")}
  `;
}

function showAll() {
  activeCategory = "ALL";
  renderProducts(products);
}

/* IMPORTANT FIX */
function filterCategory(cat) {
  activeCategory = cat;

  const filtered = products.filter(p => p.category === cat);
  renderProducts(filtered);
}

/* ================= SEARCH FIX ================= */

document.addEventListener("input", (e) => {
  if (e.target.id === "search") {
    const value = e.target.value.toLowerCase();

    let base = products;

    if (activeCategory !== "ALL") {
      base = base.filter(p => p.category === activeCategory);
    }

    const filtered = base.filter(p =>
      p.name.toLowerCase().includes(value)
    );

    renderProducts(filtered);
  }

  if (e.target.id === "delivery") {
    updateTotal();
  }
});

/* ================= PRODUCTS ================= */

function renderProducts(list) {
  const box = document.getElementById("product-list");
  if (!box) return;

  box.innerHTML = list.map(p => `
    <div class="pink-box" onclick="addToInvoice('${p.name}', ${p.price})">
      <strong>${p.name}</strong><br>
      💰 ${p.price} FCFA<br>
      📦 ${p.stock}
    </div>
  `).join("");
}
/* ================= TOTAL LIVE ================= */
function updateTotal(){

  let total = 0;

  invoice.forEach(i=>{
    total += i.qty * i.price;
  });

  const delivery = Number(document.getElementById("delivery")?.value || 0);

  currentTotal = total + delivery;

  const el = document.getElementById("grand-total");
  if(el){
    el.innerText = currentTotal + " FCFA";
  }

  return currentTotal;
}

/* LIVE DELIVERY */
document.addEventListener("input", (e)=>{
  if(e.target.id === "delivery"){
    updateTotal();
  }
});

/* ================= PAYMENT ================= */
function selectPayment(el, method){
  paymentMethod = method;

  document.querySelectorAll(".pay-btn")
    .forEach(b => b.classList.remove("active"));

  el.classList.add("active");
}

/* ================= SAVE SALE ================= */
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
    client: { name: clientName, phone: clientPhone, address: clientAddress },
    items: invoice,
    payment: paymentMethod,
    delivery,
    total
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  updateSalesView();

  alert("✔ Vente sauvegardée");

  resetInvoice();
}

/* ================= SALES TABLE ================= */
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
        th { background:#f8c8d8; }
      </style>
    </head>

    <body onload="window.print(); window.close();">

      <h1>ÉCLAT DE COCO OFFICIAL</h1>

      <div>
        ID: ${invoiceId} <br>
        ${date}
      </div>

      <div>
        ${clientName}<br>
        ${clientPhone}<br>
        ${clientAddress}
      </div>

      <table>
        <tbody>${itemsHTML}</tbody>
      </table>

      <h3>
        Livraison: ${delivery} FCFA <br>
        TOTAL: ${finalTotal} FCFA
      </h3>
      


      <div class="footer">

        Merci de faire partie de l`univers Eclat de Coco 💖<br>

        Éclat de Coco - Naturel & Luxe

      </div
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
  updateSalesView();

  document.getElementById("search")
    ?.addEventListener("input", e => searchProducts(e.target.value));
});
document.addEventListener("DOMContentLoaded", () => {

  console.log("POS LOADED");

  loadCategories();   // 🔥 IMPORTANT
  renderProducts(products);

  if (typeof generateInvoiceId === "function") {
    generateInvoiceId();
  }

  if (typeof setInvoiceDate === "function") {
    setInvoiceDate();
  }

  const search = document.getElementById("search");

  if(search){
    search.addEventListener("input", (e) => {
      searchProducts(e.target.value);
    });
  }

});
