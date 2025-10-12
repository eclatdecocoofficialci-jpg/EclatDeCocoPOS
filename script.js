// ============ GLOBAL VARIABLES ============
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let currentCart = [];

// ============ SAVE & LOAD ============
function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("sales", JSON.stringify(sales));
}

// ============ LOGIN ============
function checkAccess() {
  const code = document.getElementById("accessCode").value;
  if (code === "1234") {
    document.getElementById("loginPopup").style.display = "none";
  } else {
    alert("Incorrect code ❌");
  }
}

// ============ CATEGORY MANAGEMENT ============
function openCategoryPopup() {
  document.getElementById("categoryPopup").style.display = "flex";
}

function addCategoryFromPopup() {
  const name = document.getElementById("newCategoryName").value.trim();
  if (!name) return alert("Enter a category name");
  if (categories.find(c => c.name === name)) return alert("Category already exists");
  categories.push({ name, code: name.substring(0, 2).toUpperCase() });
  saveData();
  renderCategories();
  closePopup('categoryPopup');
}

function renderCategories() {
  const container = document.getElementById("categoryContainer");
  const select = document.getElementById("productCategory");
  if (!container) return;

  container.innerHTML = "";
  select.innerHTML = "";

  categories.forEach(cat => {
    // Create box
    const box = document.createElement("div");
    box.className = "category-box";
    box.innerText = cat.name;
    box.onclick = () => openCategory(cat.name);
    container.appendChild(box);

    // Add to select
    const opt = document.createElement("option");
    opt.value = cat.name;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

// ============ PRODUCT MANAGEMENT ============
function openProductPopup() {
  document.getElementById("productPopup").style.display = "flex";
}

function addProductFromPopup() {
  const category = document.getElementById("productCategory").value;
  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  const cost = parseFloat(document.getElementById("productCost").value);

  if (!category || !name || isNaN(price)) return alert("Fill all required fields");

  const cat = categories.find(c => c.name === category);
  const code = cat.code + String(products.length + 1).padStart(3, "0");

  products.push({ category, code, name, price, cost });
  saveData();
  openCategory(category);
  closePopup('productPopup');
}

function openCategory(category) {
  const table = document.getElementById("productTable");
  const filtered = products.filter(p => p.category === category);
  table.innerHTML = `
    <tr><th>Code</th><th>Name</th><th>Price</th><th>Cost</th><th>Action</th></tr>
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

// ============ CART MANAGEMENT ============
function addToCart(code) {
  const product = products.find(p => p.code === code);
  if (!product) return;
  const existing = currentCart.find(i => i.code === code);
  if (existing) existing.qty += 1;
  else currentCart.push({ ...product, qty: 1 });
  renderCart();
}

function renderCart() {
  const tbody = document.getElementById("cartTable");
  let total = 0;

  tbody.innerHTML = `
    <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
    ${currentCart.map(item => {
      const subtotal = item.price * item.qty;
      total += subtotal;
      return `
        <tr>
          <td>${item.name}</td>
          <td>
            <button onclick="changeQty('${item.code}', -1)">-</button>
            ${item.qty}
            <button onclick="changeQty('${item.code}', 1)">+</button>
          </td>
          <td>${item.price}</td>
          <td>${subtotal}</td>
        </tr>
      `;
    }).join("")}
  `;

  document.getElementById("subtotal").innerText = total.toFixed(0);
  document.getElementById("total").innerText = total.toFixed(0);
}

function changeQty(code, delta) {
  const item = currentCart.find(i => i.code === code);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) currentCart = currentCart.filter(i => i.code !== code);
  renderCart();
}

function clearCart() {
  currentCart = [];
  renderCart();
}

// ============ CHECKOUT ============
function checkout() {
  if (currentCart.length === 0) return alert("Cart is empty!");
  
  const clientName = document.getElementById("clientName").value || "Client";
  const address = document.getElementById("clientAddress").value || "-";
  const phone = document.getElementById("clientPhone").value || "-";
  const payment = document.getElementById("paymentMethod").value;
  const date = new Date().toLocaleDateString("fr-FR");
  const id = "INV" + Date.now().toString().slice(-6);

  const total = parseFloat(document.getElementById("total").innerText);

  const sale = { id, date, clientName, address, phone, payment, items: currentCart, total };
  sales.push(sale);
  saveData();

  printReceipt(sale);
  clearCart();
}

// ============ RECEIPT PRINT ============
function printReceipt(sale) {
  const receiptWindow = window.open("", "", "width=400,height=600");
  receiptWindow.document.write(`
    <html>
      <head><title>Facture ${sale.id}</title></head>
      <body style="font-family:Arial; text-align:center; color:#000; font-size:13px;">
        <h2>ÉCLAT DE COCO</h2>
        <p>Produits Naturels & Soins 🌸</p>
        <p>WhatsApp: +225 0777000803</p>
        <p>📧 eclatdecocoofficiel@hotmail.com</p>
        <p>Instagram: @Eclatdecoco.official</p>
        <hr>
        <p><strong>Facture N°:</strong> ${sale.id}<br><strong>Date:</strong> ${sale.date}</p>
        <p><strong>Client:</strong> ${sale.clientName}<br>${sale.address}<br>${sale.phone}</p>
        <p><strong>Méthode de Paiement:</strong> ${sale.payment}</p>
        <table width="100%" border="0" style="text-align:left;">
          <tr><th>Produit</th><th>Qté</th><th>PU</th><th>Total</th></tr>
          ${sale.items.map(i => `
            <tr>
              <td>${i.name}</td>
              <td>${i.qty}</td>
              <td>${i.price}</td>
              <td>${(i.qty * i.price).toFixed(0)}</td>
            </tr>
          `).join("")}
        </table>
        <hr>
        <p><strong>Sous-total:</strong> ${sale.total} CFA</p>
        <p><strong>Total:</strong> ${sale.total} CFA (hors livraison)</strong></p>
        <hr>
        <p><em>⚠️ Aucun retour ni remboursement</em></p>
        <p>Merci pour votre confiance 💖</p>
        <script>window.print();</script>
      </body>
    </html>
  `);
  receiptWindow.document.close();
}

// ============ POPUP UTILS ============
function closePopup(id) {
  document.getElementById(id).style.display = "none";
}

// ============ INIT ============
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderCart();
});
