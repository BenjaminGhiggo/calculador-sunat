// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Handlers (eventos de cambio de formulario)
// Coordinan: leer del form → mutar store → re-render → persistir.
// ════════════════════════════════════════════════════════════════════

function onCambioItemForm() {
  renderTasaUI();
  renderPrecioUI();
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
  renderPrecioUI();          // moneda/régimen MYPE cambian el hint
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
