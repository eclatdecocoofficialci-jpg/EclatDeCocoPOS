/* ================= DASHBOARD ÉCLAT DE COCO ================= */

function formatFCFA(amount){
  return Number(amount || 0).toLocaleString("fr-FR") + " FCFA";
}

function getData(key){
  try{
    return JSON.parse(localStorage.getItem(key)) || [];
  }catch{
    return [];
  }
}

function getSaleDate(sale){
  return new Date(sale.date || sale.createdAt || Date.now());
}

function isSameWeek(date){
  const now = new Date();
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - now.getDay());
  firstDay.setHours(0,0,0,0);

  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 7);

  return date >= firstDay && date < lastDay;
}

function isSameMonth(date){
  const now = new Date();
  return date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear();
}

function isSameYear(date){
  const now = new Date();
  return date.getFullYear() === now.getFullYear();
}

function totalSales(sales){
  return sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
}

function totalExpenses(expenses){
  return expenses.reduce((sum, expense) => {
    return sum + Number(expense.amount || expense.montant || expense.total || 0);
  }, 0);
}

function getAvanceRefunded(avance){
  if(!Array.isArray(avance.refunds)) return 0;

  return avance.refunds.reduce((sum, r) => {
    return sum + Number(r.amount || 0);
  }, 0);
}

function loadDashboard(){
  const sales = getData("sales");
  const expenses = getData("expenses");
  const avances = getData("avancesEntreprise");

  let weekSales = 0;
  let monthSales = 0;
  let yearSales = 0;

  sales.forEach(sale => {
    const d = getSaleDate(sale);
    const total = Number(sale.total || 0);

    if(isSameWeek(d)) weekSales += total;
    if(isSameMonth(d)) monthSales += total;
    if(isSameYear(d)) yearSales += total;
  });

  const expensesTotal = totalExpenses(expenses);

  const totalAvances = avances.reduce((sum, a) => {
    return sum + Number(a.amount || 0);
  }, 0);

  const totalRefunded = avances.reduce((sum, a) => {
    return sum + getAvanceRefunded(a);
  }, 0);

  const resteRembourser = totalAvances - totalRefunded;

  const weekProfit = weekSales;
  const monthProfit = monthSales - expensesTotal;
  const yearProfit = yearSales - expensesTotal;

  setText("week-profit", formatFCFA(weekProfit));
  setText("month-profit", formatFCFA(monthProfit));
  setText("year-profit", formatFCFA(yearProfit));

  setText("total-sales", formatFCFA(totalSales(sales)));
  setText("total-expenses", formatFCFA(expensesTotal));

  setText("total-avances", formatFCFA(totalAvances));
  setText("reste-rembourser", formatFCFA(resteRembourser));

  setText("top-products", getTopProducts(sales));

  drawSalesChart(sales);
}

function setText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}

function getTopProducts(sales){
  const count = {};

  sales.forEach(sale => {
    if(!Array.isArray(sale.items)) return;

    sale.items.forEach(item => {
      const name = item.name || "Produit";
      const qty = Number(item.qty || 1);

      count[name] = (count[name] || 0) + qty;
    });
  });

  const sorted = Object.entries(count).sort((a,b) => b[1] - a[1]);

  if(sorted.length === 0) return "-";

  return sorted
    .slice(0,3)
    .map(([name, qty]) => `${name} (${qty})`)
    .join(" • ");
}

function drawSalesChart(sales){
  const canvas = document.getElementById("salesChart");
  if(!canvas || typeof Chart === "undefined") return;

  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc"
  ];

  const monthlyTotals = new Array(12).fill(0);

  sales.forEach(sale => {
    const d = getSaleDate(sale);
    const month = d.getMonth();
    monthlyTotals[month] += Number(sale.total || 0);
  });

  new Chart(canvas, {
    type: "line",
    data: {
      labels: months,
      datasets: [{
        label: "Ventes mensuelles",
        data: monthlyTotals,
        tension: 0.35,
        borderWidth: 3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: "#e91e63"
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: value => value.toLocaleString("fr-FR") + " FCFA"
          }
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", loadDashboard);
