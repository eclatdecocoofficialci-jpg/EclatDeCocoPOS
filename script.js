// ================== GLOBAL DATA ==================
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];
let currentCart = [];

// ================== SAVE DATA ==================
function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("sales", JSON.stringify(sales));
  localStorage.setItem("customers", JSON.stringify(customers));
}

// ================== CATEGORY FUNCTIONS ==================
function addCategoryFromPopup() {
  const name = document.getElementById("categoryName").value.trim();
  if (!name) return alert("Enter a category name");
  if (categories.find(c => c.name === name)) return alert("Category already exists");

  const code = name.substring(0, 2).toUpperCase();
  categories.push({ name, code });
  saveData();
  closePopup("categoryPopup");
  renderCategories();
  updateCategoryDropdown();
}

function renderCategories() {
  const container = document.getElementById("categoryContainer");
  container.innerHTML = "";
  categories.forEach(cat => {
    const box = document.createElement("div");
    box.className = "category-box";
    box.innerHTML = `<p>${cat.name}</p>`;
    box.onclick = () => openCategory(cat.name);
    container.appendChild(box);
  });
}

// ================== PRODUCT FUNCTIONS ==================
function updateCategoryDropdown() {
  const dropdown = document.getElementById("productCategory");
  dropdown.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
}

function addProductFromPopup() {
  const category = document.getElementById("productCategory").value;
  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const cost = parseFloat(document.getElementById("productCost").value) || 0;

  if (!category || !name || !price) return alert("Please fill all fields");

  const cat = categories.find(c => c.name === category);
  const code = cat.code + String(products.length + 1).padStart(3, "0");

  products.push({ category, code, name, price, cost });
  saveData();
  closePopup("productPopup");
  openCategory(category);
}

// ================== DISPLAY PRODUCTS ==================
function openCategory(category) {
  const table = document.getElementById("productTable");
  const filtered = products.filter(p => p.category === category);

  table.innerHTML = `
    <tr><th>Code</th><th>Product</th><th>Price</th><th>Cost</th><th>Action</th></tr>
    ${filtered.map(p => `
      <tr>
        <td>${p.code}</td>
        <td>${p.name}</td>
        <td>${p.price}</td>
        <td>${p.cost}</td>
        <td><button onclick="addToCart('${p.code}')">+</button></td>
      </tr>
    `).join("")}
  `;
}

// ================== CART FUNCTIONS ==================
function addToCart(code) {
  const product = products.find(p => p.code === code);
  if (!product) return;

  const existing = currentCart.find(i => i.code === code);
  if (existing) existing.qty++;
  else currentCart.push({ ...product, qty: 1 });

  renderCart();
}

function renderCart() {
  const tbody = document.getElementById("cartTable");
  tbody.innerHTML = "";

  let total = 0;
  currentCart.forEach(item => {
    const subtotal = item.qty * item.price;
    total += subtotal;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price}</td>
      <td>${subtotal}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("subtotal").innerText = total.toFixed(0);
  document.getElementById("total").innerText = total.toFixed(0);
}

function clearCart() {
  currentCart = [];
  renderCart();
}

// ================== CHECKOUT ==================
function checkout() {
  if (currentCart.length === 0) return alert("Cart is empty!");

  const clientName = document.getElementById("clientName").value || "Client";
  const address = document.getElementById("clientAddress").value || "-";
  const phone = document.getElementById("clientPhone").value || "-";
  const paymentMethod = document.getElementById("paymentMethod").value;

  const date = new Date().toLocaleDateString("fr-FR");
  const id = "INV" + Date.now().toString().slice(-5);
  const total = parseFloat(document.getElementById("total").innerText);

  const sale = { id, date, clientName, address, phone, paymentMethod, items: currentCart, total };
  sales.push(sale);
  saveData();

  printReceipt(sale);
  currentCart = [];
  renderCart();
}

// ================== PRINT RECEIPT (A5) ==================
function printReceipt(sale) {
  const receiptWindow = window.open("", "", "width=800,height=600");
  receiptWindow.document.write(`
    <html>
    <head>
      <title>Facture ${sale.id}</title>
      <style>
        body { font-family: Arial; color:#000; width: 90%; margin: 20px auto; }
        h2 { text-align:center; color:#d63384; }
        table { width:100%; border-collapse: collapse; }
        th, td { border-bottom:1px solid #ccc; padding:8px; text-align:left; font-size:13px; }
        th { background:#ffe6f2; }
        .footer { text-align:center; margin-top:15px; font-size:12px; }
      </style>
    </head>
    <body>
      <h2>ÉCLAT DE COCO</h2>
      <p style="text-align:center;">100% Natural Products 🌿<br>
      WhatsApp: +225 0777000803<br>
      📧 eclatdecocoofficiel@hotmail.com<br>
      Instagram: @Eclatdecoco.official</p>
      <hr>

      <p><strong>Facture N°:</strong> ${sale.id}<br>
      <strong>Date:</strong> ${sale.date}<br>
      <strong>Client:</strong> ${sale.clientName}<br>
      ${sale.address} - ${sale.phone}</p>

      <table>
        <tr><th>Produit</th><th>Qté</th><th>Prix Unitaire</th><th>Total</th></tr>
        ${sale.items.map(i => `
          <tr>
            <td>${i.name}</td>
            <td>${i.qty}</td>
            <td>${i.price}</td>
            <td>${(i.qty * i.price).toFixed(0)}</td>
          </tr>
        `).join("")}
      </table>

      <p><strong>Sous-total:</strong> ${sale.total} CFA</p>
      <p><strong>Le total est ${sale.total} CFA sans la livraison</strong></p>
      <p><strong>Méthode de paiement:</strong> ${sale.paymentMethod}</p>
      <hr>
      <div class="footer">
        ⚠️ Aucun retour possible<br>
        Merci pour votre confiance 💖
      </div>
      <script>window.print();</script>
    </body>
    </html>
  `);
  receiptWindow.document.close();
}

// ================== POPUP CONTROLS ==================
function openPopup(id) {
  document.getElementById(id).style.display = "flex";
}

function closePopup(id) {
  document.getElementById(id).style.display = "none";
}

// ================== INITIALIZE ==================
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderCart();
  updateCategoryDropdown();
});
