const form = document.getElementById("calculatorForm");
const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const errorMessage = document.getElementById("errorMessage");
const loading = document.getElementById("loading");
const compoundingSelect = document.getElementById("compounding");
const formulaDisplay = document.getElementById("formulaDisplay");
const percentageToggle = document.getElementById("percentageToggle");
const rateInput = document.getElementById("rate");
const rateSuffix = document.getElementById("rateSuffix");
const timeInput = document.getElementById("time");
const timeUnitSelect = document.getElementById("timeUnit");

// State for time unit
let isYearMode = true;

// Time unit toggle handler
timeUnitSelect.addEventListener("change", function () {
  const selectedUnit = this.value;
  const currentValue = parseFloat(timeInput.value);
  
  if (currentValue && !isNaN(currentValue)) {
    if (selectedUnit === "month" && isYearMode) {
      // Convert years to months
      timeInput.value = (currentValue * 12).toFixed(1);
      timeInput.placeholder = "e.g., 24";
      isYearMode = false;
    } else if (selectedUnit === "year" && !isYearMode) {
      // Convert months to years
      timeInput.value = (currentValue / 12).toFixed(2);
      timeInput.placeholder = "e.g., 2";
      isYearMode = true;
    }
  } else {
    // Just update placeholder
    if (selectedUnit === "month") {
      timeInput.placeholder = "e.g., 24";
      isYearMode = false;
    } else {
      timeInput.placeholder = "e.g., 2";
      isYearMode = true;
    }
  }
  
  // Re-validate time after unit change
  if (timeInput.value) {
    validationErrors.time = validateTime(timeInput.value);
    showInputError('time', validationErrors.time);
  }
});

// Calculation History (using array as data structure)
let calculationHistory = [];
const MAX_HISTORY = 15; // Maximum number of history items

// Load history from localStorage
function loadHistory() {
  const saved = localStorage.getItem('calculationHistory');
  if (saved) {
    calculationHistory = JSON.parse(saved);
    updateHistoryBadge();
  }
}

// Save history to localStorage
function saveHistory() {
  localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
  updateHistoryBadge();
}

// Add calculation to history
function addToHistory(calculation) {
  const historyItem = {
    id: Date.now(),
    date: new Date().toLocaleString(),
    principal: calculation.principal,
    rate: calculation.rate,
    time: calculation.time,
    compounding: calculation.compoundingPeriod,
    amount: calculation.amount,
    interest: calculation.interest
  };
  
  // Add to beginning of array
  calculationHistory.unshift(historyItem);
  
  // Keep only last MAX_HISTORY items
  if (calculationHistory.length > MAX_HISTORY) {
    calculationHistory = calculationHistory.slice(0, MAX_HISTORY);
  }
  
  saveHistory();
  renderHistory();
}

// Update history badge count
function updateHistoryBadge() {
  const badge = document.getElementById('historyBadge');
  if (badge) {
    badge.textContent = calculationHistory.length;
    if (calculationHistory.length === 0) {
      badge.style.display = 'none';
    } else {
      badge.style.display = 'flex';
    }
  }
}

// Render history items
function renderHistory() {
  const historyList = document.getElementById('historyList');
  const historyEmpty = document.getElementById('historyEmpty');
  
  // Get currency from settings
  const currency = appSettings.currencySymbol;
  const decimals = appSettings.decimalPlaces;
  
  if (calculationHistory.length === 0) {
    historyEmpty.style.display = 'block';
    historyList.style.display = 'none';
    return;
  }
  
  historyEmpty.style.display = 'none';
  historyList.style.display = 'flex';
  
  historyList.innerHTML = calculationHistory.map(item => `
    <div class="history-item" onclick="loadFromHistory(${item.id})">
      <div class="history-item-header">
        <span class="history-item-date">${item.date}</span>
        <span class="history-item-amount">${currency}${item.amount.toFixed(decimals)}</span>
      </div>
      <div class="history-item-details">
        <div class="history-detail">
          <span class="history-detail-label">Principal</span>
          <span class="history-detail-value">${currency}${item.principal.toFixed(decimals)}</span>
        </div>
        <div class="history-detail">
          <span class="history-detail-label">Rate</span>
          <span class="history-detail-value">${(item.rate * 100).toFixed(decimals)}%</span>
        </div>
        <div class="history-detail">
          <span class="history-detail-label">Time</span>
          <span class="history-detail-value">${item.time.toFixed(1)} yrs</span>
        </div>
        <div class="history-detail">
          <span class="history-detail-label">Interest</span>
          <span class="history-detail-value">${currency}${item.interest.toFixed(decimals)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Load calculation from history
function loadFromHistory(id) {
  const item = calculationHistory.find(h => h.id === id);
  if (!item) return;
  
  // Fill form with historical values
  document.getElementById('principal').value = item.principal;
  document.getElementById('rate').value = (item.rate * 100).toFixed(2);
  document.getElementById('time').value = item.time;
  document.getElementById('compounding').value = item.compounding;
  
  // Ensure percentage mode is active
  if (!isPercentageMode) {
    percentageToggle.click();
  }
  
  // Ensure year mode is active
  if (!isYearMode) {
    timeUnitSelect.value = 'year';
    isYearMode = true;
  }
  
  // Update formula
  if (item.compounding === 0) {
    formulaDisplay.textContent = "A = P(1 + rt)";
  } else {
    formulaDisplay.textContent = "A = P(1 + r/n)^(nt)";
  }
  
  // Close popover
  closeHistoryPopover();
  
  // Clear any validation errors
  validationErrors.principal = '';
  validationErrors.rate = '';
  validationErrors.time = '';
  showInputError('principal', '');
  showInputError('rate', '');
  showInputError('time', '');
  
  // Automatically recalculate with the loaded values
  setTimeout(() => {
    form.dispatchEvent(new Event('submit'));
  }, 100);
}

// Custom confirm function
function customConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const messageEl = document.getElementById('confirmMessage');
    const okBtn = document.getElementById('confirmOk');
    const cancelBtn = document.getElementById('confirmCancel');
    
    messageEl.textContent = message;
    modal.style.display = 'flex';
    
    function cleanup() {
      modal.style.display = 'none';
      okBtn.removeEventListener('click', handleOk);
      cancelBtn.removeEventListener('click', handleCancel);
    }
    
    function handleOk() {
      cleanup();
      resolve(true);
    }
    
    function handleCancel() {
      cleanup();
      resolve(false);
    }
    
    okBtn.addEventListener('click', handleOk);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

// Clear all history
async function clearAllHistory() {
  const confirmed = await customConfirm('Clear all calculation history?');
  if (confirmed) {
    calculationHistory = [];
    saveHistory();
    renderHistory();
  }
}

// History popover toggle
const floatingHistoryBtn = document.getElementById('floatingHistoryBtn');
const historyPopover = document.getElementById('historyPopover');
const historyPopoverClose = document.getElementById('historyPopoverClose');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

function toggleHistoryPopover() {
  historyPopover.classList.toggle('active');
  if (historyPopover.classList.contains('active')) {
    renderHistory();
  }
}

function closeHistoryPopover() {
  historyPopover.classList.remove('active');
}

floatingHistoryBtn.addEventListener('click', toggleHistoryPopover);
clearHistoryBtn.addEventListener('click', clearAllHistory);

// Close popover when clicking outside
document.addEventListener('click', function(e) {
  if (!historyPopover.contains(e.target) && !floatingHistoryBtn.contains(e.target)) {
    closeHistoryPopover();
  }
});

// Load history on page load
loadHistory();

// ============================================
// SETTINGS SYSTEM
// ============================================
const settingsModal = document.getElementById('settingsModal');
const settingsBtn = document.getElementById('settingsBtn');
const settingsClose = document.getElementById('settingsClose');
const settingsCancelBtn = document.getElementById('settingsCancelBtn');
const settingsSaveBtn = document.getElementById('settingsSaveBtn');
const clearAllDataBtn = document.getElementById('clearAllDataBtn');

// Default settings
let appSettings = {
  decimalPlaces: 2,
  currencySymbol: '$',
  defaultCompounding: 0,
  defaultTimeUnit: 'year',
  defaultRateMode: 'percentage',
  autoSaveHistory: true
};

// Load settings from localStorage
function loadSettings() {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    appSettings = JSON.parse(saved);
    // Always reset to simple interest (0)
    appSettings.defaultCompounding = 0;
    applySettings();
  }
}

// Apply settings to UI
function applySettings() {
  // Update form inputs with defaults
  document.getElementById('decimalPlaces').value = appSettings.decimalPlaces;
  document.getElementById('currencySymbol').value = appSettings.currencySymbol;
  document.getElementById('defaultCompounding').value = appSettings.defaultCompounding;
  document.getElementById('defaultTimeUnit').value = appSettings.defaultTimeUnit;
  document.getElementById('defaultRateMode').value = appSettings.defaultRateMode;
  document.getElementById('autoSaveHistory').checked = appSettings.autoSaveHistory;
  
  // Apply defaults to calculator
  document.getElementById('compounding').value = appSettings.defaultCompounding;
  
  // Update formula based on default compounding
  if (appSettings.defaultCompounding === '0' || appSettings.defaultCompounding === 0) {
    formulaDisplay.textContent = "A = P(1 + rt)";
  } else {
    formulaDisplay.textContent = "A = P(1 + r/n)^(nt)";
  }
}

// Save settings
function saveSettings() {
  appSettings = {
    decimalPlaces: parseInt(document.getElementById('decimalPlaces').value),
    currencySymbol: document.getElementById('currencySymbol').value,
    defaultCompounding: parseInt(document.getElementById('defaultCompounding').value),
    defaultTimeUnit: document.getElementById('defaultTimeUnit').value,
    defaultRateMode: document.getElementById('defaultRateMode').value,
    autoSaveHistory: document.getElementById('autoSaveHistory').checked
  };
  
  localStorage.setItem('appSettings', JSON.stringify(appSettings));
  applySettings();
  closeSettings();
  
  // Show success message
  alert('✅ Settings saved successfully!');
}

// Open settings modal
function openSettings() {
  settingsModal.classList.add('active');
}

// Close settings modal
function closeSettings() {
  settingsModal.classList.remove('active');
}

// Clear all data
function clearAllData() {
  if (confirm('⚠️ This will clear all your history and reset settings to default. Continue?')) {
    localStorage.clear();
    calculationHistory = [];
    appSettings = {
      decimalPlaces: 2,
      currencySymbol: '$',
      defaultCompounding: 0,
      defaultTimeUnit: 'year',
      defaultRateMode: 'percentage',
      autoSaveHistory: true
    };
    applySettings();
    renderHistory();
    updateHistoryBadge();
    alert('✅ All data cleared and settings reset!');
  }
}

// Event listeners
if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
if (settingsClose) settingsClose.addEventListener('click', closeSettings);
if (settingsCancelBtn) settingsCancelBtn.addEventListener('click', closeSettings);
if (settingsSaveBtn) settingsSaveBtn.addEventListener('click', saveSettings);
if (clearAllDataBtn) clearAllDataBtn.addEventListener('click', clearAllData);

// Close modal when clicking outside
if (settingsModal) {
  settingsModal.addEventListener('click', function(e) {
    if (e.target === settingsModal) {
      closeSettings();
    }
  });
}

// Load settings on page load
loadSettings();

// ============================================
// TUTORIAL BUTTON
// ============================================
const tutorialBtn = document.getElementById('tutorialBtn');

if (tutorialBtn) {
  tutorialBtn.addEventListener('click', function() {
    startTutorial();
  });
}

// ============================================
// TAB SYSTEM FOR RESULTS
// ============================================
const resultTabs = document.querySelectorAll('.result-tab');
const tabContents = document.querySelectorAll('.tab-content');

resultTabs.forEach(tab => {
  tab.addEventListener('click', function() {
    const tabName = this.getAttribute('data-tab');
    
    // Remove active class from all tabs and contents
    resultTabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Add active class to clicked tab and corresponding content
    this.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // If switching to chart tab, update/render the chart
    if (tabName === 'chart' && window.currentCalculation) {
      renderChart(window.currentCalculation);
    }
  });
});

// ============================================
// AMORTIZATION SCHEDULE GENERATION
// ============================================
function generateSchedule(result) {
  const tableBody = document.getElementById('scheduleTableBody');
  const { principal, rate, time, compoundingPeriod } = result;
  
  // Get currency and decimals from settings
  const currency = appSettings.currencySymbol;
  const decimals = appSettings.decimalPlaces;
  
  // Clear existing rows
  tableBody.innerHTML = '';
  
  // For simple interest (compoundingPeriod = 0)
  if (compoundingPeriod === 0) {
    // Show yearly breakdown
    const years = Math.ceil(time);
    
    for (let year = 1; year <= years; year++) {
      const actualTime = year > time ? time - (year - 1) : 1;
      const periodInterest = principal * rate * actualTime;
      const periodTotal = principal + (principal * rate * year);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="schedule-period">Year ${year}</td>
        <td>${currency}${principal.toFixed(decimals)}</td>
        <td>${currency}${(principal * rate * year).toFixed(decimals)}</td>
        <td class="schedule-total">${currency}${periodTotal.toFixed(decimals)}</td>
      `;
      tableBody.appendChild(row);
      
      if (year >= time) break;
    }
  } else {
    // For compound interest, show per compounding period
    const periodsPerYear = compoundingPeriod;
    const totalPeriods = Math.ceil(time * periodsPerYear);
    const ratePerPeriod = rate / periodsPerYear;
    
    let runningTotal = principal;
    
    for (let period = 1; period <= Math.min(totalPeriods, 100); period++) {
      const periodInterest = runningTotal * ratePerPeriod;
      runningTotal += periodInterest;
      
      const periodLabel = getPeriodLabel(period, periodsPerYear);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="schedule-period">${periodLabel}</td>
        <td>${currency}${principal.toFixed(decimals)}</td>
        <td>${currency}${(runningTotal - principal).toFixed(decimals)}</td>
        <td class="schedule-total">${currency}${runningTotal.toFixed(decimals)}</td>
      `;
      tableBody.appendChild(row);
    }
    
    if (totalPeriods > 100) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="4" class="schedule-empty">Showing first 100 periods only</td>`;
      tableBody.appendChild(row);
    }
  }
}

function getPeriodLabel(period, periodsPerYear) {
  switch(periodsPerYear) {
    case 1: return `Year ${period}`;
    case 2: return `H${period} (Y${Math.ceil(period / 2)})`;
    case 4: return `Q${period} (Y${Math.ceil(period / 4)})`;
    case 12: return `Month ${period} (Y${Math.ceil(period / 12)})`;
    default: return `Period ${period}`;
  }
}

// ============================================
// CHART VISUALIZATION (AREA CHART)
// ============================================
let growthChart = null;

function renderChart(result) {
  const ctx = document.getElementById('growthChart');
  if (!ctx) return;
  
  const { principal, rate, time, compoundingPeriod } = result;
  
  // Generate data points (monthly for better visualization)
  const months = Math.ceil(time * 12);
  const dataPoints = Math.min(months, 120); // Max 120 points (10 years)
  const labels = [];
  const principalData = [];
  const totalData = [];
  
  for (let i = 0; i <= dataPoints; i++) {
    const currentTime = (i / 12); // Convert months to years
    
    // Label
    if (dataPoints <= 24) {
      labels.push(`Month ${i}`);
    } else {
      labels.push(i % 12 === 0 ? `Year ${i / 12}` : '');
    }
    
    // Principal stays constant
    principalData.push(principal);
    
    // Calculate total based on interest type
    let total;
    if (compoundingPeriod === 0) {
      // Simple interest
      total = principal * (1 + rate * currentTime);
    } else {
      // Compound interest
      const n = compoundingPeriod;
      total = principal * Math.pow(1 + rate / n, n * currentTime);
    }
    totalData.push(total);
  }
  
  // Destroy existing chart if any
  if (growthChart) {
    growthChart.destroy();
  }
  
  // Check if light mode is active
  const isLightMode = document.body.classList.contains('light-mode');
  const textColor = isLightMode ? '#1a1a1a' : '#888';
  const legendColor = isLightMode ? '#1a1a1a' : '#ddd';
  const gridColor = isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.05)';
  
  // Create new chart
  growthChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Principal',
          data: principalData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0,
          pointRadius: 0,
          pointHoverRadius: 6
        },
        {
          label: 'Total Amount',
          data: totalData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: legendColor,
            font: {
              size: 13,
              weight: '600'
            },
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fff',
          bodyColor: '#ddd',
          borderColor: '#10b981',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += '$' + context.parsed.y.toFixed(2);
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: gridColor,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            font: {
              size: 11
            },
            maxRotation: 0,
            autoSkip: true,
            autoSkipPadding: 20
          }
        },
        y: {
          grid: {
            color: gridColor,
            drawBorder: false
          },
          ticks: {
            color: textColor,
            font: {
              size: 11
            },
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          beginAtZero: true
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      }
    }
  });
}

// ============================================
// LOADING SCREEN & TUTORIAL
// ============================================
window.addEventListener("load", function () {
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingVideo = document.querySelector(".loading-video");

  // Hide loading screen after 5 seconds (matching the loading bar animation)
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
      // Start tutorial after loading screen disappears
      setTimeout(() => {
        startTutorial();
      }, 500);
    }, 500);
  }, 5000);

  // Also hide if video ends early
  loadingVideo.addEventListener("ended", function () {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
      // Start tutorial after loading screen disappears
      setTimeout(() => {
        startTutorial();
      }, 500);
    }, 500);
  });
});

// State for percentage mode
let isPercentageMode = true;

// Validation state
const validationErrors = {
  principal: '',
  rate: '',
  time: ''
};

// Input validation functions
function validatePrincipal(value) {
  const num = parseFloat(value);
  if (!value || value.trim() === '') {
    return 'Principal amount is required';
  }
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  if (num <= 0) {
    return 'Principal must be greater than 0';
  }
  if (num > 1000000000) {
    return 'Principal amount seems unrealistic (max: $1 billion)';
  }
  return '';
}

function validateRate(value) {
  const num = parseFloat(value);
  if (!value || value.trim() === '') {
    return 'Interest rate is required';
  }
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  if (num <= 0) {
    return 'Interest rate must be greater than 0';
  }
  if (isPercentageMode && num > 100) {
    return 'Interest rate cannot exceed 100%';
  }
  if (!isPercentageMode && num > 1) {
    return 'Interest rate cannot exceed 1.0 (100%)';
  }
  return '';
}

function validateTime(value) {
  const num = parseFloat(value);
  if (!value || value.trim() === '') {
    return 'Time period is required';
  }
  if (isNaN(num)) {
    return 'Please enter a valid number';
  }
  if (num <= 0) {
    return 'Time must be greater than 0';
  }
  if (num > 100) {
    return 'Time period seems unrealistic (max: 100 years)';
  }
  return '';
}

function showInputError(inputId, message) {
  const input = document.getElementById(inputId);
  const formGroup = input.closest('.form-group') || input.closest('.input-wrapper');
  
  // Remove any existing error message
  let errorDiv = formGroup.querySelector('.input-error');
  if (!errorDiv && message) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'input-error';
    formGroup.appendChild(errorDiv);
  }
  
  if (message) {
    input.classList.add('input-invalid');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  } else {
    input.classList.remove('input-invalid');
    if (errorDiv) {
      errorDiv.style.display = 'none';
    }
  }
}

function validateAllInputs() {
  const principalValue = document.getElementById('principal').value;
  const rateValue = document.getElementById('rate').value;
  const timeValue = document.getElementById('time').value;
  
  validationErrors.principal = validatePrincipal(principalValue);
  validationErrors.rate = validateRate(rateValue);
  validationErrors.time = validateTime(timeValue);
  
  showInputError('principal', validationErrors.principal);
  showInputError('rate', validationErrors.rate);
  showInputError('time', validationErrors.time);
  
  return !validationErrors.principal && !validationErrors.rate && !validationErrors.time;
}

// Real-time validation on input
document.getElementById('principal').addEventListener('input', function() {
  validationErrors.principal = validatePrincipal(this.value);
  showInputError('principal', validationErrors.principal);
});

document.getElementById('rate').addEventListener('input', function() {
  validationErrors.rate = validateRate(this.value);
  showInputError('rate', validationErrors.rate);
});

document.getElementById('time').addEventListener('input', function() {
  validationErrors.time = validateTime(this.value);
  showInputError('time', validationErrors.time);
});

// Percentage toggle handler
percentageToggle.addEventListener("click", function () {
  isPercentageMode = !isPercentageMode;

  if (isPercentageMode) {
    percentageToggle.classList.add("active");
    percentageToggle.textContent = "% Mode";
    rateSuffix.textContent = "%";
    rateInput.placeholder = "e.g., 5";
    // Convert decimal to percentage if there's a value
    if (rateInput.value && rateInput.value < 1 && rateInput.value > 0) {
      rateInput.value = (parseFloat(rateInput.value) * 100).toFixed(2);
    }
  } else {
    percentageToggle.classList.remove("active");
    percentageToggle.textContent = "Decimal";
    rateSuffix.textContent = "";
    rateInput.placeholder = "e.g., 0.05";
    // Convert percentage to decimal if there's a value
    if (rateInput.value && rateInput.value >= 1) {
      rateInput.value = (parseFloat(rateInput.value) / 100).toFixed(4);
    }
  }
  
  // Re-validate rate after mode change
  if (rateInput.value) {
    validationErrors.rate = validateRate(rateInput.value);
    showInputError('rate', validationErrors.rate);
  }
});

// Update formula display when compounding period changes
compoundingSelect.addEventListener("change", function () {
  if (this.value === "0") {
    formulaDisplay.textContent = "A = P(1 + rt)";
  } else {
    formulaDisplay.textContent = "A = P(1 + r/n)^(nt)";
  }
});

// Form submission handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validate all inputs before submitting
  if (!validateAllInputs()) {
    showError('Please fix the errors above before calculating.');
    return;
  }

  // Hide previous results and errors
  errorMessage.classList.remove("show");
  loading.style.display = "block";

  // Get form data
  const formData = new FormData(form);

  // Convert rate to decimal if in percentage mode
  let rate = parseFloat(formData.get("rate"));
  if (isPercentageMode) {
    rate = rate / 100;
  }

  // Convert time to years if in month mode
  let time = parseFloat(formData.get("time"));
  if (!isYearMode) {
    time = time / 12; // Convert months to years
  }

  // Update the form data with converted values
  formData.set("rate", rate);
  formData.set("time", time);

  const data = new URLSearchParams(formData);

  try {
    // Send POST request to C++ backend
    const response = await fetch("/api/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    });

    const result = await response.json();
    loading.style.display = "none";

    if (result.success) {
      // Display results
      displayResult(result);
    } else {
      // Show error
      showError(
        result.error || "Calculation failed. Please check your inputs."
      );
    }
  } catch (error) {
    loading.style.display = "none";
    showError(
      "Error connecting to server. Please ensure the C++ server is running."
    );
    console.error("Error:", error);
  }
});

/**
 * Function: displayResult
 * Purpose: Display calculation results in the UI
 */
function displayResult(result) {
  // Hide empty state, show results
  resultEmpty.style.display = "none";
  resultContent.style.display = "flex";

  // Get currency symbol and decimal places from settings
  const currency = appSettings.currencySymbol;
  const decimals = appSettings.decimalPlaces;

  // Display the large amount
  document.getElementById("resultAmountLarge").textContent =
    currency + result.amount.toFixed(decimals);

  document.getElementById("resultPrincipal").textContent =
    currency + result.principal.toFixed(decimals);
  document.getElementById("resultRate").textContent =
    (result.rate * 100).toFixed(decimals) + "%";
  document.getElementById("resultTime").textContent =
    result.time.toFixed(decimals) + " years";

  // Display compounding type
  const compoundingTypes = {
    0: "Simple Interest",
    1: "Annual",
    2: "Semi-Annual",
    4: "Quarterly",
    12: "Monthly",
  };
  document.getElementById("resultCompounding").textContent =
    compoundingTypes[result.compoundingPeriod] || "Simple";

  document.getElementById("resultInterest").textContent =
    currency + result.interest.toFixed(decimals);

  // Update visual bar
  const principalPercent = (result.principal / result.amount) * 100;
  const interestPercent = (result.interest / result.amount) * 100;

  document.getElementById("visualPrincipal").style.width =
    principalPercent + "%";
  document.getElementById("visualInterest").style.width =
    interestPercent + "%";
  
  // Store current calculation globally for chart rendering
  window.currentCalculation = result;
  
  // Generate amortization schedule
  generateSchedule(result);
  
  // If chart tab is active, render chart immediately
  const chartTab = document.querySelector('[data-tab="chart"]');
  if (chartTab && chartTab.classList.contains('active')) {
    renderChart(result);
  }
  
  // Add to calculation history
  addToHistory(result);
}

/**
 * Function: showError
 * Purpose: Display error message
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
}

/**
 * Function: clearForm
 * Purpose: Clear all inputs and results
 */
function clearForm() {
  form.reset();
  resultEmpty.style.display = "flex";
  resultContent.style.display = "none";
  errorMessage.classList.remove("show");
  formulaDisplay.textContent = "A = P(1 + rt)";
  // Reset to percentage mode
  isPercentageMode = true;
  percentageToggle.classList.add("active");
  percentageToggle.textContent = "% Mode";
  rateSuffix.textContent = "%";
  rateInput.placeholder = "e.g., 5";
  
  // Reset to year mode
  isYearMode = true;
  timeUnitSelect.value = "year";
  timeInput.placeholder = "e.g., 2";
  
  // Clear validation errors
  validationErrors.principal = '';
  validationErrors.rate = '';
  validationErrors.time = '';
  showInputError('principal', '');
  showInputError('rate', '');
  showInputError('time', '');
}

// Input validation - prevent negative values
const inputs = document.querySelectorAll('input[type="number"]');
inputs.forEach((input) => {
  input.addEventListener("input", function () {
    if (this.value < 0) {
      this.value = 0;
    }
  });
});

// ========== TUTORIAL SYSTEM ==========

const tutorialSteps = [
  {
    title: "Welcome to SimpleGains! 👋",
    text: "Let's take a quick interactive tour! We'll guide you through creating your first calculation. You'll actually fill in the form as we go!",
    element: null,
    position: "center",
    waitForAction: false
  },
  {
    title: "Step 1: Enter Principal Amount 💰",
    text: "First, click on the Principal Amount field below and enter a value. Try entering <strong>10000</strong>.",
    element: "#principal",
    position: "right",
    waitForAction: true,
    actionType: "input",
    targetElement: "#principal"
  },
  {
    title: "Step 2: Set Interest Rate 📊",
    text: "Great! Now enter the interest rate. Try <strong>5</strong> (which means 5% per year).",
    element: "#rate",
    position: "right",
    waitForAction: true,
    actionType: "input",
    targetElement: "#rate"
  },
  {
    title: "💡 Bonus Tip: Switch Rate Mode",
    text: "See the toggle button next to the rate? Click it to switch between percentage (%) and decimal (0.05) mode. Try clicking it now!",
    element: "#percentageToggle",
    position: "right",
    isBonus: true,
    waitForAction: true,
    actionType: "click",
    targetElement: "#percentageToggle",
    optional: true
  },
  {
    title: "Step 3: Enter Time Period ⏰",
    text: "Now specify how many years. Let's try <strong>3</strong> years.",
    element: "#time",
    position: "right",
    waitForAction: true,
    actionType: "input",
    targetElement: "#time"
  },
  {
    title: "Step 4: Choose Compounding 🔄",
    text: "Select how often interest compounds. Click the dropdown and choose any option - try <strong>Monthly</strong>!",
    element: "#compounding",
    position: "right",
    waitForAction: true,
    actionType: "change",
    targetElement: "#compounding"
  },
  {
    title: "Step 5: Calculate Your Results! 🚀",
    text: "Perfect! Now click the <strong>Calculate</strong> button to see your results!",
    element: ".btn-calculate",
    position: "top",
    waitForAction: true,
    actionType: "click",
    targetElement: ".btn-calculate"
  },
  {
    title: "Step 6: View Your Results 📈",
    text: "Awesome! Here are your results. You can see the total amount, interest earned, and a visual breakdown. Feel free to explore!",
    element: ".bento-output",
    position: "left",
    waitForAction: false
  },
  {
    title: "You're All Set! 🎉",
    text: "Congratulations! You've completed your first calculation. Now you can try different values to see how your money grows. Happy calculating!",
    element: null,
    position: "center",
    waitForAction: false
  }
];

let currentStep = 0;
let currentHighlightedElement = null;
let actionCompleted = false;
let actionListener = null;

const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialTitle = document.getElementById("tutorialTitle");
const tutorialText = document.getElementById("tutorialText");
const tutorialCounter = document.getElementById("tutorialCounter");
const tutorialNext = document.getElementById("tutorialNext");
const tutorialPrev = document.getElementById("tutorialPrev");
const tutorialSkip = document.getElementById("tutorialSkip");
const tutorialClose = document.getElementById("tutorialClose");
const tutorialTooltip = document.querySelector(".tutorial-tooltip");

function startTutorial() {
  // Check if user has seen the tutorial before
  if (localStorage.getItem("tutorialCompleted") === "true") {
    return;
  }

  currentStep = 0;
  tutorialOverlay.style.display = "block";
  tutorialOverlay.classList.add("active");
  showStep(currentStep);
}

function showStep(stepIndex) {
  const step = tutorialSteps[stepIndex];
  actionCompleted = false;
  
  // Update content
  tutorialTitle.textContent = step.title;
  
  // Handle bonus tip styling
  if (step.isBonus) {
    tutorialText.innerHTML = `<div class="tutorial-bonus"><strong>💡 Pro Tip:</strong> ${step.text}</div>`;
  } else {
    tutorialText.innerHTML = `<p>${step.text}</p>`;
  }
  
  tutorialCounter.textContent = `${stepIndex + 1} / ${tutorialSteps.length}`;
  
  // Show/hide prev button
  if (stepIndex === 0) {
    tutorialPrev.style.display = "none";
  } else {
    tutorialPrev.style.display = "inline-block";
  }
  
  // Remove previous highlight
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove("tutorial-highlight");
    currentHighlightedElement.style.pointerEvents = "";
  }
  
  // Remove previous action listener
  if (actionListener && actionListener.element && actionListener.handler) {
    actionListener.element.removeEventListener(actionListener.type, actionListener.handler);
  }
  
  // Highlight and position tooltip for current element
  if (step.element) {
    const element = document.querySelector(step.element);
    if (element) {
      currentHighlightedElement = element;
      element.classList.add("tutorial-highlight");
      
      // Enable interaction for highlighted element
      element.style.pointerEvents = "auto";
      element.style.position = "relative";
      element.style.zIndex = "9999";
      
      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Position tooltip near the element
      setTimeout(() => positionTooltip(element, step.position), 100);
    }
  } else {
    // Center the tooltip
    currentHighlightedElement = null;
    positionTooltip(null, "center");
  }
  
  // Set up interactive waiting
  if (step.waitForAction && step.targetElement) {
    setupActionListener(step);
    // Hide Next button while waiting for action (unless optional)
    if (!step.optional) {
      tutorialNext.style.display = "none";
    } else {
      tutorialNext.style.display = "inline-block";
      tutorialNext.textContent = "Skip This Step";
    }
  } else {
    // Show Next/Finish button
    tutorialNext.style.display = "inline-block";
    if (stepIndex === tutorialSteps.length - 1) {
      tutorialNext.textContent = "Finish";
    } else {
      tutorialNext.textContent = "Next";
    }
  }
}

function setupActionListener(step) {
  const targetElement = document.querySelector(step.targetElement);
  if (!targetElement) return;
  
  // Make sure target element is interactive
  targetElement.style.pointerEvents = "auto";
  targetElement.style.position = "relative";
  targetElement.style.zIndex = "9999";
  
  let eventType = step.actionType;
  
  const handler = function(e) {
    // For input fields, check if they have a value
    if (step.actionType === "input") {
      if (targetElement.value && targetElement.value.trim() !== "") {
        actionCompleted = true;
        onActionCompleted();
      }
    } 
    // For clicks and changes, immediately complete
    else if (step.actionType === "click" || step.actionType === "change") {
      actionCompleted = true;
      setTimeout(() => onActionCompleted(), 300); // Small delay for visual feedback
    }
  };
  
  // Store listener info for cleanup
  actionListener = {
    element: targetElement,
    type: eventType,
    handler: handler
  };
  
  targetElement.addEventListener(eventType, handler);
}

function onActionCompleted() {
  if (!actionCompleted) return;
  
  // Show success message briefly
  const step = tutorialSteps[currentStep];
  if (!step.optional) {
    tutorialText.innerHTML = `<p>${step.text}</p><p style="color: #10b981; margin-top: 12px; font-weight: 600;">✓ Great job! Click Next to continue.</p>`;
  }
  
  // Show Next button
  tutorialNext.style.display = "inline-block";
  tutorialNext.textContent = currentStep === tutorialSteps.length - 1 ? "Finish" : "Next";
}

function positionTooltip(element, position) {
  if (!element || position === "center") {
    // Center on screen
    tutorialTooltip.style.top = "50%";
    tutorialTooltip.style.left = "50%";
    tutorialTooltip.style.transform = "translate(-50%, -50%)";
    tutorialTooltip.style.bottom = "auto";
    tutorialTooltip.style.right = "auto";
    return;
  }
  
  const rect = element.getBoundingClientRect();
  const tooltipRect = tutorialTooltip.getBoundingClientRect();
  const offset = 20;
  
  // Reset transforms
  tutorialTooltip.style.transform = "none";
  
  switch(position) {
    case "right":
      tutorialTooltip.style.left = (rect.right + offset) + "px";
      tutorialTooltip.style.top = (rect.top + rect.height / 2 - tooltipRect.height / 2) + "px";
      tutorialTooltip.style.bottom = "auto";
      tutorialTooltip.style.right = "auto";
      break;
    case "left":
      tutorialTooltip.style.left = (rect.left - tooltipRect.width - offset) + "px";
      tutorialTooltip.style.top = (rect.top + rect.height / 2 - tooltipRect.height / 2) + "px";
      tutorialTooltip.style.bottom = "auto";
      tutorialTooltip.style.right = "auto";
      break;
    case "top":
      tutorialTooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + "px";
      tutorialTooltip.style.top = (rect.top - tooltipRect.height - offset) + "px";
      tutorialTooltip.style.bottom = "auto";
      tutorialTooltip.style.right = "auto";
      break;
    case "bottom":
      tutorialTooltip.style.left = (rect.left + rect.width / 2 - tooltipRect.width / 2) + "px";
      tutorialTooltip.style.top = (rect.bottom + offset) + "px";
      tutorialTooltip.style.bottom = "auto";
      tutorialTooltip.style.right = "auto";
      break;
  }
  
  // Keep tooltip within viewport
  const tooltipNewRect = tutorialTooltip.getBoundingClientRect();
  if (tooltipNewRect.right > window.innerWidth) {
    tutorialTooltip.style.left = (window.innerWidth - tooltipRect.width - 20) + "px";
  }
  if (tooltipNewRect.left < 0) {
    tutorialTooltip.style.left = "20px";
  }
  if (tooltipNewRect.bottom > window.innerHeight) {
    tutorialTooltip.style.top = (window.innerHeight - tooltipRect.height - 20) + "px";
  }
  if (tooltipNewRect.top < 0) {
    tutorialTooltip.style.top = "20px";
  }
}

function nextStep() {
  if (currentStep < tutorialSteps.length - 1) {
    currentStep++;
    showStep(currentStep);
  } else {
    endTutorial();
  }
}

function prevStep() {
  if (currentStep > 0) {
    currentStep--;
    showStep(currentStep);
  }
}

function endTutorial() {
  tutorialOverlay.style.display = "none";
  tutorialOverlay.classList.remove("active");
  if (currentHighlightedElement) {
    currentHighlightedElement.classList.remove("tutorial-highlight");
    currentHighlightedElement.style.pointerEvents = "";
    currentHighlightedElement.style.zIndex = "";
  }
  
  // Clean up any action listeners
  if (actionListener && actionListener.element && actionListener.handler) {
    actionListener.element.removeEventListener(actionListener.type, actionListener.handler);
    actionListener.element.style.pointerEvents = "";
    actionListener.element.style.zIndex = "";
  }
  
  localStorage.setItem("tutorialCompleted", "true");
}

// Event listeners for tutorial
if (tutorialNext) tutorialNext.addEventListener("click", nextStep);
if (tutorialPrev) tutorialPrev.addEventListener("click", prevStep);
if (tutorialSkip) tutorialSkip.addEventListener("click", endTutorial);
if (tutorialClose) tutorialClose.addEventListener("click", endTutorial);

// Optional: Add a way to restart the tutorial
// Uncomment this to add a "Restart Tutorial" function you can call
// function restartTutorial() {
//   localStorage.removeItem("tutorialCompleted");
//   startTutorial();
// }

// ============================================
// PRESETS SYSTEM
// ============================================
const presetsBtn = document.getElementById('presetsBtn');
const presetsModal = document.getElementById('presetsModal');
const presetsClose = document.getElementById('presetsClose');
const presetCards = document.querySelectorAll('.preset-card');

const presets = {
  savings: { principal: 10000, rate: 2.5, time: 5 },
  loan: { principal: 25000, rate: 7, time: 3 },
  investment: { principal: 5000, rate: 4, time: 2 },
  emergency: { principal: 15000, rate: 3, time: 1 }
};

function openPresets() {
  presetsModal.style.display = 'flex';
}

function closePresets() {
  presetsModal.style.display = 'none';
}

function applyPreset(presetName) {
  const preset = presets[presetName];
  if (preset) {
    document.getElementById('principal').value = preset.principal;
    document.getElementById('rate').value = preset.rate;
    document.getElementById('time').value = preset.time;
    closePresets();
    
    // Scroll to calculator
    document.querySelector('.bento-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

if (presetsBtn) presetsBtn.addEventListener('click', openPresets);
if (presetsClose) presetsClose.addEventListener('click', closePresets);

presetCards.forEach(card => {
  card.addEventListener('click', function() {
    const presetType = this.getAttribute('data-preset');
    applyPreset(presetType);
  });
});

// Close modal when clicking outside
presetsModal.addEventListener('click', function(e) {
  if (e.target === presetsModal) {
    closePresets();
  }
});

// ============================================
// THEME TOGGLE
// ============================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
  document.body.classList.add('light-mode');
  themeIcon.textContent = '☀️';
}

function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  
  themeIcon.textContent = isLight ? '☀️' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  
  // Re-render chart if it exists
  if (growthChart) {
    displayResults();
  }
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
