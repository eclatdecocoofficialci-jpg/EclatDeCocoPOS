document.addEventListener("DOMContentLoaded", () => {

/* ================= DATA ================= */
let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];
let discount = 0;

let currentProduct = null;
let qty = 1;

/* ================= ELEMENTS ================= */
const search = document.getElementById("search");
const results = document.getElementById("results");

const grid = document.getElementById("product-grid");

const nameEl = document.getElementById("selected-name");
const priceEl = document.getElementById("selected-price");
const qtyEl = document.getElementById("qty");

const invoiceEl = document.getElementById("invoice");
const totalEl = document.getElementById("total");

const display = document.getElementById("display");

/* ================= INIT ================= */
renderProductBoxes();
render();

/* ================= SEARCH ================= */
if(search){
search.addEventListener("input", () => {
  results.innerHTML = "";

  let val = search.value.toLowerCase();

  let found = products.filter(p =>
    p.name.toLowerCase().includes(val) ||
    p.code.toLowerCase().includes(val)
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

/* ================= PRODUCT BOXES ================= */
function renderProductBoxes(){
  if(!grid) return;

  grid.innerHTML = "";

  products.forEach(p => {
    let box = document.createElement("div");
    box.className = "result";

    box.innerHTML = `
      <strong>${p.name}</strong><br>
      ${p.price} FCFA
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
      qty
    });
  }

  currentProduct = null;
  qty = 1;

  nameEl.innerText = "-";
  priceEl.innerText = "0";
  qtyEl.innerText = "1";

  render();
};

/* ================= INVOICE ================= */
function render(){
  if(!invoiceEl || !totalEl) return;

  invoiceEl.innerHTML = "";

  let total = 0;

  invoice.forEach(i => {
    let t = i.qty * i.price;
    total += t;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${t}</td>
    `;
    invoiceEl.appendChild(tr);
  });

  let final = total - (total * discount / 100);
  totalEl.innerText = final.toFixed(0) + " FCFA";
}

/* ================= DISCOUNT ================= */
window.setDiscount = (p) => {
  discount = p;
  render();
};

/* ================= CALCULATOR ================= */
if(document.querySelectorAll(".calc button")){
document.querySelectorAll(".calc button").forEach(btn=>{
  btn.addEventListener("click", () => {
    if(!display) return;

    let v = btn.innerText;

    if(v === "C"){
      display.value = "";
    } else {
      display.value += v;
    }
  });
});
}

});
