function markEmptyFields(form) {
  const inputs = form.querySelectorAll("input, select, textarea");
  let allFilled = true;
  inputs.forEach(input => {
    const value = (input.value || "").trim();
    if (!value) { input.classList.add("is-invalid"); allFilled = false; }
    else { input.classList.remove("is-invalid"); }
  });
  return allFilled;
}

function handleSubmit(formId, resultId, typeLabelFa, typeLabelEn) {
  const form = document.getElementById(formId);
  const resultBox = document.getElementById(resultId);
  const allFilled = markEmptyFields(form);
  if (!allFilled) { resultBox.innerHTML = ""; return; }

  const langBtn = document.getElementById("langToggle");
  const isFa = langBtn.innerText === "English";
  resultBox.innerHTML = isFa
    ? '<div class="text-success">سفارش شما با موفقیت ثبت شد ✅</div>'
    : '<div class="text-success">Your order has been submitted successfully ✅</div>';

  const data = Object.fromEntries(new FormData(form).entries());
  const tbody = document.querySelector("#ordersTable tbody");
  const row = tbody.insertRow();
  const typeLabel = isFa ? typeLabelFa : typeLabelEn;

  row.innerHTML = `
    <td>${typeLabel}</td>
    <td>${data.name || "-"}</td>
    <td>${data.wallet || "-"}</td>
    <td>${data.amount || "-"}</td>
    <td>${data.duration || "-"}</td>
    <td>${data.interest || (formId === "borrowerForm" ? "" : "-")}</td>
  `;

  form.reset();
}

function setupForm(formId, resultId, typeLabelFa, typeLabelEn) {
  const form = document.getElementById(formId);
  form.addEventListener("input", () => markEmptyFields(form));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    handleSubmit(formId, resultId, typeLabelFa, typeLabelEn);
  });
}

function updateOrdersTableLanguage(isEnglish) {
  const headers = document.querySelectorAll("#ordersTable thead th");
  if (isEnglish) {
    headers[0].innerText = "Type";
    headers[1].innerText = "Name";
    headers[2].innerText = "Wallet";
    headers[3].innerText = "Amount";
    headers[4].innerText = "Duration (Months)";
    headers[5].innerText = "Interest (%)";
  } else {
    headers[0].innerText = "نوع";
    headers[1].innerText = "نام";
    headers[2].innerText = "کیف پول";
    headers[3].innerText = "مبلغ";
    headers[4].innerText = "مدت (ماه)";
    headers[5].innerText = "بهره (%)";
  }

  // تغییر ردیف‌های قبلی
  document.querySelectorAll("#ordersTable tbody tr").forEach(row => {
    const typeCell = row.cells[0];
    if (isEnglish) {
      if (typeCell.innerText === "وام‌گیرنده") typeCell.innerText = "Borrower";
      if (typeCell.innerText === "وام‌دهنده") typeCell.innerText = "Lender";
    } else {
      if (typeCell.innerText === "Borrower") typeCell.innerText = "وام‌گیرنده";
      if (typeCell.innerText === "Lender") typeCell.innerText = "وام‌دهنده";
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // دکمه تاریک/روشن
  document.getElementById("toggleMode").addEventListener("click", () => {
    document.body.classList.toggle("dark");
  });

  // دکمه همگام با سیستم
  document.getElementById("systemMode").addEventListener("click", () => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  });

  // تغییر زبان
  document.getElementById("langToggle").addEventListener("click", () => {
    const langBtn = document.getElementById("langToggle");
    const mainTitle = document.getElementById("mainTitle");

    const borrowerLabels = document.querySelectorAll("#borrowerForm .form-label");
    const borrowerInputs = document.querySelectorAll("#borrowerForm .form-control");

    const lenderLabels = document.querySelectorAll("#lenderForm .form-label");
    const lenderInputs = document.querySelectorAll("#lenderForm .form-control");

    const switchingToEnglish = (langBtn.innerText === "English");

    if (switchingToEnglish) {
      langBtn.innerText = "فارسی";
      mainTitle.innerText = "Loan System";

      document.getElementById("borrowerHeader").innerText = "Borrower";
      document.getElementById("lenderHeader").innerText = "Lender";
      document.getElementById("ordersHeader").innerText = "Orders List";

      document.querySelector("#borrowerForm button").innerText = "Submit Loan Request";
      document.querySelector("#lenderForm button").innerText = "Submit Loan Offer";

      borrowerLabels[0].innerText = "Name";
      borrowerLabels[1].innerText = "Wallet address";
      borrowerLabels[2].innerText = "Loan Amount";
      borrowerLabels[3].innerText = "Loan Duration (Months)";
      borrowerInputs[0].placeholder = "e.g. Ali Rezaei";
      borrowerInputs[1].placeholder = "e.g. EQC...";
      borrowerInputs[2].placeholder = "e.g. 1000";
      borrowerInputs[3].placeholder = "e.g. 6";

      lenderLabels[0].innerText = "Name";
      lenderLabels[1].innerText = "Wallet address";
      lenderLabels[2].innerText = "Amount";
      lenderLabels[3].innerText = "Duration (Months)";
      lenderLabels[4].innerText = "Interest (%)";
      lenderInputs[0].placeholder = "e.g. Mohammad Karimi";
      lenderInputs[1].placeholder = "e.g. EQC...";
      lenderInputs[2].placeholder = "e.g. 5000";
      lenderInputs[3].placeholder = "e.g. 12";
      lenderInputs[4].placeholder = "e.g. 10";

      updateOrdersTableLanguage(true);

    } else {
      langBtn.innerText = "English";
      mainTitle.innerText = "سامانه وام‌دهی";

      document.getElementById("borrowerHeader").innerText = "وام‌گیرنده";
      document.getElementById("lenderHeader").innerText = "وام‌دهنده";
      document.getElementById("ordersHeader").innerText = "لیست سفارشات";

      document.querySelector("#borrowerForm button").innerText = "ثبت درخواست وام";
      document.querySelector("#lenderForm button").innerText = "ثبت پیشنهاد وام";

      borrowerLabels[0].innerText = "نام";
      borrowerLabels[1].innerText = "آدرس کیف پول";
      borrowerLabels[2].innerText = "مبلغ وام";
      borrowerLabels[3].innerText = "مدت وام (ماه)";
      borrowerInputs[0].placeholder = "مثال: علی رضایی";
      borrowerInputs[1].placeholder = "مثال: EQC...";
      borrowerInputs[2].placeholder = "مثال: 1000";
      borrowerInputs[3].placeholder = "مثال: 6";

      lenderLabels[0].innerText = "نام";
      lenderLabels[1].innerText = "آدرس کیف پول";
      lenderLabels[2].innerText = "مبلغ";
      lenderLabels[3].innerText = "مدت (ماه)";
      lenderLabels[4].innerText = "بهره (%)";
      lenderInputs[0].placeholder = "مثال: محمد کریمی";
      lenderInputs[1].placeholder = "مثال: EQC...";
      lenderInputs[2].placeholder = "مثال: 5000";
      lenderInputs[3].placeholder = "مثال: 12";
      lenderInputs[4].placeholder = "مثال: 10";

      updateOrdersTableLanguage(false);
    }
  });

  // اتصال فرم‌ها
  setupForm("borrowerForm", "borrowerResult", "وام‌گیرنده", "Borrower");
  setupForm("lenderForm", "lenderResult", "وام‌دهنده", "Lender");
});
