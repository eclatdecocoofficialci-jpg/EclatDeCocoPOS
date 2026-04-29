document.addEventListener("DOMContentLoaded", () => {

let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];
let discount = 0;

let currentProduct = null;
let qty = 1;

/* ================= ELEMENTS ================= */
const search = document.getElementById("search");
const results = document.getElementById("results");

const grid = document.getElementById("products-list");
const categoryBox = document.getElementById("category-boxes");

const nameEl = document.getElementById("selected-name");
const priceEl = document.getElementById("selected-price");
const qtyEl = document.getElementById("qty");

const invoiceEl = document.getElementById("invoice");
const totalEl = document.getElementById("total");

const dateInput = document.getElementById("invoice-date");
const invoiceIdEl = document.getElementById("invoice-id");

/* ================= INIT ================= */
renderProducts(products);
renderCategories();
setDefaultDate();
generateInvoiceNumber();

/* ================= DATE ================= */
function setDefaultDate(){
  if(dateInput && !dateInput.value){
    dateInput.value = new Date().toISOString().split("T")[0];
  }
}

/* ================= INVOICE NUMBER ================= */
function generateInvoiceNumber(){
  let year = new Date().getFullYear();

  let last = localStorage.getItem("invoice-counter");
  last = last ? parseInt(last) + 1 : 1;

  localStorage.setItem("invoice-counter", last);

  if(invoiceIdEl){
    invoiceIdEl.innerText = year + String(last).padStart(3, "0");
  }
}

/* ================= SEARCH ================= */
if(search){
search.addEventListener("input", () => {

  results.innerHTML = "";

  let val = search.value.toLowerCase();

  let found = products.filter(p =>
    (p.name || "").toLowerCase().includes(val) ||
    (p.code || "").toLowerCase().includes(val)
  );

  found.forEach(p => {
    let div = document.createElement("div");
    div.className = "result";
    div.innerText = `${p.code || ""} - ${p.name}`;

    div.onclick = () => selectProduct(p);

    results.appendChild(div);
  });

});
}

/* ================= CATEGORIES ================= */
function renderCategories(){
  if(!categoryBox) return;

  let categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  categoryBox.innerHTML = "";

  categories.forEach(cat => {
    let btn = document.createElement("button");
    btn.innerText = cat;

    btn.onclick = () => filterByCategory(cat);

    categoryBox.appendChild(btn);
  });
}

/* ================= FILTER CATEGORY ================= */
function filterByCategory(category){

  let filtered = products.filter(p => p.category === category);

  renderProducts(filtered);
}

/* ================= PRODUCTS GRID ================= */
function renderProducts(list){

  if(!grid) return;

  grid.innerHTML = "";

  list.forEach(p => {

    let box = document.createElement("div");
    box.className = "result product-box";

    box.innerHTML = `
      <strong>${p.name}</strong><br>
      ${p.price} FCFA<br>
      Stock: ${p.stock || 0}
    `;

    box.onclick = () => selectProduct(p);

    grid.appendChild(box);
  });
}

/* ================= SELECT PRODUCT ================= */
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

/* ================= ADD TO CART ================= */
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

    let line = item.qty * item.price;
    total += line;

    let tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${line} FCFA</td>
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
  printBtn.addEventListener("click", () => {
    window.print();
  });
}

/* ================= SAVE ================= */
const saveBtn = document.getElementById("save-btn");

if(saveBtn){
  saveBtn.addEventListener("click", () => {

    let sales = JSON.parse(localStorage.getItem("sales")) || [];

    sales.push({
      id: invoiceIdEl?.innerText,
      date: dateInput?.value,
      client: {
        name: document.getElementById("client-name")?.value,
        phone: document.getElementById("client-phone")?.value,
        address: document.getElementById("client-address")?.value
      },
      items: invoice,
      total: totalEl.innerText
    });

    localStorage.setItem("sales", JSON.stringify(sales));

    alert("Facture sauvegardée 💗");
  });
}

});
function renderCategories() {
  const categories = [...new Set(products.map(p => p.category))];

  const box = document.getElementById("category-boxes");
  box.innerHTML = "";

  categories.forEach(cat => {
    let btn = document.createElement("button");
    btn.innerText = cat;

    btn.onclick = () => filterByCategory(cat);

    box.appendChild(btn);
  });
}

function filterByCategory(category) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  products
    .filter(p => p.category === category)
    .forEach(p => {
      let div = document.createElement("div");
      div.className = "product-box";
      div.innerHTML = `
        <strong>${p.name}</strong><br>
        ${p.price} FCFA<br>
        Stock: ${p.stock || 0}
      `;

      div.onclick = () => selectProduct(p);

      grid.appendChild(div);
    });
}
