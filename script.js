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
}

/* ================= CATEGORIES ================= */
function loadCategories(){
  const categories = [...new Set(products.map(p => p.category))];

  let html = "";

  categories.forEach(cat=>{
    html += `
      <div class="pink-box" onclick="filterProducts('${cat}')">
        ${cat}
      </div>
    `;
  });

  document.getElementById("category-boxes").innerHTML = html;
}

/* ================= PRODUITS ================= */
function filterProducts(category){

  const filtered = products.filter(p => p.category === category);

  renderProducts(filtered);
}

/* ================= SEARCH ================= */
function searchProducts(value){

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(value.toLowerCase()) ||
    p.category.toLowerCase().includes(value.toLowerCase())
  );

  renderProducts(filtered);
}

function renderProducts(list){

  let html = "";

  list.forEach(p=>{
    html += `
      <div class="pink-box" onclick="addToInvoice('${p.name}', ${p.price})">

        <strong>${p.name}</strong><br>
        💰 ${p.price} FCFA<br>
        📦 Stock: ${p.stock}

      </div>
    `;
  });

  document.getElementById("product-list").innerHTML = html;
}

/* ================= INVOICE ================= */
function addToInvoice(name, price){

  const existing = invoice.find(i => i.name === name);

  if(existing){
    existing.qty += 1;
  } else {
    invoice.push({
      name,
      price,
      qty:1
    });
  }

  renderInvoice();
}

/* ================= RENDER FACTURE ================= */
function renderInvoice(){

  let html = "";

  invoice.forEach((item, index)=>{

    const total = item.price * item.qty;

    html += `
      <tr>
        <td>${item.name}</td>

        <td>
          <input type="number"
                 value="${item.qty}"
                 min="1"
                 onchange="updateQty(${index}, this.value)">
        </td>

        <td>${item.price}</td>

        <td>${total}</td>

        <td>
          <button onclick="removeItem(${index})"
                  style="background:red;color:white;border:none;padding:5px;border-radius:5px;">
            ❌
          </button>
        </td>
      </tr>
    `;
  });

  document.getElementById("invoice-body").innerHTML = html;

  updateTotal();
}

/* ================= UPDATE QTY ================= */
function updateQty(index, qty){

  invoice[index].qty = Number(qty);

  renderInvoice();
}

/* ================= REMOVE ITEM ================= */
function removeItem(index){

  invoice.splice(index, 1);

  renderInvoice();
}

/* ================= TOTAL ================= */
function updateTotal(){

  let total = 0;

  invoice.forEach(item=>{
    total += item.price * item.qty;
  });

  // livraison
  const delivery = Number(document.getElementById("delivery")?.value || 0);

  // remise
  total = total - (total * discount / 100);

  total += delivery;

  document.getElementById("grand-total").innerText =
    total + " FCFA";

  document.getElementById("discount-value").innerText =
    discount + "%";
}

/* ================= PAYMENT ================= */
function selectPayment(el, method){

  paymentMethod = method;

  document.querySelectorAll(".pay-btn").forEach(btn=>{
    btn.style.opacity = "0.5";
  });

  el.style.opacity = "1";
}

/* ================= DISCOUNT ================= */
function discount20(){
  discount = 20;
  updateTotal();
}

function discount50(){
  discount = 50;
  updateTotal();
}

/* ================= CALCULATRICE ================= */
function press(val){
  document.getElementById("display").value += val;
}

function clearCalc(){
  document.getElementById("display").value = "";
}

function calculate(){
  try{
    document.getElementById("display").value =
      eval(document.getElementById("display").value);
  } catch(e){
    alert("Erreur calcul");
  }
}

/* ================= PRINT FACTURE ================= */
function printInvoice(){

  const paymentLabels = {
    cash:"Cash",
    orange:"Orange Money",
    wave:"Wave"
  };

  const selectedPayment =
    paymentLabels[paymentMethod] || paymentMethod;

  const deliveryValue =
    document.getElementById("delivery")?.value || 0;

  const invoiceBody =
    document.getElementById("invoice-body")?.innerHTML || "";

  const win = window.open("", "", "width=700,height=900");

  if(!win){
    alert("Active les popups");
    return;
  }

  win.document.write(`
    <html>
    <head>
      <title>Facture</title>
      <style>
        @page{ size:A5; margin:10mm; }
        body{ font-family:Poppins,sans-serif;margin:0;padding:10px; }
        table{ width:100%;border-collapse:collapse; }
        th,td{ border:1px solid #ddd;padding:8px; }
        th{ background:#ffe6ef; }
      </style>
    </head>

    <body onload="window.print();window.close();">

      <h2 style="text-align:center;color:#e91e63;">
        Éclat de Coco
      </h2>

      <p><strong>Client:</strong> ${document.getElementById("client-name").value || "-"}</p>
      <p><strong>Téléphone:</strong> ${document.getElementById("client-phone").value || "-"}</p>
      <p><strong>Date:</strong> ${document.getElementById("date").value || "-"}</p>

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
        Total: ${document.getElementById("grand-total").innerText}
      </h2>

    </body>
    </html>
  `);

  win.document.close();
}
