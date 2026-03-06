const form = document.getElementById("form");
const clearBtn = document.getElementById("clear-btn");
const copyBtn = document.getElementById("copy-btn");
const pdfBtn = document.getElementById("pdf-btn");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeToggleText = document.getElementById("theme-toggle-text");
const message = document.getElementById("message");
const resultsSection = document.getElementById("results");
const historyList = document.getElementById("history-list");

const monthlyAllowanceDisplay = document.getElementById("monthly-allowance-display");
const monthlyAllowanceHidden = document.getElementById("monthly-allowance");

const totalDaysElement = document.getElementById("total-days");
const vacationDaysElement = document.getElementById("vacation-days");
const dailyAllowanceElement = document.getElementById("daily-allowance");
const vacationAmountElement = document.getElementById("vacation-amount");
const lastMonthPaymentElement = document.getElementById("last-month-payment");

const HISTORY_KEY = "internshipCalculatorHistory";
const THEME_KEY = "internshipCalculatorTheme";

let currentResult = null;

function getInputValue(id) {
  return document.getElementById(id).value;
}

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTime(date) {
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function calculateDaysDifference(startDate, endDate) {
  const oneDayInMs = 1000 * 60 * 60 * 24;
  return Math.floor((endDate - startDate) / oneDayInMs) + 1;
}

function resetResults() {
  totalDaysElement.textContent = "0";
  vacationDaysElement.textContent = "0";
  dailyAllowanceElement.textContent = "R$ 0,00";
  vacationAmountElement.textContent = "R$ 0,00";
  lastMonthPaymentElement.textContent = "R$ 0,00";
  resultsSection.classList.add("hidden");
  currentResult = null;
}

function applyCurrencyMask(value) {
  const numericValue = value.replace(/\D/g, "");

  if (!numericValue) {
    monthlyAllowanceHidden.value = "";
    return "";
  }

  const amount = Number(numericValue) / 100;
  monthlyAllowanceHidden.value = amount.toFixed(2);

  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getHistory() {
  const savedHistory = localStorage.getItem(HISTORY_KEY);

  if (!savedHistory) {
    return [];
  }

  try {
    return JSON.parse(savedHistory);
  } catch (error) {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addToHistory(resultData) {
  const history = getHistory();

  history.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...resultData,
  });

  const limitedHistory = history.slice(0, 10);
  saveHistory(limitedHistory);
  renderHistory();
}

function renderHistory() {
  const history = getHistory();

  if (!history.length) {
    historyList.innerHTML = `<p class="history-empty">Nenhum cálculo salvo ainda.</p>`;
    return;
  }

  historyList.innerHTML = history
    .map((item) => {
      return `
        <article class="history-card">
          <div class="history-card__top">
            <span class="history-card__date">${formatDateTime(new Date(item.createdAt))}</span>
            <span class="history-card__value">${item.lastMonthPaymentFormatted}</span>
          </div>

          <ul>
            <li><strong>Estagiário:</strong> ${item.internName}</li>
            <li><strong>Período:</strong> ${formatDate(item.startDateValue)} até ${formatDate(item.endDateValue)}</li>
            <li><strong>Bolsa:</strong> ${item.monthlyAllowanceFormatted}</li>
            <li><strong>Dias:</strong> ${item.totalDays}</li>
            <li><strong>Férias:</strong> ${item.vacationDays} dias (${item.vacationAmountFormatted})</li>
          </ul>
        </article>
      `;
    })
    .join("");
}

function buildResultText(result) {
  return [
    "Resultado do cálculo de estágio",
    `Nome do estagiário: ${result.internName}`,
    `Data de início do estágio: ${formatDate(result.startDateValue)}`,
    `Data de fim do estágio: ${formatDate(result.endDateValue)}`,
    `Valor da bolsa mensal: ${result.monthlyAllowanceFormatted}`,
    `Início do último mês estagiado: ${formatDate(result.monthStartValue)}`,
    `Fim do último mês estagiado: ${formatDate(result.monthEndValue)}`,
    `Total de dias estagiados: ${result.totalDays}`,
    `Dias de férias proporcionais: ${result.vacationDays}`,
    `Valor da bolsa por dia: ${result.dailyAllowanceFormatted}`,
    `Valor estimado de férias: ${result.vacationAmountFormatted}`,
    `Pagamento do último mês: ${result.lastMonthPaymentFormatted}`,
  ].join("\n");
}

function restartCardAnimations() {
  const cards = document.querySelectorAll(".animated-card");

  cards.forEach((card) => {
    card.classList.remove("animated-card");
    void card.offsetWidth;
    card.classList.add("animated-card");
  });
}

function calculateInternshipData() {
  const internName = getInputValue("intern-name").trim();
  const startDateValue = getInputValue("start-date");
  const endDateValue = getInputValue("end-date");
  const monthlyAllowanceValue = getInputValue("monthly-allowance");
  const monthStartValue = getInputValue("month-start");
  const monthEndValue = getInputValue("month-end");

  const startDate = new Date(`${startDateValue}T00:00:00`);
  const endDate = new Date(`${endDateValue}T00:00:00`);
  const monthStart = new Date(`${monthStartValue}T00:00:00`);
  const monthEnd = new Date(`${monthEndValue}T00:00:00`);
  const monthlyAllowance = Number(monthlyAllowanceValue);

  if (
    !internName ||
    !startDateValue ||
    !endDateValue ||
    !monthStartValue ||
    !monthEndValue ||
    !monthlyAllowanceValue
  ) {
    showMessage("Preencha todos os campos antes de calcular.", "error");
    resetResults();
    return;
  }

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    Number.isNaN(monthStart.getTime()) ||
    Number.isNaN(monthEnd.getTime()) ||
    Number.isNaN(monthlyAllowance)
  ) {
    showMessage("Há campos inválidos. Revise as datas e o valor da bolsa.", "error");
    resetResults();
    return;
  }

  if (startDate > endDate) {
    showMessage("A data de início do estágio não pode ser maior que a data final.", "error");
    resetResults();
    return;
  }

  if (monthStart > monthEnd) {
    showMessage("A data inicial do último mês não pode ser maior que a data final.", "error");
    resetResults();
    return;
  }

  if (monthlyAllowance <= 0) {
    showMessage("O valor da bolsa precisa ser maior que zero.", "error");
    resetResults();
    return;
  }

  const totalDays = calculateDaysDifference(startDate, endDate);
  const vacationDays = Math.round((totalDays * 30) / 365);
  const dailyAllowance = monthlyAllowance / 30;
  const vacationAmount = vacationDays * dailyAllowance;
  const daysInLastMonth = calculateDaysDifference(monthStart, monthEnd);
  const lastMonthPayment = daysInLastMonth * dailyAllowance;

  const resultData = {
    internName,
    startDateValue,
    endDateValue,
    monthStartValue,
    monthEndValue,
    monthlyAllowance,
    monthlyAllowanceFormatted: formatCurrency(monthlyAllowance),
    totalDays,
    vacationDays,
    dailyAllowance,
    dailyAllowanceFormatted: formatCurrency(dailyAllowance),
    vacationAmount,
    vacationAmountFormatted: formatCurrency(vacationAmount),
    lastMonthPayment,
    lastMonthPaymentFormatted: formatCurrency(lastMonthPayment),
  };

  totalDaysElement.textContent = resultData.totalDays;
  vacationDaysElement.textContent = resultData.vacationDays;
  dailyAllowanceElement.textContent = resultData.dailyAllowanceFormatted;
  vacationAmountElement.textContent = resultData.vacationAmountFormatted;
  lastMonthPaymentElement.textContent = resultData.lastMonthPaymentFormatted;

  currentResult = resultData;
  resultsSection.classList.remove("hidden");
  restartCardAnimations();
  addToHistory(resultData);
  showMessage("Cálculo realizado com sucesso.", "success");
}

async function copyResult() {
  if (!currentResult) {
    showMessage("Calcule primeiro para copiar o resultado.", "error");
    return;
  }

  try {
    await navigator.clipboard.writeText(buildResultText(currentResult));
    showMessage("Resultado copiado para a área de transferência.", "success");
  } catch (error) {
    showMessage("Não foi possível copiar o resultado.", "error");
  }
}

function exportPdf() {
  if (!currentResult) {
    showMessage("Calcule primeiro para exportar o PDF.", "error");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const lines = [
    `Nome do estagiário: ${currentResult.internName}`,
    `Data de início do estágio: ${formatDate(currentResult.startDateValue)}`,
    `Data de fim do estágio: ${formatDate(currentResult.endDateValue)}`,
    `Valor da bolsa mensal: ${currentResult.monthlyAllowanceFormatted}`,
    `Início do último mês estagiado: ${formatDate(currentResult.monthStartValue)}`,
    `Fim do último mês estagiado: ${formatDate(currentResult.monthEndValue)}`,
    `Total de dias estagiados: ${currentResult.totalDays}`,
    `Dias de férias proporcionais: ${currentResult.vacationDays}`,
    `Valor da bolsa por dia: ${currentResult.dailyAllowanceFormatted}`,
    `Valor estimado de férias: ${currentResult.vacationAmountFormatted}`,
    `Pagamento do último mês: ${currentResult.lastMonthPaymentFormatted}`,
    `Gerado em: ${formatDateTime(new Date())}`,
  ];

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Calculadora de Estágio", 14, y);

  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  lines.forEach((line) => {
    doc.text(line, 14, y);
    y += 8;
  });

  const safeName = currentResult.internName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  doc.save(`calculo-estagio-${safeName || "estagiario"}.pdf`);
  showMessage("PDF exportado com sucesso.", "success");
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  themeToggleText.textContent = theme === "dark" ? "☀️ Light" : "🌙 Dark";
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(nextTheme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  setTheme(savedTheme);
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistory();
  showMessage("Histórico apagado com sucesso.", "success");
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  calculateInternshipData();
});

clearBtn.addEventListener("click", function () {
  form.reset();
  monthlyAllowanceDisplay.value = "";
  monthlyAllowanceHidden.value = "";
  showMessage("");
  resetResults();
});

copyBtn.addEventListener("click", copyResult);
pdfBtn.addEventListener("click", exportPdf);
clearHistoryBtn.addEventListener("click", clearHistory);
themeToggleBtn.addEventListener("click", toggleTheme);

monthlyAllowanceDisplay.addEventListener("input", function (event) {
  const formattedValue = applyCurrencyMask(event.target.value);
  event.target.value = formattedValue;
});

loadTheme();
renderHistory();
resetResults();