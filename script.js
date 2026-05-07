let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, stock:10, category:"Savon"},
  {name:"Savon Coco", price:3500, stock:8, category:"Savon"},
  {name:"Lotion Vanille", price:5000, stock:5, category:"Lotion"},
  {name:"Beurre Karité", price:4000, stock:7, category:"Beurre"},

  {
    name: "Savon Baptême",
    price: 0, // 🔥 calculé automatiquement
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

/* ================= PRIX SAVON PERSONNALISÉ ================= */
function calculateCustomPrice(product){

  if(!product.recipe) return product.price;

  const r = product.recipe;

  const materialsCost =
    (r.oil_litre * 2000) +
    (r.soap_kg * 3000) +
    (r.fragrance_ml * 20);

  return materialsCost +
    r.mold_cost +
    r.labor_cost +
    r.packaging;
}

/* ================= SAVE PRODUCTS ================= */
function saveProducts(){
  localStorage.setItem("products", JSON.stringify(products));
}

/* ================= RENDER PRODUCTS ================= */
function renderProducts(list){

  const box = document.getElementById("product-list");
  if(!box) return;

  box.innerHTML = list.map(p => {

    const finalPrice = p.recipe
      ? calculateCustomPrice(p)
      : p.price;

    return `
      <div class="pink-box"
        onclick='addToInvoice(${JSON.stringify(p.name)}, ${finalPrice})'>

        <strong>${p.name}</strong><br>

        💰 ${finalPrice} FCFA<br>

        📦 ${
          p.stock <= 0
          ? `<span style="color:red;font-weight:bold;">RUPTURE</span>`
          : p.stock
        }

      </div>
    `;
  }).join("");
}

/* ================= ADD TO INVOICE ================= */
function addToInvoice(name, price){

  const product = products.find(p => p.name === name);
  if(!product) return;

  const finalPrice = product.recipe
    ? calculateCustomPrice(product)
    : price;

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
    invoice.push({
      name,
      price: finalPrice,
      qty: 1
    });
  }

  renderInvoice();
}
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
