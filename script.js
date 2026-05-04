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

  if(inv){
    inv.innerText = generateInvoiceNumber();
  }

  renderCategories();
  renderProducts();
  renderInvoice();

  /* RESTORE PAYMENT BUTTON */
  const savedPayment = localStorage.getItem("selectedPayment");

  if(savedPayment){

    paymentMethod = savedPayment;

    document.querySelectorAll(".pay-btn").forEach(btn => {

      if(
        btn.innerText.toLowerCase().includes(savedPayment)
      ){
        btn.classList.add("active");
      }

    });
  }
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

/* ================= CART ================= */
function addToCart(name, price){

  let item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  }else{
    invoice.push({
      name,
      price,
      qty:1
    });
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

      <td onclick="updateQty(${index})"
      style="cursor:pointer;color:#e91e63;font-weight:bold;">
      ${i.qty}
      </td>

      <td onclick="updatePrice(${index})"
      style="cursor:pointer;color:#7b1fa2;font-weight:bold;">
      ${i.price}
      </td>

      <td>${t}</td>
    `;

    table.appendChild(tr);
  });

  let delivery =
    Number(document.getElementById("delivery")?.value || 0);

  let total = subtotal + delivery;

  total = total - (total * discount / 100);

  document.getElementById("grand-total").innerText =
    Math.round(total) + " FCFA";

  const disc = document.getElementById("discount-value");

  if(disc){
    disc.innerText = discount + "%";
  }
}

/* ================= EDIT ================= */
function updateQty(i){

  let v = parseInt(prompt("Quantité"));

  if(v > 0){
    invoice[i].qty = v;
  }

  renderInvoice();
}

function updatePrice(i){

  let v = parseFloat(prompt("Prix"));

  if(v > 0){
    invoice[i].price = v;
  }

  renderInvoice();
}

/* ================= DISCOUNT ================= */
function setDiscount(p){

  discount = p;

  renderInvoice();
}

function discount20(){
  setDiscount(20);
}

function discount50(){
  setDiscount(50);
}

/* ================= PAYMENT ================= */
function selectPayment(el, method){

  paymentMethod = method;

  localStorage.setItem("selectedPayment", paymentMethod);

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

/* ================= SAVE SALE ================= */
function saveSale(){

  let delivery =
    Number(document.getElementById("delivery")?.value || 0);

  let subtotal =
    invoice.reduce((sum, i) => sum + (i.qty * i.price), 0);

  let total = subtotal + delivery;

  total = total - (total * discount / 100);

  total = Math.round(total);

  let sale = {

    id: document.getElementById("invoice-id")?.innerText,

    date:
      document.getElementById("date")?.value
      || new Date().toISOString().split("T")[0],

    client:{
      name:document.getElementById("client-name")?.value,
      phone:document.getElementById("client-phone")?.value,
      address:document.getElementById("client-address")?.value
    },

    cart:invoice,

    subtotal:subtotal,

    discount:discount + "%",

    paymentMethod:
      localStorage.getItem("selectedPayment")
      || paymentMethod,

    delivery:delivery,

    total:total
  };

  sales.push(sale);

  /* TRI PAR DATE */
  sales.sort((a,b)=>
    new Date(b.date) - new Date(a.date)
  );

  localStorage.setItem("sales", JSON.stringify(sales));

  invoice = [];

  discount = 0;

  renderInvoice();

  document.getElementById("invoice-id").innerText =
    generateInvoiceNumber();

  const del = document.getElementById("delivery");

  if(del){
    del.value = "";
  }

  alert("💗 Vente enregistrée (" + sale.paymentMethod + ")");
}

/* ================= PRINT FACTURE A5 ================= */
function printInvoice(){

  const paymentLabels = {
    cash:"Cash",
    orange:"Orange Money",
    wave:"Wave"
  };

  const selectedPayment =
    paymentLabels[paymentMethod] || paymentMethod;

  const invoiceHTML = `

    <div style="
      font-family:Poppins,sans-serif;
      padding:10px;
    ">

      <div style="text-align:center;">

        <h2 style="
          margin-bottom:2px;
          color:#e91e63;
        ">
          Bienvenue à Éclat de Coco
        </h2>

        <p style="
          margin-top:0;
          font-size:14px;
        ">
          Abidjan - Côte d’Ivoire
        </p>

      </div>

      <hr>

      <h3>
        Facture N°:
        ${document.getElementById("invoice-id").innerText}
      </h3>

      <p>
        <strong>Client:</strong>
        ${document.getElementById("client-name").value || "-"}
      </p>

      <p>
        <strong>Date:</strong>
        ${document.getElementById("date").value || "-"}
      </p>

      <table style="
        width:100%;
        border-collapse:collapse;
        margin-top:10px;
      ">

        <thead>
          <tr>
            <th style="border:1px solid #ddd;padding:8px;">
              Produit
            </th>

            <th style="border:1px solid #ddd;padding:8px;">
              Qté
            </th>

            <th style="border:1px solid #ddd;padding:8px;">
              Prix
            </th>

            <th style="border:1px solid #ddd;padding:8px;">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          ${document.getElementById("invoice-body").innerHTML}
        </tbody>

      </table>

      <h3 style="
        text-align:right;
        margin-top:15px;
        color:#e91e63;
      ">
        ${document.getElementById("grand-total").innerText}
      </h3>

      <p>
        <strong>Paiement:</strong>
        ${selectedPayment}
      </p>

    </div>
  `;

  const win =
    window.open("", "", "width=700,height=900");

  win.document.write(`

    <html>

    <head>

      <title>Facture</title>

      <style>

        @page{
          size:A5;
          margin:10mm;
        }

        body{
          font-family:Poppins,sans-serif;
          margin:0;
          padding:0;
        }

      </style>

    </head>

    <body onload="window.print();window.close();">

      ${invoiceHTML}

    </body>

    </html>
  `);

  win.document.close();
}

/* ================= SERVICE WORKER ================= */
if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker.register("./service-worker.js");
  });
}
