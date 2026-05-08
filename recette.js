let ingredients = [];

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

  ingredients.push({
    name,
    unit,
    qty,
    price
  });

  renderTable();
  clearInputs();
}

/* ================= RENDER TABLE ================= */
function renderTable(){

  const body = document.getElementById("recipe-body");

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

        <td>
          ${i.unit}
        </td>

        <td contenteditable="true" oninput="edit(${index},'price',this.innerText)">
          ${i.price}
        </td>

        <td>${total}</td>

        <td>
          <button onclick="removeItem(${index})">❌</button>
        </td>
      </tr>
    `;
  }).join("");

  updateTotal();
}

/* ================= EDIT TABLE ================= */
function edit(i, key, value){
  ingredients[i][key] = key === "price" || key === "qty"
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

  document.getElementById("recipe-total").innerText =
    total + " FCFA";

  document.getElementById("recipe-weight").innerText =
    weight;
}

/* ================= CONVERT ================= */
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
