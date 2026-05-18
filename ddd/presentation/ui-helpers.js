// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Helpers de DOM — primitivas reutilizables
// $, formatters, escapeHtml, populateSelect, toast, banner, modal, drawer, stepper.
// ════════════════════════════════════════════════════════════════════

const $ = id => document.getElementById(id);

// ── Format helpers (usan CAT02 del dominio como fuente única) ───────
function simboloMoneda(m) {
  return (CAT02 && CAT02[m] && CAT02[m].sim) || m;
}
function nombreMoneda(m) {
  return (CAT02 && CAT02[m] && CAT02[m].nombre) || m;
}
function nombreLargoMoneda(m) {
  return (CAT02 && CAT02[m] && CAT02[m].largo) || m;
}
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

// ── Tooltips para summary headers (con base normativa) ─────────────
const TOOLTIPS = {
  "Total Gravadas":   "Suma de bases imponibles de ítems con afectación Cat.07 códigos 10-17, ajustada por descuentos/cargos globales que afectan BI. TUO Ley IGV Art. 14 (D.S. 055-99-EF).",
  "Total Exoneradas": "Suma de operaciones exoneradas (Cat.07 código 20). Apéndice I del TUO Ley IGV. No paga IGV pero se declara.",
  "Total Inafectas":  "Operaciones inafectas (Cat.07 códigos 30-37). Apéndice II del TUO Ley IGV. No están en el ámbito del impuesto.",
  "Total Export.":    "Operaciones de exportación (Cat.07 código 40). TUO Ley IGV Art. 33. Tasa 0% de IGV — saldo a favor del exportador.",
  "Desc.Global":      "Descuentos globales (Cat.53 nivel Global, códigos 02/03/04/05/06). Anexo 8 R.S. 244-2019/SUNAT. Se registran en cac:AllowanceCharge raíz del documento.",
  "Cargos Global":    "Cargos globales (Cat.53 nivel Global, códigos 45/46/49/50). FISE (Ley 29852), recargo al consumo (D.L. 25988), cargos sobre BI.",
  "Total IGV":        "IGV calculado sobre base gravada ajustada × tasa. Tasa = 18% general (D.S. 055-99-EF Art. 17) o 10.5% MYPE turismo (Ley 32219 + 32387).",
  "ICBPER":           "Impuesto al Consumo de Bolsas Plásticas (Cat.05 código 7152). Ley 30884: monto fijo S/0.50 por bolsa desde 2023. Se registra como tributo OTH.",
  "Percepción":       "Régimen de percepciones (Cat.53 códigos 51/52/53). Ley 29173: 2% venta interna / 1% combustible / 0.5% tasa especial. Base: Precio de Venta (Base + IGV).",
  "Redondeo":         "Diferencia opcional aplicada al PayableAmount para ajustar al céntimo. UBL: cbc:PayableRoundingAmount. R.S. 025-2000/SUNAT (redondeo a 2 decimales).",
  "Importe Total":    "Total a pagar = Subtotal ± Globales + IGV + ICBPER + Percepción + Redondeo. UBL: cbc:PayableAmount. Anexo I R.S. 117-2017/SUNAT.",
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
