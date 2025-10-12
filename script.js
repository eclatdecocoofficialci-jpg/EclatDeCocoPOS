// ============ GLOBAL VARIABLES ============
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let products = JSON.parse(localStorage.getItem("products")) || [];
let sales = JSON.parse(localStorage.getItem("sales")) || [];
let customers = JSON.parse(localStorage.getItem("customers")) || [];

let currentCart = [];

// ============ SAVE DATA ============
function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("sales", JSON.stringify(sales));
  localStorage.setItem("customers", JSON.stringify(customers));
}

// ============ CATEGORY MANAGEMENT ============
function addCategory(name) {
  if (!name) return alert("Enter a category name");
  if (categories.find(c => c.name === name)) return alert("Category already exists");
  categories.push({ name, code: name.substring(0, 2).toUpperCase() });
  saveData();
  renderCategories();
  closePopup("categoryPopup");
}

function renderCategories() {
  const container = document.getElementById("categoryContainer");
  if (!container) return;
  container.innerHTML = "";
  categories.forEach(cat => {
    const box = document.createElement("div");
    box.className = "category-box";
    box.innerHTML = `<h3>${cat.name}</h3>`;
    box.onclick = () => openCategory(cat.name);
    container.appendChild(box);
  });
}

// ============ PRODUCT MANAGEMENT ============
function addProduct(category, name, price, cost) {
  if (!category || !name || !price) return alert("All fields are required");
  const cat = categories.find(c => c.name === category);
  if (!cat) return alert("Category not found");
  const count = products.filter(p => p.category === category).length + 1;
  const code = cat.code + String(count).padStart(3, "0");
  products.push({ category, code, name, price: parseFloat(price), cost: parseFloat(cost) || 0 });
  saveData();
  openCategory(category);
  closePopup("productPopup");
}

function openCategory(category) {
  const table = document.getElementById("productTable");
  if (!table) return;
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
  if (!tbody) return;
  let total = 0;
  tbody.innerHTML = currentCart.map(item => {
    const subtotal = item.price * item.qty;
    total += subtotal;
    return `
      <tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>${item.price}</td>
        <td>${subtotal}</td>
      </tr>
    `;
  }).join("");

  document.getElementById("subtotal").innerText = total.toFixed(0);
  document.getElementById("total").innerText = total.toFixed(0);
}

// ============ CHECKOUT & RECEIPT ============
function checkout() {
  if (currentCart.length === 0) return alert("Cart is empty!");
  const clientName = document.getElementById("clientName").value || "Client";
  const address = document.getElementById("clientAddress").value || "-";
  const phone = document.getElementById("clientPhone").value || "-";
  const payment = document.getElementById("paymentMethod").value;
  const date = new Date().toLocaleDateString("fr-FR");
  const id = "ID ORDER " + (sales.length + 1001);

  const total = parseFloat(document.getElementById("total").innerText);

  const sale = { id, date, clientName, address, phone, payment, items: currentCart, total };
  sales.push(sale);
  saveData();

  printReceipt(sale);
  currentCart = [];
  renderCart();
}

// ============ PRINT RECEIPT ============
function printReceipt(sale) {
  const receiptWindow = window.open("", "", "width=400,height=600");
  receiptWindow.document.write(`
    <html>
      <head>
        <title>Facture ${sale.id}</title>
        <style>
          body { font-family: Arial; text-align: center; font-size: 13px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 4px; text-align: left; }
          hr { border: 0; border-top: 1px solid #000; margin: 8px 0; }
        </style>
      </head>
      <body>
        <h2>Bienvenue à Éclat de Coco</h2>
        <p>100% Natural Products 🌿</p>
        <p>WhatsApp : +225 0777000803</p>
        <p>📧 eclatdecocoofficiel@hotmail.com</p>
        <p>Instagram : @Eclatdecoco.official</p>
        <hr>
        <p><strong>Date :</strong> ${sale.date}<br><strong>ID :</strong> ${sale.id}</p>
        <p><strong>Client :</strong> ${sale.clientName}<br>${sale.address}<br>${sale.phone}</p>
        <table>
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
        <p><strong>Sous-total :</strong> ${sale.total} CFA</p>
        <p><strong>Le total est ${sale.total} CFA sans la livraison</strong></p>
        <p><strong>Méthode de paiement :</strong> ${sale.payment}</p>
        <hr>
        <p>⚠️ Aucun retour possible</p>
        <p>Merci pour votre confiance 💖</p>
        <p>Abidjan - Côte d'Ivoire</p>
        <p>Pour plus d'informations, contactez-nous !</p>
        <script>window.print();</script>
      </body>
    </html>
  `);
  receiptWindow.document.close();
}

// ============ INITIALIZE ============
document.addEventListener("DOMContentLoaded", () => {
  renderCategories();
  renderCart();
});
