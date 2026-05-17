// ════════════════════════════════════════════════════════════════════
// APPLICATION · Importación JSON
// Caso de uso: leer archivo del usuario, validar schema, hidratar store.
// ════════════════════════════════════════════════════════════════════

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
    } catch (err) {
      toast("JSON malformado: " + err.message, "error");
    }
  };
  reader.readAsText(file);
  ev.target.value = "";
}
