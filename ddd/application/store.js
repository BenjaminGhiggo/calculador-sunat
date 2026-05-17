// ════════════════════════════════════════════════════════════════════
// APPLICATION · Store — estado único de la app + persistencia
// Single source of truth. Quien quiera mutar debe pasar por una acción.
// ════════════════════════════════════════════════════════════════════

const STORAGE_KEY = "calc-sunat-2026";

const store = {
  items: [],           // [{id, codigo, producto, cantidad, …, cargosDescuentos:[]}]
  globales: [],        // [{id, codigo, modo, valor}]
  comprobante: comprobanteDefault(),
  correlativos: {},    // { "03-B001": 5, "01-F001": 12 }
  ui: {
    step: "comprobante",        // comprobante | productos | globales | resumen
    modoExperto: false,
    editingItemId: null,
  },
  undoStack: [],       // [{label, state, ts}]
};

// Buffer de cargos del ítem en edición (no commiteados al store.items hasta agregar/guardar)
let currentItemCargos = [];

// ── Snapshot inmutable para undo ────────────────────────────────────
function snapshot() {
  return {
    items:        JSON.parse(JSON.stringify(store.items)),
    globales:     JSON.parse(JSON.stringify(store.globales)),
    comprobante:  JSON.parse(JSON.stringify(store.comprobante)),
    correlativos: JSON.parse(JSON.stringify(store.correlativos)),
  };
}

// ── Persistencia en localStorage ────────────────────────────────────
function persistir() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: store.items,
      globales: store.globales,
      comprobante: store.comprobante,
      correlativos: store.correlativos,
      ui: { modoExperto: store.ui.modoExperto },
    }));
    if (typeof $ === "function" && $("persistInfo")) {
      $("persistInfo").textContent = `Auto-guardado · ${new Date().toLocaleTimeString("es-PE")}`;
    }
  } catch (e) {
    console.warn("No persiste:", e);
  }
}

function cargar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.items))    store.items    = data.items.map(migrarItem);
    if (Array.isArray(data.globales)) store.globales = data.globales;
    if (data.comprobante)             store.comprobante = { ...comprobanteDefault(), ...data.comprobante };
    if (data.correlativos && typeof data.correlativos === "object") store.correlativos = data.correlativos;
    if (data.ui)                      store.ui.modoExperto = !!data.ui.modoExperto;
  } catch (e) {
    console.warn("No carga:", e);
  }
}

// ── Próximo código de producto (depende del último item en store) ──
function siguienteCodigoProducto() {
  if (!store.items.length) return "001";
  return nextCodigo(store.items[store.items.length - 1].codigo);
}

// ── Próximo correlativo disponible para (tipo, serie) actual ────────
function siguienteCorrelativo(tipo, serie) {
  return (store.correlativos[keyCorrelativo(tipo, serie)] || 0) + 1;
}
