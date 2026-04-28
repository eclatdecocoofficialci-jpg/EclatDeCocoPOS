document.addEventListener("DOMContentLoaded", () => {

let products = JSON.parse(localStorage.getItem("products")) || [];
let invoice = [];
let discount = 0;

let currentProduct = null;
let qty = 1;

const search = document.getElementById("search");
const results = document.getElementById("results");

const nameEl = document.getElementById("selected-name");
const priceEl = document.getElementById("selected-price");
const qtyEl = document.getElementById("qty");

const invoiceEl = document.getElementById("invoice");
const totalEl = document.getElementById("total");

/* SEARCH */
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

/* SELECT */
function selectProduct(p){
  currentProduct = p;
  qty = 1;

  nameEl.innerText = p.name;
  priceEl.innerText = p.price;
  qtyEl.innerText = qty;
}

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

function render(){
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
  totalEl.innerText = final + " FCFA";
}

window.setDiscount = (p) => {
  discount = p;
  render();
};

});
