let products = [
  {name:"Savon Rose", price:3000, stock:10, category:"Savon"},
  {name:"Savon Coco", price:3500, stock:8, category:"Savon"},
  {name:"Lotion Vanille", price:5000, stock:5, category:"Lotion"},
  {name:"Beurre Karité", price:4000, stock:7, category:"Beurre"}
];

let invoice = [];
let paymentMethod = "cash";
let discount = 0;

/* ================= INIT ================= */
window.onload = function(){

  loadCategories();
  renderProducts(products);

  const searchInput = document.getElementById("search");
  if(searchInput){
    searchInput.addEventListener("input", e => {
      searchProducts(e.target.value);
    });
  }

  const deliveryInput = document.getElementById("delivery");
  if(deliveryInput){
    deliveryInput.addEventListener("input", updateTotal);
  }
};

/* ================= CATEGORIES ================= */
function loadCategories(){
  const categories = [...new Set(products.map(p => p.category))];

  document.getElementById("category-boxes").innerHTML =
    categories.map(cat =>
      `<div class="pink-box" onclick="filterProducts('${cat}')">${cat}</div>`
    ).join("");
}

/* ================= FILTER ================= */
function filterProducts(category){
  renderProducts(products.filter(p => p.category === category));
}

/* ================= SEARCH ================= */
function searchProducts(value){
  const v = value.toLowerCase();

  renderProducts(products.filter(p =>
    p.name.toLowerCase().includes(v) ||
    p.category.toLowerCase().includes(v)
  ));
}

/* ================= PRODUCTS ================= */
function renderProducts(list){

  document.getElementById("product-list").innerHTML =
    list.map(p =>
      `<div class="pink-box" onclick="addToInvoice('${p.name}', ${p.price})">
        <strong>${p.name}</strong><br>
        💰 ${p.price} FCFA<br>
        📦 Stock: ${p.stock}
      </div>`
    ).join("");
}

/* ================= ADD ================= */
function addToInvoice(name, price){

  const item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  } else {
    invoice.push({name, price, qty:1});
  }

  renderInvoice();
}


/* ================= INVOICE ================= */
function renderInvoice(){

  document.getElementById("invoice-body").innerHTML =
    invoice.map((item, index) => {

      const total = item.price * item.qty;

      return `
        <tr>

          <td>${item.name}</td>

          <!-- QUANTITE SIMPLE (FACTURE CLEAN) -->
          <td>${item.qty}</td>

          <td>${item.price}</td>
          <td>${total}</td>

          <!-- ACTION (POS ONLY) -->
          <td class="no-print">
            <button onclick="removeItem(${index})"
              style="background:#e91e63;color:white;border:none;padding:5px;border-radius:5px;">
              ❌
            </button>
          </td>

        </tr>
      `;
    }).join("");

  updateTotal();
}
/* ================= UPDATE ================= */
function updateQty(index, qty){
  invoice[index].qty = Number(qty);
  renderInvoice();
}

/* ================= REMOVE ================= */
function removeItem(index){
  invoice.splice(index, 1);
  renderInvoice();
}

/* ================= TOTAL ================= */
function updateTotal(){

  let total = 0;

  invoice.forEach(i => {
    total += i.price * i.qty;
  });

  const delivery = Number(document.getElementById("delivery")?.value || 0);

  total = total - (total * discount / 100);
  total += delivery;

  document.getElementById("grand-total").innerText = total + " FCFA";
  document.getElementById("discount-value").innerText = discount + "%";
}

/* ================= PAYMENT ================= */
function selectPayment(el, method){

  paymentMethod = method;

  document.querySelectorAll(".pay-btn").forEach(b =>
    b.classList.remove("active")
  );

  el.classList.add("active");
}

/* ================= DISCOUNT ================= */
function discount20(){ discount = 20; updateTotal(); }
function discount50(){ discount = 50; updateTotal(); }

/* ================= CALC ================= */
function press(v){
  document.getElementById("display").value += v;
}

function clearCalc(){
  document.getElementById("display").value = "";
}

function calculate(){
  try{
    document.getElementById("display").value =
      eval(document.getElementById("display").value);
  } catch {
    alert("Erreur calcul");
  }
}
/* ================= PRINT FACTURE CLEAN CLIENT ================= */
function printInvoice(){

  const paymentLabels = {
    cash:"Cash",
    orange:"Orange Money",
    wave:"Wave"
  };

  const selectedPayment =
    paymentLabels[paymentMethod] || paymentMethod;

  const deliveryValue =
    Number(document.getElementById("delivery")?.value || 0);

  const invoiceBody = invoice.map(item => {
    const total = item.price * item.qty;

    return `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${item.price}</td>
        <td>${total}</td>
      </tr>
    `;
  }).join("");

  const invoiceNumber = generateInvoiceNumber();

  const win = window.open("", "", "width=700,height=900");

  if(!win){
    alert("Active les popups pour imprimer");
    return;
  }

  win.document.write(`
    <html>
    <head>
      <title>Facture</title>

      <style>
        @page { size:A5; margin:10mm; }

        body{
          font-family:Poppins,sans-serif;
          margin:0;
          padding:10px;
        }

        table{
          width:100%;
          border-collapse:collapse;
        }

        th,td{
          border:1px solid #ddd;
          padding:8px;
          text-align:center;
        }

        th{
          background:#ffe6ef;
        }

        .title{
          text-align:center;
          color:#e91e63;
          font-size:20px;
          font-weight:bold;
        }

        .sub{
          text-align:center;
          font-size:13px;
          color:#666;
        }

        .footer{
          text-align:center;
          margin-top:30px;
          color:#e91e63;
        }
      </style>
    </head>

    <body onload="window.print();window.close();">

      <div class="title">ÉCLAT DE COCO OFFICIAL STORE</div>
      <div class="sub">Abidjan - Côte d'Ivoire</div>

      <p><strong>Facture N°:</strong> ${invoiceNumber}</p>
      <p><strong>Date:</strong> ${document.getElementById("date").value || "-"}</p>

      <p><strong>Client:</strong> ${document.getElementById("client-name").value || "-"}</p>
      <p><strong>Téléphone:</strong> ${document.getElementById("client-phone").value || "-"}</p>

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
          ${invoiceBody}
        </tbody>
      </table>

      <p><strong>Livraison:</strong> ${deliveryValue} FCFA</p>
      <p><strong>Paiement:</strong> ${selectedPayment}</p>

      <h2 style="text-align:right;color:#e91e63;">
        TOTAL: ${document.getElementById("grand-total").innerText}
      </h2>

      <div class="footer">
        Merci de faire partie de l’univers Éclat de Coco 💗
      </div>

    </body>
    </html>
  `);

  win.document.close();
}
function generateInvoiceNumber(){
  const year = new Date().getFullYear(); // 2026

  let last = localStorage.getItem("invoiceNumber");

  if(!last){
    last = 1;
  } else {
    last = Number(last) + 1;
  }

  localStorage.setItem("invoiceNumber", last);

  return year + String(last).padStart(3, "0");
}
document.addEventListener("DOMContentLoaded", function () {
  const deliveryInput = document.getElementById("delivery");

  if(deliveryInput){
    deliveryInput.addEventListener("input", updateTotal);
  }
});
/* ================= RESET SW ================= */
function resetServiceWorker(){

  navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(r => r.unregister()));

  alert("Cache cleared ✔ Refresh page");
}
