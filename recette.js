let ingredients = JSON.parse(localStorage.getItem("recipe")) || [];

/* ================= ADD ================= */
function addIngredient(){

  const name = document.getElementById("ing_name").value;
  const unit = document.getElementById("ing_unit").value;
  const qty = Number(document.getElementById("ing_qty").value);
  const price = Number(document.getElementById("ing_price").value);

  if(!name || !qty || !price){
    alert("Remplis tous les champs");
    return;
  }

  ingredients.push({ name, unit, qty, price });

  renderTable();
  clearInputs();
}

/* ================= RENDER ================= */
function renderTable(){

  const body = document.getElementById("recipe-body");
  if(!body) return;

  body.innerHTML = ingredients.map((i, index)=>{

    const total = i.price;

    return `
      <tr>
        <td contenteditable="true" oninput="edit(${index},'name',this.innerText)">
          ${i.name}
        </td>

        <td contenteditable="true" oninput="edit(${index},'qty',this.innerText)">
          ${i.qty}
        </td>

        <td>${i.unit}</td>

        <td contenteditable="true" oninput="edit(${index},'price',this.innerText)">
          ${i.price}</td>

        <td>${total}</td>

        <td>
          <button onclick="removeItem(${index})">❌</button>
        </td>
      </tr>
    `;
  }).join("");

  updateTotal();
}

/* ================= EDIT ================= */
function edit(i, key, value){
  ingredients[i][key] = (key === "price" || key === "qty")
    ? Number(value)
    : value;

  updateTotal();
}

/* ================= REMOVE ================= */
function removeItem(i){
  ingredients.splice(i,1);
  renderTable();
}

/* ================= TOTAL ================= */
function updateTotal(){

  let total = 0;
  let weight = 0;

  ingredients.forEach(i=>{
    total += i.price;
    weight += convertQty(i);
  });

  const totalBox = document.getElementById("recipe-total");
  const weightBox = document.getElementById("recipe-weight");

  if(totalBox) totalBox.innerText = total + " FCFA";
  if(weightBox) weightBox.innerText = weight;
}

/* ================= UNIT CONVERT ================= */
function convertQty(i){

  if(i.unit === "kg") return i.qty * 1000;
  if(i.unit === "g") return i.qty;
  if(i.unit === "L") return i.qty * 1000;
  if(i.unit === "ml") return i.qty;
  if(i.unit === "%") return i.qty;

  return i.qty;
}

/* ================= CLEAR ================= */
function clearInputs(){
  document.getElementById("ing_name").value = "";
  document.getElementById("ing_qty").value = "";
  document.getElementById("ing_price").value = "";
}

/* ================= SAVE ================= */
function saveRecipe(){

  localStorage.setItem("recipe", JSON.stringify(ingredients));
  alert("Recette sauvegardée ✔");
}

/* ================= PRINT ================= */
function printRecipe(){

  const notes = document.getElementById("recipe-notes")?.value || "";

  const printWindow = window.open("", "", "width=900,height=700");

  printWindow.document.write(`
    <html>
    <head>
      <title>Recette</title>
      <style>
        body{font-family:Arial;padding:20px;}
        h1{text-align:center;}
        .sub{text-align:center;margin-bottom:20px;}
        table{width:100%;border-collapse:collapse;}
        th,td{border:1px solid #000;padding:8px;text-align:center;}
        .footer{margin-top:40px;text-align:right;font-style:italic;}
      </style>
    </head>

    <body>

      <h1>ÉCLAT DE COCO OFFICIAL</h1>
      <div class="sub">Abidjan - Côte d’Ivoire</div>

      <table>
        <tr>
          <th>Ingrédient</th>
          <th>Qté</th>
          <th>Unité</th>
          <th>Prix</th>
        </tr>

        ${ingredients.map(i=>`
          <tr>
            <td>${i.name}</td>
            <td>${i.qty}</td>
            <td>${i.unit}</td>
            <td>${i.price}</td>
          </tr>
        `).join("")}
      </table>

      <h3>Notes :</h3>
      <p>${notes}</p>

      <div class="footer">
        ___________________________<br>
        Signature du responsable
      </div>

    </body>
    </html>
  `);

  
function printRecipe(){
  window.print();
}
