// === ÉCLAT DE COCO POS SYSTEM SCRIPT ===
// Version: 2025 Pro Pink Edition
// Offline Supported (LocalStorage + Service Worker)

document.addEventListener("DOMContentLoaded", () => {
  const productForm = document.getElementById("productForm");
  const productTable = document.getElementById("productTableBody");
  const categorySelect = document.getElementById("categorySelect");
  const orderTable = document.getElementById("orderTableBody");
  const subtotalElement = document.getElementById("subtotal");
  const totalElement = document.getElementById("total");
  const invoiceTable = document.getElementById("invoiceTableBody");
  const customerSelect = document.getElementById("customerSelect");
  const expenseTable = document.getElementById("expenseTableBody");
  const printBtn = document.getElementById("printReceipt");

  let products = JSON.parse(localStorage.getItem("products")) || [];
  let categories = JSON.parse(localStorage.getItem("categories")) || ["Savon", "Lotion", "Sérum"];
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  let customers = JSON.parse(localStorage.getItem("customers")) || [];
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  // === Utility Functions ===
  const saveData = () => {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("categories", JSON.stringify(categories));
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("customers", JSON.stringify(customers));
    localStorage.setItem("expenses", JSON.stringify(expenses));
  };

  const generateProductCode = (category) => {
    const codePrefix = category.substring(0, 2).toUpperCase();
    const count = products.filter(p => p.category === category).length + 1;
    return `${codePrefix}${String(count).padStart(3, "0")}`;
  };

  const generateOrderID = () => {
    const lastOrder = orders[orders.length - 1];
    const lastID = lastOrder ? lastOrder.id : 1000;
    return lastID + 1;
  };

  const updateProductTable = () => {
    productTable.innerHTML = "";
    products.forEach(p => {
      const row = `<tr>
        <td>${p.code}</td>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td>${p.price} CFA</td>
        <td>${p.quantity}</td>
        <td><button class="deleteProduct" data-code="${p.code}">🗑️</button></td>
      </tr>`;
      productTable.insertAdjacentHTML("beforeend", row);
    });
  };

  const updateCategorySelect = () => {
    categorySelect.innerHTML = "";
    categories.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      categorySelect.appendChild(opt);
    });
  };

  const updateOrderTable = () => {
    orderTable.innerHTML = "";
    let subtotal = 0;

    products.forEach(p => {
      if (p.inOrder) {
        const totalPrice = p.inOrder * p.price;
        subtotal += totalPrice;
        orderTable.insertAdjacentHTML("beforeend", `
          <tr>
            <td>${p.name}</td>
            <td>${p.inOrder}</td>
            <td>${p.price}</td>
            <td>${totalPrice}</td>
          </tr>
        `);
      }
    });

    subtotalElement.textContent = `${subtotal} CFA`;
    totalElement.textContent = `${subtotal} CFA`; // same without shipping
  };

  // === Add Product ===
  productForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("productName").value;
    const price = parseFloat(document.getElementById("productPrice").value);
    const quantity = parseInt(document.getElementById("productQuantity").value);
    const category = categorySelect.value;
    const code = generateProductCode(category);

    products.push({ code, name, category, price, quantity });
    saveData();
    updateProductTable();
    productForm.reset();
  });

  // === Delete Product ===
  document.addEventListener("click", e => {
    if (e.target.classList.contains("deleteProduct")) {
      const code = e.target.dataset.code;
      products = products.filter(p => p.code !== code);
      saveData();
      updateProductTable();
    }
  });

  // === Add Category ===
  document.getElementById("addCategory").addEventListener("click", () => {
    const newCat = prompt("Enter new category:");
    if (newCat && !categories.includes(newCat)) {
      categories.push(newCat);
      saveData();
      updateCategorySelect();
    }
  });

  // === Print Receipt ===
  printBtn.addEventListener("click", () => {
    const date = new Date().toLocaleDateString("fr-FR");
    const orderID = generateOrderID();
    const customer = document.getElementById("customerName").value || "Client(e)";
    let itemsHTML = "";

    products.filter(p => p.inOrder).forEach(p => {
      itemsHTML += `
        <tr>
          <td>${p.name}</td>
          <td>${p.inOrder}</td>
          <td>${p.price}</td>
          <td>${p.inOrder * p.price}</td>
        </tr>`;
    });

    const receiptHTML = `
      <div style="font-family: monospace; width: 250px;">
        <h3 style="text-align:center;">Bienvenue à Éclat de Coco</h3>
        <p style="text-align:center;">ID: ${orderID} | ${date}</p>
        <p>Client: ${customer}</p>
        <hr>
        <table style="width:100%;font-size:12px;">
          <thead><tr><th>Produit</th><th>Qté</th><th>PU</th><th>Total</th></tr></thead>
          <tbody>${itemsHTML}</tbody>
        </table>
        <hr>
        <p><strong>Sous-total:</strong> ${subtotalElement.textContent}</p>
        <p><strong>Total:</strong> ${totalElement.textContent}</p>
        <p>Le total est ${totalElement.textContent} sans la livraison</p>
        <hr>
        <p style="font-size:10px;text-align:center;">
        Éclat de Coco<br>
        100% Natural Products 🌿<br>
        WhatsApp : +225 0777000803<br>
        📧 eclatdecocoofficiel@hotmail.com<br>
        Instagram : @Eclatdecoco.official<br>
        ⚠️ Aucun retour possible
        </p>
      </div>
    `;

    const win = window.open("", "PrintReceipt");
    win.document.write(receiptHTML);
    win.print();
    win.close();

    orders.push({ id: orderID, date, customer, total: subtotalElement.textContent });
    saveData();
  });

  // === Init ===
  updateCategorySelect();
  updateProductTable();
  updateOrderTable();
});
