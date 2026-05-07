let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, stock:10, category:"Savon"},
  {name:"Savon Coco", price:3500, stock:8, category:"Savon"},
  {name:"Lotion Vanille", price:5000, stock:5, category:"Lotion"},
  {name:"Beurre Karité", price:4000, stock:7, category:"Beurre"}
];

/* ================= SAVE PRODUCTS ================= */
function saveProducts(){
  localStorage.setItem("products", JSON.stringify(products));
}

/* ================= BACKUP DATA ================= */
function backupData(){

  const backup = {

    products,

    sales: JSON.parse(localStorage.getItem("sales")) || [],

    customers: JSON.parse(localStorage.getItem("customers")) || [],

    expenses: JSON.parse(localStorage.getItem("expenses")) || []

  };

  localStorage.setItem(
    "eclat_backup",
    JSON.stringify(backup)
  );
}

/* ================= RESTORE BACKUP ================= */
function restoreBackup(){

  const backup =
    JSON.parse(localStorage.getItem("eclat_backup"));

  if(!backup) return;

  if(backup.products){

    products = backup.products;

    saveProducts();
  }

  if(backup.sales){

    localStorage.setItem(
      "sales",
      JSON.stringify(backup.sales)
    );
  }

  if(backup.customers){

    localStorage.setItem(
      "customers",
      JSON.stringify(backup.customers)
    );
  }

  if(backup.expenses){

    localStorage.setItem(
      "expenses",
      JSON.stringify(backup.expenses)
    );
  }
}

let invoice = [];
let paymentMethod = "cash";
let discount = 0;

/* ================= CATEGORY STATE ================= */
let activeCategory = "ALL";

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", function(){

  restoreBackup();

  if(!products) products = [];
  if(!invoice) invoice = [];

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

/* ================= CATEGORIES ================= */
function loadCategories(){

  const box = document.getElementById("category-boxes");

  if(!box) return;

  const categories = [...new Set(products.map(p => p.category))];

  box.innerHTML = `
    <div class="pink-box" onclick="showAll()">ALL</div>
  ` + categories.map(cat =>
    `<div class="pink-box" onclick="filterProducts('${cat}')">${cat}</div>`
  ).join("");
}

function showAll(){
  activeCategory = "ALL";
  renderProducts(products);
}

function filterProducts(category){

  activeCategory = category;

  renderProducts(
    products.filter(p => p.category === category)
  );
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

/* ================= PRODUCTS DISPLAY ================= */
function renderProducts(list){

  const box = document.getElementById("product-list");

  if(!box) return;

  box.innerHTML = list.map(p =>

    `<div class="pink-box"
      onclick='addToInvoice(${JSON.stringify(p.name)}, ${p.price})'>

      <strong>${p.name}</strong><br>

      💰 ${p.price} FCFA<br>

      📦 ${
        p.stock <= 0
        ? `<span style="color:red;font-weight:bold;">RUPTURE</span>`
        : p.stock
      }

    </div>`

  ).join("");
}

/* ================= ADD TO INVOICE ================= */
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

    item.qty += 1;

  } else {

    invoice.push({
      name,
      price,
      qty:1
    });
  }

  renderInvoice();
}

/* ================= INVOICE ================= */
function renderInvoice(){

  const body = document.getElementById("invoice-body");

  if(!body) return;

  body.innerHTML = invoice.map((item, index) => {

    const total = item.price * item.qty;

    return `
      <tr>

        <td>${item.name}</td>

        <td>
          <input
            type="number"
            min="1"
            value="${item.qty}"
            onchange="updateQty(${index}, this.value)">
        </td>

        <td>
          <input
            type="number"
            value="${item.price}"
            onchange="updatePrice(${index}, this.value)">
        </td>

        <td>${total}</td>

        <td>
          <button onclick="removeItem(${index})">❌</button>
        </td>

      </tr>
    `;
  }).join("");

  updateTotal();
}

/* ================= EDIT ================= */
function updateQty(index, value){

  value = Number(value);

  if(value < 1){
    value = 1;
  }

  const product = products.find(
    p => p.name === invoice[index].name
  );

  if(product && value > product.stock){

    alert("⚠ Quantité dépasse le stock");

    value = product.stock;
  }

  invoice[index].qty = value;

  renderInvoice();
}

function updatePrice(index, value){

  invoice[index].price = Number(value);

  if(invoice[index].price < 0){
    invoice[index].price = 0;
  }

  renderInvoice();
}

/* ================= REMOVE ================= */
function removeItem(index){

  invoice.splice(index, 1);

  renderInvoice();
}

/* ================= TOTAL ================= */
function updateTotal(){

  let total = 0;

  invoice.forEach(i => {
    total += i.price * i.qty;
  });

  const delivery =
    Number(document.getElementById("delivery")?.value || 0);

  total = total - (total * discount / 100);

  total += delivery;

  const grand =
    document.getElementById("grand-total");

  const discountBox =
    document.getElementById("discount-value");

  if(grand){
    grand.innerText = Math.round(total) + " FCFA";
  }

  if(discountBox){
    discountBox.innerText = discount + "%";
  }
}

/* ================= PAYMENT ================= */
function selectPayment(el, method){

  paymentMethod = method;

  document.querySelectorAll(".pay-btn").forEach(b =>
    b.classList.remove("active")
  );

  el.classList.add("active");
}

/* ================= CALCULATOR ================= */
function press(v){
  document.getElementById("display").value += v;
}

function clearCalc(){
  document.getElementById("display").value = "";
}

function calculate(){

  try{

    document.getElementById("display").value =
      eval(document.getElementById("display").value);

  } catch {

    alert("Erreur calcul");
  }
}

/* ================= DISCOUNT ================= */
function applyDiscountFromCalc(){

  const value =
    Number(document.getElementById("display").value);

  if(isNaN(value) || value < 0 || value > 100){

    alert("Remise invalide (0 à 100%)");

    return;
  }

  discount = value;

  document.getElementById("discount-value").innerText =
    discount + "%";

  updateTotal();

  clearCalc();
}

/* ================= SAVE SALE ================= */
function saveSale(){

  if(invoice.length === 0){

    alert("Aucun produit dans la facture");

    return;
  }

  /* 🔥 STOCK UPDATE */
  invoice.forEach(item => {

    let product = products.find(
      p => p.name === item.name
    );

    if(product){

      product.stock -= item.qty;

      if(product.stock < 0){
        product.stock = 0;
      }
    }
  });

  saveProducts();

  let sales =
    JSON.parse(localStorage.getItem("sales")) || [];

  const sale = {

    id: generateInvoiceNumber(),

    date:
      document.getElementById("date")?.value ||
      new Date().toISOString().split("T")[0],

    client: {

      name:
        document.getElementById("client-name")?.value || "-",

      phone:
        document.getElementById("client-phone")?.value || "-",

      address:
        document.getElementById("client-address")?.value || "-"
    },

    cart: JSON.parse(JSON.stringify(invoice)),

    discount,

    delivery:
      Number(document.getElementById("delivery")?.value || 0),

    paymentMethod,

    total:
      document.getElementById("grand-total")?.innerText || "0 FCFA"
  };

  sales.push(sale);

  localStorage.setItem("sales", JSON.stringify(sales));

  /* 🔥 AUTO BACKUP */
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

  let last =
    localStorage.getItem("invoiceNumber");

  last = last ? Number(last) + 1 : 1;

  localStorage.setItem("invoiceNumber", last);

  return year + String(last).padStart(3, "0");
}

/* ================= SALES ================= */
function renderSales(){

  let sales =
    JSON.parse(localStorage.getItem("sales")) || [];

  const body =
    document.getElementById("sales-body");

  if(!body) return;

  body.innerHTML = sales.map(sale => `
    <tr>

      <td>${sale.id}</td>

      <td>${sale.client.name}</td>

      <td>${sale.date}</td>

      <td>${sale.paymentMethod}</td>

      <td>${sale.total}</td>

    </tr>
  `).join("");
}
