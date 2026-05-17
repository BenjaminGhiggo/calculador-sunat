// ════════════════════════════════════════════════════════════════════
// APPLICATION · Exportación JSON / XML
// Caso de uso: serializar el comprobante actual y descargarlo.
// Consume el correlativo al hacerlo (es irreversible).
// ════════════════════════════════════════════════════════════════════

function exportarJSON() {
  if (!store.items.length) { toast("No hay productos para exportar", "warn"); return; }
  if (!validarEmisor() || !validarReceptor() || !validarSerie() || !validarFecha()) {
    toast("Hay datos del comprobante con errores", "error");
    goStep("comprobante"); return;
  }
  const data = {
    items: store.items,
    globales: store.globales,
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
