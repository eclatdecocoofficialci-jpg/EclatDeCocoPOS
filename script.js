let products = [
  {name:"Savon Rose", price:3000, stock:10, category:"Savon"},
  {name:"Savon Coco", price:3500, stock:8, category:"Savon"},
  {name:"Lotion Vanille", price:5000, stock:5, category:"Lotion"},
  {name:"Beurre Karité", price:4000, stock:7, category:"Beurre"}
];

let invoice = [];
let paymentMethod = "cash";
let discount = 0;

/* ================= INIT PROPRE ================= */
document.addEventListener("DOMContentLoaded", function(){

  loadCategories();
  renderProducts(products);

  const searchInput = document.getElementById("search");
  if(searchInput){
    searchInput.addEventListener("input", e => {
      searchProducts(e.target.value);
    });
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
  const categories = [...new Set(products.map(p => p.category))];

  document.getElementById("category-boxes").innerHTML =
    categories.map(cat =>
      `<div class="pink-box" onclick="filterProducts('${cat}')">${cat}</div>`
    ).join("");
}

/* ================= FILTER ================= */
function filterProducts(category){
  renderProducts(products.filter(p => p.category === category));
}

/* ================= SEARCH ================= */
function searchProducts(value){
  const v = value.toLowerCase();

  renderProducts(products.filter(p =>
    p.name.toLowerCase().includes(v) ||
    p.category.toLowerCase().includes(v)
  ));
}

/* ================= PRODUCTS ================= */
function renderProducts(list){

  document.getElementById("product-list").innerHTML =
    list.map(p =>
      `<div class="pink-box" onclick="addToInvoice('${p.name}', ${p.price})">
        <strong>${p.name}</strong><br>
        💰 ${p.price} FCFA<br>
        📦 Stock: ${p.stock}
      </div>`
    ).join("");
}

/* ================= ADD TO FACTURE ================= */
function addToInvoice(name, price){

  const item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  } else {
    invoice.push({name, price, qty:1});
  }

  renderInvoice();
}

/* ================= FACTURE ================= */
function renderInvoice(){

  document.getElementById("invoice-body").innerHTML =
    invoice.map((item, index) => {

      const total = item.price * item.qty;

      return `
        <tr>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>${item.price}</td>
          <td>${total}</td>
          <td>
            <button onclick="removeItem(${index})"
              style="background:#e91e63;color:white;border:none;padding:5px;border-radius:5px;">
              ❌
            </button>
          </td>
        </tr>
      `;
    }).join("");

  updateTotal();
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

  const delivery = Number(document.getElementById("delivery")?.value || 0);

  total = total - (total * discount / 100);
  total += delivery;

  document.getElementById("grand-total").innerText =
    Math.round(total) + " FCFA";

  document.getElementById("discount-value").innerText =
    discount + "%";
}

/* ================= PAYMENT ================= */
function selectPayment(el, method){

  paymentMethod = method;

  document.querySelectorAll(".pay-btn").forEach(b =>
    b.classList.remove("active")
  );

  el.classList.add("active");
}

/* ================= DISCOUNT ================= */
function discount20(){ discount = 20; updateTotal(); }
function discount50(){ discount = 50; updateTotal(); }

/* ================= CALC ================= */
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

/* ================= SAVE SALE (FIX FINAL) ================= */
function saveSale(){

  if(invoice.length === 0){
    alert("Aucun produit dans la facture");
    return;
  }

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  const sale = {
    id: generateInvoiceNumber(),
    date: document.getElementById("date")?.value || new Date().toISOString().split("T")[0],
    client: {
      name: document.getElementById("client-name")?.value || "-",
      phone: document.getElementById("client-phone")?.value || "-",
      address: document.getElementById("client-address")?.value || "-"
    },
    cart: JSON.parse(JSON.stringify(invoice)),
    discount: discount,
    delivery: Number(document.getElementById("delivery")?.value || 0),
    paymentMethod: paymentMethod,
    total: document.getElementById("grand-total").innerText
  };

  sales.push(sale);
  localStorage.setItem("sales", JSON.stringify(sales));

  // RESET FACTURE
  invoice = [];
  renderInvoice();
  updateTotal();

  alert("Vente sauvegardée ✔");
}

/* ================= RENDER SALES ================= */
function renderSales(){

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  sales.sort((a, b) => new Date(b.date) - new Date(a.date));

  let html = "";

  sales.forEach(sale => {

    html += `
      <tr>
        <td>${sale.id}</td>
        <td>${sale.client.name}</td>
        <td>${sale.client.phone}</td>
        <td>${sale.date}</td>
        <td>${sale.paymentMethod}</td>
        <td style="color:#e91e63;font-weight:bold;">
          ${sale.total}
        </td>
      </tr>
    `;
  });

  document.getElementById("sales-body").innerHTML = html;
}

/* ================= INVOICE NUMBER ================= */
function generateInvoiceNumber(){

  const year = new Date().getFullYear();

  let last = localStorage.getItem("invoiceNumber");

  if(!last){
    last = 1;
  } else {
    last = Number(last) + 1;
  }

  localStorage.setItem("invoiceNumber", last);

  return year + String(last).padStart(3, "0");
}

/* ================= RESET CACHE ================= */
function resetServiceWorker(){

  navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(r => r.unregister()));

  alert("Cache cleared ✔");
}
