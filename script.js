document.addEventListener("DOMContentLoaded", () => {

let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];
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

/* ===== DATE AUTO ===== */
if(dateInput && !dateInput.value){
  dateInput.value = new Date().toISOString().split("T")[0];
}

/* ===== RENDER PRODUCTS ===== */
function renderProducts(){
  if(!grid) return;

  grid.innerHTML = "";

  products.forEach(p => {
    let box = document.createElement("div");
    box.className = "result";
    box.innerHTML = `<strong>${p.name}</strong><br>${p.price} FCFA`;

    box.onclick = () => selectProduct(p);

    grid.appendChild(box);
  });
}

/* ===== SELECT PRODUCT ===== */
function selectProduct(p){
  currentProduct = p;
  qty = 1;

  nameEl.innerText = p.name;
  priceEl.innerText = p.price;
  qtyEl.innerText = qty;
}

/* ===== QTY ===== */
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

/* ===== ADD TO CART ===== */
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

/* ===== INVOICE ===== */
function renderInvoice(){
  invoiceEl.innerHTML = "";

  let total = 0;

  invoice.forEach(i => {
    let line = i.qty * i.price;
    total += line;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${line} FCFA</td>
    `;
    invoiceEl.appendChild(tr);
  });

  totalEl.innerText = total + " FCFA";
}

/* ===== INIT ===== */
renderProducts();
renderInvoice();

/* ===== PRINT ===== */
document.getElementById("print-btn")?.addEventListener("click", () => {
  window.print();
});

/* ===== SAVE ===== */
document.getElementById("save-btn")?.addEventListener("click", () => {

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  sales.push({
    date: dateInput?.value,
    items: invoice,
    total: totalEl.innerText
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  alert("Facture sauvegardée 💗");
});

});
