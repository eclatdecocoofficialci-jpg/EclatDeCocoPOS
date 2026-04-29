let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, category:"Savon"},
  {name:"Lotion Vanille", price:5000, category:"Lotion"}
];

let invoice = [];
let discount = 0;

/* ================= INVOICE NUMBER ================= */
function generateInvoiceNumber(){
  let last = localStorage.getItem("invoiceNumber");
  last = last ? parseInt(last) + 1 : 1;
  localStorage.setItem("invoiceNumber", last);
  return "2026" + String(last).padStart(3, "0");
}

/* SAFE INIT */
window.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("invoice-id");
  if(el){
    el.innerText = generateInvoiceNumber();
  }
});

/* ================= CART ================= */
function addToCart(name, price){
  let item = invoice.find(i => i.name === name);

  if(item){
    item.qty++;
  } else {
    invoice.push({name, price, qty:1});
  }

  renderInvoice();
}

/* ================= RENDER INVOICE ================= */
function renderInvoice(){

  let table = document.getElementById("invoice-body");
  if(!table) return;

  table.innerHTML = "";
  let total = 0;

  invoice.forEach(i => {
    let t = i.qty * i.price;
    total += t;

    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${t} FCFA</td>
    `;
    table.appendChild(tr);
  });

  let delivery = parseFloat(document.getElementById("delivery")?.value) || 0;
  total += delivery;

  let final = total - (total * discount / 100);

  const grand = document.getElementById("grand-total");
  if(grand){
    grand.innerText = final + " FCFA";
  }
}

/* ================= DISCOUNT ================= */
function setDiscount(p){
  discount = p;
  renderInvoice();
}

/* ================= SAVE SALE ================= */
function saveSale(){

  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  let data = {
    id: document.getElementById("invoice-id")?.innerText,
    date: document.getElementById("date")?.value,
    client: {
      name: document.getElementById("client-name")?.value,
      phone: document.getElementById("client-phone")?.value,
      address: document.getElementById("client-address")?.value
    },
    cart: invoice,
    total: document.getElementById("grand-total")?.innerText
  };

  sales.push(data);
  localStorage.setItem("sales", JSON.stringify(sales));

  // reset invoice
  invoice = [];
  renderInvoice();

  const el = document.getElementById("invoice-id");
  if(el){
    el.innerText = generateInvoiceNumber();
  }

  alert("💗 Facture sauvegardée avec succès");
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
    let val = document.getElementById("display").value;
    if(val){
      document.getElementById("display").value = Function("return " + val)();
    }
  }catch(e){
    alert("Erreur calcul");
  }
}

/* ================= OPTIONAL SAFETY ================= */
if(document.getElementById("delivery")){
  document.getElementById("delivery").addEventListener("input", renderInvoice);
}
let lang = localStorage.getItem("lang");
if (!lang) {
  // auto detect phone/iPad language
  lang = navigator.language.startsWith("fr") ? "fr" : "en";
}

let currency = localStorage.getItem("currency") || "FCFA";

const translations = {
  fr: {
    products: "Produits",
    sales: "Ventes",
    inventory: "Inventaire",
    customers: "Clients",
    expenses: "Dépenses",
    reports: "Rapports",
    categories: "Catégories",
    calculator: "Calculatrice",
    invoice: "Facture",
    client: "Client(e)",
    save: "Sauvegarder",
    print: "Imprimer",
    total: "Total",
    welcome: "Bienvenue à Éclat de Coco Officiel",
    thanks: "Merci d’avoir choisi Éclat de Coco 💗"
  },

  en: {
    products: "Products",
    sales: "Sales",
    inventory: "Inventory",
    customers: "Customers",
    expenses: "Expenses",
    reports: "Reports",
    categories: "Categories",
    calculator: "Calculator",
    invoice: "Invoice",
    client: "Client",
    save: "Save",
    print: "Print",
    total: "Total",
    welcome: "Welcome to Éclat de Coco Official",
    thanks: "Thank you for choosing Éclat de Coco 💗"
  }
};

// LANGUAGE SWITCH
function setLang(l){
  lang = l;
  localStorage.setItem("lang", l);
  applyLang();
}

// CURRENCY SWITCH
function setCurrency(c){
  currency = c;
  localStorage.setItem("currency", c);
  renderInvoice();
}

// APPLY TEXT TRANSLATION
function applyLang(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(translations[lang][key]){
      el.innerText = translations[lang][key];
    }
  });
}

// FORMAT MONEY
function formatMoney(value){
  if(currency === "USD") return "$ " + (value / 600).toFixed(2);
  if(currency === "EUR") return "€ " + (value / 650).toFixed(2);
  return value + " FCFA";
}

// INIT
window.addEventListener("DOMContentLoaded", applyLang);
