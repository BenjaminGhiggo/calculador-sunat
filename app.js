// ════════════════════════════════════════════════════════════════════
// 1) CATÁLOGOS SUNAT (fallback — sobreescritos por data.json)
// ════════════════════════════════════════════════════════════════════
let CAT03 = { "NIU":"Unidad (bienes)","ZZ":"Servicio","KGM":"Kilogramo","GRM":"Gramo","LBR":"Libra","MTR":"Metro","MMT":"Milímetro","LTR":"Litro","MLT":"Mililitro","MTQ":"Metro cúbico","DZN":"Docena","HUR":"Hora","DAY":"Día","MON":"Mes","KWH":"Kilowatt hora","TNE":"Tonelada métrica","FOT":"Pie","INH":"Pulgada","M2":"Metro cuadrado","M3":"Metro cúbico" };
let CAT07 = { "10":"Gravado - Operación onerosa","11":"Gravado - Retiro por premio","12":"Gravado - Retiro por donación","13":"Gravado - Retiro","14":"Gravado - Retiro por publicidad","15":"Gravado - Bonificaciones","16":"Gravado - Retiro entrega a trabajadores","17":"Gravado - IVAP","20":"Exonerado","30":"Inafecto - Operación no onerosa","31":"Inafecto - Retiro por mudanza","32":"Inafecto - Muestra médica","33":"Inafecto - Retiro por sorteo","34":"Inafecto - Retiro entrega a trabajadores","35":"Inafecto - Retiro por grado","36":"Inafecto - IVAP","40":"Exportación" };
let CAT05 = {
  "1000":{n:"IGV - Impuesto General a las Ventas",a:"IGV",t:0.18,modo:"pct"},
  "1016":{n:"IVAP - Impuesto Venta Arroz Pilado",a:"IVAP",t:0.04,modo:"pct"},
  "2000":{n:"ISC - Impuesto Selectivo al Consumo",a:"ISC",t:null,modo:"pct"},
  "3000":{n:"IR - Impuesto a la Renta",a:"IR",t:null,modo:"pct"},
  "7152":{n:"ICBPER - Bolsas Plásticas",a:"ICBPER",t:null,modo:"unit"},
  "9995":{n:"Exportación",a:"EXP",t:0,modo:"pct"},
  "9996":{n:"Gratuito",a:"GRA",t:0,modo:"pct"},
  "9997":{n:"Exonerado",a:"EXO",t:0,modo:"pct"},
  "9998":{n:"Inafecto",a:"INA",t:0,modo:"pct"},
  "9999":{n:"Otros tributos",a:"OTROS",t:null,modo:"pct"},
};
let CAT53 = [
  {c:"00",d:"Descuentos que afectan BI IGV/IVAP",l:"Ítem",t:"desc",ab:true,f:null,base:"base"},
  {c:"01",d:"Descuentos que NO afectan BI IGV/IVAP",l:"Ítem",t:"desc",ab:false,f:null,base:"base"},
  {c:"02",d:"Descuentos globales que afectan BI IGV/IVAP",l:"Global",t:"desc",ab:true,f:null,base:"base"},
  {c:"03",d:"Descuentos globales que NO afectan BI IGV/IVAP",l:"Global",t:"desc",ab:false,f:null,base:"base"},
  {c:"04",d:"Descuentos globales x anticipos gravados afectan BI",l:"Global",t:"desc",ab:true,f:null,base:"base"},
  {c:"05",d:"Descuentos globales x anticipos exonerados",l:"Global",t:"desc",ab:false,f:null,base:"base"},
  {c:"06",d:"Descuentos globales x anticipos inafectos",l:"Global",t:"desc",ab:false,f:null,base:"base"},
  {c:"07",d:"Factor compensación - DU 010-2004",l:"Ítem",t:"desc",ab:true,f:null,base:"base"},
  {c:"45",d:"FISE",l:"Global",t:"cargo",ab:false,f:null,base:"base+igv"},
  {c:"46",d:"Recargo al consumo y/o propinas",l:"Global",t:"cargo",ab:false,f:null,base:"base+igv"},
  {c:"47",d:"Cargos que afectan BI IGV/IVAP",l:"Ítem",t:"cargo",ab:true,f:null,base:"base"},
  {c:"48",d:"Cargos que NO afectan BI IGV/IVAP",l:"Ítem",t:"cargo",ab:false,f:null,base:"base"},
  {c:"49",d:"Cargos globales que afectan BI IGV/IVAP",l:"Global",t:"cargo",ab:true,f:null,base:"base"},
  {c:"50",d:"Cargos globales que NO afectan BI IGV/IVAP",l:"Global",t:"cargo",ab:false,f:null,base:"base"},
  {c:"51",d:"Percepción venta interna",l:"Global",t:"cargo",ab:false,f:0.02,base:"base+igv"},
  {c:"52",d:"Percepción adquisición combustible",l:"Global",t:"cargo",ab:false,f:0.01,base:"base+igv"},
  {c:"53",d:"Percepción agente percepción tasa especial",l:"Global",t:"cargo",ab:false,f:0.005,base:"base+igv"},
  {c:"54",d:"Factor aportación - DU 010-2004",l:"Ítem",t:"cargo",ab:true,f:null,base:"base"},
  {c:"61",d:"Retención de renta por anticipos",l:"Global",t:"desc",ab:false,f:null,base:"base"},
];
let PRODUCTOS = [
  "Laptop HP Pavilion 15","Smartphone Samsung Galaxy S24","Teclado mecánico Logitech",
  'Monitor Dell 27" 4K',"Mouse inalámbrico MX Master 3","Audífonos Sony WH-1000XM5",
  "Impresora HP LaserJet","Escritorio ergonómico","Silla de oficina ejecutiva",
  "Útiles de escritorio (kit)","Servicio de consultoría TI","Servicio de desarrollo web",
  "Otro (personalizado)",
];
let DEFAULTS_COMPROBANTE = null;
let DATA_JSON_META = null;

async function cargarDataJson() {
  // file:// bloquea fetch por CORS — saltar silenciosamente y usar fallback
  if (typeof location !== "undefined" && location.protocol === "file:") {
    return { ok: false, fileProtocol: true };
  }
  try {
    const res = await fetch("data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const d = await res.json();
    if (d.cat03) CAT03 = d.cat03;
    if (d.cat07) CAT07 = d.cat07;
    if (d.cat05) CAT05 = d.cat05;
    if (Array.isArray(d.cat53)) CAT53 = d.cat53;
    if (Array.isArray(d.productos)) PRODUCTOS = d.productos;
    if (d.comprobanteDefault) DEFAULTS_COMPROBANTE = d.comprobanteDefault;
    if (d._meta) DATA_JSON_META = d._meta;
    return { ok: true };
  } catch (e) {
    return { ok: false, err: e.message };
  }
}

function getCat53(c)       { return CAT53.find(e => e.c === c); }
function getCat53Items()   { return CAT53.filter(e => e.l === "Ítem"); }
function getCat53Globals() { return CAT53.filter(e => e.l === "Global"); }
function getCat07Grupo(c)  {
  if (!c) return "otro";
  if (c.startsWith("1")) return "gravada";
  if (c.startsWith("2")) return "exonerada";
  if (c.startsWith("3")) return "inafecta";
  if (c.startsWith("4")) return "exportacion";
  return "otro";
}
function esIgvAplicable(afecKey) { return (afecKey || "").startsWith("1"); }
function tributoSugerido(afecKey) {
  const grupo = getCat07Grupo(afecKey);
  if (afecKey === "17" || afecKey === "36") return "1016";
  if (grupo === "gravada")     return "1000";
  if (grupo === "exonerada")   return "9997";
  if (grupo === "inafecta")    return "9998";
  if (grupo === "exportacion") return "9995";
  return "1000";
}
function combinacionValida(afecKey, tribKey) {
  return tributoSugerido(afecKey) === tribKey || tribKey === "9999";
}

// ════════════════════════════════════════════════════════════════════
// 2) CÁLCULO PURO (sin DOM)
// ════════════════════════════════════════════════════════════════════
function round(n, d) { return Math.round(n * Math.pow(10, d)) / Math.pow(10, d); }

function calcItem(item, ctx) {
  const trib = CAT05[item.tributo] || CAT05["1000"];
  const cargos = Array.isArray(item.cargosDescuentos) ? item.cargosDescuentos : [];
  const afecKey = item.afectacion;
  const grupo = getCat07Grupo(afecKey);
  const igvAplica = esIgvAplicable(afecKey);

  // Tasa efectiva
  let tasa = trib.t;
  if (item.tributo === "1000" && ctx && ctx.tasaIgvOverride != null) tasa = ctx.tasaIgvOverride;
  if (tasa === null && trib.modo === "pct" && igvAplica) tasa = (item.tasaInput || 0) / 100;
  else if (!igvAplica && trib.modo === "pct")            tasa = 0;
  else if (trib.modo === "unit")                          tasa = 0;

  const totalValorRaw = (item.cantidad || 0) * (item.precioUnit || 0);
  let baseImpRaw, igvBaseRaw;
  if (igvAplica && item.tipoPrecio === "incluido") {
    baseImpRaw = tasa > 0 ? totalValorRaw / (1 + tasa) : totalValorRaw;
    igvBaseRaw = baseImpRaw * tasa;
  } else {
    baseImpRaw = totalValorRaw;
    igvBaseRaw = igvAplica ? baseImpRaw * tasa : 0;
  }

  // Iterar cada cargo/descuento del ítem (solo nivel "Ítem")
  let descTotal = 0, cargoTotal = 0, biFinalRaw = baseImpRaw;
  const cargosResultado = [];
  for (const cd of cargos) {
    const cat53 = getCat53(cd.codigo);
    if (!cat53 || cat53.l !== "Ítem") continue;
    const valOp = cd.valor || 0;
    if (valOp <= 0 && cat53.f === null) continue;

    const baseRef = cat53.ab ? biFinalRaw : baseImpRaw;
    let factor = null, montoRaw;
    if (cat53.f !== null) {
      factor = cat53.f;
      montoRaw = factor * baseRef;
    } else if (cd.modo === "porcentaje") {
      factor = valOp / 100;
      montoRaw = factor * baseRef;
    } else {
      factor = baseRef > 0 ? valOp / baseRef : null;
      montoRaw = valOp;
    }
    const monto = round(montoRaw, 2);
    if (cat53.t === "desc") descTotal += monto; else cargoTotal += monto;
    if (cat53.ab) {
      biFinalRaw = cat53.t === "desc" ? biFinalRaw - monto : biFinalRaw + monto;
    }
    cargosResultado.push({ cat53, factor, monto, afectaBI: cat53.ab });
  }

  const igvFinalRaw = igvAplica ? biFinalRaw * tasa : 0;

  let icbper = 0;
  if (trib.modo === "unit") {
    icbper = round((item.cantidad || 0) * (item.tasaInput || 0), 2);
  }

  let totalRaw;
  if (cargosResultado.length === 0) {
    totalRaw = baseImpRaw + igvBaseRaw;
  } else {
    const sumNoAfectaBI = cargosResultado
      .filter(r => !r.afectaBI)
      .reduce((s, r) => s + (r.cat53.t === "desc" ? -r.monto : r.monto), 0);
    totalRaw = biFinalRaw + igvFinalRaw + sumNoAfectaBI;
  }
  totalRaw += icbper;

  const valorUnitarioRaw = (igvAplica && item.tipoPrecio === "incluido" && tasa > 0)
    ? item.precioUnit / (1 + tasa)
    : item.precioUnit;

  return {
    item, trib, grupo, igvAplica, tasa,
    cargosResultado,
    valorUnitarioRaw, valorUnitario: round(valorUnitarioRaw, 2),
    precioVentaUnitario: round(valorUnitarioRaw * (1 + tasa), 2),
    baseImpRaw, baseImp: round(baseImpRaw, 2),
    biFinalRaw, biFinal: round(biFinalRaw, 2),
    igvRaw: igvFinalRaw, igv: round(igvFinalRaw, 2),
    descItem: descTotal, cargoItem: cargoTotal, icbper,
    totalRaw, total: round(totalRaw, 2),
  };
}

function calcGlobales(globales, bases) {
  let descGlobalAfectaBI = 0, descGlobalNoAfectaBI = 0;
  let cargoGlobalAfectaBI = 0, cargoGlobalNoAfectaBI = 0;
  let percepcion = 0;
  const detalle = [];
  for (const g of (globales || [])) {
    const c = getCat53(g.codigo);
    if (!c || c.l !== "Global") continue;
    const baseRef = c.base === "base+igv" ? bases.gravadas + bases.igvGravadas : bases.gravadas;
    let montoRaw;
    if (c.f !== null) montoRaw = c.f * baseRef;
    else if (g.modo === "porcentaje") montoRaw = (g.valor / 100) * baseRef;
    else montoRaw = g.valor;
    const monto = round(montoRaw, 2);
    detalle.push({ codigo: c.c, descripcion: c.d, monto, baseRef: round(baseRef, 2) });
    if (["51","52","53"].includes(c.c)) { percepcion += monto; continue; }
    if (c.t === "desc") {
      if (c.ab) descGlobalAfectaBI    += monto; else descGlobalNoAfectaBI  += monto;
    } else {
      if (c.ab) cargoGlobalAfectaBI   += monto; else cargoGlobalNoAfectaBI += monto;
    }
  }
  return { descGlobalAfectaBI, descGlobalNoAfectaBI, cargoGlobalAfectaBI, cargoGlobalNoAfectaBI, percepcion, detalle };
}

function calcComprobante(comp) {
  const regimen = (comp.regimenIgv != null) ? comp.regimenIgv
                : (store.comprobante && store.comprobante.regimenIgv) || 18;
  const ctx = { tasaIgvOverride: regimen / 100 };
  const itemsRes = comp.items.map(it => calcItem(it, ctx));

  let totalGravadas=0, totalExoneradas=0, totalInafectas=0, totalExportacion=0;
  let igvGravadas=0, totalIcbper=0, sumTotalesItem=0;
  for (const r of itemsRes) {
    if      (r.grupo === "gravada")     { totalGravadas    += r.biFinal; igvGravadas += r.igv; }
    else if (r.grupo === "exonerada")     totalExoneradas  += r.biFinal;
    else if (r.grupo === "inafecta")      totalInafectas   += r.biFinal;
    else if (r.grupo === "exportacion")   totalExportacion += r.biFinal;
    totalIcbper    += r.icbper;
    sumTotalesItem += r.total;
  }

  const PERCEP = new Set(["51","52","53"]);
  const globalesNoPercep = (comp.globales || []).filter(g => !PERCEP.has(g.codigo));
  const globalesPercep   = (comp.globales || []).filter(g =>  PERCEP.has(g.codigo));

  const glob1 = calcGlobales(globalesNoPercep, {
    gravadas: totalGravadas, igvGravadas,
    exoneradas: totalExoneradas, inafectas: totalInafectas, exportacion: totalExportacion,
  });

  const baseGravadaAjustada = totalGravadas - glob1.descGlobalAfectaBI + glob1.cargoGlobalAfectaBI;
  const tasaIgvEfectiva = totalGravadas > 0 ? igvGravadas / totalGravadas : 0.18;
  const igvFinal = round(baseGravadaAjustada * tasaIgvEfectiva, 2);

  const glob2 = calcGlobales(globalesPercep, {
    gravadas: baseGravadaAjustada, igvGravadas: igvFinal,
    exoneradas: totalExoneradas, inafectas: totalInafectas, exportacion: totalExportacion,
  });

  const glob = {
    descGlobalAfectaBI: glob1.descGlobalAfectaBI, descGlobalNoAfectaBI: glob1.descGlobalNoAfectaBI,
    cargoGlobalAfectaBI: glob1.cargoGlobalAfectaBI, cargoGlobalNoAfectaBI: glob1.cargoGlobalNoAfectaBI,
    percepcion: glob2.percepcion,
    detalle: [...glob1.detalle, ...glob2.detalle],
  };

  const subtotal = baseGravadaAjustada + totalExoneradas + totalInafectas + totalExportacion;
  const totalAntesPercepcion = subtotal + igvFinal + totalIcbper
    - glob.descGlobalNoAfectaBI + glob.cargoGlobalNoAfectaBI;
  const importeTotal = round(totalAntesPercepcion + glob.percepcion, 2);

  return {
    itemsRes,
    totalGravadas: round(totalGravadas, 2),
    totalExoneradas: round(totalExoneradas, 2),
    totalInafectas: round(totalInafectas, 2),
    totalExportacion: round(totalExportacion, 2),
    baseGravadaAjustada: round(baseGravadaAjustada, 2),
    igvFinal, totalIcbper: round(totalIcbper, 2),
    descGlobalAfectaBI: round(glob.descGlobalAfectaBI, 2),
    descGlobalNoAfectaBI: round(glob.descGlobalNoAfectaBI, 2),
    cargoGlobalAfectaBI: round(glob.cargoGlobalAfectaBI, 2),
    cargoGlobalNoAfectaBI: round(glob.cargoGlobalNoAfectaBI, 2),
    percepcion: round(glob.percepcion, 2),
    detalleGlobales: glob.detalle,
    sumTotalesItem: round(sumTotalesItem, 2),
    redondeo: 0,
    importeTotal,
  };
}

// ════════════════════════════════════════════════════════════════════
// 3) ESTADO + PERSISTENCIA
// ════════════════════════════════════════════════════════════════════
const STORAGE_KEY = "calc-sunat-2026";
const $ = id => document.getElementById(id);

function comprobanteDefault() {
  const base = {
    tipo: "03", serie: "B001", correlativo: 1, moneda: "PEN",
    fechaEmision: new Date().toISOString().slice(0, 10),
    tipoOperacion: "0101", regimenIgv: 18,
    emisor:   { ruc: "20123456789", razon: "MI EMPRESA S.A.C.", direccion: "Av. Principal 123, Lima" },
    receptor: { tipoDoc: "1", doc: "00000000", razon: "CLIENTE VARIOS", direccion: "-" },
  };
  if (!DEFAULTS_COMPROBANTE) return base;
  return {
    ...base, ...DEFAULTS_COMPROBANTE,
    fechaEmision: DEFAULTS_COMPROBANTE.fechaEmision || base.fechaEmision,
    emisor:   { ...base.emisor,   ...(DEFAULTS_COMPROBANTE.emisor   || {}) },
    receptor: { ...base.receptor, ...(DEFAULTS_COMPROBANTE.receptor || {}) },
  };
}

const store = {
  items: [], globales: [], comprobante: comprobanteDefault(),
  correlativos: {},
  ui: { step: "comprobante", modoExperto: false, editingItemId: null },
  undoStack: [],
};

// Cargos del ítem que se está armando (no commiteados aún)
let currentItemCargos = [];

function migrarItem(item) {
  if (Array.isArray(item.cargosDescuentos)) return item;
  const cd = [];
  if (item.codigo53Item) {
    const c = getCat53(item.codigo53Item);
    if (c && (item.valorOp > 0 || c.f !== null)) {
      cd.push({ codigo: item.codigo53Item, modo: item.modoOp || "porcentaje", valor: item.valorOp || 0 });
    }
  }
  return { ...item, cargosDescuentos: cd };
}

function simboloMoneda(m) { return { PEN: "S/", USD: "US$", EUR: "€" }[m] || m; }
function fmtMon(n) { return `${simboloMoneda(store.comprobante.moneda)} ${(n || 0).toFixed(2)}`; }
function fmtMonNeg(n) { return n > 0 ? `-${fmtMon(n)}` : fmtMon(0); }

function persistir() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: store.items, globales: store.globales,
      comprobante: store.comprobante, correlativos: store.correlativos,
      ui: { modoExperto: store.ui.modoExperto },
    }));
    if ($("persistInfo")) {
      $("persistInfo").textContent = `Auto-guardado · ${new Date().toLocaleTimeString("es-PE")}`;
    }
  } catch (e) { console.warn("No persiste:", e); }
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
  } catch (e) { console.warn("No carga:", e); }
}

// ════════════════════════════════════════════════════════════════════
// 4) UNDO
// ════════════════════════════════════════════════════════════════════
function snapshot() {
  return {
    items: JSON.parse(JSON.stringify(store.items)),
    globales: JSON.parse(JSON.stringify(store.globales)),
    comprobante: JSON.parse(JSON.stringify(store.comprobante)),
    correlativos: JSON.parse(JSON.stringify(store.correlativos)),
  };
}
function pushUndo(label) {
  store.undoStack.push({ label, state: snapshot(), ts: Date.now() });
  if (store.undoStack.length > 20) store.undoStack.shift();
  updateUndoBtn();
}
function undo() {
  const last = store.undoStack.pop();
  if (!last) return;
  store.items       = last.state.items;
  store.globales    = last.state.globales;
  store.comprobante = last.state.comprobante;
  store.correlativos= last.state.correlativos;
  escribirComprobanteForm();
  renderAll();
  persistir();
  toast(`Deshecho: ${last.label}`, "info");
}
function updateUndoBtn() {
  const btn = $("btnUndo");
  if (!btn) return;
  btn.disabled = store.undoStack.length === 0;
  const last = store.undoStack[store.undoStack.length - 1];
  btn.title = last ? `Deshacer "${last.label}" (Ctrl+Z)` : "Nada para deshacer";
}

// ════════════════════════════════════════════════════════════════════
// 5) AUTONUMERACIÓN
// ════════════════════════════════════════════════════════════════════
function nextCodigo(code) {
  if (!code || code === "-") return "001";
  const m = String(code).match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return code + "-1";
  const [, prefix, num, suffix] = m;
  const next = String(parseInt(num, 10) + 1).padStart(num.length, "0");
  return prefix + next + suffix;
}
function siguienteCodigoProducto() {
  if (!store.items.length) return "001";
  return nextCodigo(store.items[store.items.length - 1].codigo);
}
function keyCorrelativo(tipo, serie) { return `${tipo}-${serie}`; }
function siguienteCorrelativo(tipo, serie) {
  return (store.correlativos[keyCorrelativo(tipo, serie)] || 0) + 1;
}
function consumirCorrelativoActual() {
  const c = store.comprobante;
  const k = keyCorrelativo(c.tipo, c.serie);
  store.correlativos[k] = Math.max(store.correlativos[k] || 0, c.correlativo);
  c.correlativo = store.correlativos[k] + 1;
  if ($("correlativo")) $("correlativo").value = c.correlativo;
  persistir();
  renderAll();
}

// ════════════════════════════════════════════════════════════════════
// 6) UI HELPERS — toast / banner / modal / drawer / step nav
// ════════════════════════════════════════════════════════════════════
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

function modal({ title, body, confirmLabel = "Aceptar", cancelLabel = "Cancelar", danger = false, onConfirm }) {
  $("modalTitle").textContent = title;
  $("modalContent").innerHTML = body;
  $("modalActions").innerHTML = `
    <button class="btn ghost" data-modal-cancel>${cancelLabel}</button>
    <button class="btn ${danger ? 'primary' : 'primary'}" data-modal-ok style="${danger ? 'background:var(--c-danger);border-color:var(--c-danger);' : ''}">${confirmLabel}</button>
  `;
  $("modalOverlay").hidden = false;
  $("modalOverlay").querySelector("[data-modal-cancel]").onclick = closeModal;
  $("modalOverlay").querySelector("[data-modal-ok]").onclick = () => { closeModal(); onConfirm && onConfirm(); };
}
function closeModal() { $("modalOverlay").hidden = true; }

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

function goStep(step) {
  if (!["comprobante","productos","globales","resumen"].includes(step)) return;
  store.ui.step = step;
  document.documentElement.dataset.step = step;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ════════════════════════════════════════════════════════════════════
// 7) VALIDACIONES
// ════════════════════════════════════════════════════════════════════
function validRuc(s) { return /^(10|15|17|20)\d{9}$/.test(s); }
function validDni(s) { return /^\d{8}$/.test(s); }
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
function validarEmisor() {
  return setInvalid("emisorRuc", "emisorRucErr",
    validRuc($("emisorRuc").value.trim()) ? "" : "RUC debe tener 11 dígitos y empezar con 10/15/17/20.");
}
function validarReceptor() {
  const tipo = $("receptorTipoDoc").value, doc = $("receptorDoc").value.trim();
  if (tipo === "0") return setInvalid("receptorDoc", "receptorDocErr", "");
  if (tipo === "1") return setInvalid("receptorDoc", "receptorDocErr", validDni(doc) ? "" : "DNI debe tener 8 dígitos numéricos.");
  if (tipo === "6") return setInvalid("receptorDoc", "receptorDocErr", validRuc(doc) ? "" : "RUC del receptor: 11 dígitos.");
  return setInvalid("receptorDoc", "receptorDocErr", doc ? "" : "Ingresa el número de documento.");
}
function validarSerie() {
  const tipo = $("tipoComprobante").value;
  const serie = $("serie").value.toUpperCase().trim();
  const patron = (tipo === "01" || tipo === "08") ? /^F\d{3}$/
              :  (tipo === "03") ? /^B\d{3}$/
              :  (tipo === "07") ? /^(F|B)\d{3}$/
              :  /^[A-Z0-9]{4}$/;
  return setInvalid("serie", "serieErr", patron.test(serie) ? "" :
    `Serie esperada: ${patron.toString().includes('F') && patron.toString().includes('B') ? 'F### o B###' : tipo === '03' ? 'B###' : 'F###'} (ej. ${tipo === '03' ? 'B001' : 'F001'}).`);
}
function validarFecha() {
  const v = $("fechaEmision").value;
  if (!v) return setInvalid("fechaEmision", "fechaErr", "Fecha requerida.");
  const f = new Date(v + "T00:00:00");
  const hoy = new Date(); hoy.setHours(23,59,59,999);
  return setInvalid("fechaEmision", "fechaErr", f > hoy ? "La fecha no puede ser futura." : "");
}
function validarCantidad() {
  const v = parseFloat($("cantidad").value) || 0;
  return setInvalid("cantidad", "cantidadErr", v > 0 ? "" : "Cantidad debe ser > 0.");
}
function validarPrecio() {
  const v = parseFloat($("precioUnit").value) || 0;
  return setInvalid("precioUnit", "precioErr", v >= 0 ? "" : "Precio no puede ser negativo.");
}

// ════════════════════════════════════════════════════════════════════
// 8) FORMS
// ════════════════════════════════════════════════════════════════════
function leerItemForm() {
  const prodSel = $("producto").value;
  const prodCustom = $("productoCustom").value;
  return {
    codigo:        $("codigoProducto").value || "-",
    producto:      prodSel === "Otro (personalizado)" && prodCustom ? prodCustom : prodSel,
    cantidad:      parseFloat($("cantidad").value)   || 0,
    unidad:        $("unidad").value,
    afectacion:    $("afectacion").value,
    precioUnit:    parseFloat($("precioUnit").value) || 0,
    tipoPrecio:    $("tipoPrecio").value,
    tributo:       $("tributo").value,
    tasaInput:     parseFloat($("tasaInput").value)  || 0,
    cargosDescuentos: [...currentItemCargos],
  };
}
function escribirItemForm(item) {
  $("codigoProducto").value = item.codigo || "";
  if (item.producto && PRODUCTOS.includes(item.producto)) {
    $("producto").value = item.producto;
    $("productoCustom").value = "";
    $("productoCustomField").hidden = true;
  } else {
    $("producto").value = "Otro (personalizado)";
    $("productoCustom").value = item.producto || "";
    $("productoCustomField").hidden = false;
  }
  $("cantidad").value   = item.cantidad;
  $("unidad").value     = item.unidad;
  $("afectacion").value = item.afectacion;
  $("precioUnit").value = item.precioUnit;
  $("tipoPrecio").value = item.tipoPrecio;
  $("tributo").value    = item.tributo;
  $("tasaInput").value  = item.tasaInput || 0;
  currentItemCargos = (item.cargosDescuentos || []).map(c => ({ ...c }));
}

function leerGlobalForm() {
  return {
    codigo: $("codigo53Global").value,
    modo:   $("modoOpGlobal").value,
    valor:  parseFloat($("valorOpGlobal").value) || 0,
  };
}
function leerComprobanteForm() {
  return {
    tipo:          $("tipoComprobante").value,
    serie:         $("serie").value.toUpperCase().trim(),
    correlativo:   parseInt($("correlativo").value, 10) || 1,
    moneda:        $("moneda").value,
    fechaEmision:  $("fechaEmision").value || new Date().toISOString().slice(0, 10),
    tipoOperacion: ($("tipoOperacion") && $("tipoOperacion").value) || "0101",
    regimenIgv:    parseFloat(($("regimenIgv") && $("regimenIgv").value) || "18"),
    emisor: {
      ruc:       $("emisorRuc").value.trim(),
      razon:     $("emisorRazon").value,
      direccion: $("emisorDireccion").value,
    },
    receptor: {
      tipoDoc:   $("receptorTipoDoc").value,
      doc:       $("receptorDoc").value.trim(),
      razon:     $("receptorRazon").value,
      direccion: $("receptorDireccion").value,
    },
  };
}
function escribirComprobanteForm() {
  const c = store.comprobante;
  $("tipoComprobante").value = c.tipo;
  $("serie").value = c.serie;
  $("correlativo").value = c.correlativo;
  $("moneda").value = c.moneda;
  $("fechaEmision").value = c.fechaEmision;
  if ($("tipoOperacion")) $("tipoOperacion").value = c.tipoOperacion || "0101";
  if ($("regimenIgv"))    $("regimenIgv").value    = String(c.regimenIgv || 18);
  $("emisorRuc").value = c.emisor.ruc;
  $("emisorRazon").value = c.emisor.razon;
  $("emisorDireccion").value = c.emisor.direccion;
  $("receptorTipoDoc").value = c.receptor.tipoDoc;
  $("receptorDoc").value = c.receptor.doc;
  $("receptorRazon").value = c.receptor.razon;
  $("receptorDireccion").value = c.receptor.direccion;
}

// ════════════════════════════════════════════════════════════════════
// 9) RENDERS
// ════════════════════════════════════════════════════════════════════
function renderAvisoReceptor() {
  const el = $("avisoReceptor");
  if (!el) return;
  const tipo = $("tipoComprobante").value;
  const tipoDoc = $("receptorTipoDoc").value;
  const inconsistente = (tipo === "01" && tipoDoc !== "6")
                     || (tipo === "03" && tipoDoc === "6");
  if (inconsistente) {
    el.hidden = false;
    el.innerHTML = `⚠️ <span><b>${tipo === "01" ? "Factura" : "Boleta"}</b> normalmente lleva <b>${tipo === "01" ? "RUC" : "DNI"}</b> en el receptor.</span>`;
  } else {
    el.hidden = true;
  }
}
function renderSerieHint() {
  const tipo = $("tipoComprobante").value;
  const txt = (tipo === "03") ? "Boleta: B###"
            : (tipo === "01" || tipo === "08") ? "Factura: F###"
            : (tipo === "07") ? "Nota crédito: F### o B###" : "—";
  if ($("serieHint")) $("serieHint").textContent = txt;
}
function renderRegimenInfo() {
  const el = $("regimenInfo");
  if (!el) return;
  const r = store.comprobante.regimenIgv;
  el.textContent = (r === 10.5)
    ? "MYPE turismo (Ley 32387) — vigente hasta 31-dic-2026."
    : "Tasa general 18% (IGV+IPM).";
}
function renderCorrelativoInfo() {
  const el = $("correlativoInfo");
  if (!el) return;
  const c = store.comprobante;
  const next = siguienteCorrelativo(c.tipo, c.serie);
  if (c.correlativo === next) {
    el.textContent = `próximo disponible: ${next}`;
    el.style.color = "";
  } else if (c.correlativo < next) {
    el.textContent = `⚠ ya usado — libre: ${next}`;
    el.style.color = "var(--c-warn)";
  } else {
    el.textContent = `saltarás del ${next} al ${c.correlativo}`;
    el.style.color = "var(--c-warn)";
  }
}
function renderTasaUI() {
  const tribKey = $("tributo").value;
  const afecKey = $("afectacion").value;
  const trib = CAT05[tribKey];
  const igvAplica = esIgvAplicable(afecKey);
  const tasaRow = $("tasaRow");
  const tasaInput = $("tasaInput");
  const tasaLabel = $("tasaLabel");

  if (trib.modo === "unit") {
    tasaRow.style.display = "flex";
    tasaLabel.textContent = `S/ por ${$("unidad").value}`;
    tasaInput.step = "0.10";
    if (!parseFloat(tasaInput.value) || parseFloat(tasaInput.value) === 18) tasaInput.value = "0.50";
  } else if (trib.t === null && igvAplica) {
    tasaRow.style.display = "flex";
    tasaLabel.textContent = "Tasa del tributo (%)";
    tasaInput.step = "0.01";
  } else {
    tasaRow.style.display = "none";
  }

  // Aviso combinación
  const aviso = $("avisoCombinacion");
  if (aviso) {
    if (!combinacionValida(afecKey, tribKey)) {
      const sug = CAT05[tributoSugerido(afecKey)];
      aviso.hidden = false;
      aviso.innerHTML = `⚠️ <span>Combinación inusual: afectación <b>${afecKey}</b> con tributo <b>${tribKey}</b>. Sugerido: <b>${sug.a}</b>.</span>
        <button class="a-action" type="button" onclick="aplicarSugerencia()">Aplicar sugerencia</button>`;
    } else aviso.hidden = true;
  }
}
function aplicarSugerencia() {
  $("tributo").value = tributoSugerido($("afectacion").value);
  onCambioItemForm();
}

function renderCat53UI() {
  const c = getCat53($("codigo53").value);
  if (!c) return;
  $("desc53Info").textContent = `${c.t === "desc" ? "Descuento" : "Cargo"} · Nivel: ${c.l} · ${c.ab ? "Afecta BI" : "No afecta BI"}`;
  const modo  = $("modoOp"), label = $("labelOp"), input = $("valorOp");
  if (c.f !== null) {
    modo.value = "porcentaje"; modo.disabled = true;
    label.textContent = `Porcentaje (tasa fija ${(c.f * 100).toFixed(1)}%)`;
    input.value = (c.f * 100).toFixed(1); input.disabled = true;
  } else {
    modo.disabled = false; input.disabled = false;
    label.textContent = modo.value === "porcentaje" ? "Porcentaje (%)" : "Monto fijo";
    input.step = modo.value === "porcentaje" ? "0.5" : "10";
  }
}
function renderCat53GlobalUI() {
  const c = getCat53($("codigo53Global").value);
  if (!c) return;
  const baseTxt = c.base === "base+igv" ? "Base + IGV" : "Base imp.";
  $("desc53GlobalInfo").textContent = `${c.t === "desc" ? "Descuento" : "Cargo"} · Sobre: ${baseTxt} · ${c.ab ? "Afecta BI" : "No afecta BI"}`;
  const modo  = $("modoOpGlobal"), label = $("labelOpGlobal"), input = $("valorOpGlobal");
  if (c.f !== null) {
    modo.value = "porcentaje"; modo.disabled = true;
    label.textContent = `Porcentaje (tasa fija ${(c.f * 100).toFixed(2)}%)`;
    input.value = (c.f * 100).toFixed(2); input.disabled = true;
  } else {
    modo.disabled = false; input.disabled = false;
    label.textContent = modo.value === "porcentaje" ? "Porcentaje (%)" : "Monto fijo";
    input.step = modo.value === "porcentaje" ? "0.5" : "10";
  }
}

function renderItemCargosList() {
  const el = $("itemCargosList");
  if (!el) return;
  if (!currentItemCargos.length) { el.innerHTML = ""; return; }
  el.innerHTML = currentItemCargos.map((cd, i) => {
    const c = getCat53(cd.codigo);
    if (!c) return "";
    const isCargo = c.t === "cargo";
    const valStr = cd.modo === "porcentaje" ? `${cd.valor}%` : `S/ ${cd.valor.toFixed(2)}`;
    return `<li class="chip ${isCargo ? 'is-cargo' : ''}">
      <span>${c.c} ${isCargo ? "Cargo" : "Desc"} ${valStr}</span>
      <button class="chip-x" type="button" onclick="quitarCargoItem(${i})" aria-label="Quitar">✕</button>
    </li>`;
  }).join("");
}

function renderItemList() {
  $("productCount").textContent = `${store.items.length} producto(s)`;
  const el = $("productList");
  if (!store.items.length) {
    el.innerHTML = '<p class="empty-list">Aún no hay productos. Completa el formulario y pulsa "Agregar producto".</p>';
    return;
  }
  const regimen = (store.comprobante && store.comprobante.regimenIgv) || 18;
  const ctx = { tasaIgvOverride: regimen / 100 };
  let html = '<table class="product-list-table"><thead><tr><th>#</th><th>Cód.</th><th>Producto</th><th>Cant.</th><th>Und</th><th>P.Unit</th><th>Total</th><th></th></tr></thead><tbody>';
  store.items.forEach((p, i) => {
    const r = calcItem(p, ctx);
    const editing = store.ui.editingItemId === p.id;
    html += `<tr class="clickable ${editing ? 'editing' : ''}" onclick="editarItem(${p.id})">
      <td>${i+1}</td>
      <td>${escapeHtml(p.codigo)}</td>
      <td>${escapeHtml(p.producto.length > 20 ? p.producto.slice(0,20)+"…" : p.producto)}</td>
      <td>${p.cantidad.toFixed(2)}</td>
      <td>${escapeHtml(p.unidad)}</td>
      <td>${fmtMon(r.valorUnitario)}</td>
      <td>${fmtMon(r.total)}</td>
      <td onclick="event.stopPropagation()"><button class="btn-remove" onclick="eliminarItem(${p.id})" aria-label="Eliminar">✕</button></td>
    </tr>`;
  });
  html += "</tbody></table>";
  el.innerHTML = html;
}

function renderGlobalesList() {
  $("globalesCount").textContent = `${store.globales.length} global(es)`;
  const el = $("globalesList");
  if (!store.globales.length) {
    el.innerHTML = '<p class="empty-list">No hay descuentos / cargos globales.</p>';
    return;
  }
  let html = '<table class="product-list-table"><thead><tr><th>Cód.</th><th>Concepto</th><th>Modo</th><th>Valor</th><th></th></tr></thead><tbody>';
  store.globales.forEach(g => {
    const c = getCat53(g.codigo);
    html += `<tr>
      <td>${g.codigo}</td>
      <td>${c ? escapeHtml(c.d) : "—"}</td>
      <td>${g.modo === "porcentaje" ? "%" : "S/"}</td>
      <td>${g.valor.toFixed(2)}</td>
      <td><button class="btn-remove" onclick="eliminarGlobal(${g.id})" aria-label="Eliminar">✕</button></td>
    </tr>`;
  });
  html += "</tbody></table>";
  el.innerHTML = html;
}

function renderComprobante() {
  const items = store.items;
  if (!items.length) {
    $("excelHead").innerHTML = "";
    $("excelBody").innerHTML = "<tr><td colspan='13' style='text-align:center;color:var(--c-subtle);padding:1rem'>Sin productos. Vuelve al paso 2.</td></tr>";
    $("summaryContainer").innerHTML = "";
    $("comprobantePreview").innerHTML = "";
    renderSummarySticky({ totalGravadas:0, totalExoneradas:0, totalInafectas:0, totalExportacion:0, baseGravadaAjustada:0, igvFinal:0, totalIcbper:0, percepcion:0, importeTotal:0, itemsRes:[] });
    return;
  }
  const c = calcComprobante({ items, globales: store.globales });
  const headers = ['#','Cód.','Cant.','Und','Descripción','P.Unit','Val.Unit.','P.Venta','Val.Venta','Desc/Cargo','Base Imp.','IGV','Total'];
  const rows = c.itemsRes.map((r, i) => {
    const p = r.item;
    return `<tr>
      <td>${i+1}</td><td>${escapeHtml(p.codigo)}</td>
      <td>${p.cantidad.toFixed(2)}</td><td>${escapeHtml(p.unidad)}</td>
      <td>${escapeHtml(p.producto.length > 18 ? p.producto.slice(0,18)+"…" : p.producto)}</td>
      <td>${fmtMon(p.precioUnit)}</td><td>${fmtMon(r.valorUnitario)}</td><td>${fmtMon(r.precioVentaUnitario)}</td>
      <td>${fmtMon(r.baseImp)}</td>
      <td>${(r.descItem + r.cargoItem) > 0 ? fmtMon(r.descItem + r.cargoItem) : "-"}</td>
      <td>${fmtMon(r.biFinal)}</td><td>${r.igvAplica ? fmtMon(r.igv) : "Ex."}</td><td>${fmtMon(r.total)}</td>
    </tr>`;
  }).join("");
  $("excelHead").innerHTML = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";
  $("excelBody").innerHTML = rows;

  const sumCols = [
    { k: "Total Gravadas",  v: fmtMon(c.totalGravadas) },
    { k: "Total Exoneradas",v: fmtMon(c.totalExoneradas) },
    { k: "Total Inafectas", v: fmtMon(c.totalInafectas) },
    { k: "Total Export.",   v: fmtMon(c.totalExportacion) },
    { k: "Desc.Global",     v: fmtMonNeg(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI) },
    { k: "Cargos Global",   v: fmtMon(c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI) },
    { k: "Total IGV",       v: fmtMon(c.igvFinal) },
    { k: "ICBPER",          v: fmtMon(c.totalIcbper) },
    { k: "Percepción",      v: fmtMon(c.percepcion) },
    { k: "Redondeo",        v: fmtMon(c.redondeo) },
    { k: "Importe Total",   v: fmtMon(c.importeTotal), total: true },
  ];
  let aviso = "";
  if (c.percepcion > 0 && c.importeTotal < 1500) {
    aviso = `<div class="alert warn" style="margin-top:0.6rem">
      ⚠️ <span>No corresponde percepción a consumidor final &lt; S/1,500 (D.S. 317-2014-EF). Total: <b>S/ ${c.importeTotal.toFixed(2)}</b>.</span>
    </div>`;
  }
  $("summaryContainer").innerHTML = `
    <table id="summaryTable">
      <thead><tr>${sumCols.map(col => `<th><span>${col.k}${tip(col.k)}</span></th>`).join("")}</tr></thead>
      <tbody><tr>${sumCols.map(col => `<td${col.total ? ' class="total"' : ""}>${col.v}</td>`).join("")}</tr></tbody>
    </table>${aviso}
  `;
  renderComprobantePreview(c);
  renderSummarySticky(c);
}

function renderSummarySticky(c) {
  if (!$("qsItems")) return;
  $("qsItems").textContent    = store.items.length;
  $("qsGravadas").textContent = fmtMon(c.totalGravadas);
  $("qsIgv").textContent      = fmtMon(c.igvFinal);
  $("qsIcbper").textContent   = c.totalIcbper > 0 ? fmtMon(c.totalIcbper) : "—";
  $("qsPercep").textContent   = c.percepcion > 0 ? fmtMon(c.percepcion) : "—";
  $("qsTotal").textContent    = fmtMon(c.importeTotal);
  const cb = store.comprobante;
  $("qsDoc").textContent      = `${cb.tipo === "01" ? "Factura" : cb.tipo === "03" ? "Boleta" : cb.tipo} · ${cb.serie}-${String(cb.correlativo).padStart(8,"0")}`;
}

function renderComprobantePreview(c) {
  const el = $("comprobantePreview");
  if (!c.itemsRes.length) { el.innerHTML = ""; return; }
  const cb = store.comprobante;
  const tipoNombre = { "01":"FACTURA ELECTRÓNICA","03":"BOLETA ELECTRÓNICA","07":"NOTA DE CRÉDITO ELECTRÓNICA","08":"NOTA DE DÉBITO ELECTRÓNICA" }[cb.tipo] || "COMPROBANTE ELECTRÓNICO";
  const date = new Date(cb.fechaEmision + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const monedaNombre = { PEN: "SOLES", USD: "DÓLARES AMERICANOS", EUR: "EUROS" }[cb.moneda] || cb.moneda;
  const tipoDocNombre = { "1":"DNI","6":"RUC","4":"CE","7":"Pasaporte","0":"-" }[cb.receptor.tipoDoc] || "Doc";
  const lines = c.itemsRes.map((r, i) => {
    const p = r.item;
    return `<tr>
      <td style="text-align:center">${i+1}</td><td style="text-align:center">${escapeHtml(p.codigo)}</td>
      <td style="text-align:center">${p.cantidad.toFixed(2)}</td><td style="text-align:center">${escapeHtml(p.unidad)}</td>
      <td>${escapeHtml(p.producto.length > 28 ? p.producto.slice(0,28)+"…" : p.producto)}</td>
      <td style="text-align:right">${p.precioUnit.toFixed(2)}</td><td style="text-align:right">${r.valorUnitario.toFixed(2)}</td>
      <td style="text-align:right">${r.precioVentaUnitario.toFixed(2)}</td>
      <td style="text-align:right">${(r.descItem + r.cargoItem).toFixed(2)}</td>
      <td style="text-align:right">${r.baseImp.toFixed(2)}</td>
      <td style="text-align:right">${r.igvAplica ? r.igv.toFixed(2) : "0.00"}</td>
      <td style="text-align:right">${r.total.toFixed(2)}</td>
    </tr>`;
  }).join("");
  el.innerHTML = `
    <div class="invoice">
      <div class="inv-header">
        <div class="inv-title">${tipoNombre}</div>
        <div class="inv-ribbon">RUC: ${escapeHtml(cb.emisor.ruc)}</div>
      </div>
      <div class="inv-empresa">${escapeHtml(cb.emisor.razon)} — ${escapeHtml(cb.emisor.direccion)}</div>
      <div class="inv-meta">
        <span><b>Serie-N°:</b> ${serie}-${correlativo}</span>
        <span><b>Fecha:</b> ${date}</span>
        <span><b>Moneda:</b> ${monedaNombre}</span>
      </div>
      <div class="inv-cliente">
        <div><b>Cliente:</b> ${escapeHtml(cb.receptor.razon)}</div>
        <div><b>${tipoDocNombre}:</b> ${escapeHtml(cb.receptor.doc)} · <b>Dir:</b> ${escapeHtml(cb.receptor.direccion)}</div>
      </div>
      <table class="inv-table">
        <thead><tr>
          <th style="width:28px">#</th><th style="width:45px">Cód.</th><th style="width:45px">Cant.</th>
          <th style="width:35px">Und</th><th>Descripción</th><th style="width:55px">P.U</th>
          <th style="width:60px">V.Unit</th><th style="width:60px">P.Vta</th><th style="width:55px">D/C</th>
          <th style="width:60px">V.Venta</th><th style="width:55px">IGV</th><th style="width:65px">Total</th>
        </tr></thead>
        <tbody>${lines}</tbody>
      </table>
      <div class="inv-summary">
        <div class="inv-sum-row"><span>Op. Gravadas:</span><span>${fmtMon(c.totalGravadas)}</span></div>
        ${c.totalExoneradas > 0 ? `<div class="inv-sum-row"><span>Op. Exoneradas:</span><span>${fmtMon(c.totalExoneradas)}</span></div>` : ""}
        ${c.totalInafectas   > 0 ? `<div class="inv-sum-row"><span>Op. Inafectas:</span><span>${fmtMon(c.totalInafectas)}</span></div>` : ""}
        ${c.totalExportacion > 0 ? `<div class="inv-sum-row"><span>Op. Exportación:</span><span>${fmtMon(c.totalExportacion)}</span></div>` : ""}
        ${(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI) > 0 ? `<div class="inv-sum-row"><span>Descuentos Globales:</span><span>${fmtMonNeg(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI)}</span></div>` : ""}
        ${(c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI) > 0 ? `<div class="inv-sum-row"><span>Cargos Globales:</span><span>${fmtMon(c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI)}</span></div>` : ""}
        <div class="inv-sum-row"><span>IGV:</span><span>${fmtMon(c.igvFinal)}</span></div>
        ${c.totalIcbper > 0 ? `<div class="inv-sum-row"><span>ICBPER:</span><span>${fmtMon(c.totalIcbper)}</span></div>` : ""}
        ${c.percepcion > 0 ? `<div class="inv-sum-row"><span>Percepción:</span><span>${fmtMon(c.percepcion)}</span></div>` : ""}
        <div class="inv-sum-row inv-total"><span>TOTAL A PAGAR:</span><span>${fmtMon(c.importeTotal)}</span></div>
      </div>
      <div class="inv-footer">
        <div class="inv-qr">
          <div class="qr-placeholder"><div class="qr-inner"></div></div>
          <div class="qr-text">Rep. Impresión<br/>SUNAT ${serie}-${correlativo}</div>
        </div>
      </div>
    </div>
  `;
}

const TOOLTIPS = {
  "Total Gravadas":"Operaciones gravadas (Cat.07 10-17) tras globales que afectan BI.",
  "Total Exoneradas":"Cat.07 código 20.",
  "Total Inafectas":"Cat.07 códigos 30-36.",
  "Total Export.":"Cat.07 código 40.",
  "Desc.Global":"Descuentos globales (Cat.53 nivel Global).",
  "Cargos Global":"Cargos globales (Cat.53 nivel Global).",
  "Total IGV":"IGV sobre base gravada ajustada por globales.",
  "ICBPER":"Cat.05 7152, monto fijo por unidad.",
  "Percepción":"Cat.53 51/52/53, sobre Base + IGV.",
  "Redondeo":"PayableRoundingAmount (UBL).",
  "Importe Total":"Total a pagar = subtotal ± globales + IGV + ICBPER + percepción + redondeo.",
};
function tip(key) {
  const t = TOOLTIPS[key] || "";
  return t ? `<span class="tip-i" data-tip="${escapeHtml(t)}">i</span>` : "";
}
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;")
    .replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function renderAll() {
  renderSerieHint();
  renderRegimenInfo();
  renderCorrelativoInfo();
  renderAvisoReceptor();
  renderTasaUI();
  renderCat53UI();
  renderCat53GlobalUI();
  renderItemCargosList();
  renderItemList();
  renderGlobalesList();
  renderComprobante();
}

// ════════════════════════════════════════════════════════════════════
// 10) ACCIONES
// ════════════════════════════════════════════════════════════════════
function agregarItem() {
  if (!validarCantidad() || !validarPrecio()) {
    toast("Revisa los campos del producto", "error"); return;
  }
  pushUndo("Agregar producto");
  const item = { ...leerItemForm(), id: Date.now() };
  store.items.push(item);
  $("codigoProducto").value = siguienteCodigoProducto();
  currentItemCargos = [];
  renderAll();
  persistir();
  toast("Producto agregado", "success");
}

function editarItem(id) {
  const item = store.items.find(p => p.id === id);
  if (!item) return;
  store.ui.editingItemId = id;
  escribirItemForm(item);
  $("itemFormTitle").textContent = `Editando: ${item.producto}`;
  $("btnAddItem").hidden = true;
  $("btnSaveEdit").hidden = false;
  $("btnCancelEdit").hidden = false;
  renderItemCargosList();
  renderTasaUI();
  goStep("productos");
  $("codigoProducto").focus();
}

function guardarEdicionItem() {
  if (!store.ui.editingItemId) return;
  if (!validarCantidad() || !validarPrecio()) {
    toast("Revisa los campos del producto", "error"); return;
  }
  pushUndo("Editar producto");
  const idx = store.items.findIndex(p => p.id === store.ui.editingItemId);
  if (idx >= 0) {
    store.items[idx] = { ...leerItemForm(), id: store.ui.editingItemId };
  }
  cancelarEdicionItem();
  renderAll();
  persistir();
  toast("Cambios guardados", "success");
}

function cancelarEdicionItem() {
  store.ui.editingItemId = null;
  $("itemFormTitle").textContent = "Nuevo producto";
  $("btnAddItem").hidden = false;
  $("btnSaveEdit").hidden = true;
  $("btnCancelEdit").hidden = true;
  $("codigoProducto").value = siguienteCodigoProducto();
  currentItemCargos = [];
  renderItemCargosList();
  renderItemList();
}

function eliminarItem(id) {
  const item = store.items.find(p => p.id === id);
  if (!item) return;
  pushUndo("Eliminar producto");
  store.items = store.items.filter(p => p.id !== id);
  if (store.ui.editingItemId === id) cancelarEdicionItem();
  $("codigoProducto").value = siguienteCodigoProducto();
  renderAll();
  persistir();
  toast("Producto eliminado · usa ↶ para deshacer", "info");
}

function limpiarItems() {
  if (!store.items.length) return;
  modal({
    title: "Eliminar todos los productos",
    body: `Vas a eliminar <b>${store.items.length} producto(s)</b>. Puedes deshacer con ↶.`,
    confirmLabel: "Sí, eliminar", danger: true,
    onConfirm: () => {
      pushUndo("Limpiar productos");
      store.items = [];
      $("codigoProducto").value = siguienteCodigoProducto();
      renderAll(); persistir();
      toast("Lista vaciada", "info");
    }
  });
}

function agregarCargoItem() {
  const codigo = $("codigo53").value;
  const c = getCat53(codigo);
  if (!c || c.l !== "Ítem") { toast("Código no válido para nivel ítem", "error"); return; }
  const modo = $("modoOp").value;
  const valor = parseFloat($("valorOp").value) || 0;
  if (c.f === null && valor <= 0) { toast("Ingresa un valor mayor a 0", "warn"); return; }
  if (currentItemCargos.some(cd => cd.codigo === codigo)) {
    toast(`El código ${codigo} ya está en el ítem`, "warn"); return;
  }
  currentItemCargos.push({ codigo, modo, valor: c.f !== null ? c.f * 100 : valor });
  renderItemCargosList();
  $("valorOp").value = 0;
  toast("Agregado al ítem", "info", 1800);
}
function quitarCargoItem(idx) {
  currentItemCargos.splice(idx, 1);
  renderItemCargosList();
}

function agregarGlobal() {
  const g = leerGlobalForm();
  if (!g.codigo) return;
  const c = getCat53(g.codigo);
  if (c && c.f === null && g.valor <= 0) { toast("Ingresa un valor", "warn"); return; }
  pushUndo("Agregar global");
  store.globales.push({ ...g, id: Date.now() });
  renderAll(); persistir();
  toast(`Global ${g.codigo} agregado`, "success");
}
function eliminarGlobal(id) {
  pushUndo("Eliminar global");
  store.globales = store.globales.filter(g => g.id !== id);
  renderAll(); persistir();
  toast("Global eliminado", "info");
}

function resetTodo() {
  modal({
    title: "¿Reset total?",
    body: "Esto borra todos los productos, globales, datos del comprobante y contadores de correlativo. Acción irreversible.",
    confirmLabel: "Sí, borrar todo", danger: true,
    onConfirm: () => {
      pushUndo("Reset total");
      store.items = []; store.globales = []; store.correlativos = {};
      store.comprobante = comprobanteDefault();
      localStorage.removeItem(STORAGE_KEY);
      escribirComprobanteForm();
      cancelarEdicionItem();
      renderAll();
      toast("Todo reiniciado", "info");
    }
  });
}

function exportarJSON() {
  if (!store.items.length) { toast("No hay productos para exportar", "warn"); return; }
  if (!validarEmisor() || !validarReceptor() || !validarSerie() || !validarFecha()) {
    toast("Hay datos del comprobante con errores", "error");
    goStep("comprobante"); return;
  }
  const data = {
    items: store.items, globales: store.globales,
    comprobante: store.comprobante,
    calculado: calcComprobante({ items: store.items, globales: store.globales }),
    generadoEl: new Date().toISOString(),
    _schema: "calc-sunat-2026/v1",
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${store.comprobante.serie}-${String(store.comprobante.correlativo).padStart(8,"0")}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  consumirCorrelativoActual();
  toast(`JSON ${a.download} descargado · correlativo avanzó`, "success", 5000);
}

function exportarXML() {
  if (!store.items.length) { toast("No hay productos para exportar", "warn"); return; }
  if (!validarEmisor() || !validarReceptor() || !validarSerie() || !validarFecha()) {
    toast("Hay datos del comprobante con errores", "error");
    goStep("comprobante"); return;
  }
  const xml = generarUblXml(store);
  const blob = new Blob([xml], { type: "application/xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${store.comprobante.emisor.ruc}-${store.comprobante.tipo}-${store.comprobante.serie}-${String(store.comprobante.correlativo).padStart(8,"0")}.xml`;
  a.click();
  URL.revokeObjectURL(a.href);
  consumirCorrelativoActual();
  toast(`XML ${a.download} descargado · correlativo avanzó`, "success", 5000);
}

function validarJsonImport(data) {
  if (!data || typeof data !== "object") return "El archivo no contiene un objeto JSON válido.";
  if (data.items && !Array.isArray(data.items)) return "'items' debe ser un array.";
  if (data.globales && !Array.isArray(data.globales)) return "'globales' debe ser un array.";
  if (data.items) {
    for (let i = 0; i < data.items.length; i++) {
      const it = data.items[i];
      if (typeof it !== "object" || !it.producto || typeof it.cantidad !== "number" || typeof it.precioUnit !== "number") {
        return `Ítem #${i+1} incompleto: requiere producto, cantidad y precioUnit numéricos.`;
      }
    }
  }
  return null;
}

function importarJSON(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const err = validarJsonImport(data);
      if (err) { toast("JSON inválido: " + err, "error", 6000); return; }
      pushUndo("Importar JSON");
      if (Array.isArray(data.items))    store.items    = data.items.map(migrarItem);
      if (Array.isArray(data.globales)) store.globales = data.globales;
      if (data.comprobante)             store.comprobante = { ...comprobanteDefault(), ...data.comprobante };
      if (data.correlativos && typeof data.correlativos === "object") store.correlativos = data.correlativos;
      persistir();
      escribirComprobanteForm();
      $("codigoProducto").value = siguienteCodigoProducto();
      renderAll();
      toast(`Importado: ${store.items.length} producto(s)`, "success");
    } catch (err) { toast("JSON malformado: " + err.message, "error"); }
  };
  reader.readAsText(file);
  ev.target.value = "";
}

// ════════════════════════════════════════════════════════════════════
// 11) EVENT HANDLERS DE FORMS
// ════════════════════════════════════════════════════════════════════
function onCambioItemForm() {
  renderTasaUI();
  renderCat53UI();
  validarCantidad();
  validarPrecio();
  renderItemList();
}
function onCambioGlobalForm() {
  renderCat53GlobalUI();
}
function onCambioComprobante() {
  store.comprobante = leerComprobanteForm();
  renderAvisoReceptor();
  renderSerieHint();
  renderCorrelativoInfo();
  renderRegimenInfo();
  validarSerie();
  validarFecha();
  validarEmisor();
  validarReceptor();
  renderItemList();
  renderComprobante();
  persistir();
}
function onCambioTipoOSerie() {
  const tipo  = $("tipoComprobante").value;
  const serie = $("serie").value.toUpperCase().trim();
  $("correlativo").value = siguienteCorrelativo(tipo, serie);
  onCambioComprobante();
}

// ════════════════════════════════════════════════════════════════════
// 12) INIT
// ════════════════════════════════════════════════════════════════════
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

function bindEvents() {
  // Producto select
  $("producto").addEventListener("change", function () {
    $("productoCustomField").hidden = this.value !== "Otro (personalizado)";
    onCambioItemForm();
  });

  // Item form
  ["tributo","afectacion","unidad","tipoPrecio","codigo53","modoOp"].forEach(id => {
    if ($(id)) $(id).addEventListener("change", onCambioItemForm);
  });
  ["codigoProducto","cantidad","precioUnit","tasaInput","valorOp","productoCustom"].forEach(id => {
    if ($(id)) $(id).addEventListener("input", onCambioItemForm);
  });
  $("btnAddItem").addEventListener("click", agregarItem);
  $("btnSaveEdit").addEventListener("click", guardarEdicionItem);
  $("btnCancelEdit").addEventListener("click", cancelarEdicionItem);
  $("btnAddCargoItem").addEventListener("click", agregarCargoItem);

  // Globales
  $("codigo53Global").addEventListener("change", onCambioGlobalForm);
  $("modoOpGlobal").addEventListener("change", onCambioGlobalForm);
  $("valorOpGlobal").addEventListener("input", onCambioGlobalForm);
  $("btnAddGlobal").addEventListener("click", agregarGlobal);

  // Comprobante
  $("tipoComprobante").addEventListener("change", onCambioTipoOSerie);
  $("serie").addEventListener("input", onCambioTipoOSerie);
  ["moneda","receptorTipoDoc","tipoOperacion","regimenIgv"].forEach(id => {
    if ($(id)) $(id).addEventListener("change", onCambioComprobante);
  });
  ["correlativo","fechaEmision","emisorRuc","emisorRazon","emisorDireccion",
   "receptorDoc","receptorRazon","receptorDireccion"].forEach(id => {
    if ($(id)) $(id).addEventListener("input", onCambioComprobante);
  });

  // Stepper
  document.querySelectorAll(".stepper .step").forEach(b => {
    b.addEventListener("click", () => goStep(b.dataset.step));
  });
  document.querySelectorAll("[data-go]").forEach(b => {
    b.addEventListener("click", () => goStep(b.dataset.go));
  });

  // Topbar tools
  $("btnUndo").addEventListener("click", undo);
  $("toggleExperto").addEventListener("change", function () {
    store.ui.modoExperto = this.checked;
    document.documentElement.dataset.mode = this.checked ? "experto" : "simple";
    persistir();
    toast(`Modo ${this.checked ? "experto" : "simple"} activado`, "info", 1800);
  });
  $("btnAyuda").addEventListener("click", () => {
    modal({
      title: "Atajos de teclado",
      body: `<ul style="line-height:1.8">
        <li><b>Ctrl + Z</b> · Deshacer</li>
        <li><b>Ctrl + 1/2/3/4</b> · Saltar a paso N</li>
        <li><b>Ctrl + Enter</b> · Agregar producto (en paso 2)</li>
        <li><b>Esc</b> · Cerrar modal / drawer</li>
      </ul>`,
      confirmLabel: "Entendido", cancelLabel: ""
    });
  });
  $("btnNormativa").addEventListener("click", openDrawer);
  $("drawerNormativa").querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);

  // Reset + acciones
  $("btnReset").addEventListener("click", resetTodo);

  // Modal cierra con click fuera o Esc
  $("modalOverlay").addEventListener("click", e => { if (e.target.id === "modalOverlay") closeModal(); });

  // Atajos de teclado
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); closeDrawer(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "4") {
      e.preventDefault();
      goStep(["comprobante","productos","globales","resumen"][parseInt(e.key,10) - 1]);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && store.ui.step === "productos") {
      e.preventDefault();
      store.ui.editingItemId ? guardarEdicionItem() : agregarItem();
    }
  });
}

async function init() {
  // 1) Cargar catálogos
  const { ok, err, fileProtocol } = await cargarDataJson();
  if (!ok) {
    if (fileProtocol) {
      banner("data",
        `ℹ️ Estás abriendo con <b>file://</b> — los navegadores bloquean leer <code>data.json</code> por seguridad. ` +
        `La calculadora funciona igual con los catálogos del código. ` +
        `Para editar <code>data.json</code> arranca <code>python3 -m http.server</code> desde esta carpeta y abre <code>http://localhost:8000</code>.`,
        "info"
      );
    } else {
      banner("data", `⚠️ Catálogos: usando los del código (data.json: ${err}).`, "warn", [
        { label: "Reintentar", onClick: async () => {
          const r = await cargarDataJson();
          if (r.ok) { closeBanner("data"); init(); }
        }}
      ]);
    }
  }

  // 2) Estado inicial del comprobante
  store.comprobante = comprobanteDefault();

  // 3) Cargar persistencia
  cargar();

  // 4) Selects
  const afecGroups = {
    "Gravadas": Object.entries(CAT07).filter(([k]) => k.startsWith("1")).map(([k,v]) => ({k,v})),
    "Exoneradas": Object.entries(CAT07).filter(([k]) => k.startsWith("2")).map(([k,v]) => ({k,v})),
    "Inafectas": Object.entries(CAT07).filter(([k]) => k.startsWith("3")).map(([k,v]) => ({k,v})),
    "Exportación": Object.entries(CAT07).filter(([k]) => k.startsWith("4")).map(([k,v]) => ({k,v})),
  };
  populateSelect("unidad", Object.entries(CAT03), ([k,v]) => `${k} — ${v}`, ([k]) => k);
  populateSelectGrouped("afectacion", afecGroups, ({k,v}) => `${k} — ${v}`, ({k}) => k);
  populateSelect("tributo", Object.entries(CAT05), ([k,v]) => `${k} — ${v.a} — ${v.n}`, ([k]) => k);

  const cat53Items = getCat53Items();
  const itemGroups = {
    "Descuentos": cat53Items.filter(c => c.t === "desc"),
    "Cargos":     cat53Items.filter(c => c.t === "cargo"),
  };
  populateSelectGrouped("codigo53", itemGroups, e => `${e.c} — ${e.d}`, e => e.c);

  const cat53Globals = getCat53Globals();
  const globalGroups = {
    "Descuentos": cat53Globals.filter(c => c.t === "desc"),
    "Cargos":     cat53Globals.filter(c => c.t === "cargo" && !["51","52","53"].includes(c.c)),
    "Percepciones": cat53Globals.filter(c => ["51","52","53"].includes(c.c)),
  };
  populateSelectGrouped("codigo53Global", globalGroups, e => `${e.c} — ${e.d}`, e => e.c);

  populateSelect("producto", PRODUCTOS, e => e, e => e);

  // 5) Reflejar estado en el form
  escribirComprobanteForm();
  $("codigoProducto").value = siguienteCodigoProducto();

  // 6) Modo experto
  document.documentElement.dataset.mode = store.ui.modoExperto ? "experto" : "simple";
  $("toggleExperto").checked = store.ui.modoExperto;

  // 7) Step inicial
  goStep("comprobante");

  // 8) Bind events
  bindEvents();

  // 9) Render todo
  renderAll();
  updateUndoBtn();

  // 10) Info persistente
  if ($("persistInfo")) {
    $("persistInfo").textContent = DATA_JSON_META
      ? `📂 Catálogos data.json v${DATA_JSON_META.version || "?"} (${DATA_JSON_META.actualizado || "—"}) · auto-guardado activo.`
      : `📦 Catálogos por defecto · auto-guardado activo.`;
  }
}

// ════════════════════════════════════════════════════════════════════
// 13) GENERADOR UBL XML (SUNAT) — sin cambios funcionales
// ════════════════════════════════════════════════════════════════════
function escXml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function cdata(s) { return `<![CDATA[${String(s || "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`; }

function infoTributacion(afecKey, trib, tasaReal) {
  const grupo = getCat07Grupo(afecKey);
  if (grupo === "gravada")
    return { categoria: "S", taxTypeCode: "VAT",
             taxId: trib.a === "IVAP" ? "1016" : "1000",
             taxName: trib.a === "IVAP" ? "IVAP" : "IGV",
             percent: round(tasaReal * 100, 2) };
  if (grupo === "exonerada")
    return { categoria: "E", taxTypeCode: "VAT", taxId: "9997", taxName: "EXO", percent: 0 };
  if (grupo === "inafecta")
    return { categoria: "O", taxTypeCode: "FRE", taxId: "9998", taxName: "INA", percent: 0 };
  if (grupo === "exportacion")
    return { categoria: "G", taxTypeCode: "FRE", taxId: "9995", taxName: "EXP", percent: 0 };
  return { categoria: "S", taxTypeCode: "VAT", taxId: "1000", taxName: "IGV", percent: 18 };
}

function xmlInvoiceLine(r, idx, currencyId) {
  const p = r.item;
  const info = infoTributacion(p.afectacion, r.trib, r.tasa);
  const qty  = (p.cantidad || 0).toFixed(2);
  const valU = r.valorUnitario.toFixed(2);
  const pVta = r.precioVentaUnitario.toFixed(2);
  const base = r.biFinal.toFixed(2);
  const igv  = r.igv.toFixed(2);

  // Múltiples AllowanceCharge por línea
  const allowances = (r.cargosResultado || []).map(cr => `
    <cac:AllowanceCharge>
      <cbc:ChargeIndicator>${cr.cat53.t === "cargo" ? "true" : "false"}</cbc:ChargeIndicator>
      <cbc:AllowanceChargeReasonCode listAgencyName="PE:SUNAT" listName="Cargo/descuento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo53">${escXml(cr.cat53.c)}</cbc:AllowanceChargeReasonCode>
      ${cr.factor != null ? `<cbc:MultiplierFactorNumeric>${cr.factor.toFixed(5)}</cbc:MultiplierFactorNumeric>` : ""}
      <cbc:Amount currencyID="${currencyId}">${cr.monto.toFixed(2)}</cbc:Amount>
      <cbc:BaseAmount currencyID="${currencyId}">${r.baseImp.toFixed(2)}</cbc:BaseAmount>
    </cac:AllowanceCharge>`).join("");

  let icbperSubtotal = "";
  if (r.icbper > 0) {
    icbperSubtotal = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currencyId}">${p.cantidad.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currencyId}">${r.icbper.toFixed(2)}</cbc:TaxAmount>
        <cbc:BaseUnitMeasure unitCode="${escXml(p.unidad)}">${p.cantidad.toFixed(2)}</cbc:BaseUnitMeasure>
        <cac:TaxCategory>
          <cbc:PerUnitAmount currencyID="${currencyId}">${(p.tasaInput || 0).toFixed(2)}</cbc:PerUnitAmount>
          <cac:TaxScheme><cbc:ID>7152</cbc:ID><cbc:Name>ICBPER</cbc:Name><cbc:TaxTypeCode>OTH</cbc:TaxTypeCode></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>`;
  }

  return `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${escXml(p.unidad)}" unitCodeListID="UN/ECE rec 20" unitCodeListAgencyName="United Nations Economic Commission for Europe">${qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currencyId}">${base}</cbc:LineExtensionAmount>
    <cac:PricingReference>
      <cac:AlternativeConditionPrice>
        <cbc:PriceAmount currencyID="${currencyId}">${pVta}</cbc:PriceAmount>
        <cbc:PriceTypeCode listName="Tipo de Precio" listAgencyName="PE:SUNAT" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo16">01</cbc:PriceTypeCode>
      </cac:AlternativeConditionPrice>
    </cac:PricingReference>${allowances}
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${currencyId}">${(r.igv + r.icbper).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currencyId}">${base}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currencyId}">${igv}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${info.percent.toFixed(2)}</cbc:Percent>
          <cbc:TaxExemptionReasonCode listAgencyName="PE:SUNAT" listName="Afectacion del IGV" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo07">${escXml(p.afectacion)}</cbc:TaxExemptionReasonCode>
          <cac:TaxScheme>
            <cbc:ID>${info.taxId}</cbc:ID><cbc:Name>${info.taxName}</cbc:Name><cbc:TaxTypeCode>${info.taxTypeCode}</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>${icbperSubtotal}
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${cdata(p.producto)}</cbc:Description>
      <cac:SellersItemIdentification><cbc:ID>${escXml(p.codigo)}</cbc:ID></cac:SellersItemIdentification>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="${currencyId}">${valU}</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>`;
}

function xmlAllowanceChargeGlobal(g, c, currencyId, idx) {
  const cat53 = getCat53(g.codigo);
  const det = c.detalleGlobales[idx];
  if (!cat53 || !det) return "";
  const factor = cat53.f !== null ? cat53.f : (g.modo === "porcentaje" ? g.valor / 100 : null);
  return `
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>${cat53.t === "cargo" ? "true" : "false"}</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReasonCode listAgencyName="PE:SUNAT" listName="Cargo/descuento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo53">${escXml(cat53.c)}</cbc:AllowanceChargeReasonCode>
    ${factor != null ? `<cbc:MultiplierFactorNumeric>${factor.toFixed(5)}</cbc:MultiplierFactorNumeric>` : ""}
    <cbc:Amount currencyID="${currencyId}">${det.monto.toFixed(2)}</cbc:Amount>
    <cbc:BaseAmount currencyID="${currencyId}">${det.baseRef.toFixed(2)}</cbc:BaseAmount>
  </cac:AllowanceCharge>`;
}

function generarUblXml(s) {
  const cb = s.comprobante;
  const c = calcComprobante({ items: s.items, globales: s.globales });
  const cid = cb.moneda;
  const docId = `${cb.serie}-${String(cb.correlativo).padStart(8, "0")}`;
  const rootEl = ["07","08"].includes(cb.tipo) ? (cb.tipo === "07" ? "CreditNote" : "DebitNote") : "Invoice";
  const rootNs = rootEl === "Invoice" ? "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
                : rootEl === "CreditNote" ? "urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
                : "urn:oasis:names:specification:ubl:schema:xsd:DebitNote-2";
  const tipoOperacion = cb.tipoOperacion || "0101";

  const lineas = c.itemsRes.map((r, i) => xmlInvoiceLine(r, i, cid)).join("");
  const allowances = (s.globales || []).map((g, i) => xmlAllowanceChargeGlobal(g, c, cid, i)).join("");

  const taxTotalDoc = `
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${cid}">${(c.igvFinal + c.totalIcbper).toFixed(2)}</cbc:TaxAmount>
    ${c.totalGravadas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.baseGravadaAjustada.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">${c.igvFinal.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalExoneradas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalExoneradas.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>9997</cbc:ID><cbc:Name>EXO</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalInafectas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalInafectas.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>9998</cbc:ID><cbc:Name>INA</cbc:Name><cbc:TaxTypeCode>FRE</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalExportacion > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalExportacion.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>9995</cbc:ID><cbc:Name>EXP</cbc:Name><cbc:TaxTypeCode>FRE</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalIcbper > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">0.00</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">${c.totalIcbper.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>7152</cbc:ID><cbc:Name>ICBPER</cbc:Name><cbc:TaxTypeCode>OTH</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
  </cac:TaxTotal>`;

  const sumLineExt = c.itemsRes.reduce((s, r) => s + r.biFinal, 0);
  const allowanceTotal = c.descGlobalAfectaBI + c.descGlobalNoAfectaBI;
  const chargeTotal    = c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI;
  const monetaryTotal = `
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${cid}">${sumLineExt.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="${cid}">${(c.importeTotal - c.percepcion).toFixed(2)}</cbc:TaxInclusiveAmount>
    ${allowanceTotal > 0 ? `<cbc:AllowanceTotalAmount currencyID="${cid}">${allowanceTotal.toFixed(2)}</cbc:AllowanceTotalAmount>` : ""}
    ${chargeTotal    > 0 ? `<cbc:ChargeTotalAmount currencyID="${cid}">${chargeTotal.toFixed(2)}</cbc:ChargeTotalAmount>` : ""}
    <cbc:PayableAmount currencyID="${cid}">${c.importeTotal.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>`;

  const supplier = `
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6" schemeName="Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${escXml(cb.emisor.ruc)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName><cbc:Name>${cdata(cb.emisor.razon)}</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${cdata(cb.emisor.razon)}</cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cbc:AddressTypeCode>0000</cbc:AddressTypeCode>
          <cac:AddressLine><cbc:Line>${cdata(cb.emisor.direccion)}</cbc:Line></cac:AddressLine>
          <cac:Country><cbc:IdentificationCode>PE</cbc:IdentificationCode></cac:Country>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>`;

  const customer = `
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${escXml(cb.receptor.tipoDoc)}" schemeName="Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${escXml(cb.receptor.doc)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${cdata(cb.receptor.razon)}</cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cac:AddressLine><cbc:Line>${cdata(cb.receptor.direccion || "-")}</cbc:Line></cac:AddressLine>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>`;

  const signature = `
  <cac:Signature>
    <cbc:ID>${escXml(docId)}</cbc:ID>
    <cac:SignatoryParty>
      <cac:PartyIdentification><cbc:ID>${escXml(cb.emisor.ruc)}</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>${cdata(cb.emisor.razon)}</cbc:Name></cac:PartyName>
    </cac:SignatoryParty>
    <cac:DigitalSignatureAttachment>
      <cac:ExternalReference><cbc:URI>#SignatureSP</cbc:URI></cac:ExternalReference>
    </cac:DigitalSignatureAttachment>
  </cac:Signature>`;

  const typeCodeTag = rootEl === "Invoice"
    ? `<cbc:InvoiceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01" listID="${tipoOperacion}">${cb.tipo}</cbc:InvoiceTypeCode>`
    : "";

  const lineWrap = rootEl === "Invoice" ? "InvoiceLine"
                 : rootEl === "CreditNote" ? "CreditNoteLine"
                 : "DebitNoteLine";

  return `<?xml version="1.0" encoding="UTF-8"?>
<${rootEl}
  xmlns="${rootNs}"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
  xmlns:sac="urn:sunat:names:specification:ubl:peru:schema:xsd:SunatAggregateComponents-1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- Firma digital del emisor (XMLDSig) — inyectar antes de enviar a SUNAT -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${escXml(docId)}</cbc:ID>
  <cbc:IssueDate>${escXml(cb.fechaEmision)}</cbc:IssueDate>
  <cbc:IssueTime>${new Date().toTimeString().slice(0,8)}</cbc:IssueTime>
  ${typeCodeTag}
  <cbc:DocumentCurrencyCode>${escXml(cid)}</cbc:DocumentCurrencyCode>
  ${signature}
  ${supplier}
  ${customer}${allowances}
  ${taxTotalDoc}
  ${monetaryTotal}
${lineas.replace(/InvoiceLine/g, lineWrap)}
</${rootEl}>
`;
}

// ════════════════════════════════════════════════════════════════════
init();
