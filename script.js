let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, category:"Savon"},
  {name:"Lotion Vanille", price:5000, category:"Lotion"}
];

let invoice = JSON.parse(localStorage.getItem("invoice")) || [];
let discount = parseFloat(localStorage.getItem("discount")) || 0;

/* ================= STORAGE ================= */
function saveState(){
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("invoice", JSON.stringify(invoice));
  localStorage.setItem("discount", discount);
}

/* ================= INVOICE NUMBER ================= */
function generateInvoiceNumber(){
  let last = localStorage.getItem("invoiceNumber");

  if(!last){
    last = 1;
  } else {
    last = parseInt(last) + 1;
  }

  localStorage.setItem("invoiceNumber", last);
  return "2026" + String(last).padStart(3,"0");
}

document.getElementById("invoice-id").innerText = generateInvoiceNumber();

/* ================= CATEGORIES ================= */
function renderCategories(){
  let categories = [...new Set(products.map(p => p.category))];

  let box = document.getElementById("category-boxes");
  box.innerHTML = "";

  categories.forEach(c=>{
    let div = document.createElement("div");
    div.className = "category";
    div.innerText = c;
    div.onclick = ()=>filterProducts(c);
    box.appendChild(div);
  });
}

/* ================= PRODUCTS ================= */
function filterProducts(cat){
  let list = document.getElementById("product-list");
  list.innerHTML = "";

  products
    .filter(p => p.category === cat)
    .forEach(p=>{
      let div = document.createElement("div");
      div.className = "product-box";

      div.innerHTML = `
        <strong>${p.name}</strong><br>
        ${p.price} FCFA<br>
        <button onclick="addToCart('${p.name}',${p.price})">Ajouter</button>
      `;

      list.appendChild(div);
    });
}

/* ================= ADD TO CART ================= */
function addToCart(name, price){
  let item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  } else {
    invoice.push({name, price, qty:1});
  }

  saveState();
  renderInvoice();
}

/* ================= INVOICE RENDER ================= */
function renderInvoice(){
  let table = document.getElementById("invoice-body");
  table.innerHTML = "";

  let total = 0;

  invoice.forEach(i=>{
    let t = i.qty * i.price;
    total += t;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${t}</td>
    `;
    table.appendChild(tr);
  });

  let delivery = parseFloat(document.getElementById("delivery").value) || 0;
  total += delivery;

  let final = total - (total * discount / 100);

  document.getElementById("grand-total").innerText = final + " FCFA";

  saveState();
}

/* ================= DISCOUNT ================= */
function setDiscount(p){
  discount = p;
  saveState();
  renderInvoice();
}

/* ================= CALCULATOR ================= */
function press(val){
  document.getElementById("display").value += val;
}

function clearCalc(){
  document.getElementById("display").value = "";
}

function calculate(){
  try {
    document.getElementById("display").value =
      eval(document.getElementById("display").value);
  } catch {
    document.getElementById("display").value = "Erreur";
  }
}

/* ================= SAVE CUSTOMER ================= */
function saveCustomer(){
  let customers = JSON.parse(localStorage.getItem("customers")) || [];

  let customer = {
    name: document.getElementById("client-name").value,
    phone: document.getElementById("client-phone").value,
    address: document.getElementById("client-address").value,
    date: new Date().toISOString()
  };

  customers.push(customer);
  localStorage.setItem("customers", JSON.stringify(customers));

  alert("Client sauvegardé 💗");
}

/* ================= SAVE EXPENSE ================= */
function saveExpense(){
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  let expense = {
    title: document.getElementById("expense-title").value,
    amount: parseFloat(document.getElementById("expense-amount").value),
    category: document.getElementById("expense-category").value,
    date: new Date().toISOString()
  };

  expenses.push(expense);
  localStorage.setItem("expenses", JSON.stringify(expenses));

  alert("Dépense sauvegardée 💸");
}

/* ================= GENERATE REPORT ================= */
function generateReport(){

  let sales = JSON.parse(localStorage.getItem("sales")) || [];
  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  let totalSales = sales.reduce((sum, s) => {
    return sum + parseFloat((s.total || "0").replace(" FCFA",""));
  }, 0);

  let totalExpenses = expenses.reduce((sum, e) => {
    return sum + (e.amount || 0);
  }, 0);

  let report = {
    date: new Date().toISOString(),
    totalSales,
    totalExpenses,
    profit: totalSales - totalExpenses
  };

  let reports = JSON.parse(localStorage.getItem("reports")) || [];
  reports.push(report);

  localStorage.setItem("reports", JSON.stringify(reports));

  alert("Report généré 📊");
}

/* ================= SAVE SALE ================= */
function saveSale(){

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  let data = {
    id: document.getElementById("invoice-id").innerText,
    date: document.getElementById("date").value,
    client: {
      name: document.getElementById("client-name").value,
      phone: document.getElementById("client-phone").value,
      address: document.getElementById("client-address").value
    },
    items: invoice,
    delivery: document.getElementById("delivery").value || 0,
    total: document.getElementById("grand-total").innerText
  };

  sales.push(data);
  localStorage.setItem("sales", JSON.stringify(sales));

  alert("Facture sauvegardée 💗");

  invoice = [];
  saveState();
  renderInvoice();
}

/* ================= INIT ================= */
window.onload = function(){
  renderCategories();

  if(invoice.length > 0){
    renderInvoice();
  }
};
