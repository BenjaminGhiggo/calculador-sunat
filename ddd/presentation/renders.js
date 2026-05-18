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
    const nombreComp = (CAT01[tipo] && CAT01[tipo].nombre) || tipo;
    const docEsperado = tipo === "01" ? "RUC" : "DNI";
    el.innerHTML = `⚠️ <span><b>${nombreComp}</b> normalmente lleva <b>${docEsperado}</b> en el receptor.</span>`;
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
  // Lookup desde REGIMENES_IGV (dominio) — single source of truth
  const reg = (typeof REGIMENES_IGV !== "undefined") && REGIMENES_IGV.find(x => x.valor === r);
  el.textContent = reg ? reg.notaUi : `Tasa ${r}%`;
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

// ── Panel de ecuación en vivo del ítem (con sustento normativo) ───
// Muestra paso a paso cómo se calcula este producto: base, IGV, total.
// Cada paso lleva su tooltip con norma exacta.
function renderFormulaPanel() {
  const el = $("formulaPanel");
  if (!el) return;
  // Si campos clave no están listos, ocultar
  const cant   = parseFloat($("cantidad").value) || 0;
  const precio = parseFloat($("precioUnit").value) || 0;
  if (cant <= 0 || precio < 0) { el.hidden = true; el.innerHTML = ""; return; }

  // Calcular el ítem con la lógica del dominio
  const item = leerItemForm();
  const regimen = (store.comprobante && store.comprobante.regimenIgv) || 18;
  const r = calcItem(item, { tasaIgvOverride: regimen / 100 });
  const trib  = r.trib;
  const tasaPct = (r.tasa * 100).toFixed(2);
  const sim = simboloMoneda(store.comprobante.moneda);
  const fmt = n => `${sim} ${(n || 0).toFixed(2)}`;
  const fmtRaw = n => (n === 0 || isNaN(n) ? "0" : Number(n).toFixed(10).replace(/\.?0+$/, ""));

  // Construir filas según el grupo de afectación
  const filas = [];

  // 1) Total bruto
  const totalValorRaw = cant * precio;
  if (item.tipoPrecio === "incluido" && r.igvAplica) {
    filas.push({
      label: "Total con IGV ingresado",
      eq: `${cant} × ${fmt(precio)}`,
      result: fmt(totalValorRaw),
      tip: "Cantidad × precio unitario ingresado (que ya incluye IGV). TUO Ley IGV (D.S. 055-99-EF) Art. 14.",
    });
    filas.push({
      label: "Base imponible (V.V.)",
      eq: `${fmt(totalValorRaw)} ÷ (1 + ${tasaPct}%)`,
      result: fmt(r.baseImp),
      tip: "Fórmula inversa: cuando el precio ingresado incluye IGV, la base se obtiene dividiendo entre (1+tasa). Derivado del Art. 14 TUO Ley IGV.",
    });
  } else {
    filas.push({
      label: "Base imponible (V.V.)",
      eq: `${cant} × ${fmt(precio)}`,
      result: fmt(r.baseImp),
      tip: "Valor Venta = Cantidad × Valor Unitario (sin IGV). TUO Ley IGV (D.S. 055-99-EF) Art. 14. UBL: cbc:LineExtensionAmount.",
    });
  }

  // 2) Descuentos/cargos por ítem que afectan BI (si hay)
  if (r.cargosResultado && r.cargosResultado.length) {
    let biAcum = r.baseImp;
    let acumDelta = 0;
    for (const cr of r.cargosResultado) {
      if (!cr.afectaBI) continue;
      const signo = cr.cat53.t === "desc" ? -1 : 1;
      const factor = cr.factor != null ? (cr.factor * 100).toFixed(2) + "%" : fmt(cr.monto);
      filas.push({
        label: `${cr.cat53.t === "desc" ? "Descuento" : "Cargo"} Cat.53 ${cr.cat53.c}`,
        eq: cr.factor != null ? `${fmt(r.baseImp)} × ${factor}` : factor,
        result: (signo > 0 ? "+" : "−") + fmt(cr.monto),
        tip: `${cr.cat53.d}. Catálogo SUNAT N° 53. Como afecta BI (ab=true), reduce/aumenta la base imponible y recalcula el IGV. Reglamento IGV (D.S. 029-94-EF) Art. 5 num. 13.`,
      });
      biAcum += signo * cr.monto;
      acumDelta += signo * cr.monto;
    }
    if (acumDelta !== 0) {
      filas.push({
        label: "Base imp. final (BI)",
        eq: `${fmt(r.baseImp)} ${acumDelta > 0 ? "+" : "−"} ${fmt(Math.abs(acumDelta))}`,
        result: fmt(r.biFinal),
        tip: "Base imponible ajustada por descuentos/cargos que afectan BI. Sobre este monto se calcula el IGV.",
      });
    }
  }

  // 3) IGV (o leyenda de no aplica)
  if (r.igvAplica) {
    filas.push({
      label: `${trib.a} (${tasaPct}%)`,
      eq: `${fmt(r.biFinal)} × ${tasaPct}%`,
      result: fmt(r.igv),
      tip: `IGV = Base Imponible × tasa. TUO Ley IGV (D.S. 055-99-EF) Art. 17. Tasa ${tasaPct}% ${regimen === 10.5 ? "(MYPE turismo, Leyes 31556+32219+32387)" : "(general)"}.`,
    });
  } else {
    const grupoNombre = {
      exonerada:   "Exonerado (Apéndice I Ley IGV)",
      inafecta:    "Inafecto (Apéndice II Ley IGV)",
      exportacion: "Exportación (Art. 33 Ley IGV)",
    }[r.grupo] || "No gravado";
    filas.push({
      label: "IGV",
      eq: grupoNombre,
      result: fmt(0),
      tip: `Esta operación no causa IGV. Afectación Cat.07 = ${item.afectacion}. ${r.grupo === "exonerada" ? "Exoneraciones del Apéndice I del TUO Ley IGV." : r.grupo === "inafecta" ? "Operaciones del Apéndice II — fuera del ámbito del impuesto." : r.grupo === "exportacion" ? "Exportación: tasa 0%, saldo a favor del exportador (Art. 33 Ley IGV)." : "Verificar la afectación elegida."}`,
    });
  }

  // 4) Descuentos/cargos que no afectan BI
  if (r.cargosResultado) {
    for (const cr of r.cargosResultado) {
      if (cr.afectaBI) continue;
      const signo = cr.cat53.t === "desc" ? -1 : 1;
      filas.push({
        label: `${cr.cat53.t === "desc" ? "Descuento" : "Cargo"} Cat.53 ${cr.cat53.c} (no afecta BI)`,
        eq: cr.factor != null ? `${fmt(r.baseImp)} × ${(cr.factor*100).toFixed(2)}%` : fmt(cr.monto),
        result: (signo > 0 ? "+" : "−") + fmt(cr.monto),
        tip: `${cr.cat53.d}. NO recalcula el IGV; solo ajusta el total. Catálogo SUNAT N° 53.`,
      });
    }
  }

  // 5) ICBPER si aplica
  if (r.icbper > 0) {
    filas.push({
      label: "ICBPER (Cat.05 7152)",
      eq: `${cant} × ${fmt(item.tasaInput || 0)}`,
      result: fmt(r.icbper),
      tip: "ICBPER = Cantidad × monto fijo por bolsa (S/0.50 desde 2023). Ley 30884. NO es porcentaje sobre base; se registra como tributo OTH.",
    });
  }

  // 6) Total final
  filas.push({
    label: "TOTAL del ítem",
    eq: r.igvAplica
      ? `${fmt(r.biFinal)} + ${fmt(r.igv)}${r.icbper > 0 ? " + " + fmt(r.icbper) : ""}`
      : fmt(r.biFinal),
    result: fmt(r.total),
    tip: "Total a pagar de esta línea. UBL: cac:InvoiceLine/cbc:LineExtensionAmount (BI) + cac:TaxTotal (IGV).",
    isTotal: true,
  });

  // Build HTML
  const grupoTxt = {
    gravada:     "Operación gravada con IGV",
    exonerada:   "Operación exonerada",
    inafecta:    "Operación inafecta",
    exportacion: "Operación de exportación",
  }[r.grupo] || "Operación";
  const emoji = r.grupo === "gravada" ? "🧮" : r.grupo === "exonerada" ? "🟢" : r.grupo === "inafecta" ? "⚪" : "🌍";
  const claseGrupo = r.grupo === "gravada" ? "" : "fp-exonerada";
  const tasaNorma  = regimen === 10.5
    ? "Tasa MYPE turismo (Leyes 31556 + 32219 + 32387) — vigente hasta 31-dic-2026."
    : "Tasa IGV general 18% (15.5% IGV + 2.5% IPM en 2026 por Ley 32387).";

  el.className = `formula-panel ${claseGrupo}`;
  el.hidden = false;
  el.innerHTML = `
    <div class="fp-head">
      <span class="fp-head-emoji">${emoji}</span>
      <span>Ecuación en vivo · ${grupoTxt}</span>
      <span class="fp-help" style="margin-left:auto">
        <span class="help" data-tip="Este panel muestra cómo se calcula el ítem actual paso a paso, con referencia a la norma SUNAT. Los números se actualizan en vivo mientras editas el formulario. Sustento: TUO Ley IGV (D.S. 055-99-EF) Arts. 13, 14 y 17 · Reglamento IGV (D.S. 029-94-EF) Art. 5 · R.S. 117-2017/SUNAT Anexo I.">?</span>
      </span>
    </div>
    ${filas.map(f => `
      <div class="fp-row${f.isTotal ? " fp-total" : ""}">
        <span class="fp-label">${escapeHtml(f.label)}</span>
        <span class="fp-eq">${escapeHtml(f.eq)}</span>
        <span class="fp-arrow">=</span>
        <span class="fp-result">${escapeHtml(f.result)}</span>
        ${f.tip ? `<span class="fp-help"><span class="help" data-tip="${escapeHtml(f.tip)}">?</span></span>` : ""}
      </div>
    `).join("")}
    <div class="fp-foot">
      <span class="fp-foot-emoji">📜</span>
      <span>${tasaNorma}</span>
    </div>
  `;
}

// ── UI del precio: relabel del input + hint con conversión equivalente ──
// Si el usuario eligió "Valor unitario (sin IGV)", muestra como hint el
// precio unitario equivalente (con IGV). Y viceversa. Cero efecto sobre cálculo.
function renderPrecioUI() {
  const tipo    = $("tipoPrecio").value;
  const precio  = parseFloat($("precioUnit").value) || 0;
  const afecKey = $("afectacion").value;
  const tribKey = $("tributo").value;
  const trib    = CAT05[tribKey];
  const igvAplica = esIgvAplicable(afecKey);

  // Tasa efectiva (respeta override de régimen MYPE)
  const regimen = (store.comprobante && store.comprobante.regimenIgv) || 18;
  let tasa = trib.t;
  if (tribKey === "1000") tasa = regimen / 100;
  if (tasa === null && trib.modo === "pct" && igvAplica) tasa = (parseFloat($("tasaInput").value) || 0) / 100;
  if (!igvAplica || trib.modo === "unit") tasa = 0;

  const label = $("precioUnitLabel");
  const hint  = $("precioConvHint");
  if (!label || !hint) return;

  const sim = simboloMoneda(store.comprobante.moneda);
  if (tipo === "incluido") {
    label.textContent = `Precio unitario — con IGV (${sim})`;
    if (igvAplica && precio > 0 && tasa > 0) {
      const valor = precio / (1 + tasa);
      const baseIgv = precio - valor;
      hint.innerHTML = `Equivale a <b>valor unitario ${fmtMon(valor)}</b> + IGV ${fmtMon(baseIgv)} · base = precio ÷ (1 + ${(tasa*100).toFixed(2)}%)`;
      hint.hidden = false;
    } else if (!igvAplica && precio > 0) {
      hint.textContent = `Operación no gravada — valor unitario = precio unitario = ${fmtMon(precio)}`;
      hint.hidden = false;
    } else {
      hint.hidden = true;
    }
  } else {
    label.textContent = `Valor unitario — sin IGV (${sim})`;
    if (igvAplica && precio > 0 && tasa > 0) {
      const precioConIgv = precio * (1 + tasa);
      const baseIgv = precioConIgv - precio;
      hint.innerHTML = `Equivale a <b>precio unitario ${fmtMon(precioConIgv)}</b> (+ IGV ${fmtMon(baseIgv)}) · precio = valor × (1 + ${(tasa*100).toFixed(2)}%)`;
      hint.hidden = false;
    } else if (!igvAplica && precio > 0) {
      hint.textContent = `Operación no gravada — valor unitario = precio unitario = ${fmtMon(precio)}`;
      hint.hidden = false;
    } else {
      hint.hidden = true;
    }
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
  // Headers coherentes con la norma SUNAT: V.U. (sin IGV) y P.U. (con IGV) son
  // siempre distintos cuando hay IGV. Relación: P.U. = V.U. × (1 + tasa).
  const headers = [
    { k: "#",       t: "" },
    { k: "Cód.",    t: "" },
    { k: "Producto",t: "" },
    { k: "Cant.",   t: "" },
    { k: "Und",     t: "" },
    { k: "V.U.",    t: "Valor unitario — sin IGV. Base imponible por unidad. TUO Ley IGV (D.S. 055-99-EF) Art. 14. UBL: cbc:PriceAmount." },
    { k: "P.U.",    t: "Precio unitario — con IGV. P.U. = V.U. × (1 + tasa). Reglamento de Comprobantes de Pago (R.S. 007-99) Art. 8. UBL: cac:AlternativeConditionPrice." },
    { k: "Total",   t: "Total de la línea = BI + IGV ± cargos/descuentos del ítem + ICBPER." },
    { k: "",        t: "" },
  ];
  let html = '<table class="product-list-table"><thead><tr>' +
    headers.map(h =>
      `<th><span class="th-wrap">${h.k}${h.t ? `<span class="tip-i" data-tip="${escapeHtml(h.t)}">i</span>` : ""}</span></th>`
    ).join("") +
    '</tr></thead><tbody>';
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
      <td>${r.igvAplica ? fmtMon(r.precioVentaUnitario) : "—"}</td>
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
  // Columnas alineadas a la norma SUNAT:
  //   V.U. = Valor unitario (sin IGV) — Ley del IGV D.S. 055-99-EF art. 14
  //   P.U. = Precio unitario (con IGV) — Reglamento de Comprobantes de Pago. P.U. = V.U. × (1 + tasa)
  //   V.V. = Valor Venta = V.U. × cantidad (base imponible antes de descuentos)
  //   BI   = Base Imponible final (V.V. tras descuentos que afectan BI)
  const headers = [
    { k: '#',           t: '' },
    { k: 'Cód.',        t: 'Código del producto — propio del emisor o estándar UNSPSC (Cat.25 SUNAT, 8 dígitos). R.S. 340-2017/SUNAT.' },
    { k: 'Cant.',       t: 'Cantidad por línea. Formato UBL n(12,10): hasta 12 enteros y 10 decimales. R.S. 117-2017/SUNAT Anexo I, campo cbc:InvoicedQuantity.' },
    { k: 'Und',         t: 'Unidad de medida — Catálogo SUNAT N° 03 basado en UN/ECE Rec. 20. NIU (unidad), KGM, MTR, LTR, ZZ (servicio).' },
    { k: 'Descripción', t: 'Descripción del bien o servicio. Requisito mínimo de la factura/boleta. R.S. 007-99/SUNAT Art. 8 num. 1.7 y 3.5. UBL: cbc:Description.' },
    { k: 'V.U. (sin IGV)', t: 'Valor Unitario — base imponible por unidad, sin IGV. TUO Ley IGV (D.S. 055-99-EF) Art. 14. UBL: cbc:PriceAmount (raíz). Formato n(12,10), hasta 10 decimales.' },
    { k: 'P.U. (con IGV)', t: 'Precio Unitario — incluye IGV. P.U. = V.U. × (1 + tasa). Reglamento de Comprobantes de Pago (R.S. 007-99) Art. 8. UBL: cac:AlternativeConditionPrice con PriceTypeCode=01.' },
    { k: 'V.V.',        t: 'Valor Venta del ítem = V.U. × Cantidad. Es la base imponible antes de descuentos. TUO Ley IGV Art. 14.' },
    { k: 'Desc/Cargo',  t: 'Descuentos o cargos por ítem (Cat.53 nivel Ítem, códigos 00/01/07/47/48/54). Reducen o aumentan la base si "afectan BI". Anexo 8 R.S. 244-2019.' },
    { k: 'BI',          t: 'Base Imponible final = V.V. ∓ descuentos/cargos que afectan BI. Sobre esta cantidad se calcula el IGV. Reglamento IGV (D.S. 029-94-EF) Art. 5.13.' },
    { k: 'IGV',         t: 'IGV = BI × tasa. Tasa: 18% general (D.S. 055-99-EF Art. 17) o 10.5% MYPE turismo (Leyes 32219 y 32387, vigente hasta 31-dic-2026).' },
    { k: 'Total',       t: 'Total ítem = BI + IGV ± cargos/descuentos que no afectan BI + ICBPER si aplica. Suma de la línea reportada en cbc:LineExtensionAmount.' },
  ];
  const rows = c.itemsRes.map((r, i) => {
    const p = r.item;
    return `<tr>
      <td>${i+1}</td><td>${escapeHtml(p.codigo)}</td>
      <td>${p.cantidad.toFixed(2)}</td><td>${escapeHtml(p.unidad)}</td>
      <td>${escapeHtml(p.producto.length > 18 ? p.producto.slice(0,18)+"…" : p.producto)}</td>
      <td>${fmtMon(r.valorUnitario)}</td>
      <td>${r.igvAplica ? fmtMon(r.precioVentaUnitario) : "—"}</td>
      <td>${fmtMon(r.baseImp)}</td>
      <td>${(r.descItem + r.cargoItem) > 0 ? fmtMon(r.descItem + r.cargoItem) : "-"}</td>
      <td>${fmtMon(r.biFinal)}</td>
      <td>${r.igvAplica ? fmtMon(r.igv) : "Ex."}</td>
      <td>${fmtMon(r.total)}</td>
    </tr>`;
  }).join("");
  $("excelHead").innerHTML = "<tr>" + headers.map(h =>
    `<th><span class="th-wrap">${h.k}${h.t ? `<span class="tip-i" data-tip="${escapeHtml(h.t)}">i</span>` : ""}</span></th>`
  ).join("") + "</tr>";
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
  // Lookup CAT01 (dominio)
  const tipoNombreCorto = (CAT01[cb.tipo] && CAT01[cb.tipo].nombre) || cb.tipo;
  $("qsDoc").textContent  = `${tipoNombreCorto} · ${cb.serie}-${String(cb.correlativo).padStart(8,"0")}`;

  // Total inline en el header (visible cuando está colapsado en mobile)
  const sticky = $("summarySticky");
  if (sticky) {
    let h3 = sticky.querySelector("h3");
    if (h3 && !h3.querySelector(".qsum-total-inline")) {
      const span = document.createElement("span");
      span.className = "qsum-total-inline";
      h3.appendChild(span);
    }
    const inline = sticky.querySelector(".qsum-total-inline");
    if (inline) inline.textContent = fmtMon(c.importeTotal);
  }
}

// ── Re-render orquestal ─────────────────────────────────────────────
function renderAll() {
  renderSerieHint();
  renderRegimenInfo();
  renderCorrelativoInfo();
  renderAvisoReceptor();
  renderTasaUI();
  renderPrecioUI();
  renderFormulaPanel();
  renderCat53UI();
  renderCat53GlobalUI();
  renderItemCargosList();
  renderItemList();
  renderGlobalesList();
  renderComprobante();
}
