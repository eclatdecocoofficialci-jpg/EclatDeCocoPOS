let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, category:"Savon"},
  {name:"Lotion Vanille", price:5000, category:"Lotion"}
];

let invoice = JSON.parse(localStorage.getItem("invoice")) || [];
let discount = parseFloat(localStorage.getItem("discount")) || 0;

/* ===== INVOICE NUMBER ===== */
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

/* ===== SET INVOICE ID ===== */
document.getElementById("invoice-id").innerText = generateInvoiceNumber();

/* ===== SAVE STATE (IMPORTANT OFFLINE) ===== */
function saveState(){
  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("invoice", JSON.stringify(invoice));
  localStorage.setItem("discount", discount);
}

/* ===== CATEGORIES ===== */
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

/* ===== PRODUCTS ===== */
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

/* ===== ADD TO CART ===== */
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

/* ===== RENDER INVOICE ===== */
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

/* ===== DISCOUNT ===== */
function setDiscount(p){
  discount = p;
  saveState();
  renderInvoice();
}

/* ===== CALCULATOR ===== */
function press(val){
  document.getElementById("display").value += val;
}

function clearCalc(){
  document.getElementById("display").value = "";
}

function calculate(){
  try {
    let res = eval(document.getElementById("display").value);
    document.getElementById("display").value = res;
  } catch {
    document.getElementById("display").value = "Erreur";
  }
}

/* ===== SAVE SALE ===== */
function saveSale(){
  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  sales.push({
    id: document.getElementById("invoice-id").innerText,
    total: document.getElementById("grand-total").innerText,
    date: new Date().toISOString()
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  alert("Facture sauvegardée 💗");
}

/* ===== RESTORE ON LOAD ===== */
window.onload = function(){

  renderCategories();

  if(invoice.length > 0){
    renderInvoice();
  }

  let savedDiscount = localStorage.getItem("discount");
  if(savedDiscount){
    discount = parseFloat(savedDiscount);
  }
};
