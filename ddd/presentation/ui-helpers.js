// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Helpers de DOM — primitivas reutilizables
// $, formatters, escapeHtml, populateSelect, toast, banner, modal, drawer, stepper.
// ════════════════════════════════════════════════════════════════════

const $ = id => document.getElementById(id);

// ── Format helpers ───────────────────────────────────────────────────
function simboloMoneda(m) { return { PEN: "S/", USD: "US$", EUR: "€" }[m] || m; }
function fmtMon(n)    { return `${simboloMoneda(store.comprobante.moneda)} ${(n || 0).toFixed(2)}`; }
function fmtMonNeg(n) { return n > 0 ? `-${fmtMon(n)}` : fmtMon(0); }

function escapeHtml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

// ── Selects ─────────────────────────────────────────────────────────
function populateSelect(id, entries, formatFn, getValue) {
  const sel = $(id);
  sel.innerHTML = entries.map((v, i) =>
    `<option value="${escapeHtml(getValue(v))}" ${i === 0 ? "selected" : ""}>${formatFn(v)}</option>`
  ).join("");
}

function populateSelectGrouped(id, groups, formatFn, getValue) {
  const sel = $(id);
  sel.innerHTML = Object.entries(groups).map(([label, entries]) =>
    `<optgroup label="${escapeHtml(label)}">${entries.map(v =>
      `<option value="${escapeHtml(getValue(v))}">${formatFn(v)}</option>`).join("")}</optgroup>`
  ).join("");
}

// ── Validation helpers (escriben/limpian estados visuales) ──────────
function setInvalid(inputId, errId, msg) {
  const inp = $(inputId), err = $(errId);
  if (!inp) return false;
  if (msg) {
    inp.classList.add("invalid");
    if (err) { err.textContent = msg; err.hidden = false; }
    return false;
  }
  inp.classList.remove("invalid");
  if (err) err.hidden = true;
  return true;
}

// ── Tooltips para summary headers ───────────────────────────────────
const TOOLTIPS = {
  "Total Gravadas":  "Operaciones gravadas (Cat.07 10-17) tras globales que afectan BI.",
  "Total Exoneradas":"Cat.07 código 20.",
  "Total Inafectas": "Cat.07 códigos 30-36.",
  "Total Export.":   "Cat.07 código 40.",
  "Desc.Global":     "Descuentos globales (Cat.53 nivel Global).",
  "Cargos Global":   "Cargos globales (Cat.53 nivel Global).",
  "Total IGV":       "IGV sobre base gravada ajustada por globales.",
  "ICBPER":          "Cat.05 7152, monto fijo por unidad.",
  "Percepción":      "Cat.53 51/52/53, sobre Base + IGV.",
  "Redondeo":        "PayableRoundingAmount (UBL).",
  "Importe Total":   "Total a pagar = subtotal ± globales + IGV + ICBPER + percepción + redondeo.",
};
function tip(key) {
  const t = TOOLTIPS[key] || "";
  return t ? `<span class="tip-i" data-tip="${escapeHtml(t)}">i</span>` : "";
}

// ── Toasts (notificación efímera) ───────────────────────────────────
let _toastSeq = 0;
function toast(msg, type = "info", timeout = 3500) {
  const id = `t${++_toastSeq}`;
  const el = document.createElement("div");
  el.id = id; el.className = `toast ${type}`;
  el.innerHTML = `<span>${msg}</span>`;
  $("toastContainer").appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 200);
  }, timeout);
}

// ── Banners (persistente con acciones) ──────────────────────────────
const _banners = new Map();
function banner(key, msg, type = "info", actions = []) {
  closeBanner(key);
  const el = document.createElement("div");
  el.className = `banner ${type}`; el.dataset.key = key;
  let html = `<span class="b-msg">${msg}</span>`;
  if (actions.length) {
    html += `<span class="b-actions">${actions.map((a, i) =>
      `<button class="btn ${a.style || 'secondary'} small" data-act="${i}">${a.label}</button>`).join("")}</span>`;
  }
  html += `<button class="b-close" aria-label="Cerrar">×</button>`;
  el.innerHTML = html;
  el.querySelector(".b-close").onclick = () => closeBanner(key);
  el.querySelectorAll("[data-act]").forEach(b => {
    b.onclick = () => actions[parseInt(b.dataset.act, 10)].onClick && actions[parseInt(b.dataset.act, 10)].onClick();
  });
  $("bannerContainer").appendChild(el);
  _banners.set(key, el);
}
function closeBanner(key) {
  const el = _banners.get(key);
  if (el) { el.remove(); _banners.delete(key); }
}

// ── Modal (confirmaciones) ──────────────────────────────────────────
function modal({ title, body, confirmLabel = "Aceptar", cancelLabel = "Cancelar", danger = false, onConfirm }) {
  $("modalTitle").textContent = title;
  $("modalContent").innerHTML = body;
  $("modalActions").innerHTML = `
    ${cancelLabel ? `<button class="btn ghost" data-modal-cancel>${cancelLabel}</button>` : ""}
    <button class="btn primary" data-modal-ok style="${danger ? 'background:var(--c-danger);border-color:var(--c-danger);' : ''}">${confirmLabel}</button>
  `;
  $("modalOverlay").hidden = false;
  const cancelBtn = $("modalOverlay").querySelector("[data-modal-cancel]");
  if (cancelBtn) cancelBtn.onclick = closeModal;
  $("modalOverlay").querySelector("[data-modal-ok]").onclick = () => { closeModal(); onConfirm && onConfirm(); };
}
function closeModal() { $("modalOverlay").hidden = true; }

// ── Drawer (justificación normativa) ────────────────────────────────
function openDrawer() {
  const d = $("drawerNormativa");
  d.hidden = false;
  requestAnimationFrame(() => d.classList.add("open"));
  d.setAttribute("aria-hidden", "false");
}
function closeDrawer() {
  const d = $("drawerNormativa");
  d.classList.remove("open");
  d.setAttribute("aria-hidden", "true");
  setTimeout(() => { d.hidden = true; }, 250);
}

// ── Stepper / navegación de pasos ───────────────────────────────────
function goStep(step) {
  if (!["comprobante","productos","globales","resumen"].includes(step)) return;
  store.ui.step = step;
  document.documentElement.dataset.step = step;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
