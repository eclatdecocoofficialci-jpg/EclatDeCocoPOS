let soaps = JSON.parse(localStorage.getItem("soaps")) || [];

/* ================= CALC ================= */
function calcSoap(){

  const oil = Number(oil.value || 0);
  const base = Number(base.value || 0);
  const fragrance = Number(fragrance.value || 0);
  const mold = Number(mold.value || 0);
  const labor = Number(labor.value || 0);
  const packaging = Number(packaging.value || 0);

  const cost =
    (oil * 2000) +
    (base * 3000) +
    (fragrance * 20) +
    mold + labor + packaging;

  document.getElementById("total_cost").innerText = cost;
  document.getElementById("selling_price").innerText = cost * 2;
}

/* ================= ADD SOAP ================= */
function addSoap(){

  const name = document.getElementById("soap_name").value;
  const cost = Number(document.getElementById("total_cost").innerText);

  if(!name || cost <= 0){
    alert("Remplis les champs");
    return;
  }

  soaps.push({
    name,
    cost,
    price: cost * 2
  });

  save();
  render();
}

/* ================= EDIT INLINE ================= */
function editSoap(i, key, value){

  soaps[i][key] =
    key === "cost" || key === "price"
    ? Number(value)
    : value;

  save();
  render();
}

/* ================= DELETE ================= */
function deleteSoap(i){
  soaps.splice(i,1);
  save();
  render();
}

/* ================= SAVE ================= */
function save(){
  localStorage.setItem("soaps", JSON.stringify(soaps));
}

/* ================= RENDER ================= */
function render(){

  const table = document.getElementById("soap_table");

  table.innerHTML = soaps.map((s,i)=>`

    <tr>
      <td contenteditable="true"
          oninput="editSoap(${i},'name',this.innerText)">
        ${s.name}
      </td>

      <td contenteditable="true"
          oninput="editSoap(${i},'cost',this.innerText)">
        ${s.cost}
      </td>

      <td>
        ${s.price - s.cost}
      </td>

      <td>
        ${s.price}
      </td>

      <td>
        <button onclick="deleteSoap(${i})">❌</button>
      </td>
    </tr>

  `).join("");
}

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", render);
