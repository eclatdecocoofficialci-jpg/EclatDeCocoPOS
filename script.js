document.addEventListener("DOMContentLoaded", () => {

let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];
let discount = 0;

let currentProduct = null;
let qty = 1;

/* ELEMENTS */
const search = document.getElementById("search");
const results = document.getElementById("results");
const grid = document.getElementById("product-grid");

const nameEl = document.getElementById("selected-name");
const priceEl = document.getElementById("selected-price");
const qtyEl = document.getElementById("qty");

const invoiceEl = document.getElementById("invoice");
const totalEl = document.getElementById("total");

const dateInput = document.getElementById("invoice-date");
const invoiceIdEl = document.getElementById("invoice-id");

/* GLOBAL (pour save) */
window.invoice = invoice;

/* ================= INIT ================= */
renderProducts();
renderInvoice();
setDefaultDate();
generateInvoiceNumber();

/* ================= DATE ================= */
function setDefaultDate(){
  if(dateInput){
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }
}

/* ================= NUMERO FACTURE ================= */
function generateInvoiceNumber(){
  const year = new Date().getFullYear();

  let last = localStorage.getItem("invoice-counter") || 0;
  last = parseInt(last) + 1;

  localStorage.setItem("invoice-counter", last);

  if(invoiceIdEl){
    invoiceIdEl.innerText = year + String(last).padStart(3, "0");
  }
}

/* ================= SEARCH ================= */
if(search){
search.addEventListener("input", () => {

  results.innerHTML = "";

  let found = products.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase()) ||
    p.code.toLowerCase().includes(search.value.toLowerCase())
  );

  found.forEach(p => {
    let div = document.createElement("div");
    div.className = "result";
    div.innerText = `${p.code} - ${p.name}`;

    div.onclick = () => selectProduct(p);

    results.appendChild(div);
  });

});
}

/* ================= PRODUCTS BOX ================= */
function renderProducts(){
  if(!grid) return;

  grid.innerHTML = "";

  products.forEach(p => {

    let box = document.createElement("div");
    box.className = "result";

    box.innerHTML = `
      <strong>${p.name}</strong><br>
      ${p.price} FCFA<br>
      Stock: ${p.stock}
    `;

    box.onclick = () => selectProduct(p);

    grid.appendChild(box);
  });
}

/* ================= SELECT ================= */
function selectProduct(p){
  currentProduct = p;
  qty = 1;

  nameEl.innerText = p.name;
  priceEl.innerText = p.price;
  qtyEl.innerText = qty;
}

/* ================= QTY ================= */
window.plusQty = () => {
  qty++;
  qtyEl.innerText = qty;
};

window.minusQty = () => {
  if(qty > 1){
    qty--;
    qtyEl.innerText = qty;
  }
};

/* ================= ADD CART ================= */
window.addToCart = () => {

  if(!currentProduct) return;

  let exist = invoice.find(i => i.name === currentProduct.name);

  if(exist){
    exist.qty += qty;
  } else {
    invoice.push({
      name: currentProduct.name,
      price: currentProduct.price,
      qty: qty
    });
  }

  window.invoice = invoice;

  currentProduct = null;
  qty = 1;

  nameEl.innerText = "-";
  priceEl.innerText = "0";
  qtyEl.innerText = "1";

  renderInvoice();
};

/* ================= INVOICE ================= */
function renderInvoice(){

  invoiceEl.innerHTML = "";

  let total = 0;

  invoice.forEach(item => {

    let lineTotal = item.qty * item.price;
    total += lineTotal;

    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${lineTotal} FCFA</td>
    `;

    invoiceEl.appendChild(tr);
  });

  let final = total - (total * discount / 100);

  totalEl.innerText = final.toFixed(0) + " FCFA";
}

/* ================= DISCOUNT ================= */
window.setDiscount = (p) => {
  discount = p;
  renderInvoice();
};

/* ================= PRINT ================= */
const printBtn = document.getElementById("print-btn");
if(printBtn){
  printBtn.onclick = () => window.print();
}

/* ================= SAVE ================= */
const saveBtn = document.getElementById("save-btn");

if(saveBtn){
  saveBtn.onclick = () => {

    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    sales.push({
      id: invoiceIdEl?.innerText || "",
      date: dateInput?.value || "",
      items: invoice,
      total: totalEl.innerText
    });

    localStorage.setItem("sales", JSON.stringify(sales));

    alert("Facture sauvegardée 💗");
  };
}

});
