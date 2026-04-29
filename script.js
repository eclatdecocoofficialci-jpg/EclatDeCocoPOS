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
