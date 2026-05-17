// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Mapeo Form ↔ Modelo
// Lee del DOM y produce objetos del dominio; o vuelca un objeto al DOM.
// ════════════════════════════════════════════════════════════════════

// ── Ítem ────────────────────────────────────────────────────────────
function leerItemForm() {
  const prodSel    = $("producto").value;
  const prodCustom = $("productoCustom").value;
  return {
    codigo:           $("codigoProducto").value || "-",
    producto:         prodSel === "Otro (personalizado)" && prodCustom ? prodCustom : prodSel,
    cantidad:         parseFloat($("cantidad").value)   || 0,
    unidad:           $("unidad").value,
    afectacion:       $("afectacion").value,
    precioUnit:       parseFloat($("precioUnit").value) || 0,
    tipoPrecio:       $("tipoPrecio").value,
    tributo:          $("tributo").value,
    tasaInput:        parseFloat($("tasaInput").value)  || 0,
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

// ── Global ──────────────────────────────────────────────────────────
function leerGlobalForm() {
  return {
    codigo: $("codigo53Global").value,
    modo:   $("modoOpGlobal").value,
    valor:  parseFloat($("valorOpGlobal").value) || 0,
  };
}

// ── Comprobante ─────────────────────────────────────────────────────
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
  $("serie").value           = c.serie;
  $("correlativo").value     = c.correlativo;
  $("moneda").value          = c.moneda;
  $("fechaEmision").value    = c.fechaEmision;
  if ($("tipoOperacion")) $("tipoOperacion").value = c.tipoOperacion || "0101";
  if ($("regimenIgv"))    $("regimenIgv").value    = String(c.regimenIgv || 18);
  $("emisorRuc").value       = c.emisor.ruc;
  $("emisorRazon").value     = c.emisor.razon;
  $("emisorDireccion").value = c.emisor.direccion;
  $("receptorTipoDoc").value = c.receptor.tipoDoc;
  $("receptorDoc").value     = c.receptor.doc;
  $("receptorRazon").value   = c.receptor.razon;
  $("receptorDireccion").value = c.receptor.direccion;
}
