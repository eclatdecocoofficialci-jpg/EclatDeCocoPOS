let cart = [];
let products = JSON.parse(localStorage.getItem("products")) || [];

let discount = 0;

/* ===== ELEMENTS ===== */
const resultsBox = document.getElementById("results");
const searchInput = document.getElementById("search");

const selectedName = document.getElementById("selected-name");
const selectedPrice = document.getElementById("selected-price");
const qtyDisplay = document.getElementById("qty");

const subtotalEl = document.getElementById("subtotal");
const totalFinalEl = document.getElementById("total-final");

let currentProduct = null;
let qty = 1;

/* ===== SEARCH PRODUIT ===== */
searchInput.addEventListener("input", () => {
  let val = searchInput.value.toLowerCase();
  resultsBox.innerHTML = "";

  let found = products.filter(p =>
    p.name.toLowerCase().includes(val) ||
    p.code.toLowerCase().includes(val)
  );

  found.forEach(p => {
    let div = document.createElement("div");
    div.className = "result";
    div.innerText = `${p.code} - ${p.name} (${p.price} FCFA)`;

    div.onclick = () => selectProduct(p);

    resultsBox.appendChild(div);
  });
});

/* ===== SELECT PRODUCT (CENTRE BOX) ===== */
function selectProduct(p){
  currentProduct = p;
  qty = 1;

  selectedName.innerText = p.name;
  selectedPrice.innerText = p.price;

  qtyDisplay.innerText = qty;
}

/* ===== QUANTITY CONTROL ===== */
function plusQty(){
  qty++;
  qtyDisplay.innerText = qty;
}

function minusQty(){
  if(qty > 1){
    qty--;
    qtyDisplay.innerText = qty;
  }
}

/* ===== ADD TO CART ===== */
function addToCart(){
  if(!currentProduct) return;

  let existing = cart.find(i => i.name === currentProduct.name);

  if(existing){
    existing.qty += qty;
  } else {
    cart.push({
      name: currentProduct.name,
      price: currentProduct.price,
      qty: qty
    });
  }

  currentProduct = null;
  qty = 1;

  selectedName.innerText = "-";
  selectedPrice.innerText = "0";
  qtyDisplay.innerText = "1";

  updateInvoice();
}

/* ===== INVOICE ===== */
function updateInvoice(){
  const tbody = document.querySelector(".right-panel tbody");
  tbody.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item, i) => {
    let total = item.qty * item.price;
    subtotal += total;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price} FCFA</td>
      <td>${total} FCFA</td>
      <td><button onclick="removeItem(${i})">X</button></td>
    `;
    tbody.appendChild(tr);
  });

  let final = subtotal - (subtotal * discount / 100);

  subtotalEl.innerText = subtotal + " FCFA";
  totalFinalEl.innerText = final + " FCFA";
}

/* ===== REMOVE ===== */
function removeItem(i){
  cart.splice(i,1);
  updateInvoice();
}

/* ===== DISCOUNT ===== */
function setDiscount(p){
  discount = p;
  updateInvoice();
}

/* ===== SAVE ===== */
document.getElementById("save-btn").addEventListener("click", ()=>{
  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  let subtotal = cart.reduce((a,b)=>a + b.qty*b.price,0);
  let final = subtotal - (subtotal * discount / 100);

  sales.push({
    date: new Date().toISOString(),
    cart,
    discount,
    total: final
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  cart = [];
  discount = 0;
  updateInvoice();
});
