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

const display = document.getElementById("display");

const dateInput = document.getElementById("invoice-date");

/* ================= INIT ================= */
renderProducts();
renderInvoice();
setDefaultDate();

/* ================= DATE ================= */
function setDefaultDate(){
  if(!dateInput) return;

  const today = new Date().toISOString().split("T")[0];

  if(!dateInput.value){
    dateInput.value = today;
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

/* ================= PRODUCTS ================= */
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

/* ================= ADD ================= */
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
  renderInvoice();
};

});
const invoiceIdEl = document.getElementById("invoice-id");

function generateInvoiceNumber() {
  const year = new Date().getFullYear();

  let last = localStorage.getItem("invoice-counter");

  if(!last){
    last = 1;
  } else {
    last = parseInt(last) + 1;
  }

  localStorage.setItem("invoice-counter", last);

  return year + String(last).padStart(3, "0");
}

/* INIT NUMBER */
let invoiceNumber = generateInvoiceNumber();

if(invoiceIdEl){
  invoiceIdEl.innerText = invoiceNumber;
}
document.addEventListener("DOMContentLoaded", () => {

  /* ================= IMPRIMER ================= */
  const printBtn = document.getElementById("print-btn");
  if(printBtn){
    printBtn.addEventListener("click", () => {
      window.print();
    });
  }

  /* ================= SAUVEGARDER ================= */
  const saveBtn = document.getElementById("save-btn");

  if(saveBtn){
    saveBtn.addEventListener("click", () => {

      let sales = JSON.parse(localStorage.getItem("sales")) || [];

      const invoiceData = {
        id: document.getElementById("invoice-id")?.innerText || "",
        date: document.getElementById("invoice-date")?.value || "",
        client: {
          name: document.getElementById("client-name")?.value || "",
          phone: document.getElementById("client-phone")?.value || "",
          address: document.getElementById("client-address")?.value || ""
        },
        items: window.invoice || [],
        total: document.getElementById("total")?.innerText || "0"
      };

      sales.push(invoiceData);

      localStorage.setItem("sales", JSON.stringify(sales));

      alert("Facture sauvegardée 💗");
    });
  }

});

.right table tr:hover {
  background: #fff0f6;
}
