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
      const typeIcon = item.calculationType === "monthly" ? "📋" : "⏱️";
      const showLastMonth = item.lastMonthPaymentFormatted;
      return `
        <article class="history-card">
          <div class="history-card__top">
            <span class="history-card__name">${typeIcon} ${item.internName}</span>
            <span class="history-card__value">${item.totalRescissionFormatted || item.vacationAmountFormatted}</span>
          </div>
          <span class="history-card__date">${formatDateTime(new Date(item.createdAt))}</span>
          <ul>
            <li><strong>Tipo:</strong> ${item.calculationTypeLabel}</li>
            <li><strong>Dias:</strong> ${item.totalDays} estagiados</li>
            <li><strong>Restantes:</strong> ${item.remainingVacationDays} dias de férias</li>
            <li><strong>Férias:</strong> ${item.vacationAmountFormatted}</li>
            ${showLastMonth ? `<li><strong>Último mês:</strong> ${item.lastMonthPaymentFormatted}</li>` : ""}
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

    // Dias estagiados no último mês = dia do mês da data final
    const lastMonthDays = endDate.getDate();
    lastMonthPayment = dailyValue * lastMonthDays;

    Object.assign(resultData, {
      hourlyRate,
      hourlyRateFormatted: formatCurrency(hourlyRate),
      dailyHours,
      lastMonthDays,
      lastMonthPayment,
      lastMonthPaymentFormatted: formatCurrency(lastMonthPayment),
    });
  }

  resultData.dailyValue = dailyValue;
  resultData.dailyValueFormatted = formatCurrency(dailyValue);
  resultData.vacationAmount = vacationAmount;
  resultData.vacationAmountFormatted = formatCurrency(vacationAmount);

  const totalRescission = vacationAmount + (resultData.lastMonthPayment || 0);
  resultData.totalRescission = totalRescission;
  resultData.totalRescissionFormatted = formatCurrency(totalRescission);

  totalDaysElement.textContent = resultData.totalDays;
  vacationDaysElement.textContent = resultData.vacationDays;
  remainingVacationDaysElement.textContent = resultData.remainingVacationDays;
  dailyValueElement.textContent = resultData.dailyValueFormatted;
  vacationAmountElement.textContent = resultData.vacationAmountFormatted;
  lastMonthPaymentElement.textContent = resultData.lastMonthPaymentFormatted || "Não se aplica";

  const totalEl = document.getElementById("total-rescission");
  if (totalEl) totalEl.textContent = resultData.totalRescissionFormatted;

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

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const blue = [28, 110, 255];
  const dark = [20, 32, 51];
  const soft = [101, 114, 135];
  const lightBg = [238, 243, 249];
  const white = [255, 255, 255];
  const now = new Date().toLocaleDateString("pt-BR");

  // Header
  doc.setFillColor(...blue);
  doc.rect(0, 0, W, 44, "F");

  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text("Calculadora de Rescisão de Estágio", W / 2, 17, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Ferramenta interna  •  Recursos Humanos / Estágio", W / 2, 27, { align: "center" });
  doc.text("Gerado em " + now, W / 2, 36, { align: "center" });

  // Intern card
  let y = 56;
  doc.setFillColor(...lightBg);
  doc.roundedRect(14, y, W - 28, 26, 4, 4, "F");
  doc.setTextColor(...dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(currentResult.internName, 22, y + 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...soft);
  doc.text(currentResult.calculationTypeLabel, 22, y + 20);
  doc.text(
    formatDate(currentResult.startDateValue) + "  →  " + formatDate(currentResult.endDateValue),
    W - 22, y + 15, { align: "right" }
  );

  y += 40;

  // Section label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...blue);
  doc.text("DADOS CALCULADOS", 14, y);
  doc.setDrawColor(...blue);
  doc.setLineWidth(0.4);
  doc.line(14, y + 3, W - 14, y + 3);

  y += 12;

  // Data rows
  const rows = [];

  if (currentResult.calculationType === "hourly") {
    rows.push(["Valor da hora", currentResult.hourlyRateFormatted]);
    rows.push(["Horas diárias trabalhadas", currentResult.dailyHours + "h"]);
  }
  if (currentResult.calculationType === "monthly") {
    rows.push(["Bolsa mensal", currentResult.monthlyAllowanceFormatted]);
  }

  rows.push(["Dias estagiados", currentResult.totalDays + " dias"]);
  rows.push(["Dias de direito a férias", currentResult.vacationDays + " dias"]);
  rows.push(["Dias de férias usufruídos", currentResult.usedVacationDays + " dias"]);
  rows.push(["Dias restantes de férias", currentResult.remainingVacationDays + " dias"]);
  rows.push(["Valor por dia", currentResult.dailyValueFormatted]);

  if (currentResult.calculationType === "monthly") {
    rows.push(["Início do último mês", formatDate(currentResult.monthStartValue)]);
    rows.push(["Fim do último mês", formatDate(currentResult.monthEndValue)]);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  rows.forEach(function(row, i) {
    if (i % 2 === 0) {
      doc.setFillColor(248, 251, 255);
      doc.rect(14, y - 5, W - 28, 13, "F");
    }
    doc.setTextColor(...soft);
    doc.text(row[0], 20, y + 3);
    doc.setTextColor(...dark);
    doc.setFont("helvetica", "bold");
    doc.text(row[1], W - 20, y + 3, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 14;
  });

  // Highlight: Valor total das férias
  y += 6;
  doc.setFillColor(...blue);
  doc.roundedRect(14, y, W - 28, 24, 4, 4, "F");
  doc.setTextColor(...white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Valor total das férias", 22, y + 10);
  doc.setFontSize(14);
  doc.text(currentResult.vacationAmountFormatted, W - 22, y + 11, { align: "right" });

  // Highlight: Pagamento do último mês (mensal)
  if (currentResult.calculationType === "monthly") {
    y += 32;
    doc.setFillColor(...lightBg);
    doc.roundedRect(14, y, W - 28, 22, 4, 4, "F");
    doc.setTextColor(...blue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Pagamento do último mês", 22, y + 9);
    doc.text(currentResult.lastMonthPaymentFormatted, W - 22, y + 9, { align: "right" });
  }

  // Footer
  doc.setDrawColor(238, 243, 249);
  doc.setLineWidth(0.3);
  doc.line(14, H - 18, W - 14, H - 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...soft);
  doc.text("Calculadora de Rescisão de Estágio  •  Eccos / GHB Docs", 14, H - 10);
  doc.text(now, W - 14, H - 10, { align: "right" });

  // Save
  const safeName = currentResult.internName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

  doc.save("calculo-estagio-" + (safeName || "estagiario") + ".pdf");
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
