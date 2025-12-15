// ======== VARIABLES ========
let cart = [];
let orderNumber = generateOrderNumber();
let currentDate = new Date().toISOString().split("T")[0];

const subtotalEl = document.getElementById("subtotal");
const totalFinalEl = document.getElementById("total-final");
const deliveryInput = document.getElementById("delivery");
const invoiceDateInput = document.getElementById("invoice-date");
const invoiceIdEl = document.getElementById("invoice-id");

// ======== INITIALISATION ========
invoiceIdEl.innerText = orderNumber;
invoiceDateInput.value = currentDate;
updateInvoice();

// ======== AJOUT DES PRODUITS ========
const productButtons = document.querySelectorAll(".product-card button");
productButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".product-card");
    const name = card.querySelector("strong").innerText;
    const price = parseInt(card.querySelector("span strong").innerText.replace(/\D/g, ""));
    const qty = parseInt(card.querySelector("input").value);
    addToCart(name, qty, price);
  });
});

function addToCart(name, qty, price) {
  const existing = cart.find(p => p.name === name);
  if (existing) { existing.qty += qty; }
  else { cart.push({ name, qty, price }); }
  updateInvoice();
}

// ======== UPDATE FACTURE ========
function updateInvoice() {
  const tbody = document.querySelector(".right-panel tbody");
  tbody.innerHTML = "";
  let subtotal = 0;

  cart.forEach((item, i) => {
    const total = item.qty * item.price;
    subtotal += total;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.price.toLocaleString()} FCFA</td>
      <td>${total.toLocaleString()} FCFA</td>
      <td><button onclick="removeItem(${i})">Supprimer</button></td>
    `;
    tbody.appendChild(tr);
  });

  if(cart.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="5">Aucun article</td>';
    tbody.appendChild(row);
  }

  subtotalEl.innerText = `${subtotal.toLocaleString()} FCFA`;
  const delivery = parseInt(deliveryInput.value) || 0;
  totalFinalEl.innerText = `${(subtotal + delivery).toLocaleString()} FCFA`;
}

function removeItem(index) {
  cart.splice(index, 1);
  updateInvoice();
}

// ======== LIVRAISON ========
deliveryInput.addEventListener("input", updateInvoice);

// ======== IMPRIMER ========
document.getElementById("print-btn").addEventListener("click", () => {
  updateInvoice();
  window.print();
});

// ======== EXPORT PDF ========
document.getElementById("pdf-btn").addEventListener("click", generatePDF);

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const invoiceId = invoiceIdEl.innerText;
  const invoiceDate = invoiceDateInput.value || currentDate;
  const delivery = parseInt(deliveryInput.value) || 0;
  const subtotal = cart.reduce((acc,i)=>acc+i.qty*i.price,0);

  let y = 10;

  // HEADER
  doc.setFontSize(18);
  doc.text("Éclat de Coco POS", 105, y, { align: "center" });
  y += 10;
  doc.setFontSize(12);
  doc.text(`Facture: ${invoiceId}`, 10, y);
  doc.text(`Date: ${invoiceDate}`, 150, y);
  y += 10;

  // TABLE HEADER
  doc.text("Produit", 10, y);
  doc.text("Qté", 80, y);
  doc.text("Prix", 110, y);
  doc.text("Total", 150, y);
  y += 7;
  doc.setLineWidth(0.5);
  doc.line(10, y, 200, y);
  y += 5;

  // PRODUITS
  cart.forEach(item => {
    const total = item.qty * item.price;
    doc.text(item.name, 10, y);
    doc.text(String(item.qty), 80, y);
    doc.text(item.price.toLocaleString()+" FCFA", 110, y);
    doc.text(total.toLocaleString()+" FCFA", 150, y);
    y += 7;
  });

  // TOTAUX
  y += 5;
  doc.text(`Sous-total: ${subtotal.toLocaleString()} FCFA`, 150, y);
  y += 7;
  doc.text(`Livraison: ${delivery.toLocaleString()} FCFA`, 150, y);
  y += 7;
  doc.setFontSize(14);
  doc.text(`Total: ${(subtotal + delivery).toLocaleString()} FCFA`, 150, y);

  doc.save(`Facture_${invoiceId}.pdf`);
}

// ======== SAUVEGARDER ========
document.getElementById("save-btn").addEventListener("click", () => {
  const invoiceDate = invoiceDateInput.value || currentDate;
  let sales = JSON.parse(localStorage.getItem("sales")) || [];
  sales.push({
    id: orderNumber,
    date: invoiceDate,
    cart,
    delivery: parseInt(deliveryInput.value) || 0,
    total: cart.reduce((acc,i)=>acc+i.qty*i.price,0)+(parseInt(deliveryInput.value)||0)
  });
  localStorage.setItem("sales", JSON.stringify(sales));
  alert(`Facture ${orderNumber} sauvegardée !`);
  cart = [];
  orderNumber = generateOrderNumber();
  invoiceIdEl.innerText = orderNumber;
  invoiceDateInput.value = currentDate;
  deliveryInput.value = "";
  updateInvoice();
});

// ======== GENERATION NUMERO FACTURE ========
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const lastNumber = parseInt(localStorage.getItem("lastInvoice")) || 0;
  const nextNumber = lastNumber + 1;
  localStorage.setItem("lastInvoice", nextNumber);
  return `${year}${String(nextNumber).padStart(3,"0")}`; // exemple: 2025001
}
