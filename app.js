// ════════════════════════════════════════════════════════════════════
// 1) CATÁLOGOS SUNAT
// ────────────────────────────────────────────────────────────────────
// Los valores aquí son FALLBACK. La fuente real es data.json — se carga
// vía fetch al inicio y reemplaza estas variables. Si el archivo no se
// puede leer (ej. abrir el HTML con file://), se usan los hardcoded.
// ════════════════════════════════════════════════════════════════════

// Catálogo N.º 03: Unidad de Medida
let CAT03 = {
  "NIU": "Unidad (bienes)", "ZZ": "Servicio", "KGM": "Kilogramo",
  "GRM": "Gramo", "LBR": "Libra", "MTR": "Metro", "MMT": "Milímetro",
  "LTR": "Litro", "MLT": "Mililitro", "MTQ": "Metro cúbico",
  "DZN": "Docena", "HUR": "Hora", "DAY": "Día", "MON": "Mes",
  "KWH": "Kilowatt hora", "TNE": "Tonelada métrica", "FOT": "Pie",
  "INH": "Pulgada", "M2": "Metro cuadrado", "M3": "Metro cúbico",
};

// Catálogo N.º 07: Afectación IGV
let CAT07 = {
  "10": "Gravado - Operación onerosa",
  "11": "Gravado - Retiro por premio",
  "12": "Gravado - Retiro por donación",
  "13": "Gravado - Retiro",
  "14": "Gravado - Retiro por publicidad",
  "15": "Gravado - Bonificaciones",
  "16": "Gravado - Retiro entrega a trabajadores",
  "17": "Gravado - IVAP",
  "20": "Exonerado",
  "30": "Inafecto - Operación no onerosa",
  "31": "Inafecto - Retiro por mudanza",
  "32": "Inafecto - Muestra médica",
  "33": "Inafecto - Retiro por sorteo",
  "34": "Inafecto - Retiro entrega a trabajadores",
  "35": "Inafecto - Retiro por grado",
  "36": "Inafecto - IVAP",
  "40": "Exportación",
};

// Catálogo N.º 05: Tributos
// t = tasa fija (null = libre), modo = 'pct' (% sobre base) o 'unit' (monto fijo × cantidad)
let CAT05 = {
  "1000": { n: "IGV - Impuesto General a las Ventas", a: "IGV",    t: 0.18, modo: "pct"  },
  "1016": { n: "IVAP - Impuesto Venta Arroz Pilado",  a: "IVAP",   t: 0.04, modo: "pct"  },
  "2000": { n: "ISC - Impuesto Selectivo al Consumo", a: "ISC",    t: null, modo: "pct"  },
  "3000": { n: "IR - Impuesto a la Renta",            a: "IR",     t: null, modo: "pct"  },
  "7152": { n: "ICBPER - Bolsas Plásticas",           a: "ICBPER", t: null, modo: "unit" },
  "9995": { n: "Exportación",                          a: "EXP",    t: 0,    modo: "pct"  },
  "9996": { n: "Gratuito",                             a: "GRA",    t: 0,    modo: "pct"  },
  "9997": { n: "Exonerado",                            a: "EXO",    t: 0,    modo: "pct"  },
  "9998": { n: "Inafecto",                             a: "INA",    t: 0,    modo: "pct"  },
  "9999": { n: "Otros tributos",                       a: "OTROS",  t: null, modo: "pct"  },
};

// Catálogo N.º 53: Cargos/Descuentos
// l = "Ítem" (afecta la línea) o "Global" (afecta el comprobante)
// ab = "Afecta Base Imponible" del IGV
// f = factor fijo (null = libre)
// base = sobre qué se aplica: "base" (BI) | "base+igv" (precio venta)
let CAT53 = [
  { c: "00", d: "Descuentos que afectan BI IGV/IVAP",                 l: "Ítem",   t: "desc",  ab: true,  f: null,   base: "base" },
  { c: "01", d: "Descuentos que NO afectan BI IGV/IVAP",              l: "Ítem",   t: "desc",  ab: false, f: null,   base: "base" },
  { c: "02", d: "Descuentos globales que afectan BI IGV/IVAP",        l: "Global", t: "desc",  ab: true,  f: null,   base: "base" },
  { c: "03", d: "Descuentos globales que NO afectan BI IGV/IVAP",     l: "Global", t: "desc",  ab: false, f: null,   base: "base" },
  { c: "04", d: "Descuentos globales x anticipos gravados afectan BI",l: "Global", t: "desc",  ab: true,  f: null,   base: "base" },
  { c: "05", d: "Descuentos globales x anticipos exonerados",          l: "Global", t: "desc",  ab: false, f: null,   base: "base" },
  { c: "06", d: "Descuentos globales x anticipos inafectos",           l: "Global", t: "desc",  ab: false, f: null,   base: "base" },
  { c: "07", d: "Factor compensación - DU 010-2004",                   l: "Ítem",   t: "desc",  ab: true,  f: null,   base: "base" },
  { c: "45", d: "FISE",                                                l: "Global", t: "cargo", ab: false, f: null,   base: "base+igv" },
  { c: "46", d: "Recargo al consumo y/o propinas",                     l: "Global", t: "cargo", ab: false, f: null,   base: "base+igv" },
  { c: "47", d: "Cargos que afectan BI IGV/IVAP",                      l: "Ítem",   t: "cargo", ab: true,  f: null,   base: "base" },
  { c: "48", d: "Cargos que NO afectan BI IGV/IVAP",                   l: "Ítem",   t: "cargo", ab: false, f: null,   base: "base" },
  { c: "49", d: "Cargos globales que afectan BI IGV/IVAP",             l: "Global", t: "cargo", ab: true,  f: null,   base: "base" },
  { c: "50", d: "Cargos globales que NO afectan BI IGV/IVAP",          l: "Global", t: "cargo", ab: false, f: null,   base: "base" },
  // Percepciones — se aplican sobre (Base + IGV) del comprobante
  { c: "51", d: "Percepción venta interna",                            l: "Global", t: "cargo", ab: false, f: 0.02,   base: "base+igv" },
  { c: "52", d: "Percepción adquisición combustible",                  l: "Global", t: "cargo", ab: false, f: 0.01,   base: "base+igv" },
  { c: "53", d: "Percepción agente percepción tasa especial",          l: "Global", t: "cargo", ab: false, f: 0.005,  base: "base+igv" },
  { c: "54", d: "Factor aportación - DU 010-2004",                     l: "Ítem",   t: "cargo", ab: true,  f: null,   base: "base" },
  { c: "61", d: "Retención de renta por anticipos",                    l: "Global", t: "desc",  ab: false, f: null,   base: "base" },
];

let PRODUCTOS = [
  "Laptop HP Pavilion 15", "Smartphone Samsung Galaxy S24",
  "Teclado mecánico Logitech", "Monitor Dell 27\" 4K",
  "Mouse inalámbrico MX Master 3", "Audífonos Sony WH-1000XM5",
  "Impresora HP LaserJet", "Escritorio ergonómico",
  "Silla de oficina ejecutiva", "Útiles de escritorio (kit)",
  "Servicio de consultoría TI", "Servicio de desarrollo web",
  "Otro (personalizado)",
];

// Defaults para el comprobante (se sobrescriben con data.json)
let DEFAULTS_COMPROBANTE = null;
let DATA_JSON_META = null;

async function cargarDataJson() {
  try {
    const res = await fetch("data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const d = await res.json();
    if (d.cat03)              CAT03      = d.cat03;
    if (d.cat07)              CAT07      = d.cat07;
    if (d.cat05)              CAT05      = d.cat05;
    if (Array.isArray(d.cat53))    CAT53      = d.cat53;
    if (Array.isArray(d.productos))PRODUCTOS  = d.productos;
    if (d.comprobanteDefault) DEFAULTS_COMPROBANTE = d.comprobanteDefault;
    if (d._meta)              DATA_JSON_META = d._meta;
    return true;
  } catch (e) {
    console.warn("data.json no disponible — usando catálogos hardcoded.", e.message);
    return false;
  }
}

// Helpers de catálogo
function getCat53(c)        { return CAT53.find(e => e.c === c); }
function getCat53Items()    { return CAT53.filter(e => e.l === "Ítem"); }
function getCat53Globals()  { return CAT53.filter(e => e.l === "Global"); }
function getCat07Grupo(c)   {
  if (c.startsWith("1")) return "gravada";
  if (c.startsWith("2")) return "exonerada";
  if (c.startsWith("3")) return "inafecta";
  if (c.startsWith("4")) return "exportacion";
  return "otro";
}
function esIgvAplicable(afecKey) { return afecKey.startsWith("1"); }

// Tributo sugerido según afectación (para auto-corrección)
function tributoSugerido(afecKey) {
  const grupo = getCat07Grupo(afecKey);
  if (afecKey === "17" || afecKey === "36") return "1016"; // IVAP
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

/**
 * Calcula UN ítem. Los Cat.53 de nivel "Global" se ignoran aquí —
 * deben pasarse en `globales[]` a calcComprobante.
 * `ctx.tasaIgvOverride` (decimal, ej. 0.105) permite usar régimen MYPE.
 */
function calcItem(item, ctx) {
  const trib = CAT05[item.tributo] || CAT05["1000"];
  const cat53 = getCat53(item.codigo53Item) || getCat53Items()[0];
  const afecKey = item.afectacion;
  const grupo = getCat07Grupo(afecKey);
  const igvAplica = esIgvAplicable(afecKey);

  // Tasa efectiva del tributo principal
  let tasa = trib.t;
  // Override de tasa IGV (MYPE turismo, etc.) — solo si el tributo es IGV (1000)
  if (item.tributo === "1000" && ctx && ctx.tasaIgvOverride != null) {
    tasa = ctx.tasaIgvOverride;
  }
  if (tasa === null && trib.modo === "pct" && igvAplica) tasa = (item.tasaInput || 0) / 100;
  else if (!igvAplica && trib.modo === "pct")            tasa = 0;
  else if (trib.modo === "unit")                          tasa = 0; // ICBPER no es %

  // Valor venta raw (cantidad × precio)
  const totalValorRaw = item.cantidad * item.precioUnit;
  let baseImpRaw, igvBaseRaw;
  if (igvAplica && item.tipoPrecio === "incluido") {
    baseImpRaw = totalValorRaw / (1 + tasa);
    igvBaseRaw = baseImpRaw * tasa;
  } else {
    baseImpRaw = totalValorRaw;
    igvBaseRaw = igvAplica ? baseImpRaw * tasa : 0;
  }

  // Cat.53 a nivel Ítem (solo si l === "Ítem" y valorOp > 0)
  let descItem = 0, cargoItem = 0, biFinalRaw = baseImpRaw, factorItem = null;
  if (cat53.l === "Ítem" && (item.valorOp || 0) > 0) {
    const valOp = item.valorOp;
    let montoRaw;
    if (cat53.f !== null) {
      factorItem = cat53.f;
      montoRaw   = factorItem * baseImpRaw;
    } else if (item.modoOp === "porcentaje") {
      factorItem = valOp / 100;
      montoRaw   = factorItem * baseImpRaw;
    } else {
      factorItem = baseImpRaw > 0 ? valOp / baseImpRaw : null;
      montoRaw   = valOp;
    }
    const monto = round(montoRaw, 2);
    if (cat53.t === "desc") descItem  = monto;
    else                    cargoItem = monto;

    if (cat53.ab) {
      biFinalRaw = cat53.t === "desc" ? baseImpRaw - monto : baseImpRaw + monto;
    }
  }

  // IGV final (sobre BI final si afecta, igual que el inicial si no)
  const igvFinalRaw = igvAplica ? biFinalRaw * tasa : 0;

  // ICBPER (tributo modo "unit"): cantidad × tasa-fija en S/
  let icbper = 0;
  if (trib.modo === "unit") {
    icbper = round(item.cantidad * (item.tasaInput || 0), 2);
  }

  // Total del ítem
  let totalRaw;
  if (descItem === 0 && cargoItem === 0) {
    totalRaw = baseImpRaw + igvBaseRaw;
  } else if (cat53.ab) {
    totalRaw = biFinalRaw + igvFinalRaw;
  } else {
    const sign = cat53.t === "desc" ? -1 : 1;
    totalRaw = baseImpRaw + igvBaseRaw + sign * (descItem || cargoItem);
  }
  totalRaw += icbper;

  const valorUnitarioRaw = (igvAplica && item.tipoPrecio === "incluido")
    ? item.precioUnit / (1 + tasa)
    : item.precioUnit;

  return {
    item, cat53, trib, grupo, igvAplica, tasa, factorItem,
    valorUnitarioRaw, valorUnitario: round(valorUnitarioRaw, 2),
    precioVentaUnitario: round(valorUnitarioRaw * (1 + tasa), 2),
    baseImpRaw, baseImp:  round(baseImpRaw, 2),
    biFinalRaw, biFinal:  round(biFinalRaw, 2),
    igvRaw:    igvFinalRaw, igv: round(igvFinalRaw, 2),
    descItem, cargoItem, icbper,
    totalRaw, total: round(totalRaw, 2),
  };
}

/**
 * Procesa los descuentos/cargos globales del comprobante.
 * Devuelve montos discriminados por tipo + percepción.
 */
function calcGlobales(globales, bases) {
  // bases = { gravadas, igvGravadas, exoneradas, inafectas, exportacion }
  let descGlobalAfectaBI    = 0;
  let descGlobalNoAfectaBI  = 0;
  let cargoGlobalAfectaBI   = 0;
  let cargoGlobalNoAfectaBI = 0;
  let percepcion            = 0;
  const detalle = [];

  for (const g of (globales || [])) {
    const c = getCat53(g.codigo);
    if (!c || c.l !== "Global") continue;

    const baseRef = c.base === "base+igv"
      ? bases.gravadas + bases.igvGravadas
      : bases.gravadas;

    let montoRaw;
    if (c.f !== null) {
      montoRaw = c.f * baseRef;
    } else if (g.modo === "porcentaje") {
      montoRaw = (g.valor / 100) * baseRef;
    } else {
      montoRaw = g.valor;
    }
    const monto = round(montoRaw, 2);

    detalle.push({ codigo: c.c, descripcion: c.d, monto, baseRef: round(baseRef, 2) });

    // Percepciones (51/52/53) van a su propio bucket
    if (["51","52","53"].includes(c.c)) {
      percepcion += monto;
      continue;
    }
    if (c.t === "desc") {
      if (c.ab) descGlobalAfectaBI    += monto;
      else      descGlobalNoAfectaBI  += monto;
    } else {
      if (c.ab) cargoGlobalAfectaBI   += monto;
      else      cargoGlobalNoAfectaBI += monto;
    }
  }

  return {
    descGlobalAfectaBI,  descGlobalNoAfectaBI,
    cargoGlobalAfectaBI, cargoGlobalNoAfectaBI,
    percepcion, detalle,
  };
}

/**
 * Calcula el comprobante completo.
 */
function calcComprobante(comp) {
  // Régimen IGV del comprobante (default 18%)
  const regimen = (comp.regimenIgv != null) ? comp.regimenIgv
                : (store.comprobante && store.comprobante.regimenIgv) || 18;
  const ctx = { tasaIgvOverride: regimen / 100 };
  const itemsRes = comp.items.map(it => calcItem(it, ctx));

  let totalGravadas = 0, totalExoneradas = 0, totalInafectas = 0, totalExportacion = 0;
  let igvGravadas = 0, totalIcbper = 0;
  let sumTotalesItem = 0;

  for (const r of itemsRes) {
    if      (r.grupo === "gravada")     { totalGravadas    += r.biFinal; igvGravadas += r.igv; }
    else if (r.grupo === "exonerada")     totalExoneradas  += r.biFinal;
    else if (r.grupo === "inafecta")      totalInafectas   += r.biFinal;
    else if (r.grupo === "exportacion")   totalExportacion += r.biFinal;
    totalIcbper    += r.icbper;
    sumTotalesItem += r.total;
  }

  // 1.ª pasada: descuentos/cargos globales (sin percepción) sobre bases originales
  const PERCEP = new Set(["51","52","53"]);
  const globalesNoPercep = (comp.globales || []).filter(g => !PERCEP.has(g.codigo));
  const globalesPercep   = (comp.globales || []).filter(g =>  PERCEP.has(g.codigo));

  const glob1 = calcGlobales(globalesNoPercep, {
    gravadas:    totalGravadas,
    igvGravadas, exoneradas: totalExoneradas,
    inafectas:   totalInafectas, exportacion: totalExportacion,
  });

  // Ajustar BI gravada e IGV por descuentos/cargos globales que afectan BI
  const baseGravadaAjustada = totalGravadas
    - glob1.descGlobalAfectaBI
    + glob1.cargoGlobalAfectaBI;
  const tasaIgvEfectiva = totalGravadas > 0 ? igvGravadas / totalGravadas : 0.18;
  const igvFinal = round(baseGravadaAjustada * tasaIgvEfectiva, 2);

  // 2.ª pasada: percepciones sobre Base + IGV ya ajustados
  const glob2 = calcGlobales(globalesPercep, {
    gravadas:    baseGravadaAjustada,
    igvGravadas: igvFinal,
    exoneradas:  totalExoneradas,
    inafectas:   totalInafectas, exportacion: totalExportacion,
  });

  const glob = {
    descGlobalAfectaBI:    glob1.descGlobalAfectaBI,
    descGlobalNoAfectaBI:  glob1.descGlobalNoAfectaBI,
    cargoGlobalAfectaBI:   glob1.cargoGlobalAfectaBI,
    cargoGlobalNoAfectaBI: glob1.cargoGlobalNoAfectaBI,
    percepcion:            glob2.percepcion,
    detalle:               [...glob1.detalle, ...glob2.detalle],
  };

  const subtotal = baseGravadaAjustada + totalExoneradas + totalInafectas + totalExportacion;
  const totalAntesPercepcion = subtotal + igvFinal + totalIcbper
    - glob.descGlobalNoAfectaBI + glob.cargoGlobalNoAfectaBI;

  const importeTotal = round(totalAntesPercepcion + glob.percepcion, 2);

  // Redondeo SUNAT (PayableRoundingAmount): diferencia entre el calculado y el cobrado.
  // En esta implementación = 0 salvo que se aplique un redondeo manual al céntimo.
  const redondeo = 0;

  return {
    itemsRes,
    totalGravadas:    round(totalGravadas, 2),
    totalExoneradas:  round(totalExoneradas, 2),
    totalInafectas:   round(totalInafectas, 2),
    totalExportacion: round(totalExportacion, 2),
    baseGravadaAjustada: round(baseGravadaAjustada, 2),
    igvFinal,
    totalIcbper:      round(totalIcbper, 2),
    descGlobalAfectaBI:    round(glob.descGlobalAfectaBI, 2),
    descGlobalNoAfectaBI:  round(glob.descGlobalNoAfectaBI, 2),
    cargoGlobalAfectaBI:   round(glob.cargoGlobalAfectaBI, 2),
    cargoGlobalNoAfectaBI: round(glob.cargoGlobalNoAfectaBI, 2),
    percepcion:       round(glob.percepcion, 2),
    detalleGlobales:  glob.detalle,
    sumTotalesItem:   round(sumTotalesItem, 2),
    redondeo,
    importeTotal,
  };
}

// ════════════════════════════════════════════════════════════════════
// 3) ESTADO
// ════════════════════════════════════════════════════════════════════
const STORAGE_KEY = "calc-sunat-2026";

function comprobanteDefault() {
  const base = {
    tipo: "03",
    serie: "B001",
    correlativo: 1,
    moneda: "PEN",
    fechaEmision: new Date().toISOString().slice(0, 10),
    tipoOperacion: "0101",      // Cat.51 — Venta interna por defecto
    regimenIgv: 18,             // 18 general | 10.5 MYPE turismo
    emisor:   { ruc: "20123456789", razon: "MI EMPRESA S.A.C.", direccion: "Av. Principal 123, Lima" },
    receptor: { tipoDoc: "1", doc: "00000000", razon: "CLIENTE VARIOS", direccion: "-" },
  };
  if (!DEFAULTS_COMPROBANTE) return base;
  return {
    ...base,
    ...DEFAULTS_COMPROBANTE,
    fechaEmision: DEFAULTS_COMPROBANTE.fechaEmision || base.fechaEmision,
    emisor:   { ...base.emisor,   ...(DEFAULTS_COMPROBANTE.emisor   || {}) },
    receptor: { ...base.receptor, ...(DEFAULTS_COMPROBANTE.receptor || {}) },
  };
}

const store = {
  items: [],
  globales: [],
  comprobante: comprobanteDefault(),
  // Contador de correlativos por par tipo-serie. Ej: { "03-B001": 5, "01-F001": 12 }
  correlativos: {},
};

// ── Auto-numeración ──
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
  // Marcar el correlativo actual como usado y avanzar al siguiente
  store.correlativos[k] = Math.max(store.correlativos[k] || 0, c.correlativo);
  c.correlativo = store.correlativos[k] + 1;
  if ($("correlativo")) $("correlativo").value = c.correlativo;
  persistir();
  renderComprobante();
}

function simboloMoneda(m) { return { PEN: "S/", USD: "US$", EUR: "€" }[m] || m; }
function fmtMon(n) { return `${simboloMoneda(store.comprobante.moneda)} ${(n || 0).toFixed(2)}`; }
function fmtMonNeg(n) { return n > 0 ? `-${fmtMon(n)}` : fmtMon(0); }

// ── Persistencia ──
function persistir() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      items: store.items, globales: store.globales,
      comprobante: store.comprobante,
      correlativos: store.correlativos,
    }));
    const el = $("persistInfo");
    if (el) el.textContent = `Auto-guardado · ${new Date().toLocaleTimeString("es-PE")}`;
  } catch (e) {
    console.warn("No se pudo persistir:", e);
  }
}
function cargar() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.items))    store.items    = data.items;
    if (Array.isArray(data.globales)) store.globales = data.globales;
    if (data.comprobante)             store.comprobante = { ...comprobanteDefault(), ...data.comprobante };
    if (data.correlativos && typeof data.correlativos === "object") store.correlativos = data.correlativos;
  } catch (e) {
    console.warn("No se pudo cargar:", e);
  }
}
function resetTodo() {
  if (!confirm("¿Borrar todos los productos, globales, datos del comprobante y contadores de correlativo?")) return;
  store.items    = [];
  store.globales = [];
  store.comprobante = comprobanteDefault();
  store.correlativos = {};
  localStorage.removeItem(STORAGE_KEY);
  escribirComprobanteForm();
  renderItemList();
  renderGlobalesList();
  if ($("codigoProducto")) $("codigoProducto").value = siguienteCodigoProducto();
  onCambioForm();
}

// ── Export / Import ──
function exportarJSON() {
  const data = {
    items: store.items, globales: store.globales,
    comprobante: store.comprobante,
    calculado: calcComprobante({ items: store.items, globales: store.globales }),
    generadoEl: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${store.comprobante.serie}-${String(store.comprobante.correlativo).padStart(8,"0")}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  consumirCorrelativoActual();
}
function importarJSON(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.items))    store.items    = data.items;
      if (Array.isArray(data.globales)) store.globales = data.globales;
      if (data.comprobante)             store.comprobante = { ...comprobanteDefault(), ...data.comprobante };
      if (data.correlativos && typeof data.correlativos === "object") store.correlativos = data.correlativos;
      persistir();
      escribirComprobanteForm();
      if ($("codigoProducto")) $("codigoProducto").value = siguienteCodigoProducto();
      renderItemList();
      renderGlobalesList();
      onCambioForm();
    } catch (err) {
      alert("JSON inválido: " + err.message);
    }
  };
  reader.readAsText(file);
  ev.target.value = "";
}
function exportarXML() {
  const xml = generarUblXml(store);
  const blob = new Blob([xml], { type: "application/xml" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${store.comprobante.emisor.ruc}-${store.comprobante.tipo}-${store.comprobante.serie}-${String(store.comprobante.correlativo).padStart(8,"0")}.xml`;
  a.click();
  URL.revokeObjectURL(a.href);
  consumirCorrelativoActual();
}

// ════════════════════════════════════════════════════════════════════
// 4) DOM HELPERS
// ════════════════════════════════════════════════════════════════════
const $  = id => document.getElementById(id);

function populateSelect(id, entries, formatFn, getValue) {
  const sel = $(id);
  sel.innerHTML = entries.map((v, i) =>
    `<option value="${getValue(v)}" ${i === 0 ? "selected" : ""}>${formatFn(v)}</option>`
  ).join("");
}

// ════════════════════════════════════════════════════════════════════
// 5) FORM HELPERS
// ════════════════════════════════════════════════════════════════════
function leerItemForm() {
  const prodSel    = $("producto").value;
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
    codigo53Item:  $("codigo53").value,
    modoOp:        $("modoOp").value,
    valorOp:       parseFloat($("valorOp").value)    || 0,
  };
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
    serie:         $("serie").value.toUpperCase(),
    correlativo:   parseInt($("correlativo").value, 10) || 1,
    moneda:        $("moneda").value,
    fechaEmision:  $("fechaEmision").value || new Date().toISOString().slice(0, 10),
    tipoOperacion: ($("tipoOperacion") && $("tipoOperacion").value) || "0101",
    regimenIgv:    parseFloat(($("regimenIgv") && $("regimenIgv").value) || "18"),
    emisor: {
      ruc:       $("emisorRuc").value,
      razon:     $("emisorRazon").value,
      direccion: $("emisorDireccion").value,
    },
    receptor: {
      tipoDoc:   $("receptorTipoDoc").value,
      doc:       $("receptorDoc").value,
      razon:     $("receptorRazon").value,
      direccion: $("receptorDireccion").value,
    },
  };
}

function escribirComprobanteForm() {
  const c = store.comprobante;
  $("tipoComprobante").value   = c.tipo;
  $("serie").value             = c.serie;
  $("correlativo").value       = c.correlativo;
  $("moneda").value            = c.moneda;
  $("fechaEmision").value      = c.fechaEmision;
  if ($("tipoOperacion")) $("tipoOperacion").value = c.tipoOperacion || "0101";
  if ($("regimenIgv"))    $("regimenIgv").value    = String(c.regimenIgv || 18);
  $("emisorRuc").value         = c.emisor.ruc;
  $("emisorRazon").value       = c.emisor.razon;
  $("emisorDireccion").value   = c.emisor.direccion;
  $("receptorTipoDoc").value   = c.receptor.tipoDoc;
  $("receptorDoc").value       = c.receptor.doc;
  $("receptorRazon").value     = c.receptor.razon;
  $("receptorDireccion").value = c.receptor.direccion;
  renderAvisoReceptor();
}

function renderAvisoReceptor() {
  const aviso = $("avisoReceptor");
  if (!aviso) return;
  const tipo = $("tipoComprobante").value;
  const tipoDoc = $("receptorTipoDoc").value;
  // Factura (01) requiere RUC (6); Boleta (03) acepta DNI (1) o sin doc (0)
  const inconsistente = (tipo === "01" && tipoDoc !== "6")
                     || (tipo === "03" && tipoDoc === "6");
  aviso.style.display = inconsistente ? "flex" : "none";
}

// ════════════════════════════════════════════════════════════════════
// 6) RENDER
// ════════════════════════════════════════════════════════════════════
function renderTasaUI() {
  const tribKey = $("tributo").value;
  const afecKey = $("afectacion").value;
  const trib = CAT05[tribKey];
  const igvAplica = esIgvAplicable(afecKey);
  const tasaRow   = $("tasaRow");
  const tasaInput = $("tasaInput");
  const tasaLabel = document.querySelector('label[for="tasaInput"]') || tasaRow.querySelector("label");

  // ICBPER: monto fijo S/ por unidad (no porcentaje)
  if (trib.modo === "unit") {
    tasaRow.style.display = "flex";
    tasaLabel.textContent = `Monto S/ por ${$("unidad").value}`;
    tasaInput.step = "0.10";
    if (!parseFloat(tasaInput.value) || parseFloat(tasaInput.value) === 18) tasaInput.value = "0.50";
  } else if (trib.t === null && igvAplica) {
    tasaRow.style.display  = "flex";
    tasaLabel.textContent  = "Tasa del tributo (%)";
    tasaInput.step = "0.01";
  } else if (trib.t !== null) {
    tasaRow.style.display = "none";
  } else {
    tasaRow.style.display = "none";
  }

  // Aviso de combinación inválida
  const aviso = $("avisoCombinacion");
  if (aviso) {
    if (!combinacionValida(afecKey, tribKey)) {
      const sug = CAT05[tributoSugerido(afecKey)];
      aviso.style.display = "block";
      aviso.innerHTML = `⚠️ Combinación inusual: afectación <b>${afecKey}</b> con tributo <b>${tribKey}</b>. Sugerido: <b>${sug.a}</b>. <button class="btn-secondary" onclick="aplicarSugerencia()">Aplicar</button>`;
    } else {
      aviso.style.display = "none";
    }
  }
}

function aplicarSugerencia() {
  $("tributo").value = tributoSugerido($("afectacion").value);
  onCambioForm();
}

function renderCat53UI() {
  const c = getCat53($("codigo53").value);
  const info = $("desc53Info");
  const tipo = c.t === "desc" ? "Descuento" : "Cargo";
  info.textContent = `${tipo} | Nivel: ${c.l} | Afecta BI: ${c.ab ? "Sí" : "No"}`;

  const modo  = $("modoOp");
  const label = $("labelOp");
  const input = $("valorOp");

  if (c.f !== null) {
    modo.value    = "porcentaje";
    modo.disabled = true;
    label.textContent = `Porcentaje (tasa fija: ${(c.f * 100).toFixed(1)}%)`;
    input.value    = (c.f * 100).toFixed(1);
    input.disabled = true;
  } else {
    modo.disabled  = false;
    input.disabled = false;
    label.textContent = modo.value === "porcentaje" ? "Porcentaje (%)" : "Monto fijo (S/)";
    input.step        = modo.value === "porcentaje" ? "0.5" : "10";
  }
}

function renderCat53GlobalUI() {
  const c = getCat53($("codigo53Global").value);
  const info = $("desc53GlobalInfo");
  if (!c || !info) return;
  const tipo = c.t === "desc" ? "Descuento" : "Cargo";
  const baseTxt = c.base === "base+igv" ? "Base + IGV" : "Base imp.";
  info.textContent = `${tipo} | Sobre: ${baseTxt} | Afecta BI: ${c.ab ? "Sí" : "No"}`;

  const modo  = $("modoOpGlobal");
  const label = $("labelOpGlobal");
  const input = $("valorOpGlobal");

  if (c.f !== null) {
    modo.value    = "porcentaje";
    modo.disabled = true;
    label.textContent = `Porcentaje (tasa fija: ${(c.f * 100).toFixed(2)}%)`;
    input.value    = (c.f * 100).toFixed(2);
    input.disabled = true;
  } else {
    modo.disabled  = false;
    input.disabled = false;
    label.textContent = modo.value === "porcentaje" ? "Porcentaje (%)" : "Monto fijo (S/)";
    input.step        = modo.value === "porcentaje" ? "0.5" : "10";
  }
}

function renderItemList() {
  $("productCount").textContent = `${store.items.length} producto(s) en la lista`;
  const el = $("productList");
  if (!store.items.length) {
    el.innerHTML = '<p class="empty-list">Aún no hay productos agregados.</p>';
    return;
  }
  let html = '<table class="product-list-table"><thead><tr><th>#</th><th>Cód.</th><th>Producto</th><th>Cant.</th><th>Und</th><th>P.Unit</th><th>Total</th><th></th></tr></thead><tbody>';
  const regimen = (store.comprobante && store.comprobante.regimenIgv) || 18;
  const ctx = { tasaIgvOverride: regimen / 100 };
  store.items.forEach((p, i) => {
    const r = calcItem(p, ctx);
    html += `<tr>
      <td>${i+1}</td>
      <td>${p.codigo}</td>
      <td>${p.producto.length > 20 ? p.producto.slice(0,20)+"…" : p.producto}</td>
      <td>${p.cantidad.toFixed(2)}</td>
      <td>${p.unidad}</td>
      <td>${fmtMon(r.valorUnitario)}</td>
      <td>${fmtMon(r.total)}</td>
      <td><button class="btn-remove" onclick="eliminarItem(${p.id})">✕</button></td>
    </tr>`;
  });
  html += "</tbody></table>";
  html += `<div class="product-list-actions"><button class="btn-secondary" onclick="limpiarItems()">🗑 Limpiar todo</button></div>`;
  el.innerHTML = html;
}

function renderGlobalesList() {
  const el = $("globalesList");
  if (!el) return;
  $("globalesCount").textContent = `${store.globales.length} global(es)`;
  if (!store.globales.length) {
    el.innerHTML = '<p class="empty-list">Aún no hay descuentos/cargos globales.</p>';
    return;
  }
  let html = '<table class="product-list-table"><thead><tr><th>Cód.</th><th>Descripción</th><th>Modo</th><th>Valor</th><th></th></tr></thead><tbody>';
  store.globales.forEach(g => {
    const c = getCat53(g.codigo);
    html += `<tr>
      <td>${g.codigo}</td>
      <td style="text-align:left">${c ? c.d : "—"}</td>
      <td>${g.modo === "porcentaje" ? "%" : "S/"}</td>
      <td>${g.valor.toFixed(2)}</td>
      <td><button class="btn-remove" onclick="eliminarGlobal(${g.id})">✕</button></td>
    </tr>`;
  });
  html += "</tbody></table>";
  el.innerHTML = html;
}

function renderResultadoItem() {
  const item = leerItemForm();
  const regimen = (store.comprobante && store.comprobante.regimenIgv) || 18;
  const r = calcItem(item, { tasaIgvOverride: regimen / 100 });
  const cat53 = r.cat53, trib = r.trib;
  const tipoOp = cat53.t === "desc" ? "Descuento" : "Cargo";
  const proceso = construirProceso(item, r);

  let html = `<div class="metrics">`;
  html += card("Producto", item.producto);
  html += card("Cantidad", `${item.cantidad.toFixed(4)} ${item.unidad}`);
  html += card("P.Unitario", fmtMon(item.precioUnit));
  html += card("Base Imponible", fmtMon(r.baseImp));
  if (r.descItem > 0 || r.cargoItem > 0) {
    html += card(`${tipoOp} (${cat53.c})`, fmtMon(r.descItem || r.cargoItem));
    if (r.factorItem !== null && item.modoOp === "porcentaje") html += card("Factor", r.factorItem.toFixed(4));
    html += card("Base Imp.Final", fmtMon(r.biFinal));
  }
  if (r.igvAplica)     html += card(`${trib.a} (${(r.tasa*100).toFixed(2)}%)`, fmtMon(r.igv));
  else if (trib.modo === "unit") html += card(`${trib.a}`, fmtMon(r.icbper));
  else                  html += card(trib.a, "No aplica");
  html += cardTotal("TOTAL ÍTEM", fmtMon(r.total));
  html += `</div>`;

  html += `<div class="process-section"><h3>🔬 Proceso de cálculo (valores raw sin redondear)</h3>`;
  html += `<table class="process-table"><thead><tr><th>Paso</th><th>Valor Raw</th><th>Redondeado (2 dec)</th></tr></thead><tbody>`;
  for (const p of proceso) {
    const rawStr = p.raw === 0 ? "0" : p.raw.toFixed(10).replace(/\.?0+$/, "");
    html += `<tr><td>${p.paso}</td><td class="raw">${rawStr}</td><td class="rnd">${p.rnd.toFixed(2)}</td></tr>`;
  }
  html += `</tbody></table>`;
  html += `<p class="footnote">🧾 SUNAT: mantener valores raw, redondear solo el resultado final a 2 decimales.</p>`;
  html += `</div>`;

  $("resultados").innerHTML = html;
}

function construirProceso(item, r) {
  const trib = r.trib, cat53 = r.cat53;
  const totalValorRaw = item.cantidad * item.precioUnit;
  const igvBaseRaw    = r.igvAplica ? r.baseImpRaw * r.tasa : 0;
  const tipoOp        = cat53.t === "desc" ? "Descuento" : "Cargo";
  const pct           = r.factorItem !== null ? r.factorItem * 100 : 0;
  const proceso = [
    { paso: "① Cant. × P.Unit = Total V.Vta (raw)", raw: totalValorRaw, rnd: round(totalValorRaw, 2) },
  ];
  if (r.igvAplica && item.tipoPrecio === "incluido") {
    proceso.push({ paso: `② Precio c/IGV → Base = Total / (1+${r.tasa})`, raw: r.baseImpRaw, rnd: r.baseImp });
  } else {
    proceso.push({ paso: "② Base Imponible (raw)", raw: r.baseImpRaw, rnd: r.baseImp });
  }

  const opMonto = r.descItem || r.cargoItem;
  if (opMonto > 0 && cat53.l === "Ítem") {
    proceso.push({
      paso: `③ ${tipoOp} ${cat53.c} ${cat53.f !== null ? `tasa fija ${(cat53.f*100).toFixed(1)}%` : item.modoOp === "porcentaje" ? `${pct.toFixed(2)}%` : "monto fijo"}`,
      raw: opMonto, rnd: opMonto,
    });
    if (cat53.ab) {
      proceso.push({ paso: "④ Base Imp.Final = Base ∓ Desc/Cargo", raw: r.biFinalRaw, rnd: r.biFinal });
      proceso.push({ paso: r.igvAplica ? `⑤ ${trib.a} (${(r.tasa*100).toFixed(2)}%) × Base Final` : `⑤ ${trib.a}: No aplica`, raw: r.igvRaw, rnd: r.igv });
      proceso.push({ paso: "⑥ TOTAL = Base Final + IGV", raw: r.totalRaw - r.icbper, rnd: round(r.totalRaw - r.icbper, 2) });
    } else {
      proceso.push({ paso: r.igvAplica ? `④ ${trib.a} (${(r.tasa*100).toFixed(2)}%) × Base (sin afectar)` : `④ ${trib.a}: No aplica`, raw: igvBaseRaw, rnd: round(igvBaseRaw, 2) });
      proceso.push({ paso: `⑤ TOTAL = Base + IGV ${cat53.t === "desc" ? "−" : "+"} ${tipoOp}`, raw: r.totalRaw - r.icbper, rnd: round(r.totalRaw - r.icbper, 2) });
    }
  } else {
    proceso.push({ paso: r.igvAplica ? `③ ${trib.a} (${(r.tasa*100).toFixed(2)}%) × Base` : `③ ${trib.a}: No aplica`, raw: igvBaseRaw, rnd: round(igvBaseRaw, 2) });
    proceso.push({ paso: "④ TOTAL = Base + IGV", raw: r.totalRaw - r.icbper, rnd: round(r.totalRaw - r.icbper, 2) });
  }
  if (r.icbper > 0) {
    proceso.push({ paso: `⑦ ICBPER = Cant × Monto fijo`, raw: r.icbper, rnd: r.icbper });
    proceso.push({ paso: "⑧ TOTAL FINAL = Subtotal + ICBPER", raw: r.totalRaw, rnd: r.total });
  }
  return proceso;
}

function renderComprobante() {
  // Usar lista guardada o el form actual si está vacía
  const items = store.items.length ? store.items : [leerItemForm()];
  const comp  = { items, globales: store.globales };
  const c     = calcComprobante(comp);

  // Tabla de detalle
  const headers = ['#','Cód.','Cant.','Und','Descripción','P.Unit','Val.Unit.','P.Venta','Val.Venta','Desc/Cargo','Base Imp.','IGV','Total'];
  const rows = c.itemsRes.map((r, i) => {
    const p = r.item;
    return `<tr>
      <td>${i+1}</td>
      <td>${p.codigo}</td>
      <td>${p.cantidad.toFixed(2)}</td>
      <td>${p.unidad}</td>
      <td>${p.producto.length > 18 ? p.producto.slice(0,18)+"…" : p.producto}</td>
      <td>${fmtMon(p.precioUnit)}</td>
      <td>${fmtMon(r.valorUnitario)}</td>
      <td>${fmtMon(r.precioVentaUnitario)}</td>
      <td>${fmtMon(r.baseImp)}</td>
      <td>${(r.descItem + r.cargoItem) > 0 ? fmtMon(r.descItem + r.cargoItem) : "-"}</td>
      <td>${fmtMon(r.biFinal)}</td>
      <td>${r.igvAplica ? fmtMon(r.igv) : "Ex."}</td>
      <td>${fmtMon(r.total)}</td>
    </tr>`;
  }).join("");
  $("excelHead").innerHTML = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";
  $("excelBody").innerHTML = rows;

  // Resumen horizontal
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
  // Aviso: umbral consumidor final percepción (S/1,500)
  let aviso = "";
  if (c.percepcion > 0 && c.importeTotal < 1500) {
    aviso = `<div class="aviso" style="margin-top:0.6rem">
      ⚠️ <b>Régimen de percepciones (Ley 29173, modif. D.S. 317-2014-EF):</b>
      no corresponde aplicar percepción a consumidor final cuando el importe total &lt; S/ 1,500.
      Total actual: <b>S/ ${c.importeTotal.toFixed(2)}</b>. Considera removerla.
    </div>`;
  }

  $("summaryContainer").innerHTML = `
    <table id="summaryTable">
      <thead><tr>${sumCols.map(col => th(col.k)).join("")}</tr></thead>
      <tbody><tr>${sumCols.map(col => `<td${col.total ? ' class="total"' : ""}>${col.v}</td>`).join("")}</tr></tbody>
    </table>
    ${aviso}
  `;

  // Preview comprobante
  renderComprobantePreview(c);
}

function renderComprobantePreview(c) {
  const el = $("comprobantePreview");
  if (!c.itemsRes.length) { el.innerHTML = ""; return; }

  const cb = store.comprobante;
  const tipoNombre = {
    "01": "FACTURA ELECTRÓNICA",
    "03": "BOLETA ELECTRÓNICA",
    "07": "NOTA DE CRÉDITO ELECTRÓNICA",
    "08": "NOTA DE DÉBITO ELECTRÓNICA",
  }[cb.tipo] || "COMPROBANTE ELECTRÓNICO";
  const date = new Date(cb.fechaEmision + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const monedaNombre = { PEN: "SOLES", USD: "DÓLARES AMERICANOS", EUR: "EUROS" }[cb.moneda] || cb.moneda;
  const tipoDocNombre = { "1": "DNI", "6": "RUC", "4": "CE", "7": "Pasaporte", "0": "-" }[cb.receptor.tipoDoc] || "Doc";

  const lines = c.itemsRes.map((r, i) => {
    const p = r.item;
    return `<tr>
      <td style="text-align:center">${i+1}</td>
      <td style="text-align:center">${p.codigo}</td>
      <td style="text-align:center">${p.cantidad.toFixed(2)}</td>
      <td style="text-align:center">${p.unidad}</td>
      <td>${p.producto.length > 28 ? p.producto.slice(0,28)+"…" : p.producto}</td>
      <td style="text-align:right">${p.precioUnit.toFixed(2)}</td>
      <td style="text-align:right">${r.valorUnitario.toFixed(2)}</td>
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
        <div class="inv-ribbon">RUC: ${cb.emisor.ruc}</div>
      </div>
      <div class="inv-empresa">${cb.emisor.razon} — ${cb.emisor.direccion}</div>
      <div class="inv-meta">
        <span><b>Serie-N°:</b> ${serie}-${correlativo}</span>
        <span><b>Fecha:</b> ${date}</span>
        <span><b>Moneda:</b> ${monedaNombre}</span>
      </div>
      <div class="inv-cliente">
        <div><b>Cliente:</b> ${cb.receptor.razon}</div>
        <div><b>${tipoDocNombre}:</b> ${cb.receptor.doc} &nbsp;·&nbsp; <b>Dir:</b> ${cb.receptor.direccion}</div>
      </div>
      <table class="inv-table">
        <thead><tr>
          <th style="width:28px">#</th>
          <th style="width:45px">Cód.</th>
          <th style="width:45px">Cant.</th>
          <th style="width:35px">Und</th>
          <th>Descripción</th>
          <th style="width:55px">P.U</th>
          <th style="width:60px">V.Unit</th>
          <th style="width:60px">P.Vta</th>
          <th style="width:55px">D/C</th>
          <th style="width:60px">V.Venta</th>
          <th style="width:55px">IGV</th>
          <th style="width:65px">Total</th>
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

// ════════════════════════════════════════════════════════════════════
// 7) ACCIONES
// ════════════════════════════════════════════════════════════════════
function agregarItem() {
  store.items.push({ ...leerItemForm(), id: Date.now() });
  // Autoincrementar el código del producto en el form para el siguiente ítem
  $("codigoProducto").value = siguienteCodigoProducto();
  renderItemList();
  renderResultadoItem();
  renderComprobante();
  persistir();
}
function eliminarItem(id) {
  store.items = store.items.filter(p => p.id !== id);
  $("codigoProducto").value = siguienteCodigoProducto();
  renderItemList();
  renderResultadoItem();
  renderComprobante();
  persistir();
}
function limpiarItems() {
  store.items = [];
  $("codigoProducto").value = siguienteCodigoProducto();
  renderItemList();
  renderResultadoItem();
  renderComprobante();
  persistir();
}
function agregarGlobal() {
  const g = leerGlobalForm();
  if (!g.codigo) return;
  store.globales.push({ ...g, id: Date.now() });
  renderGlobalesList();
  renderComprobante();
  persistir();
}
function eliminarGlobal(id) {
  store.globales = store.globales.filter(g => g.id !== id);
  renderGlobalesList();
  renderComprobante();
  persistir();
}

function onCambioForm() {
  renderTasaUI();
  renderCat53UI();
  renderResultadoItem();
  renderComprobante();
}
function onCambioGlobalForm() {
  renderCat53GlobalUI();
  renderComprobante();
}
function onCambioComprobante() {
  store.comprobante = leerComprobanteForm();
  renderAvisoReceptor();
  renderCorrelativoInfo();
  renderRegimenInfo();
  renderResultadoItem();   // re-cálculo del ítem en preparación con régimen actual
  renderItemList();        // re-cálculo de los items guardados con régimen actual
  renderComprobante();
  persistir();
}

function renderRegimenInfo() {
  const el = $("regimenInfo");
  if (!el) return;
  const r = store.comprobante.regimenIgv;
  if (r === 10.5) {
    el.textContent = "MYPE turismo (Ley 32387) — vigente hasta 31-dic-2026.";
    el.style.background = "#fef3c7";
    el.style.color = "#92400e";
  } else {
    el.textContent = "Tasa general aplicable a operaciones gravadas (IGV+IPM = 18%).";
    el.style.background = "";
    el.style.color = "";
  }
}

function renderCorrelativoInfo() {
  const el = $("correlativoInfo");
  if (!el) return;
  const c = store.comprobante;
  const next = siguienteCorrelativo(c.tipo, c.serie);
  if (c.correlativo === next) {
    el.textContent = `(próximo disponible: ${next})`;
    el.className = "hint";
  } else if (c.correlativo < next) {
    el.textContent = `⚠️ ya usado — próximo libre: ${next}`;
    el.className = "hint warn";
  } else {
    el.textContent = `(saltarás del ${next} al ${c.correlativo})`;
    el.className = "hint warn";
  }
}

// Cuando cambia tipo o serie, autocargar el siguiente correlativo del contador
function onCambioTipoOSerie() {
  const tipo  = $("tipoComprobante").value;
  const serie = $("serie").value.toUpperCase();
  $("correlativo").value = siguienteCorrelativo(tipo, serie);
  onCambioComprobante();
}

// ════════════════════════════════════════════════════════════════════
// 8) UI HELPERS
// ════════════════════════════════════════════════════════════════════
function card(l, v)      { return `<div class="metric"><div class="m-label">${l}</div><div class="m-value">${v}</div></div>`; }
function cardTotal(l, v) { return `<div class="metric total"><div class="m-label">${l}</div><div class="m-value">${v}</div></div>`; }

const TOOLTIPS = {
  "Total Gravadas":   "Operaciones gravadas – Cat.07 códigos 10–17 (con globales que afectan BI ya descontados/sumados)",
  "Total Exoneradas": "Operaciones exoneradas – Cat.07 código 20",
  "Total Inafectas":  "Operaciones inafectas – Cat.07 códigos 30–36",
  "Total Export.":    "Operaciones de exportación – Cat.07 código 40",
  "Desc.Global":      "Descuentos globales del comprobante – Cat.53 nivel Global",
  "Cargos Global":    "Cargos globales del comprobante – Cat.53 nivel Global",
  "Total IGV":        "IGV calculado sobre la base gravada ajustada por globales",
  "ICBPER":           "Impuesto a bolsas plásticas – Cat.05 7152, monto fijo por unidad",
  "Percepción":       "Percepción – Cat.53 códigos 51 (2%), 52 (1%), 53 (0.5%), sobre Base + IGV",
  "Redondeo":         "Ajuste por redondeo – UBL: PayableRoundingAmount",
  "Importe Total":    "Importe total a pagar = Subtotal ± Globales + IGV + ICBPER + Percepción + Redondeo",
};
function tip(key) {
  const t = TOOLTIPS[key] || "";
  return t ? `<span class="tip-i" data-tip="${t}">i</span>` : "";
}
function th(key) { return `<th><span class="th-wrap">${key}${tip(key)}</span></th>`; }

// ════════════════════════════════════════════════════════════════════
// 9) INIT
// ════════════════════════════════════════════════════════════════════
async function init() {
  // 1) Cargar catálogos desde data.json (con fallback a hardcoded)
  const dataLoaded = await cargarDataJson();

  // 2) Re-instanciar el default del comprobante con los datos de data.json
  store.comprobante = comprobanteDefault();

  // 3) Cargar estado persistido del usuario (sobreescribe defaults)
  cargar();

  // Selects estáticos
  populateSelect("unidad",     Object.entries(CAT03), ([k,v]) => `${k} — ${v}`, ([k]) => k);
  populateSelect("afectacion", Object.entries(CAT07), ([k,v]) => `${k} — ${v}`, ([k]) => k);
  populateSelect("tributo",    Object.entries(CAT05), ([k,v]) => `${k} — ${v.a} — ${v.n}`, ([k]) => k);
  populateSelect("codigo53",   getCat53Items(),  e => `${e.c} — ${e.d}`, e => e.c);
  populateSelect("producto",   PRODUCTOS, e => e, e => e);
  if ($("codigo53Global")) {
    populateSelect("codigo53Global", getCat53Globals(), e => `${e.c} — ${e.d}`, e => e.c);
  }

  // Reflejar comprobante guardado en el form
  if ($("tipoComprobante")) escribirComprobanteForm();

  // Event bindings del ítem (un solo listener por elemento)
  $("producto").addEventListener("change", function () {
    $("productoCustom").disabled = this.value !== "Otro (personalizado)";
    onCambioForm();
  });
  $("tributo").addEventListener("change",    onCambioForm);
  $("afectacion").addEventListener("change", onCambioForm);
  $("codigo53").addEventListener("change",   onCambioForm);
  $("modoOp").addEventListener("change",     onCambioForm);
  $("unidad").addEventListener("change",     onCambioForm);
  $("tipoPrecio").addEventListener("change", onCambioForm);

  // Inputs del ítem: un solo listener "input"
  ["codigoProducto","cantidad","precioUnit","tasaInput","valorOp","productoCustom"].forEach(id => {
    if ($(id)) $(id).addEventListener("input", onCambioForm);
  });

  // Globales del comprobante
  if ($("codigo53Global")) {
    $("codigo53Global").addEventListener("change", onCambioGlobalForm);
    $("modoOpGlobal").addEventListener("change",   onCambioGlobalForm);
    $("valorOpGlobal").addEventListener("input",   onCambioGlobalForm);
  }

  // Comprobante (configuración global)
  // Tipo y serie tienen handler especial: sincronizan el correlativo
  if ($("tipoComprobante")) $("tipoComprobante").addEventListener("change", onCambioTipoOSerie);
  if ($("serie"))           $("serie").addEventListener("input",            onCambioTipoOSerie);

  ["moneda","receptorTipoDoc","tipoOperacion","regimenIgv"].forEach(id => {
    if ($(id)) $(id).addEventListener("change", onCambioComprobante);
  });
  ["correlativo","fechaEmision",
   "emisorRuc","emisorRazon","emisorDireccion",
   "receptorDoc","receptorRazon","receptorDireccion"].forEach(id => {
    if ($(id)) $(id).addEventListener("input", onCambioComprobante);
  });

  // Modal de fórmula (compat con celdas f-click)
  document.addEventListener("click", function (e) {
    const cell = e.target.closest(".f-click");
    if (!cell) return;
    const raw = cell.getAttribute("data-formula");
    if (!raw) return;
    const lines = raw.split("\n");
    let html = '<div class="formula-card">';
    html += `<div class="f-title">📐 ${lines[0]}</div><div class="f-body">`;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith("=")) {
        const parts = line.split("→");
        html += `<div class="f-step"><span class="f-expr">${parts[0]}</span>`;
        if (parts[1]) html += `<span class="f-rarr">→</span><span class="f-result">${parts[1]}</span>`;
        html += "</div>";
      } else {
        html += `<div class="f-line">${line}</div>`;
      }
    }
    html += "</div></div>";
    $("modalContent").innerHTML = html;
    $("modalOverlay").classList.add("visible");
  });

  // Estado inicial — autonumeración
  if ($("codigoProducto")) $("codigoProducto").value = siguienteCodigoProducto();
  renderRegimenInfo();
  renderCorrelativoInfo();

  onCambioForm();
  if ($("codigo53Global")) onCambioGlobalForm();
  renderItemList();
  renderGlobalesList();

  // Indicador de fuente de catálogos
  const info = $("persistInfo");
  if (info) {
    const fuente = DATA_JSON_META
      ? `📂 Catálogos cargados desde data.json v${DATA_JSON_META.version || "?"} (${DATA_JSON_META.actualizado || "—"})`
      : `⚠️ data.json no disponible — usando catálogos por defecto del código`;
    info.textContent = `${fuente} · Auto-guardado en este navegador.`;
  }
}

function cerrarModal() { $("modalOverlay").classList.remove("visible"); }

// ════════════════════════════════════════════════════════════════════
// 10) GENERADOR XML UBL 2.1 (SUNAT)
// ════════════════════════════════════════════════════════════════════
// Genera un XML mínimo viable conforme a la guía UBL 2.1 de SUNAT.
// NO incluye firma digital (UBLExtensions queda como placeholder) ni
// validación XSD — debe firmarse con certificado antes de enviar al SEE.

function escXml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function cdata(s) { return `<![CDATA[${String(s || "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`; }

// Mapeo afectación IGV (Cat.07) → categoría tributaria UBL + tributo
function infoTributacion(afecKey, trib, tasaReal) {
  const grupo = getCat07Grupo(afecKey);
  // Categoría tributaria UN/ECE 5305: S, E, O, G
  // TaxTypeCode UN/ECE 5153: VAT, EXC, FRE, OTH
  if (grupo === "gravada") {
    return { categoria: "S", taxTypeCode: trib.a === "IVAP" ? "VAT" : "VAT",
             taxId: trib.a === "IVAP" ? "1016" : "1000",
             taxName: trib.a === "IVAP" ? "IVAP" : "IGV",
             percent: round(tasaReal * 100, 2) };
  }
  if (grupo === "exonerada") {
    return { categoria: "E", taxTypeCode: "VAT", taxId: "9997", taxName: "EXO", percent: 0 };
  }
  if (grupo === "inafecta") {
    return { categoria: "O", taxTypeCode: "FRE", taxId: "9998", taxName: "INA", percent: 0 };
  }
  if (grupo === "exportacion") {
    return { categoria: "G", taxTypeCode: "FRE", taxId: "9995", taxName: "EXP", percent: 0 };
  }
  return { categoria: "S", taxTypeCode: "VAT", taxId: "1000", taxName: "IGV", percent: 18 };
}

function xmlInvoiceLine(r, idx, currencyId) {
  const p = r.item;
  const info = infoTributacion(p.afectacion, r.trib, r.tasa);
  const qty   = (p.cantidad || 0).toFixed(2);
  const valU  = r.valorUnitario.toFixed(2);
  const pVta  = r.precioVentaUnitario.toFixed(2);
  const base  = r.biFinal.toFixed(2);
  const igv   = r.igv.toFixed(2);

  let allowanceLine = "";
  if (r.descItem > 0 || r.cargoItem > 0) {
    const isCharge = r.cargoItem > 0;
    allowanceLine = `
    <cac:AllowanceCharge>
      <cbc:ChargeIndicator>${isCharge ? "true" : "false"}</cbc:ChargeIndicator>
      <cbc:AllowanceChargeReasonCode listAgencyName="PE:SUNAT" listName="Cargo/descuento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo53">${escXml(r.cat53.c)}</cbc:AllowanceChargeReasonCode>
      ${r.factorItem != null ? `<cbc:MultiplierFactorNumeric>${r.factorItem.toFixed(5)}</cbc:MultiplierFactorNumeric>` : ""}
      <cbc:Amount currencyID="${currencyId}">${(r.descItem || r.cargoItem).toFixed(2)}</cbc:Amount>
      <cbc:BaseAmount currencyID="${currencyId}">${r.baseImp.toFixed(2)}</cbc:BaseAmount>
    </cac:AllowanceCharge>`;
  }

  // ICBPER: línea adicional dentro de TaxTotal del ítem
  let icbperSubtotal = "";
  if (r.icbper > 0) {
    icbperSubtotal = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currencyId}">${p.cantidad.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currencyId}">${r.icbper.toFixed(2)}</cbc:TaxAmount>
        <cbc:BaseUnitMeasure unitCode="${escXml(p.unidad)}">${p.cantidad.toFixed(2)}</cbc:BaseUnitMeasure>
        <cac:TaxCategory>
          <cbc:PerUnitAmount currencyID="${currencyId}">${(p.tasaInput || 0).toFixed(2)}</cbc:PerUnitAmount>
          <cac:TaxScheme>
            <cbc:ID>7152</cbc:ID>
            <cbc:Name>ICBPER</cbc:Name>
            <cbc:TaxTypeCode>OTH</cbc:TaxTypeCode>
          </cac:TaxScheme>
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
    </cac:PricingReference>${allowanceLine}
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${currencyId}">${(r.igv + r.icbper).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currencyId}">${base}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currencyId}">${igv}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${info.percent.toFixed(2)}</cbc:Percent>
          <cbc:TaxExemptionReasonCode listAgencyName="PE:SUNAT" listName="Afectacion del IGV" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo07">${escXml(p.afectacion)}</cbc:TaxExemptionReasonCode>
          <cac:TaxScheme>
            <cbc:ID>${info.taxId}</cbc:ID>
            <cbc:Name>${info.taxName}</cbc:Name>
            <cbc:TaxTypeCode>${info.taxTypeCode}</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>${icbperSubtotal}
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${cdata(p.producto)}</cbc:Description>
      <cac:SellersItemIdentification>
        <cbc:ID>${escXml(p.codigo)}</cbc:ID>
      </cac:SellersItemIdentification>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${currencyId}">${valU}</cbc:PriceAmount>
    </cac:Price>
  </cac:InvoiceLine>`;
}

function xmlAllowanceChargeGlobal(g, c, currencyId, idx) {
  const cat53 = getCat53(g.codigo);
  const det = c.detalleGlobales[idx];
  if (!cat53 || !det) return "";
  const isCharge = cat53.t === "cargo";
  const factor = cat53.f !== null
    ? cat53.f
    : (g.modo === "porcentaje" ? g.valor / 100 : null);
  return `
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>${isCharge ? "true" : "false"}</cbc:ChargeIndicator>
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
  const isFactura = cb.tipo === "01";
  const rootEl = ["07","08"].includes(cb.tipo) ? (cb.tipo === "07" ? "CreditNote" : "DebitNote") : "Invoice";
  const rootNs = rootEl === "Invoice" ? "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
                : rootEl === "CreditNote" ? "urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
                : "urn:oasis:names:specification:ubl:schema:xsd:DebitNote-2";
  // Catálogo 51 — Tipo de Operación (configurable; default 0101 Venta interna)
  const tipoOperacion = cb.tipoOperacion || "0101";

  // Líneas
  const lineas = c.itemsRes.map((r, i) => xmlInvoiceLine(r, i, cid)).join("");

  // Allowance/Charge globales
  const allowances = (s.globales || []).map((g, i) => xmlAllowanceChargeGlobal(g, c, cid, i)).join("");

  // TaxTotal del documento (suma de subtotales por categoría)
  const taxTotalDoc = `
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${cid}">${(c.igvFinal + c.totalIcbper).toFixed(2)}</cbc:TaxAmount>
    ${c.totalGravadas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.baseGravadaAjustada.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">${c.igvFinal.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalExoneradas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalExoneradas.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme><cbc:ID>9997</cbc:ID><cbc:Name>EXO</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalInafectas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalInafectas.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme><cbc:ID>9998</cbc:ID><cbc:Name>INA</cbc:Name><cbc:TaxTypeCode>FRE</cbc:TaxTypeCode></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalExportacion > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalExportacion.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme><cbc:ID>9995</cbc:ID><cbc:Name>EXP</cbc:Name><cbc:TaxTypeCode>FRE</cbc:TaxTypeCode></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalIcbper > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">0.00</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">${c.totalIcbper.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory>
        <cac:TaxScheme><cbc:ID>7152</cbc:ID><cbc:Name>ICBPER</cbc:Name><cbc:TaxTypeCode>OTH</cbc:TaxTypeCode></cac:TaxScheme>
      </cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
  </cac:TaxTotal>`;

  // LegalMonetaryTotal
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

  // Parties
  const supplier = `
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6" schemeName="Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${escXml(cb.emisor.ruc)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName>
        <cbc:Name>${cdata(cb.emisor.razon)}</cbc:Name>
      </cac:PartyName>
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

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
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
        <!-- Firma digital del emisor (XMLDSig) — debe ser inyectada antes de enviar a SUNAT -->
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
  return xml;
}

init();
