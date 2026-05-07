let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, stock:10, category:"Savon"},
  {name:"Savon Coco", price:3500, stock:8, category:"Savon"},
  {name:"Lotion Vanille", price:5000, stock:5, category:"Lotion"},
  {name:"Beurre Karité", price:4000, stock:7, category:"Beurre"},

  {
    name: "Savon Baptême",
    price: 0,
    stock: 5,
    category: "Savon Personnalisé",
    recipe: {
      oil_litre: 0.5,
      soap_kg: 1,
      fragrance_ml: 50,
      mold_cost: 500,
      labor_cost: 1000,
      packaging: 300
    }
  }
];

let invoice = [];
let paymentMethod = "cash";
let discount = 0;
let activeCategory = "ALL";

/* ================= SOAP UI ================= */
let soapMode = "standard";

function openSavonUI(){
  const ui = document.getElementById("soap-ui");
  if(ui) ui.style.display = "block";
}

function toggleSoapUI(){
  const ui = document.getElementById("soap-ui");
  if(ui){
    ui.style.display = (ui.style.display === "none") ? "block" : "none";
  }
}

function setSoapMode(mode){

  soapMode = mode;

  const std = document.getElementById("soap-standard");
  const cus = document.getElementById("soap-custom");

  const btns = document.querySelectorAll(".payment-boxes .pay-btn");

  btns.forEach(b => b.classList.remove("active"));

  if(mode === "standard"){
    std.style.display = "block";
    cus.style.display = "none";
    btns[0].classList.add("active");
  }

  if(mode === "custom"){
    std.style.display = "none";
    cus.style.display = "block";
    btns[1].classList.add("active");
  }
}

/* ================= CALC SOAP ================= */
function calcSoap(){

  const oil = Number(document.getElementById("c_oil")?.value || 0);
  const base = Number(document.getElementById("c_base")?.value || 0);
  const perfume = Number(document.getElementById("c_perfume")?.value || 0);

  const mold = Number(document.getElementById("c_mold")?.value || 0);
  const labor = Number(document.getElementById("c_labor")?.value || 0);
  const pack = Number(document.getElementById("c_pack")?.value || 0);

  let total = 0;

  if(soapMode === "custom"){
    total =
      (oil * 2000) +
      (base * 3000) +
      (perfume * 20) +
      mold + labor + pack;
  } else {
    total = (base * 2500) + pack;
  }

  const el = document.getElementById("soap-total");
  if(el) el.innerText = Math.round(total);
}

function addSoapToInvoice(){

  const total = Number(document.getElementById("soap-total")?.innerText || 0);

  if(total <= 0){
    alert("⚠ Remplis les champs");
    return;
  }

  invoice.push({
    name: soapMode === "custom"
      ? "Savon Personnalisé"
      : "Savon Standard",

    price: total,
    qty: 1
  });

  renderInvoice();
}

/* ================= SAVE ================= */
function saveProducts(){
  localStorage.setItem("products", JSON.stringify(products));
}

/* ================= CALCUL PRIX RECETTE ================= */
function calculateCustomPrice(product){

  if(!product || !product.recipe) return product.price;

  const r = product.recipe;

  return (
    (r.oil_litre * 2000) +
    (r.soap_kg * 3000) +
    (r.fragrance_ml * 20) +
    r.mold_cost +
    r.labor_cost +
    r.packaging
  );
}

/* ================= CATEGORIES ================= */
function loadCategories(){

  const box = document.getElementById("category-boxes");
  if(!box) return;

  const categories = [...new Set(products.map(p => p.category))];

  box.innerHTML =
    `<div class="pink-box" onclick="showAll()">ALL</div>` +
    categories.map(cat =>
      `<div class="pink-box" onclick="filterProducts('${cat}')">${cat}</div>`
    ).join("");
}

function showAll(){
  activeCategory = "ALL";
  renderProducts(products);
}

function filterProducts(category){
  activeCategory = category;
  renderProducts(products.filter(p => p.category === category));
}

/* ================= SEARCH ================= */
function searchProducts(value){

  const v = value.toLowerCase();

  let base = products;

  if(activeCategory !== "ALL"){
    base = products.filter(p => p.category === activeCategory);
  }

  renderProducts(
    base.filter(p =>
      p.name.toLowerCase().includes(v) ||
      p.category.toLowerCase().includes(v)
    )
  );
}

/* ================= PRODUCTS ================= */
function renderProducts(list){

  const box = document.getElementById("product-list");
  if(!box) return;

  box.innerHTML = list.map(p => {

    const price = p.recipe
      ? calculateCustomPrice(p)
      : p.price;

    return `
      <div class="pink-box"
        onclick='addToInvoice(${JSON.stringify(p.name)}, ${price})'>

        <strong>${p.name}</strong><br>
        💰 ${price} FCFA<br>

        📦 ${
          p.stock <= 0
          ? `<span style="color:red;font-weight:bold;">RUPTURE</span>`
          : p.stock
        }

      </div>
    `;
  }).join("");
}

/* ================= INVOICE ================= */
function addToInvoice(name, price){

  const product = products.find(p => p.name === name);
  if(!product) return;

  const finalPrice = product.recipe
    ? calculateCustomPrice(product)
    : price;

  if(product.stock <= 0){
    alert("❌ Rupture stock");
    return;
  }

  const item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  } else {
    invoice.push({name, price: finalPrice, qty:1});
  }

  renderInvoice();
}

function renderInvoice(){

  const body = document.getElementById("invoice-body");
  if(!body) return;

  body.innerHTML = invoice.map((item, index) => `
    <tr>
      <td>${item.name}</td>
      <td><input type="number" value="${item.qty}" onchange="updateQty(${index},this.value)"></td>
      <td><input type="number" value="${item.price}" onchange="updatePrice(${index},this.value)"></td>
      <td>${item.price * item.qty}</td>
      <td><button onclick="removeItem(${index})">❌</button></td>
    </tr>
  `).join("");

  updateTotal();
}

function updateQty(i,v){
  invoice[i].qty = Math.max(1, Number(v));
  renderInvoice();
}

function updatePrice(i,v){
  invoice[i].price = Math.max(0, Number(v));
  renderInvoice();
}

function removeItem(i){
  invoice.splice(i,1);
  renderInvoice();
}

/* ================= TOTAL ================= */
function updateTotal(){

  let total = 0;

  invoice.forEach(i=>{
    total += i.price * i.qty;
  });

  const delivery = Number(document.getElementById("delivery")?.value || 0);

  total = total - (total * discount / 100);
  total += delivery;

  document.getElementById("grand-total").innerText =
    Math.round(total) + " FCFA";
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", function(){

  loadCategories();
  renderProducts(products);

  const searchInput = document.getElementById("search");
  if(searchInput){
    searchInput.addEventListener("input", e =>
      searchProducts(e.target.value)
    );
  }
});
