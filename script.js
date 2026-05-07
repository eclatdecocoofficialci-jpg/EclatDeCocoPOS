let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, stock:10, category:"Savon"},
  {name:"Savon Coco", price:3500, stock:8, category:"Savon"},
  {name:"Lotion Vanille", price:5000, stock:5, category:"Lotion"},
  {name:"Beurre Karité", price:4000, stock:7, category:"Beurre"},

  {
    name: "Savon Baptême",
    price: 5000,
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

/* ================= SAVE PRODUCTS ================= */
function saveProducts(){
  localStorage.setItem("products", JSON.stringify(products));
}

/* ================= BACKUP ================= */
function backupData(){

  const backup = {
    products,
    sales: JSON.parse(localStorage.getItem("sales")) || [],
    customers: JSON.parse(localStorage.getItem("customers")) || [],
    expenses: JSON.parse(localStorage.getItem("expenses")) || []
  };

  localStorage.setItem("eclat_backup", JSON.stringify(backup));
}

/* ================= RESTORE ================= */
function restoreBackup(){

  const backup = JSON.parse(localStorage.getItem("eclat_backup"));
  if(!backup) return;

  if(backup.products){
    products = backup.products;
    saveProducts();
  }

  if(backup.sales){
    localStorage.setItem("sales", JSON.stringify(backup.sales));
  }

  if(backup.customers){
    localStorage.setItem("customers", JSON.stringify(backup.customers));
  }

  if(backup.expenses){
    localStorage.setItem("expenses", JSON.stringify(backup.expenses));
  }
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", function(){

  restoreBackup();

  loadCategories();
  renderProducts(products);

  const searchInput = document.getElementById("search");
  if(searchInput){
    searchInput.addEventListener("input", e =>
      searchProducts(e.target.value)
    );
  }

  const deliveryInput = document.getElementById("delivery");
  if(deliveryInput){
    deliveryInput.addEventListener("input", updateTotal);
  }

  if(document.getElementById("sales-body")){
    renderSales();
  }
});

/* ================= CUSTOMERS SYSTEM ================= */
function updateCustomer(name, phone, address){

  let customers = JSON.parse(localStorage.getItem("customers")) || [];

  if(!phone || phone === "-") return;

  let existing = customers.find(c => c.phone === phone);

  if(existing){
    existing.totalInvoices = (existing.totalInvoices || 0) + 1;
  } else {
    customers.push({
      id: "CL" + String(customers.length + 1).padStart(3,"0"),
      name: name || "-",
      phone,
      address: address || "-",
      totalInvoices: 1
    });
  }

  localStorage.setItem("customers", JSON.stringify(customers));
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

  box.innerHTML = list.map(p => `
    <div class="pink-box"
      onclick='addToInvoice(${JSON.stringify(p.name)}, ${p.price})'>

      <strong>${p.name}</strong><br>
      💰 ${p.price} FCFA<br>

      📦 ${
        p.stock <= 0
        ? `<span style="color:red;font-weight:bold;">RUPTURE</span>`
        : p.stock
      }

    </div>
  `).join("");
}

/* ================= INVOICE ================= */
function addToInvoice(name, price){

  const product = products.find(p => p.name === name);
  if(!product) return;

  if(product.stock <= 0){
    alert("❌ Produit en rupture de stock");
    return;
  }

  const item = invoice.find(i => i.name === name);

  if(item){

    if(item.qty >= product.stock){
      alert("⚠ Stock maximum atteint");
      return;
    }

    item.qty++;

  } else {
    invoice.push({name, price, qty:1});
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

/* ================= EDIT ================= */
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

/* ================= SAVE SALE ================= */
function saveSale(){

  if(invoice.length === 0){
    alert("Aucun produit");
    return;
  }

  invoice.forEach(item=>{
    let p = products.find(x=>x.name===item.name);
    if(p){
      p.stock -= item.qty;
      if(p.stock < 0) p.stock = 0;
    }
  });

  saveProducts();

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  const name = document.getElementById("client-name")?.value || "-";
  const phone = document.getElementById("client-phone")?.value || "-";
  const address = document.getElementById("client-address")?.value || "-";

  const sale = {
    id: generateInvoiceNumber(),
    date: new Date().toISOString().split("T")[0],
    client: {name, phone, address},
    cart: JSON.parse(JSON.stringify(invoice)),
    discount,
    delivery: Number(document.getElementById("delivery")?.value || 0),
    paymentMethod,
    total: document.getElementById("grand-total").innerText
  };

  sales.push(sale);
  localStorage.setItem("sales", JSON.stringify(sales));

  updateCustomer(name, phone, address);

  backupData();

  invoice = [];
  renderInvoice();
  renderProducts(products);
  loadCategories();
  updateTotal();

  alert("Vente sauvegardée ✔");
}

/* ================= INVOICE NUMBER ================= */
function generateInvoiceNumber(){
  const year = new Date().getFullYear();
  let last = localStorage.getItem("invoiceNumber");
  last = last ? Number(last)+1 : 1;
  localStorage.setItem("invoiceNumber", last);
  return year + String(last).padStart(3,"0");
}

/* ================= SALES ================= */
function renderSales(){

  let sales = JSON.parse(localStorage.getItem("sales")) || [];
  const body = document.getElementById("sales-body");
  if(!body) return;

  body.innerHTML = sales.map(s=>`
    <tr>
      <td>${s.id}</td>
      <td>${s.client.name}</td>
      <td>${s.date}</td>
      <td>${s.paymentMethod}</td>
      <td>${s.total}</td>
    </tr>
  `).join("");
}
