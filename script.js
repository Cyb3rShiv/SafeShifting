/**
 * Safe Shifting Packers & Movers – E-Invoice
 * script.js  |  All functionality + Firebase Auth
 */

/* ═══════════════════════════════════════════
   FIREBASE CONFIGURATION
   ⚠ Replace the placeholder values below with
     your actual Firebase project config from:
     https://console.firebase.google.com/
     → Project Settings → Your apps → Web app
════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey: "AIzaSyAAH2BsG2efWzsnXlFQm9CyKasxd5ELK-A",
  authDomain: "safe-shifting.firebaseapp.com",
  projectId: "safe-shifting",
  storageBucket: "safe-shifting.firebasestorage.app",
  messagingSenderId: "957011145524",
  appId: "1:957011145524:web:a21e1ec9aca61dce14ab61",
  measurementId: "G-GWSZVQDC2W"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

/* ═══════════════════════════════════════════
   AUTH STATE LISTENER
   Show/hide auth overlay and invoice app
════════════════════════════════════════════ */
auth.onAuthStateChanged((user) => {
  const overlay = document.getElementById("auth-overlay");
  const toolbar = document.getElementById("main-toolbar");
  const invoiceWrap = document.getElementById("invoice-root");

  if (user) {
    // Logged in → hide overlay, show app
    overlay.style.display = "none";
    toolbar.style.display = "flex";
    invoiceWrap.style.display = "flex";
    initInvoiceApp();
  } else {
    // Not logged in → show overlay, hide app
    overlay.style.display = "flex";
    toolbar.style.display = "none";
    invoiceWrap.style.display = "none";
  }
});

/* ─── Login ─── */
function loginUser() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const errEl = document.getElementById("auth-error");
  const btn = document.getElementById("auth-login-btn");

  errEl.textContent = "";

  if (!email || !password) {
    errEl.textContent = "⚠ Please enter email and password.";
    return;
  }

  btn.disabled = true;
  btn.textContent = "Logging in…";

  auth.signInWithEmailAndPassword(email, password)
    .catch((err) => {
      let msg = "Login failed. Check credentials.";
      if (err.code === "auth/user-not-found") msg = "⚠ No account found for this email.";
      if (err.code === "auth/wrong-password") msg = "⚠ Incorrect password.";
      if (err.code === "auth/invalid-email") msg = "⚠ Invalid email address.";
      if (err.code === "auth/too-many-requests") msg = "⚠ Too many attempts. Try later.";
      if (err.code === "auth/invalid-credential") msg = "⚠ Invalid email or password.";
      errEl.textContent = msg;
      btn.disabled = false;
      btn.textContent = "🔐 Login";
    });
}

/* Allow Enter key to trigger login */
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && document.getElementById("auth-overlay").style.display !== "none") {
    loginUser();
  }
});

/* ─── Logout ─── */
function logoutUser() {
  if (!confirm("Are you sure you want to log out?")) return;
  auth.signOut();
}

/* ═══════════════════════════════════════════
   DATA DEFINITIONS
════════════════════════════════════════════ */

/** Primary service rows */
const SERVICE_ROWS = [
  {
    id: "transport",
    label: "Transportation Goods By",
    extra: `
      <label class="svc-label"><input type="checkbox" class="svc-check" name="tx-air"/> Air</label>
      <label class="svc-label"><input type="checkbox" class="svc-check" name="tx-ship"/> Ship</label>
      <label class="svc-label"><input type="checkbox" class="svc-check" name="tx-truck"/> Truck</label>
      <input class="svc-input" name="tx-feet" placeholder="........Feet"/>
    `
  },
  {
    id: "transport-car",
    label: "Transportation (CAR)",
    extra: `<input class="svc-input" name="car-model" placeholder="Model : .............................."/>`
  },
  {
    id: "packing",
    label: "Packing",
    extra: ``
  },
  {
    id: "loading",
    label: "Loading",
    extra: `
      (Floor
      <input class="svc-input" name="ld-floor" placeholder="........" style="width:50px"/>)
      Use:
      <label class="svc-label"><input type="checkbox" class="svc-check" name="ld-lift"/> Lift</label>
      <label class="svc-label"><input type="checkbox" class="svc-check" name="ld-stairs"/> Stairs</label>
      <label class="svc-label"><input type="checkbox" class="svc-check" name="ld-rope"/> Rope</label>
    `
  },
  {
    id: "unloading",
    label: "Unloading",
    extra: `
      (Floor
      <input class="svc-input" name="ul-floor" placeholder="........" style="width:50px"/>)
      Use:
      <label class="svc-label"><input type="checkbox" class="svc-check" name="ul-lift"/> Lift</label>
      <label class="svc-label"><input type="checkbox" class="svc-check" name="ul-stairs"/> Stairs</label>
      <label class="svc-label"><input type="checkbox" class="svc-check" name="ul-rope"/> Rope</label>
    `
  },
  {
    id: "unpacking",
    label: "Unpacking",
    extra: `<span style="font-size:9px;color:#666;">(Goods Re-arrange will be by Party at Destination)</span>`
  },
  {
    id: "gst-row",
    label: "GST @",
    extra: `
      <input class="svc-input" name="gst-pct-svc" placeholder="........." style="width:50px"/>
      % on total amount Rs.
      <input class="svc-input" name="gst-base" placeholder="..........." style="width:70px"/>
      <span style="color:#c0392b;font-size:9px;">(Extra)</span>
    `
  },
  {
    id: "insurance-hhg",
    label: "Transit Insurance for HHG",
    extra: `@3% on declared goods value Rs.
      <input class="svc-input" name="ins-hhg-val" placeholder="..........." style="width:70px"/>
      <span style="color:#c0392b;font-size:9px;">(Extra)</span>`
  },
  {
    id: "insurance-car",
    label: "Transit Insurance for CR",
    extra: `@1.5% on declared Car Value Rs.
      <input class="svc-input" name="ins-car-val" placeholder="..........." style="width:70px"/>
      <span style="color:#c0392b;font-size:9px;">(Extra)</span>`
  },
  {
    id: "truck-type",
    label: "Truck Type",
    extra: `
      <label class="svc-label"><input type="checkbox" class="svc-check" name="t-individual"/> Individual Truck</label>
      <label class="svc-label"><input type="checkbox" class="svc-check" name="t-sharing"/> Sharing Basis Truck</label>
      <span style="font-size:9px;color:#888;">(Additional services chargeable extra – actual payable by party)</span>
    `
  }
];

/** Additional charge rows */
const ADD_CHARGE_ROWS = [
  { id: "st-tax", label: "S.T. Charges" },
  { id: "toll-tax", label: "Toll Tax / Green Tax / Entry Charges @", hasNote: true },
  { id: "storage", label: "Storage Charges : Per Day ______ Per Month ______ Per Year ______" },
  { id: "escort", label: "Escort with vehicle inclusive of Escorts expenses & Return Fare Charges" },
  { id: "rearrange", label: "Goods Re-arranging Charges" },
  { id: "carpenter", label: "Carpenter / Plumber / Electrician Charges" },
  { id: "other", label: "Other Charge" }
];

/* ═══════════════════════════════════════════
   INIT (called only after auth confirmed)
════════════════════════════════════════════ */
let appInitialized = false;

function initInvoiceApp() {
  if (appInitialized) return;
  appInitialized = true;
  generateQuotNo();
  setTodayDate();
  renderServiceRows();
  renderAddChargeRows();
  recalc();
}

/* ─── Generate unique quotation number ─── */
function generateQuotNo() {
  const prefix = "SS";
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  document.getElementById("quot-no").value = `${prefix}-${year}-${rand}`;
}

/* ─── Set today's date ─── */
function setTodayDate() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("inv-date").value = today;
}

/* ═══════════════════════════════════════════
   RENDER SERVICE TABLE ROWS
════════════════════════════════════════════ */
function renderServiceRows() {
  const tbody = document.getElementById("services-tbody");
  tbody.innerHTML = SERVICE_ROWS.map((row, i) => `
    <tr>
      <td class="td-sn">${i + 1}</td>
      <td class="td-desc">
        <div class="svc-desc-cell">
          <span class="svc-label">${row.label}</span>
          ${row.extra}
        </div>
      </td>
      <td class="td-amt">
        <input
          class="amt-input"
          id="amt-${row.id}"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          oninput="recalc()"
        />
      </td>
    </tr>
  `).join("");
}

/* ═══════════════════════════════════════════
   RENDER ADDITIONAL CHARGES ROWS
════════════════════════════════════════════ */
function renderAddChargeRows() {
  const tbody = document.getElementById("add-tbody");
  tbody.innerHTML = ADD_CHARGE_ROWS.map((row, i) => `
    <tr>
      <td class="td-sn" style="width:38px;">${i + 1}</td>
      <td class="td-desc">
        <div class="svc-desc-cell">
          <input type="checkbox" class="svc-check" id="chk-${row.id}" />
          <span class="svc-label">${row.label}</span>
          ${row.hasNote ? `<input class="svc-input" placeholder="..." style="width:60px"/>` : ""}
        </div>
      </td>
      <td class="td-amt">
        <input
          class="amt-input"
          id="add-${row.id}"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          oninput="recalc()"
        />
      </td>
    </tr>
  `).join("");
}

/* ═══════════════════════════════════════════
   RECALCULATE TOTALS
════════════════════════════════════════════ */
function recalc() {
  let subtotal = 0;

  // Sum service rows
  SERVICE_ROWS.forEach(row => {
    const el = document.getElementById(`amt-${row.id}`);
    if (el) subtotal += parseFloat(el.value) || 0;
  });

  // Sum additional charge rows
  ADD_CHARGE_ROWS.forEach(row => {
    const el = document.getElementById(`add-${row.id}`);
    if (el) subtotal += parseFloat(el.value) || 0;
  });

  const gstPct = parseFloat(document.getElementById("gst-pct").value) || 0;
  const gstAmt = subtotal * gstPct / 100;
  const grand = subtotal + gstAmt;
  const token = parseFloat(document.getElementById("token-advance").value) || 0;
  const balance = grand - token;

  document.getElementById("subtotal").textContent = `₹ ${fmt(subtotal)}`;
  document.getElementById("gst-amt").textContent = `₹ ${fmt(gstAmt)}`;
  document.getElementById("grand-total").textContent = `₹ ${fmt(grand)}`;
  document.getElementById("balance-due").textContent = `₹ ${fmt(balance)}`;
}

/** Format number to 2 decimal places with commas (Indian style) */
function fmt(n) {
  if (isNaN(n)) return "0.00";
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
}

/* ═══════════════════════════════════════════
   LOGO UPLOAD
════════════════════════════════════════════ */
function handleLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById("logo-img");
    const hint = document.getElementById("logo-hint");
    img.src = e.target.result;
    img.style.display = "block";
    hint.style.display = "none";
  };
  reader.readAsDataURL(file);
}

/* ═══════════════════════════════════════════
   LOCAL STORAGE – SAVE / LOAD
════════════════════════════════════════════ */

/** Gather all input values into a plain object */
function collectFormData() {
  const data = {};
  document.querySelectorAll("#invoice-content input, #invoice-content textarea")
    .forEach(el => {
      if (el.type === "file") return;
      const key = el.id || el.name;
      if (!key) return;
      data[key] = el.type === "checkbox" ? el.checked : el.value;
    });
  return data;
}

/** Restore form values from a plain object */
function applyFormData(data) {
  document.querySelectorAll("#invoice-content input, #invoice-content textarea")
    .forEach(el => {
      if (el.type === "file") return;
      const key = el.id || el.name;
      if (!key || !(key in data)) return;
      if (el.type === "checkbox") {
        el.checked = data[key];
      } else {
        el.value = data[key];
      }
    });
  recalc();
}

function saveLocal() {
  try {
    const data = collectFormData();
    localStorage.setItem("ss_invoice", JSON.stringify(data));
    showToast("Invoice saved to browser storage ✓");
  } catch (e) {
    showToast("⚠ Could not save: " + e.message);
  }
}

function loadSaved() {
  try {
    const raw = localStorage.getItem("ss_invoice");
    if (!raw) { showToast("No saved invoice found."); return; }
    const data = JSON.parse(raw);
    applyFormData(data);
    showToast("Invoice loaded ✓");
  } catch (e) {
    showToast("⚠ Could not load: " + e.message);
  }
}

function clearForm() {
  if (!confirm("Clear all fields and generate a new quotation number?")) return;
  document.querySelectorAll("#invoice-content input, #invoice-content textarea")
    .forEach(el => {
      if (el.type === "file" || el.readOnly) return;
      if (el.type === "checkbox") {
        el.checked = false;
      } else {
        el.value = "";
      }
    });
  generateQuotNo();
  setTodayDate();
  recalc();
  showToast("Form cleared.");
}

/* ═══════════════════════════════════════════
   PRINT
════════════════════════════════════════════ */
function printInvoice() {
  window.print();
}

/* ═══════════════════════════════════════════
   PDF DOWNLOAD  (html2pdf.js)
════════════════════════════════════════════ */
function downloadPDF() {
  const el = document.getElementById("invoice-content");
  const quotNo = document.getElementById("quot-no").value || "Invoice";

  const opt = {
    margin: [5, 5, 5, 5],   // mm
    filename: `SafeShifting_${quotNo}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] }
  };

  showToast("Generating PDF…");

  html2pdf()
    .set(opt)
    .from(el)
    .save()
    .then(() => showToast("PDF downloaded ✓"));
}

/* ═══════════════════════════════════════════
   TOAST NOTIFICATION
════════════════════════════════════════════ */
let toastTimer = null;

function showToast(msg) {
  // Remove existing toast if present
  const old = document.getElementById("inv-toast");
  if (old) old.remove();

  const toast = document.createElement("div");
  toast.id = "inv-toast";
  toast.textContent = msg;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    background: "#1a1a1a",
    color: "#f5c000",
    padding: "10px 20px",
    borderRadius: "6px",
    fontSize: "13px",
    fontFamily: "'Oswald', sans-serif",
    letterSpacing: ".5px",
    boxShadow: "0 4px 16px rgba(0,0,0,.4)",
    border: "1px solid #f5c000",
    zIndex: "9999",
    opacity: "0",
    transition: "opacity .3s ease"
  });
  document.body.appendChild(toast);

  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });

  // Fade out after 2.5 s
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 350);
  }, 2500);
}
