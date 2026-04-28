document.addEventListener("DOMContentLoaded", () => {

/* ===================== DATA ===================== */
let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];
let discount = 0;

let currentProduct = null;
let qty = 1;

/* ===================== ELEMENTS ===================== */
const search = document.getElementById("search");
const results = document.getElementById("results");

const selectedName = document.getElementById("selected-name");
const selectedPrice = document.getElementById("selected-price");
const qtyDisplay = document.getElementById("qty");

const invoiceTable = document.getElementById("invoice");
const totalEl = document.getElementById("total");

const display = document.getElementById("display");

/* ===================== SEARCH ===================== */
if(search){
search.addEventListener("input", () => {
  let val = search.value.toLowerCase();
  results.innerHTML = "";

  let found = products.filter(p =>
    p.name.toLowerCase().includes(val) ||
    p.code.toLowerCase().includes(val)
  );

  found.forEach(p => {
    let div = document.createElement("div");
    div.className = "result";
    div.innerText = `${p.code} - ${p.name} (${p.price} FCFA)`;

    div.onclick = () => selectProduct(p);

    results.appendChild(div);
  });
});
}

/* ===================== SELECT PRODUCT ===================== */
function selectProduct(p){
  currentProduct = p;
  qty = 1;

  if(selectedName) selectedName.innerText = p.name;
  if(selectedPrice) selectedPrice.innerText = p.price;
  if(qtyDisplay) qtyDisplay.innerText = qty;
}

/* ===================== QTY ===================== */
window.plusQty = function(){
  qty++;
  if(qtyDisplay) qtyDisplay.innerText = qty;
}

window.minusQty = function(){
  if(qty > 1){
    qty--;
    if(qtyDisplay) qtyDisplay.innerText = qty;
  }
}

/* ===================== ADD TO CART ===================== */
window.addToCart = function(){
  if(!currentProduct) return;

  let existing = invoice.find(i => i.name === currentProduct.name);

  if(existing){
    existing.qty += qty;
  } else {
    invoice.push({
      name: currentProduct.name,
      price: currentProduct.price,
      qty: qty
    });
  }

  currentProduct = null;
  qty = 1;

  if(selectedName) selectedName.innerText = "-";
  if(selectedPrice) selectedPrice.innerText = "0";
  if(qtyDisplay) qtyDisplay.innerText = "1";

  renderInvoice();
}

/* ===================== RENDER INVOICE ===================== */
function renderInvoice(){
  if(!invoiceTable) return;

  invoiceTable.innerHTML = "";

  let total = 0;

  invoice.forEach(item => {
    let t = item.qty * item.price;
    total += t;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price}</td>
      <td>${item.qty}</td>
      <td>${t}</td>
    `;
    invoiceTable.appendChild(tr);
  });

  let final = total - (total * discount / 100);

  if(totalEl){
    totalEl.innerText = "Total: " + final.toFixed(0) + " FCFA";
  }
}

/* ===================== DISCOUNT ===================== */
window.setDiscount = function(p){
  discount = p;
  renderInvoice();
}

/* ===================== CALCULATOR ===================== */
if(document.querySelectorAll(".calc button")){
document.querySelectorAll(".calc button").forEach(btn=>{
  btn.addEventListener("click", () => {
    let v = btn.innerText;

    if(!display) return;

    if(v === "C"){
      display.value = "";
    } else {
      display.value += v;
    }
  });
});
}

/* ===================== INIT ===================== */
console.log("POS SCRIPT LOADED SUCCESSFULLY");

});
