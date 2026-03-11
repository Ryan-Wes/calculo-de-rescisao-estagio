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

const calculationTypeSelect = document.getElementById("calculation-type");

const monthlyAllowanceDisplay = document.getElementById("monthly-allowance-display");
const monthlyAllowanceHidden = document.getElementById("monthly-allowance");

const hourlyRateDisplay = document.getElementById("hourly-rate-display");
const hourlyRateHidden = document.getElementById("hourly-rate");

const totalDaysElement = document.getElementById("total-days");
const vacationDaysElement = document.getElementById("vacation-days");
const remainingVacationDaysElement = document.getElementById("remaining-vacation-days");
const dailyValueElement = document.getElementById("daily-value");
const vacationAmountElement = document.getElementById("vacation-amount");
const lastMonthPaymentElement = document.getElementById("last-month-payment");

const monthlyFields = document.querySelectorAll(".monthly-field");
const hourlyFields = document.querySelectorAll(".hourly-field");
const monthlyResultCard = document.querySelector(".monthly-result");

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
  remainingVacationDaysElement.textContent = "0";
  dailyValueElement.textContent = "R$ 0,00";
  vacationAmountElement.textContent = "R$ 0,00";
  lastMonthPaymentElement.textContent = "R$ 0,00";
  resultsSection.classList.add("hidden");
  currentResult = null;
}

function applyCurrencyMask(value, hiddenInput) {
  const numericValue = value.replace(/\D/g, "");

  if (!numericValue) {
    hiddenInput.value = "";
    return "";
  }

  const amount = Number(numericValue) / 100;
  hiddenInput.value = amount.toFixed(2);

  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function updateCalculationTypeUI() {
  const calculationType = calculationTypeSelect.value;
  const isMonthly = calculationType === "monthly";

  monthlyFields.forEach((field) => field.classList.toggle("hidden", !isMonthly));
  hourlyFields.forEach((field) => field.classList.toggle("hidden", isMonthly));
  monthlyResultCard.classList.toggle("hidden-card", !isMonthly);
}

function getHistory() {
  const savedHistory = localStorage.getItem(HISTORY_KEY);

  if (!savedHistory) return [];

  try {
    return JSON.parse(savedHistory);
  } catch {
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

  saveHistory(history.slice(0, 10));
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
            <span class="history-card__value">${item.vacationAmountFormatted}</span>
          </div>

          <ul>
            <li><strong>Estagiário:</strong> ${item.internName}</li>
            <li><strong>Tipo:</strong> ${item.calculationTypeLabel}</li>
            <li><strong>Dias:</strong> ${item.totalDays}</li>
            <li><strong>Férias:</strong> ${item.vacationDays} dias</li>
            <li><strong>Usufruídos:</strong> ${item.usedVacationDays}</li>
            <li><strong>Restantes:</strong> ${item.remainingVacationDays}</li>
          </ul>
        </article>
      `;
    })
    .join("");
}

function buildResultText(result) {
  const lines = [
    "Resultado do cálculo de estágio",
    `Nome do estagiário: ${result.internName}`,
    `Tipo de cálculo: ${result.calculationTypeLabel}`,
    `Data de início do estágio: ${formatDate(result.startDateValue)}`,
    `Data de fim do estágio: ${formatDate(result.endDateValue)}`,
    `Dias estagiados: ${result.totalDays}`,
    `Dias de direito a férias: ${result.vacationDays}`,
    `Dias de férias usufruídos: ${result.usedVacationDays}`,
    `Dias restantes de férias: ${result.remainingVacationDays}`,
    `Valor por dia: ${result.dailyValueFormatted}`,
    `Valor total das férias: ${result.vacationAmountFormatted}`,
  ];

  if (result.calculationType === "monthly") {
    lines.splice(5, 0, `Valor da bolsa mensal: ${result.monthlyAllowanceFormatted}`);
    lines.push(`Pagamento do último mês: ${result.lastMonthPaymentFormatted}`);
  }

  if (result.calculationType === "hourly") {
    lines.splice(5, 0,
      `Valor da hora: ${result.hourlyRateFormatted}`,
      `Horas diárias trabalhadas: ${result.dailyHours}`
    );
  }

  return lines.join("\n");
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
  const calculationType = getInputValue("calculation-type");
  const internName = getInputValue("intern-name").trim();
  const startDateValue = getInputValue("start-date");
  const endDateValue = getInputValue("end-date");
  const usedVacationDays = Number(getInputValue("used-vacation-days") || 0);

  const startDate = new Date(`${startDateValue}T00:00:00`);
  const endDate = new Date(`${endDateValue}T00:00:00`);

  if (!internName || !startDateValue || !endDateValue) {
    showMessage("Preencha todos os campos obrigatórios antes de calcular.", "error");
    resetResults();
    return;
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    showMessage("Há datas inválidas. Revise os campos.", "error");
    resetResults();
    return;
  }

  if (startDate > endDate) {
    showMessage("A data de início não pode ser maior que a data final.", "error");
    resetResults();
    return;
  }

  if (usedVacationDays < 0) {
    showMessage("Os dias usufruídos não podem ser negativos.", "error");
    resetResults();
    return;
  }

  const totalDays = calculateDaysDifference(startDate, endDate);
  const vacationDays = Math.round((totalDays / 365) * 30);
  const remainingVacationDays = Math.max(vacationDays - usedVacationDays, 0);

  let dailyValue = 0;
  let vacationAmount = 0;
  let lastMonthPayment = 0;

  const resultData = {
    calculationType,
    calculationTypeLabel: calculationType === "monthly" ? "Bolsa mensal" : "Pagamento por hora",
    internName,
    startDateValue,
    endDateValue,
    totalDays,
    vacationDays,
    usedVacationDays,
    remainingVacationDays,
  };

  if (calculationType === "monthly") {
    const monthlyAllowance = Number(getInputValue("monthly-allowance"));
    const monthStartValue = getInputValue("month-start");
    const monthEndValue = getInputValue("month-end");
    const monthStart = new Date(`${monthStartValue}T00:00:00`);
    const monthEnd = new Date(`${monthEndValue}T00:00:00`);

    if (!monthlyAllowance || !monthStartValue || !monthEndValue) {
      showMessage("Preencha os campos de bolsa mensal e último mês.", "error");
      resetResults();
      return;
    }

    if (Number.isNaN(monthStart.getTime()) || Number.isNaN(monthEnd.getTime())) {
      showMessage("As datas do último mês estão inválidas.", "error");
      resetResults();
      return;
    }

    if (monthStart > monthEnd) {
      showMessage("A data inicial do último mês não pode ser maior que a data final.", "error");
      resetResults();
      return;
    }

    dailyValue = monthlyAllowance / 30;
    vacationAmount = dailyValue * remainingVacationDays;
    lastMonthPayment = calculateDaysDifference(monthStart, monthEnd) * dailyValue;

    Object.assign(resultData, {
      monthlyAllowance,
      monthlyAllowanceFormatted: formatCurrency(monthlyAllowance),
      monthStartValue,
      monthEndValue,
      lastMonthPayment,
      lastMonthPaymentFormatted: formatCurrency(lastMonthPayment),
    });
  }

  if (calculationType === "hourly") {
    const hourlyRate = Number(getInputValue("hourly-rate"));
    const dailyHours = Number(getInputValue("daily-hours"));

    if (!hourlyRate || !dailyHours) {
      showMessage("Preencha valor da hora e horas diárias trabalhadas.", "error");
      resetResults();
      return;
    }

    if (hourlyRate <= 0 || dailyHours <= 0) {
      showMessage("Valor da hora e horas diárias devem ser maiores que zero.", "error");
      resetResults();
      return;
    }

    dailyValue = hourlyRate * dailyHours;
    vacationAmount = dailyValue * remainingVacationDays;

    Object.assign(resultData, {
      hourlyRate,
      hourlyRateFormatted: formatCurrency(hourlyRate),
      dailyHours,
    });
  }

  resultData.dailyValue = dailyValue;
  resultData.dailyValueFormatted = formatCurrency(dailyValue);
  resultData.vacationAmount = vacationAmount;
  resultData.vacationAmountFormatted = formatCurrency(vacationAmount);

  totalDaysElement.textContent = resultData.totalDays;
  vacationDaysElement.textContent = resultData.vacationDays;
  remainingVacationDaysElement.textContent = resultData.remainingVacationDays;
  dailyValueElement.textContent = resultData.dailyValueFormatted;
  vacationAmountElement.textContent = resultData.vacationAmountFormatted;
  lastMonthPaymentElement.textContent =
    resultData.calculationType === "monthly"
      ? resultData.lastMonthPaymentFormatted
      : "Não se aplica";

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
  } catch {
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

  const lines = buildResultText(currentResult).split("\n");

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Calculadora de Rescisão de Estágio", 14, y);

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
  setTheme(currentTheme === "light" ? "dark" : "light");
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
  hourlyRateDisplay.value = "";
  hourlyRateHidden.value = "";
  document.getElementById("used-vacation-days").value = 0;
  showMessage("");
  resetResults();
  updateCalculationTypeUI();
});

copyBtn.addEventListener("click", copyResult);
pdfBtn.addEventListener("click", exportPdf);
clearHistoryBtn.addEventListener("click", clearHistory);
themeToggleBtn.addEventListener("click", toggleTheme);
calculationTypeSelect.addEventListener("change", updateCalculationTypeUI);

monthlyAllowanceDisplay.addEventListener("input", function (event) {
  event.target.value = applyCurrencyMask(event.target.value, monthlyAllowanceHidden);
});

hourlyRateDisplay.addEventListener("input", function (event) {
  event.target.value = applyCurrencyMask(event.target.value, hourlyRateHidden);
});

loadTheme();
renderHistory();
resetResults();
updateCalculationTypeUI();