// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Previews multi-canal del comprobante
// 7 layouts del mismo cálculo: SUNAT, ticket POS, retail, B2B, ecommerce,
// email, WhatsApp. Cero efecto sobre el cálculo o el XML — solo formato visual.
// ════════════════════════════════════════════════════════════════════

// Canales de preview — orden mostrado en el selector + label e icon + descripción
const CANALES_PREVIEW = [
  { id: "sunat",      icon: "📃", label: "SUNAT oficial (Boleta/Factura electrónica)",        desc: "SUNAT oficial — exactamente lo que se imprime / se envía al PSE." },
  { id: "ticket",     icon: "🧾", label: "Ticket POS / bodega (impresora térmica 58mm)",       desc: "Ticket POS térmico 58 mm — formato típico de bodega o cajero." },
  { id: "consumidor", icon: "🛒", label: "Consumidor final retail (precio total)",             desc: "Consumidor final retail — pizarra / etiqueta con precio total." },
  { id: "b2b",        icon: "💼", label: "Cotización B2B (neto + IGV)",                        desc: "Cotización B2B — comprador empresarial necesita ver neto + IGV." },
  { id: "ecommerce",  icon: "🌐", label: "Ecommerce / marketplace (precio destacado + cuotas)", desc: "Marketplace (Mercado Libre / web) — precio destacado y cuotas." },
  { id: "email",      icon: "✉️", label: "Email a cliente",                                    desc: "Email transaccional al cliente — formato HTML resumido." },
  { id: "whatsapp",   icon: "💬", label: "Mensaje WhatsApp",                                   desc: "Mensaje de WhatsApp — texto plano breve, para reenviar al cliente." },
  { id: "promo",      icon: "🎁", label: "Promoción — Antes vs Ahora",                          desc: "Pieza promocional: precio original tachado vs precio final con descuento destacado." },
  { id: "sunatPromo", icon: "📃", label: "SUNAT oficial — con Precio ofrecido vs Final",         desc: "Mismo formato del comprobante SUNAT, con columnas adicionales que muestran el precio ofrecido (sin descuento) y el descuento aplicado por línea." },
];

// Lookup rápido id → desc (retrocompat con código previo)
const CANALES_INFO = CANALES_PREVIEW.reduce((acc, c) => (acc[c.id] = c.desc, acc), {});

// ── Helpers de "precio antes vs después" para mostrar descuento explícito ─
// "Precio original" = lo que sería el total si NO hubiera descuentos/cargos
// aplicados al ítem (pero conservando ICBPER, que no es descuento sino tributo).
function precioOriginalItem(r) {
  const igvBruto = r.igvAplica ? r.baseImpRaw * r.tasa : 0;
  return r.baseImpRaw + igvBruto + r.icbper;
}
function descuentoTotalItem(r) {
  const orig = precioOriginalItem(r);
  const dif  = orig - r.total;
  return dif > 0.005 ? dif : 0;  // solo si efectivamente hay ahorro
}
function ahorroComprobante(c) {
  let orig = 0;
  for (const r of c.itemsRes) orig += precioOriginalItem(r);
  // Sumar globales: descuentos restan, cargos suman al original-sin-ajustes
  const globalAjusteOriginal = c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI
                            - c.descGlobalAfectaBI - c.descGlobalNoAfectaBI;
  const ajusteFinalConPercep = -c.percepcion;
  // Original es lo que sería sin descuentos globales tampoco
  const totalSinGlob = orig + c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI;
  const ahorro = totalSinGlob - c.importeTotal + ajusteFinalConPercep;
  return ahorro > 0.005 ? ahorro : 0;
}

function renderComprobantePreview(c) {
  const el = $("comprobantePreview");
  if (!c.itemsRes.length) { el.innerHTML = ""; return; }
  const canal = ($("canalPreview") && $("canalPreview").value) || "sunat";
  const hint = $("canalHint");
  if (hint) hint.textContent = CANALES_INFO[canal] || "";

  switch (canal) {
    case "ticket":     return el.innerHTML = previewTicket(c);
    case "consumidor": return el.innerHTML = previewConsumidor(c);
    case "b2b":        return el.innerHTML = previewB2B(c);
    case "ecommerce":  return el.innerHTML = previewEcommerce(c);
    case "email":      return el.innerHTML = previewEmail(c);
    case "whatsapp":   return el.innerHTML = previewWhatsApp(c);
    case "promo":      return el.innerHTML = previewPromo(c);
    case "sunatPromo": return el.innerHTML = previewSunatPromo(c);
    default:           return el.innerHTML = previewSunat(c);
  }
}

// ── 1) SUNAT oficial ──
function previewSunat(c) {
  const cb = store.comprobante;
  // Lookups desde el dominio (CAT01, CAT02, CAT06) — single source of truth
  const tipoNombre    = (CAT01[cb.tipo] && CAT01[cb.tipo].largo) || "COMPROBANTE ELECTRÓNICO";
  const monedaNombre  = nombreLargoMoneda(cb.moneda);
  const tipoDocNombre = (CAT06[cb.receptor.tipoDoc] && CAT06[cb.receptor.tipoDoc].corto) || "Doc";
  const date = new Date(cb.fechaEmision + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const lines = c.itemsRes.map((r, i) => {
    const p = r.item;
    return `<tr>
      <td style="text-align:center">${i+1}</td><td style="text-align:center">${escapeHtml(p.codigo)}</td>
      <td style="text-align:center">${p.cantidad.toFixed(2)}</td><td style="text-align:center">${escapeHtml(p.unidad)}</td>
      <td>${escapeHtml(p.producto.length > 28 ? p.producto.slice(0,28)+"…" : p.producto)}</td>
      <td style="text-align:right">${r.valorUnitario.toFixed(2)}</td>
      <td style="text-align:right">${r.igvAplica ? r.precioVentaUnitario.toFixed(2) : "—"}</td>
      <td style="text-align:right">${(r.descItem + r.cargoItem).toFixed(2)}</td>
      <td style="text-align:right">${r.baseImp.toFixed(2)}</td>
      <td style="text-align:right">${r.igvAplica ? r.igv.toFixed(2) : "0.00"}</td>
      <td style="text-align:right">${r.total.toFixed(2)}</td>
    </tr>`;
  }).join("");
  return `
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
          <th style="width:35px">Und</th><th>Descripción</th>
          <th style="width:60px">V.U.<br/><small>sin IGV</small></th>
          <th style="width:60px">P.U.<br/><small>con IGV</small></th>
          <th style="width:55px">D/C</th>
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

// ── 2) Ticket POS térmico (58 mm) ──
function previewTicket(c) {
  const cb = store.comprobante;
  // Tipos cortos (3 chars máx) derivados del nombre del catálogo
  const TIPOS_CORTOS = { "01": "FACTURA", "03": "BOLETA", "07": "NC", "08": "ND" };
  const tipoNombre    = TIPOS_CORTOS[cb.tipo] || "DOC";
  const tipoDocItem   = CAT06[cb.receptor.tipoDoc];
  const tipoDocNombre = (tipoDocItem && cb.receptor.tipoDoc !== "0") ? tipoDocItem.corto : "";
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const date = new Date(cb.fechaEmision + "T00:00:00").toLocaleDateString("es-PE");
  const time = new Date().toLocaleTimeString("es-PE").slice(0, 5);
  const pad = (l, r, w = 32) => {
    const s = String(l), e = String(r);
    const sp = Math.max(1, w - s.length - e.length);
    return s + " ".repeat(sp) + e;
  };
  const lineas = c.itemsRes.map(r => {
    const p = r.item;
    const nombre = p.producto.slice(0, 30);
    const cantTxt = `${p.cantidad.toFixed(2)} x ${fmtMon(r.precioVentaUnitario)}`;
    const filas = [
      escapeHtml(nombre),
      escapeHtml(pad(cantTxt, fmtMon(r.total), 32)),
    ];
    // Línea adicional si hay descuento/cargo en el ítem
    if (r.descItem > 0) {
      filas.push(escapeHtml(pad("   Desc. ítem:", "-" + fmtMon(r.descItem), 32)));
    }
    if (r.cargoItem > 0) {
      filas.push(escapeHtml(pad("   Cargo ítem:", "+" + fmtMon(r.cargoItem), 32)));
    }
    return filas.join("\n");
  }).join("\n");

  return `
    <div class="preview-ticket">
      <pre>${escapeHtml(cb.emisor.razon.toUpperCase())}
RUC: ${escapeHtml(cb.emisor.ruc)}
${escapeHtml(cb.emisor.direccion)}
--------------------------------
${tipoNombre} ELECTRÓNICA
${serie}-${correlativo}
${date}  ${time}
--------------------------------
${tipoDocNombre ? tipoDocNombre + ": " + escapeHtml(cb.receptor.doc) : ""}
${cb.receptor.razon !== "CLIENTE VARIOS" ? "Cliente: " + escapeHtml(cb.receptor.razon) : ""}
--------------------------------
${lineas}
--------------------------------
${pad("Op. Gravadas", fmtMon(c.totalGravadas))}
${c.totalExoneradas > 0 ? pad("Op. Exoneradas", fmtMon(c.totalExoneradas)) + "\n" : ""}${(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI) > 0 ? pad("Desc. Global", "-" + fmtMon(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI)) + "\n" : ""}${(c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI) > 0 ? pad("Cargo Global", "+" + fmtMon(c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI)) + "\n" : ""}${pad("IGV", fmtMon(c.igvFinal))}
${c.totalIcbper > 0 ? pad("ICBPER", fmtMon(c.totalIcbper)) + "\n" : ""}${c.percepcion > 0 ? pad("Percepción", fmtMon(c.percepcion)) + "\n" : ""}--------------------------------
${pad("TOTAL", fmtMon(c.importeTotal))}
--------------------------------
   ¡GRACIAS POR SU COMPRA!
Representación impresa CPE
  Consulte en sunat.gob.pe</pre>
    </div>
  `;
}

// ── 3) Consumidor final retail ──
function previewConsumidor(c) {
  const totalItems = c.itemsRes.length;
  const items = c.itemsRes.slice(0, 6).map(r => {
    const p = r.item;
    return `<div class="pc-row">
      <span class="pc-name">${escapeHtml(p.producto)}</span>
      <span class="pc-qty">×${p.cantidad}</span>
      <span class="pc-price">${fmtMon(r.total)}</span>
    </div>`;
  }).join("");
  const extra = totalItems > 6 ? `<div class="pc-more">+ ${totalItems - 6} producto(s) más…</div>` : "";
  return `
    <div class="preview-consumidor">
      <div class="pc-header">🛒 ${escapeHtml(store.comprobante.emisor.razon)}</div>
      <div class="pc-items">${items}${extra}</div>
      <div class="pc-total">
        <span>TOTAL A PAGAR</span>
        <span class="pc-amount">${fmtMon(c.importeTotal)}</span>
      </div>
      <div class="pc-note">IGV incluido · ${totalItems} producto(s)</div>
    </div>
  `;
}

// ── 4) Cotización B2B ──
function previewB2B(c) {
  const cb = store.comprobante;
  const date = new Date(cb.fechaEmision + "T00:00:00").toLocaleDateString("es-PE");
  const rows = c.itemsRes.map((r, i) => {
    const p = r.item;
    // Descuento/cargo de la línea con signo
    const dcMonto = r.descItem - r.cargoItem;  // positivo = descuento, negativo = cargo
    let dcCell = "-";
    if (dcMonto > 0) dcCell = `<span style="color:var(--tq-success);font-weight:600">-${fmtMon(dcMonto)}</span>`;
    else if (dcMonto < 0) dcCell = `<span style="color:var(--tq-warn);font-weight:600">+${fmtMon(-dcMonto)}</span>`;
    return `<tr>
      <td>${i+1}</td>
      <td>${escapeHtml(p.producto)}</td>
      <td style="text-align:center">${p.cantidad}</td>
      <td style="text-align:right">${fmtMon(r.valorUnitario)}</td>
      <td style="text-align:right">${dcCell}</td>
      <td style="text-align:right">${fmtMon(r.biFinal)}</td>
    </tr>`;
  }).join("");
  const tasaIgv = ((store.comprobante.regimenIgv || 18)).toFixed(1);
  return `
    <div class="preview-b2b">
      <div class="b2b-head">
        <div>
          <h3>COTIZACIÓN</h3>
          <small>Ref: ${escapeHtml(cb.serie)}-${String(cb.correlativo).padStart(6,"0")}</small>
        </div>
        <div class="b2b-emisor">
          <b>${escapeHtml(cb.emisor.razon)}</b><br>
          RUC ${escapeHtml(cb.emisor.ruc)}<br>
          ${escapeHtml(cb.emisor.direccion)}
        </div>
      </div>
      <div class="b2b-cliente">
        <b>Cliente:</b> ${escapeHtml(cb.receptor.razon)} ·
        RUC ${escapeHtml(cb.receptor.doc)} ·
        <b>Fecha:</b> ${date}
      </div>
      <table class="b2b-table">
        <thead><tr><th>#</th><th>Descripción</th><th>Cant.</th><th>P. Unit. (sin IGV)</th><th>Desc/Cargo</th><th>Subtotal</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="b2b-totales">
        <div><span>Subtotal (gravado):</span><span>${fmtMon(c.totalGravadas)}</span></div>
        ${c.totalExoneradas > 0 ? `<div><span>Subtotal (exonerado):</span><span>${fmtMon(c.totalExoneradas)}</span></div>` : ""}
        ${(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI) > 0 ? `<div><span>Descuentos:</span><span>${fmtMonNeg(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI)}</span></div>` : ""}
        <div><span>IGV (${tasaIgv}%):</span><span>${fmtMon(c.igvFinal)}</span></div>
        ${c.percepcion > 0 ? `<div><span>Percepción:</span><span>${fmtMon(c.percepcion)}</span></div>` : ""}
        <div class="b2b-total"><span>TOTAL</span><span>${fmtMon(c.importeTotal)}</span></div>
      </div>
      <div class="b2b-footer">
        Validez de la cotización: 7 días · Forma de pago: a coordinar · Esta cotización no constituye comprobante de pago.
      </div>
    </div>
  `;
}

// ── 5) Ecommerce / marketplace ──
function previewEcommerce(c) {
  const first = c.itemsRes[0];
  if (!first) return "";
  const p = first.item;
  const totalItems = c.itemsRes.length;
  const totalUnidades = c.itemsRes.reduce((s, r) => s + r.item.cantidad, 0);
  const precioBig = c.importeTotal;
  const cuota12 = round(precioBig / 12, 2);
  const cuota6  = round(precioBig / 6, 2);
  const precioInt = Math.floor(precioBig);
  const precioDec = (precioBig - precioInt).toFixed(2).slice(2);
  // Total "original" sin descuentos para mostrar tachado
  const ahorro = ahorroComprobante(c);
  const precioOriginal = precioBig + ahorro;
  const pctAhorro = ahorro > 0 ? Math.round((ahorro / precioOriginal) * 100) : 0;
  return `
    <div class="preview-ec">
      <div class="ec-galeria">
        <div class="ec-img">📦</div>
        ${ahorro > 0 ? `<span class="ec-badge-off">${pctAhorro}% OFF</span>` : ""}
      </div>
      <div class="ec-body">
        <div class="ec-status">Nuevo  ·  ${totalUnidades} disponibles</div>
        <h3 class="ec-title">${escapeHtml(p.producto)}${totalItems > 1 ? ` + ${totalItems - 1} más en este pedido` : ""}</h3>
        <div class="ec-rating">★★★★☆ <span class="ec-rating-n">(127 opiniones)</span></div>
        ${ahorro > 0 ? `<div class="ec-price-old">${fmtMon(precioOriginal)}</div>` : ""}
        <div class="ec-price">
          <span class="ec-currency">${simboloMoneda(store.comprobante.moneda)}</span>
          <span class="ec-int">${precioInt.toLocaleString("es-PE")}</span>
          <span class="ec-dec">${precioDec}</span>
          ${ahorro > 0 ? `<span class="ec-pct-off">${pctAhorro}% OFF</span>` : ""}
        </div>
        ${ahorro > 0 ? `<div class="ec-ahorro">💰 <b>Ahorras ${fmtMon(ahorro)}</b></div>` : ""}
        <div class="ec-cuotas">en <b>12x ${fmtMon(cuota12)}</b> sin interés · o <b>6x ${fmtMon(cuota6)}</b></div>
        <div class="ec-envio">🚚 Llega gratis mañana · 🛡️ Compra protegida</div>
        <div class="ec-stock">Stock: ${totalUnidades > 10 ? "más de 10" : totalUnidades} unidades</div>
        <button class="ec-buy" type="button">Comprar ahora</button>
        <button class="ec-cart" type="button">Agregar al carrito</button>
        <div class="ec-detail">IGV incluido · Vendido por ${escapeHtml(store.comprobante.emisor.razon)}</div>
      </div>
    </div>
  `;
}

// ── 6) Email transaccional ──
function previewEmail(c) {
  const cb = store.comprobante;
  // Nombre legible del comprobante (en minúsculas para el cuerpo del email)
  const tipoNombre = ((CAT01[cb.tipo] && CAT01[cb.tipo].nombre) || "comprobante").toLowerCase();
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const ahorro = ahorroComprobante(c);
  const rows = c.itemsRes.map(r => {
    const p = r.item;
    const orig = precioOriginalItem(r);
    const tieneDesc = (orig - r.total) > 0.005;
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(p.producto)}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #eee">${p.cantidad}</td>
      <td style="padding:8px;text-align:right;border-bottom:1px solid #eee;color:${tieneDesc ? 'var(--tq-success)' : 'inherit'};font-weight:${tieneDesc ? '600' : 'normal'}">
        ${tieneDesc ? '-' + fmtMon(orig - r.total) : '—'}
      </td>
      <td style="padding:8px;text-align:right;border-bottom:1px solid #eee">${fmtMon(r.total)}</td>
    </tr>`;
  }).join("");
  return `
    <div class="preview-email">
      <div class="em-bar">
        <div><b>De:</b> ${escapeHtml(cb.emisor.razon.toLowerCase().replace(/\s/g,""))}@empresa.pe</div>
        <div><b>Para:</b> cliente@gmail.com</div>
        <div><b>Asunto:</b> Tu ${tipoNombre} ${serie}-${correlativo} de ${escapeHtml(cb.emisor.razon)}</div>
      </div>
      <div class="em-body">
        <h2>¡Gracias por tu compra! 🎉</h2>
        <p>Hola ${escapeHtml(cb.receptor.razon)},</p>
        <p>Te confirmamos tu ${tipoNombre} electrónica <b>${serie}-${correlativo}</b>:</p>
        <table style="width:100%;border-collapse:collapse;margin:1rem 0">
          <thead><tr style="background:#f5f6fa">
            <th style="padding:8px;text-align:left">Producto</th>
            <th style="padding:8px;text-align:center">Cant.</th>
            <th style="padding:8px;text-align:right">Desc.</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr><td colspan="3" style="padding:8px;text-align:right;font-weight:700">TOTAL PAGADO</td>
                <td style="padding:8px;text-align:right;font-weight:700;color:#e63946;font-size:1.1em">${fmtMon(c.importeTotal)}</td></tr>
          </tfoot>
        </table>
        ${ahorro > 0 ? `<div style="background:#dcfce7;border-left:4px solid #16a34a;padding:0.8rem 1rem;border-radius:8px;margin:1rem 0;color:#14532d;font-weight:600">
          🎉 ¡Te ahorraste ${fmtMon(ahorro)} en esta compra!
        </div>` : ""}
        <p style="font-size:0.85em;color:#666">
          Incluye IGV de ${fmtMon(c.igvFinal)}${c.percepcion > 0 ? ` y percepción de ${fmtMon(c.percepcion)}` : ""}.
        </p>
        <a class="em-cta" href="#">📥 Descargar PDF</a>
        <a class="em-cta secondary" href="#">📄 Ver XML</a>
        <p style="font-size:0.8em;color:#999;margin-top:2rem">
          Este comprobante fue enviado a SUNAT.<br>
          Consulta su validez en <a href="#">sunat.gob.pe</a>.
        </p>
      </div>
    </div>
  `;
}

// ── 7) WhatsApp ──
function previewWhatsApp(c) {
  const cb = store.comprobante;
  const WA_CORTOS = { "01": "factura", "03": "boleta", "07": "NC", "08": "ND" };
  const tipoNombre = WA_CORTOS[cb.tipo] || ((CAT01[cb.tipo] && CAT01[cb.tipo].nombre) || "doc").toLowerCase();
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const ahorro = ahorroComprobante(c);
  const items = c.itemsRes.map(r => {
    const p = r.item;
    const orig = precioOriginalItem(r);
    const descDelta = orig - r.total;
    const tieneDesc = descDelta > 0.005;
    let l = `${p.cantidad}× ${p.producto} — ${fmtMon(r.total)}`;
    if (tieneDesc) l += `\n   _Desc: -${fmtMon(descDelta)}_`;
    return l;
  }).join("\n");
  const globalDescTxt = (c.descGlobalAfectaBI + c.descGlobalNoAfectaBI) > 0
    ? `Desc. Global: -${fmtMon(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI)}\n` : "";
  const msg = `*${escapeHtml(cb.emisor.razon)}*
${tipoNombre.toUpperCase()} ${serie}-${correlativo}

${escapeHtml(items)}

—————————
Op. Gravadas: ${fmtMon(c.totalGravadas)}
${globalDescTxt}IGV: ${fmtMon(c.igvFinal)}${c.totalIcbper > 0 ? "\nICBPER: " + fmtMon(c.totalIcbper) : ""}${c.percepcion > 0 ? "\nPercepción: " + fmtMon(c.percepcion) : ""}
*TOTAL: ${fmtMon(c.importeTotal)}*${ahorro > 0 ? `\n💰 *Te ahorraste ${fmtMon(ahorro)}*` : ""}

¡Gracias por tu preferencia! 🙌
Consulta tu CPE en sunat.gob.pe`;
  return `
    <div class="preview-wa">
      <div class="wa-bg">
        <div class="wa-bubble">
          <pre>${msg}</pre>
          <div class="wa-meta">12:34 ✓✓</div>
        </div>
      </div>
      <div class="wa-actions">
        <button class="btn secondary small" type="button" onclick="copiarWhatsApp()">📋 Copiar texto</button>
      </div>
    </div>
  `;
}

// ── 8) Promoción — Antes vs Ahora ──
// Pieza visual estilo "oferta de marketplace": precio original tachado vs
// precio final destacado + monto y porcentaje ahorrado.
function previewPromo(c) {
  const ahorroTotal = ahorroComprobante(c);
  const totalFinal  = c.importeTotal;
  const totalOriginal = totalFinal + ahorroTotal;
  const pct = ahorroTotal > 0 ? Math.round((ahorroTotal / totalOriginal) * 100) : 0;
  const cb = store.comprobante;

  // Filas por producto con su antes/ahora
  const filas = c.itemsRes.map((r, i) => {
    const p = r.item;
    const orig = precioOriginalItem(r);
    const desc = orig - r.total;
    const tieneDesc = desc > 0.005;
    const pctItem = tieneDesc ? Math.round((desc / orig) * 100) : 0;
    return `
      <div class="promo-item ${tieneDesc ? "promo-item--off" : ""}">
        <div class="promo-item-cabezal">
          <span class="promo-item-num">${i + 1}</span>
          <div class="promo-item-info">
            <div class="promo-item-nombre">${escapeHtml(p.producto)}</div>
            <div class="promo-item-meta">${p.cantidad} × ${escapeHtml(p.unidad)}</div>
          </div>
          ${tieneDesc ? `<span class="promo-item-badge">−${pctItem}%</span>` : ""}
        </div>
        <div class="promo-item-precios">
          ${tieneDesc ? `<span class="promo-item-original">${fmtMon(orig)}</span>` : ""}
          <span class="promo-item-final">${fmtMon(r.total)}</span>
          ${tieneDesc ? `<span class="promo-item-ahorro">ahorras ${fmtMon(desc)}</span>` : ""}
        </div>
      </div>
    `;
  }).join("");

  // Hero principal con el total
  return `
    <div class="preview-promo">
      ${ahorroTotal > 0 ? `
      <div class="promo-hero">
        <div class="promo-hero-badge">
          <span class="promo-hero-pct">−${pct}%</span>
          <span class="promo-hero-label">DESCUENTO</span>
        </div>
        <div class="promo-hero-body">
          <div class="promo-hero-from">Antes</div>
          <div class="promo-hero-original">${fmtMon(totalOriginal)}</div>
          <div class="promo-hero-now">Ahora</div>
          <div class="promo-hero-final">${fmtMon(totalFinal)}</div>
          <div class="promo-hero-ahorro">
            <span class="promo-emoji">💰</span>
            <span>Te ahorras <b>${fmtMon(ahorroTotal)}</b></span>
          </div>
        </div>
      </div>
      ` : `
      <div class="promo-hero promo-hero--nodesc">
        <div class="promo-hero-body">
          <div class="promo-hero-label-empty">PRECIO TOTAL</div>
          <div class="promo-hero-final">${fmtMon(totalFinal)}</div>
          <p class="promo-hero-empty-msg">No hay descuentos aplicados.<br>Agrega un descuento Cat.53 (ítem o global) para ver este formato con el antes/ahora.</p>
        </div>
      </div>
      `}

      <div class="promo-emisor">
        <span class="promo-mark"></span>
        <span><b>${escapeHtml(cb.emisor.razon)}</b> · RUC ${escapeHtml(cb.emisor.ruc)}</span>
      </div>

      <h4 class="promo-section-title">📦 Detalle por producto</h4>
      <div class="promo-items">${filas}</div>

      <div class="promo-footer">
        <div class="promo-foot-row"><span>Subtotal sin IGV</span><span>${fmtMon(c.totalGravadas + c.totalExoneradas + c.totalInafectas + c.totalExportacion)}</span></div>
        ${(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI) > 0 ? `<div class="promo-foot-row promo-foot-row--desc"><span>Descuento global</span><span>−${fmtMon(c.descGlobalAfectaBI + c.descGlobalNoAfectaBI)}</span></div>` : ""}
        <div class="promo-foot-row"><span>IGV</span><span>${fmtMon(c.igvFinal)}</span></div>
        ${c.totalIcbper > 0 ? `<div class="promo-foot-row"><span>ICBPER</span><span>${fmtMon(c.totalIcbper)}</span></div>` : ""}
        ${c.percepcion > 0 ? `<div class="promo-foot-row"><span>Percepción</span><span>${fmtMon(c.percepcion)}</span></div>` : ""}
        <div class="promo-foot-row promo-foot-row--total">
          <span>TOTAL A PAGAR</span><span>${fmtMon(totalFinal)}</span>
        </div>
      </div>

      <div class="promo-disclaimer">
        ⚖️ <span>Precio "antes" calculado como el total que sería sin descuentos/cargos aplicados. SUNAT no exige mostrar precio anterior — es solo comunicación comercial. Reglamento de Comprobantes de Pago R.S. 007-99/SUNAT permite consignar descuentos siempre que se calculen sobre la base imponible (D.S. 029-94-EF Art. 5 num. 13).</span>
      </div>
    </div>
  `;
}

// ── 9) SUNAT oficial — con Precio Ofrecido vs Final ──
// Misma estructura SUNAT con columnas adicionales informativas:
//   "Precio ofrecido" (sin descuentos) y "Descuento" (monto aplicado).
// Sin lenguaje promocional — solo desglose técnico para que el cliente vea
// el descuento que ya está incorporado en el total final.
function previewSunatPromo(c) {
  const cb = store.comprobante;
  const tipoNombre    = (CAT01[cb.tipo] && CAT01[cb.tipo].largo) || "COMPROBANTE ELECTRÓNICO";
  const monedaNombre  = nombreLargoMoneda(cb.moneda);
  const tipoDocNombre = (CAT06[cb.receptor.tipoDoc] && CAT06[cb.receptor.tipoDoc].corto) || "Doc";
  const date = new Date(cb.fechaEmision + "T00:00:00").toLocaleDateString("es-PE", { day: "2-digit", month: "long", year: "numeric" });
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const descuentoTotal = ahorroComprobante(c);

  const lines = c.itemsRes.map((r, i) => {
    const p = r.item;
    const ofrecido = precioOriginalItem(r);
    const descMonto = ofrecido - r.total;
    const tieneDesc = descMonto > 0.005;
    return `<tr${tieneDesc ? ' class="inv-row-desc"' : ''}>
      <td style="text-align:center">${i+1}</td>
      <td style="text-align:center">${escapeHtml(p.codigo)}</td>
      <td style="text-align:center">${p.cantidad.toFixed(2)}</td>
      <td style="text-align:center">${escapeHtml(p.unidad)}</td>
      <td>${escapeHtml(p.producto.length > 24 ? p.producto.slice(0,24)+"…" : p.producto)}</td>
      <td style="text-align:right">${r.valorUnitario.toFixed(2)}</td>
      <td style="text-align:right">${r.igvAplica ? r.precioVentaUnitario.toFixed(2) : "—"}</td>
      <td style="text-align:right" class="inv-col-antes">${tieneDesc ? ofrecido.toFixed(2) : r.total.toFixed(2)}</td>
      <td style="text-align:right" class="inv-col-ahorro">${tieneDesc ? `−${descMonto.toFixed(2)}` : "0.00"}</td>
      <td style="text-align:right">${(r.descItem + r.cargoItem).toFixed(2)}</td>
      <td style="text-align:right">${r.baseImp.toFixed(2)}</td>
      <td style="text-align:right">${r.igvAplica ? r.igv.toFixed(2) : "0.00"}</td>
      <td style="text-align:right">${r.total.toFixed(2)}</td>
    </tr>`;
  }).join("");

  return `
    <div class="invoice invoice--promo">
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
      <table class="inv-table inv-table--promo">
        <thead><tr>
          <th style="width:24px">#</th>
          <th style="width:40px">Cód.</th>
          <th style="width:40px">Cant.</th>
          <th style="width:32px">Und</th>
          <th>Descripción</th>
          <th style="width:55px">V.U.<br/><small>sin IGV</small></th>
          <th style="width:55px">P.U.<br/><small>con IGV</small></th>
          <th style="width:62px" class="inv-col-antes-head">Precio<br/><small>ofrecido</small></th>
          <th style="width:62px" class="inv-col-ahorro-head">Descuento<br/><small>aplicado</small></th>
          <th style="width:50px">D/C</th>
          <th style="width:55px">V.Venta</th>
          <th style="width:50px">IGV</th>
          <th style="width:60px">Total</th>
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
        ${descuentoTotal > 0 ? `<div class="inv-sum-row inv-sum-ahorro">
          <span>Total descuento aplicado:</span><span>−${fmtMon(descuentoTotal)}</span>
        </div>` : ""}
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

function copiarWhatsApp() {
  const txt = $("comprobantePreview").querySelector(".wa-bubble pre").textContent;
  navigator.clipboard.writeText(txt).then(
    () => toast("Texto copiado al portapapeles", "success"),
    () => toast("No se pudo copiar", "error")
  );
}
