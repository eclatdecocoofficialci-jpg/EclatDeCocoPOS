/* ================= STORAGE ================= */

let soaps = JSON.parse(localStorage.getItem("soaps")) || [];

/* ================= TEMP INGREDIENTS ================= */

let ingredients = [];

/* ================= ADD INGREDIENT ================= */

function addIngredient(){

  const name =
    document.getElementById("ing_name").value;

  const qty =
    Number(document.getElementById("ing_qty").value || 0);

  const unit =
    document.getElementById("ing_unit").value;

  const price =
    Number(document.getElementById("ing_price").value || 0);

  if(!name || qty <= 0){
    alert("⚠ Remplis les champs ingrédient");
    return;
  }

  ingredients.push({
    name,
    qty,
    unit,
    price
  });

  renderIngredients();
  clearIngredientInputs();
  calcSoap();
}

/* ================= CLEAR INPUTS ================= */

function clearIngredientInputs(){

  document.getElementById("ing_name").value = "";
  document.getElementById("ing_qty").value = "";
  document.getElementById("ing_price").value = "";
}

/* ================= DELETE INGREDIENT ================= */

function deleteIngredient(i){

  ingredients.splice(i,1);

  renderIngredients();
  calcSoap();
}

/* ================= EDIT INGREDIENT ================= */

function editIngredient(i,key,value){

  if(key === "qty" || key === "price"){
    ingredients[i][key] = Number(value) || 0;
  }else{
    ingredients[i][key] = value;
  }

  calcSoap();
}

/* ================= RENDER INGREDIENTS ================= */

function renderIngredients(){

  const table =
    document.getElementById("ingredient_table");

  if(!table) return;

  table.innerHTML = ingredients.map((ing,i)=>`

    <tr>

      <td contenteditable="true"
          oninput="editIngredient(${i},'name',this.innerText)">
        ${ing.name}
      </td>

      <td contenteditable="true"
          oninput="editIngredient(${i},'qty',this.innerText)">
        ${ing.qty}
      </td>

      <td contenteditable="true"
          oninput="editIngredient(${i},'unit',this.innerText)">
        ${ing.unit}
      </td>

      <td contenteditable="true"
          oninput="editIngredient(${i},'price',this.innerText)">
        ${ing.price}
      </td>

      <td>
        <button onclick="deleteIngredient(${i})">
          ❌
        </button>
      </td>

    </tr>

  `).join("");
}

/* ================= CALCUL ================= */

function calcSoap(){

  let ingredientsTotal = 0;

  ingredients.forEach(ing=>{
    ingredientsTotal += ing.price;
  });

  const mold =
    Number(document.getElementById("mold_cost")?.value || 0);

  const labor =
    Number(document.getElementById("labor_cost")?.value || 0);

  const packaging =
    Number(document.getElementById("packaging_cost")?.value || 0);

  const quantity =
    Number(document.getElementById("soap_qty")?.value || 1);

  const selling =
    Number(document.getElementById("selling_input")?.value || 0);

  const total =
    ingredientsTotal +
    mold +
    labor +
    packaging;

  const costPerSoap =
    quantity > 0
    ? total / quantity
    : total;

  const profit =
    selling - costPerSoap;

  document.getElementById("ingredients_total").innerText =
    Math.round(ingredientsTotal);

  document.getElementById("total_cost").innerText =
    Math.round(total);

  document.getElementById("cost_per_soap").innerText =
    Math.round(costPerSoap);

  document.getElementById("profit_total").innerText =
    Math.round(profit);
}

/* ================= ADD SOAP ================= */

function addSoap(){

  const name =
    document.getElementById("soap_name").value;

  const total =
    Number(document.getElementById("total_cost").innerText || 0);

  const costPerSoap =
    Number(document.getElementById("cost_per_soap").innerText || 0);

  const selling =
    Number(document.getElementById("selling_input").value || 0);

  const quantity =
    Number(document.getElementById("soap_qty").value || 1);

  if(!name){
    alert("⚠ Nom savon requis");
    return;
  }

  if(ingredients.length === 0){
    alert("⚠ Ajoute des ingrédients");
    return;
  }

  soaps.push({

    name,

    quantity,

    ingredients:[...ingredients],

    total,

    costPerSoap,

    selling,

    profit:selling - costPerSoap

  });

  save();
  render();

  resetSoapForm();

  alert("✅ Production ajoutée");
}

/* ================= RESET ================= */

function resetSoapForm(){

  ingredients = [];

  renderIngredients();

  document.getElementById("soap_name").value = "";
  document.getElementById("soap_qty").value = "";
  document.getElementById("selling_input").value = "";

  document.getElementById("mold_cost").value = "";
  document.getElementById("labor_cost").value = "";
  document.getElementById("packaging_cost").value = "";

  calcSoap();
}

/* ================= DELETE SOAP ================= */

function deleteSoap(i){

  soaps.splice(i,1);

  save();
  render();
}

/* ================= EDIT SOAP ================= */

function editSoap(i,key,value){

  if(
    key === "total" ||
    key === "selling" ||
    key === "profit"
  ){
    soaps[i][key] = Number(value) || 0;
  }else{
    soaps[i][key] = value;
  }

  save();
}

/* ================= SAVE ================= */

function save(){

  localStorage.setItem(
    "soaps",
    JSON.stringify(soaps)
  );
}

/* ================= RENDER ================= */

function render(){

  const table =
    document.getElementById("soap_table");

  if(!table) return;

  table.innerHTML = soaps.map((s,i)=>`

    <tr>

      <td contenteditable="true"
          oninput="editSoap(${i},'name',this.innerText)">
        ${s.name}
      </td>

      <td>
        ${s.quantity || 1}
      </td>

      <td>
        ${s.total}
      </td>

      <td>
        ${s.costPerSoap}
      </td>

      <td contenteditable="true"
          oninput="editSoap(${i},'selling',this.innerText)">
        ${s.selling}
      </td>

      <td>
        ${s.profit}
      </td>

      <td>
        <button onclick="deleteSoap(${i})">
          ❌
        </button>
      </td>

    </tr>

  `).join("");
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", ()=>{

  render();
  renderIngredients();

});
