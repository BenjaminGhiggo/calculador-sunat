// ════════════════════════════════════════════════════════════════════
// DOMAIN · Cálculo puro (sin DOM, sin storage)
// Estas son las reglas matemáticas y normativas SUNAT del comprobante.
// ════════════════════════════════════════════════════════════════════

// Redondeo half-up (estándar contable peruano)
function round(n, d) { return Math.round(n * Math.pow(10, d)) / Math.pow(10, d); }

// ─────────────────────────────────────────────────────────────────────
// calcItem — calcula UN ítem.
// `ctx.tasaIgvOverride` (decimal, ej. 0.105) reemplaza la tasa fija del
//   tributo 1000 (IGV) — usado por régimen MYPE turismo.
// Los Cat.53 de nivel "Global" se ignoran aquí; se procesan en calcGlobales.
// ─────────────────────────────────────────────────────────────────────
function calcItem(item, ctx) {
  const trib = CAT05[item.tributo] || CAT05["1000"];
  const cargos = Array.isArray(item.cargosDescuentos) ? item.cargosDescuentos : [];
  const afecKey = item.afectacion;
  const grupo = getCat07Grupo(afecKey);
  const igvAplica = esIgvAplicable(afecKey);

  // Tasa efectiva del tributo principal
  let tasa = trib.t;
  if (item.tributo === "1000" && ctx && ctx.tasaIgvOverride != null) tasa = ctx.tasaIgvOverride;
  if (tasa === null && trib.modo === "pct" && igvAplica) tasa = (item.tasaInput || 0) / 100;
  else if (!igvAplica && trib.modo === "pct")            tasa = 0;
  else if (trib.modo === "unit")                          tasa = 0; // ICBPER no es %

  // Base imponible inicial (cantidad × precio)
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
  // Los que afectan BI se aplican en orden y van mutando la base acumulada.
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

  // IGV final (sobre BI ajustada)
  const igvFinalRaw = igvAplica ? biFinalRaw * tasa : 0;

  // ICBPER (tributo modo "unit"): cantidad × monto fijo en S/
  let icbper = 0;
  if (trib.modo === "unit") {
    icbper = round((item.cantidad || 0) * (item.tasaInput || 0), 2);
  }

  // Total del ítem
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

// ─────────────────────────────────────────────────────────────────────
// calcGlobales — procesa Cat.53 nivel "Global" del comprobante.
// Devuelve montos discriminados por tipo + percepción.
// ─────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────
// calcComprobante — orquesta items + globales en dos pasadas:
//   1) descuentos/cargos globales NO-percepción → ajusta base+IGV.
//   2) percepciones sobre el Base+IGV ya ajustado.
// ─────────────────────────────────────────────────────────────────────
function calcComprobante(comp) {
  const regimen = (comp.regimenIgv != null) ? comp.regimenIgv
                : (typeof store !== "undefined" && store.comprobante && store.comprobante.regimenIgv) || 18;
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
