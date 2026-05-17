// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Previews multi-canal del comprobante
// 7 layouts del mismo cálculo: SUNAT, ticket POS, retail, B2B, ecommerce,
// email, WhatsApp. Cero efecto sobre el cálculo o el XML — solo formato visual.
// ════════════════════════════════════════════════════════════════════

const CANALES_INFO = {
  sunat:      "SUNAT oficial — exactamente lo que se imprime / se envía al PSE.",
  ticket:     "Ticket POS térmico 58 mm — formato típico de bodega o cajero.",
  consumidor: "Consumidor final retail — pizarra / etiqueta con precio total.",
  b2b:        "Cotización B2B — comprador empresarial necesita ver neto + IGV.",
  ecommerce:  "Marketplace (Mercado Libre / web) — precio destacado y cuotas.",
  email:      "Email transaccional al cliente — formato HTML resumido.",
  whatsapp:   "Mensaje de WhatsApp — texto plano breve, para reenviar al cliente.",
};

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
    default:           return el.innerHTML = previewSunat(c);
  }
}

// ── 1) SUNAT oficial ──
function previewSunat(c) {
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

// ── 2) Ticket POS térmico (58 mm) ──
function previewTicket(c) {
  const cb = store.comprobante;
  const tipoNombre = { "01":"FACTURA","03":"BOLETA","07":"NC","08":"ND" }[cb.tipo] || "DOC";
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const date = new Date(cb.fechaEmision + "T00:00:00").toLocaleDateString("es-PE");
  const time = new Date().toLocaleTimeString("es-PE").slice(0, 5);
  const tipoDocNombre = { "1":"DNI","6":"RUC","4":"CE","7":"Pas","0":"" }[cb.receptor.tipoDoc] || "";
  const pad = (l, r, w = 32) => {
    const s = String(l), e = String(r);
    const sp = Math.max(1, w - s.length - e.length);
    return s + " ".repeat(sp) + e;
  };
  const lineas = c.itemsRes.map(r => {
    const p = r.item;
    const nombre = p.producto.slice(0, 30);
    const cantTxt = `${p.cantidad.toFixed(2)} x ${fmtMon(r.precioVentaUnitario)}`;
    return [
      escapeHtml(nombre),
      escapeHtml(pad(cantTxt, fmtMon(r.total), 32)),
    ].join("\n");
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
${c.totalExoneradas > 0 ? pad("Op. Exoneradas", fmtMon(c.totalExoneradas)) + "\n" : ""}${pad("IGV", fmtMon(c.igvFinal))}
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
    return `<tr>
      <td>${i+1}</td>
      <td>${escapeHtml(p.producto)}</td>
      <td style="text-align:center">${p.cantidad}</td>
      <td style="text-align:right">${fmtMon(r.valorUnitario)}</td>
      <td style="text-align:right">${fmtMon(r.baseImp)}</td>
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
        <thead><tr><th>#</th><th>Descripción</th><th>Cant.</th><th>P. Unit. (sin IGV)</th><th>Subtotal</th></tr></thead>
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
  return `
    <div class="preview-ec">
      <div class="ec-galeria">
        <div class="ec-img">📦</div>
      </div>
      <div class="ec-body">
        <div class="ec-status">Nuevo  ·  ${totalUnidades} disponibles</div>
        <h3 class="ec-title">${escapeHtml(p.producto)}${totalItems > 1 ? ` + ${totalItems - 1} más en este pedido` : ""}</h3>
        <div class="ec-rating">★★★★☆ <span class="ec-rating-n">(127 opiniones)</span></div>
        <div class="ec-price">
          <span class="ec-currency">${simboloMoneda(store.comprobante.moneda)}</span>
          <span class="ec-int">${precioInt.toLocaleString("es-PE")}</span>
          <span class="ec-dec">${precioDec}</span>
        </div>
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
  const tipoNombre = { "01":"factura","03":"boleta","07":"nota de crédito","08":"nota de débito" }[cb.tipo] || "comprobante";
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const rows = c.itemsRes.map(r => {
    const p = r.item;
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${escapeHtml(p.producto)}</td>
      <td style="padding:8px;text-align:center;border-bottom:1px solid #eee">${p.cantidad}</td>
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
            <th style="padding:8px;text-align:right">Total</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr><td colspan="2" style="padding:8px;text-align:right;font-weight:700">TOTAL PAGADO</td>
                <td style="padding:8px;text-align:right;font-weight:700;color:#e63946;font-size:1.1em">${fmtMon(c.importeTotal)}</td></tr>
          </tfoot>
        </table>
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
  const tipoNombre = { "01":"factura","03":"boleta","07":"NC","08":"ND" }[cb.tipo] || "doc";
  const serie = cb.serie, correlativo = String(cb.correlativo).padStart(6, "0");
  const items = c.itemsRes.map(r => {
    const p = r.item;
    return `${p.cantidad}× ${p.producto} — ${fmtMon(r.total)}`;
  }).join("\n");
  const msg = `*${escapeHtml(cb.emisor.razon)}*
${tipoNombre.toUpperCase()} ${serie}-${correlativo}

${escapeHtml(items)}

—————————
Op. Gravadas: ${fmtMon(c.totalGravadas)}
IGV: ${fmtMon(c.igvFinal)}${c.totalIcbper > 0 ? "\nICBPER: " + fmtMon(c.totalIcbper) : ""}${c.percepcion > 0 ? "\nPercepción: " + fmtMon(c.percepcion) : ""}
*TOTAL: ${fmtMon(c.importeTotal)}*

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

function copiarWhatsApp() {
  const txt = $("comprobantePreview").querySelector(".wa-bubble pre").textContent;
  navigator.clipboard.writeText(txt).then(
    () => toast("Texto copiado al portapapeles", "success"),
    () => toast("No se pudo copiar", "error")
  );
}
