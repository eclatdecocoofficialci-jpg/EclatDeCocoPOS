let products = JSON.parse(localStorage.getItem("products")) || [
  {name:"Savon Rose", price:3000, category:"Savon"},
  {name:"Lotion Vanille", price:5000, category:"Lotion"}
];

let invoice = [];
let discount = 0;

/* ===== INVOICE NUMBER ===== */
function generateInvoiceNumber(){
  let last = localStorage.getItem("invoiceNumber");

  if(!last){ last = 1; }
  else { last = parseInt(last) + 1; }

  localStorage.setItem("invoiceNumber", last);

  return "2026" + String(last).padStart(3,"0");
}

document.getElementById("invoice-id").innerText = generateInvoiceNumber();

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

  products.filter(p=>p.category===cat).forEach(p=>{
    let div = document.createElement("div");

    div.innerHTML = `
      ${p.name} - ${p.price} FCFA
      <button onclick="addToCart('${p.name}',${p.price})">+</button>
    `;

    list.appendChild(div);
  });
}

/* ===== ADD TO CART ===== */
function addToCart(name, price){
  let item = invoice.find(i=>i.name===name);

  if(item){ item.qty++; }
  else{ invoice.push({name,price,qty:1}); }

  renderInvoice();
}

/* ===== RENDER ===== */
function renderInvoice(){
  let table = document.getElementById("invoice");
  table.innerHTML = "";

  let total = 0;

  invoice.forEach(i=>{
    let t = i.qty * i.price;
    total += t;

    let tr = document.createElement("tr");
    tr.innerHTML = `<td>${i.name}</td><td>${i.qty}</td><td>${t}</td>`;
    table.appendChild(tr);
  });

  let delivery = parseFloat(document.getElementById("delivery").value) || 0;

  total += delivery;

  let final = total - (total * discount / 100);

  document.getElementById("total").innerText = final + " FCFA";
}

/* ===== DISCOUNT ===== */
function setDiscount(p){
  discount = p;
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
  let res = eval(document.getElementById("display").value);
  document.getElementById("display").value = res;
}

/* ===== SAVE SALE ===== */
function saveSale(){
  let sales = JSON.parse(localStorage.getItem("sales")) || [];

  sales.push({
    id: document.getElementById("invoice-id").innerText,
    total: document.getElementById("total").innerText
  });

  localStorage.setItem("sales", JSON.stringify(sales));

  alert("Facture sauvegardée 💗");
}

/* ===== INIT ===== */
renderCategories();
