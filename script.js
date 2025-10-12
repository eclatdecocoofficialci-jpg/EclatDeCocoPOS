// =========================
// Éclat de Coco POS Script
// =========================

// LOCAL STORAGE
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = [];

// ===== SAVE TO LOCAL STORAGE =====
function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("products", JSON.stringify(products));
}

// ===== ADD CATEGORY =====
function addCategory(name) {
  if (!name) return alert("Please enter a category name.");
  categories.push({ name, codePrefix: name.slice(0, 2).toUpperCase(), products: [] });
  saveData();
  renderCategories();
}

// ===== RENDER CATEGORIES =====
function renderCategories() {
  const container = document.getElementById("categoryContainer");
  if (!container) return;
  container.innerHTML = "";
  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "category-box";
    div.innerText = cat.name;
    div.onclick = () => openCategory(cat.name);
    container.appendChild(div);
  });
}

// ===== OPEN CATEGORY =====
function openCategory(name) {
  const table = document.getElementById("productTable");
  table.innerHTML = "<tr><th>Code</th><th>Product</th><th>Price</th><th>Cost</th><th>Action</th></tr>";

  const cat = categories.find(c => c.name === name);
  if (!cat) return;

  const catProducts = products.filter(p => p.category === name);
  catProducts.forEach(p => {
    const row = table.insertRow();
    row.insertCell(0).innerText = p.code;
    row.insertCell(1).innerText = p.name;
    row.insertCell(2).innerText = p.price + " CFA";
    row.insertCell(3).innerText = p.cost || "-";
    const actionCell = row.insertCell(4);
    const addBtn = document.createElement("button");
    addBtn.innerText = "+";
    addBtn.onclick = () => addToCart(p);
    actionCell.appendChild(addBtn);
  });
}

// ===== ADD PRODUCT =====
function addProduct(category, name, price, cost) {
  if (!category || !name || !price) return alert("Fill all product fields.");
  const cat = categories.find(c => c.name === category);
  if (!cat) return alert("Category not found.");

  const codePrefix = cat.codePrefix;
  const number = products.filter(p => p.category === category).length + 1;
  const code = `${codePrefix}${String(number).padStart(3, "0")}`;

  const newProduct = { category, name, price: parseFloat(price), cost: parseFloat(cost) || 0, code };
  products.push(newProduct);
  saveData();
  openCategory(category);
}

// ===== ADD TO CART =====
function addToCart(product) {
  const existing = cart.find(item => item.code === product.code);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
}

// ===== RENDER CART =====
function renderCart() {
  const table = document.getElementById("cartTable");
  table.innerHTML = "<tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>";

  let subtotal = 0;
  cart.forEach(item => {
    const total = item.qty * item.price;
    subtotal += total;

    const row = table.insertRow();
    row.insertCell(0).innerText = item.name;
    row.insertCell(1).innerHTML = `
      <button onclick="changeQty('${item.code}', -1)">-</button>
      ${item.qty}
      <button onclick="changeQty('${item.code}', 1)">+</button>
    `;
    row.insertCell(2).innerText = item.price.toFixed(0) + " CFA";
    row.insertCell(3).innerText = total.toFixed(0) + " CFA";
  });

  document.getElementById("subtotal").innerText = subtotal.toFixed(0);
  document.getElementById("total").innerText = subtotal.toFixed(0);
}

// ===== CHANGE QTY =====
function changeQty(code, delta) {
  const item = cart.find(i => i.code === code);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.code !== code);
  renderCart();
}

// ===== CHECKOUT / PRINT RECEIPT =====
function checkout() {
  if (cart.length === 0) return alert("Cart is empty!");

  const clientName = document.getElementById("clientName").value || "Client";
  const date = new Date().toLocaleDateString("fr-FR");

  let receipt = `
    <div style="font-family:Arial;text-align:center;">
      <h3>Éclat de Coco</h3>
      <p>Reçu de vente</p>
      <p>Date: ${date}</p>
      <p>Client: ${clientName}</p>
      <hr>
      <table style="width:100%;text-align:left;">
        <tr><th>Produit</th><th>Qté</th><th>PU</th><th>Total</th></tr>
  `;

  let total = 0;
  cart.forEach(item => {
    const itemTotal = item.qty * item.price;
    total += itemTotal;
    receipt += `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${item.price.toFixed(0)}</td>
        <td>${itemTotal.toFixed(0)}</td>
      </tr>
    `;
  });

  receipt += `
      </table>
      <hr>
      <p><strong>Total: ${total.toFixed(0)} CFA</strong></p>
      <p>Merci pour votre achat 🌸</p>
    </div>
  `;

  const newWindow = window.open("", "Receipt", "width=400,height=600");
  newWindow.document.write(receipt);
  newWindow.print();
  newWindow.close();

  // Save sale record (optional for reports)
  saveSaleHistory({ clientName, total, date });

  cart = [];
  renderCart();
}

// ===== SAVE SALES TO HISTORY =====
function saveSaleHistory(sale) {
  let sales = JSON.parse(localStorage.getItem("sales")) || [];
  sales.push(sale);
  localStorage.setItem("sales", JSON.stringify(sales));
}

// ===== INITIALIZE =====
window.onload = function() {
  renderCategories();
  renderCart();
};
