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

// Loading screen handler
window.addEventListener("load", function () {
  const loadingScreen = document.getElementById("loadingScreen");
  const loadingVideo = document.querySelector(".loading-video");

  // Hide loading screen after 5 seconds (matching the loading bar animation)
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }, 5000);

  // Also hide if video ends early
  loadingVideo.addEventListener("ended", function () {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  });
});

// State for percentage mode
let isPercentageMode = true;

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

  // Update the form data with converted rate
  formData.set("rate", rate);

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

  // Display the large amount
  document.getElementById("resultAmountLarge").textContent =
    "$" + result.amount.toFixed(2);

  document.getElementById("resultPrincipal").textContent =
    "$" + result.principal.toFixed(2);
  document.getElementById("resultRate").textContent =
    (result.rate * 100).toFixed(2) + "%";
  document.getElementById("resultTime").textContent =
    result.time.toFixed(2) + " years";

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
    "$" + result.interest.toFixed(2);

  // Update visual bar
  const principalPercent = (result.principal / result.amount) * 100;
  const interestPercent = (result.interest / result.amount) * 100;

  document.getElementById("visualPrincipal").style.width =
    principalPercent + "%";
  document.getElementById("visualInterest").style.width =
    interestPercent + "%";
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
