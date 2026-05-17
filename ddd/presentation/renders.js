// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Renders del DOM
// Cada función toma datos del store + dominio y reescribe una zona del DOM.
// ════════════════════════════════════════════════════════════════════

// ── Aviso receptor (tipo doc ↔ tipo comprobante) ────────────────────
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

// ── UI dependiente del tributo (mostrar/ocultar tasa) ───────────────
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

// ── Chip list de cargos del ítem en edición ─────────────────────────
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

// ── Lista de items y de globales ────────────────────────────────────
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

// ── Tabla detalle + summary + sticky ────────────────────────────────
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

// ── Re-render orquestal ─────────────────────────────────────────────
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
