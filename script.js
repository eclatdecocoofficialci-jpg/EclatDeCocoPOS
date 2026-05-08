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

/* ================= PRICE CALC ================= */
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

  box.innerHTML = list.map((p, index) => {

    const price = p.recipe ? calculateCustomPrice(p) : p.price;

    return `
      <div class="pink-box" onclick="addToInvoice('${p.name.replace(/'/g," ") }', ${price})">

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

  if(product.stock <= 0){
    alert("❌ Rupture stock");
    return;
  }

  const item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  } else {
    invoice.push({name, price, qty:1});
  }

  // 🔥 décrément stock
  product.stock -= 1;

  saveProducts();
  renderInvoice();
  renderProducts(products);
}

/* ================= SAVE STOCK ================= */
function saveProducts(){
  localStorage.setItem("products", JSON.stringify(products));
}

/* ================= INVOICE ================= */
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

  const el = document.getElementById("grand-total");
  if(el) el.innerText = Math.round(total) + " FCFA";
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
