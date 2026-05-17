// ════════════════════════════════════════════════════════════════════
// APPLICATION · Casos de uso (acciones del usuario)
// Cada acción: 1) push undo, 2) muta store, 3) re-render, 4) persiste, 5) feedback.
// ════════════════════════════════════════════════════════════════════

// ── Ítems ───────────────────────────────────────────────────────────
function agregarItem() {
  if (!validarCantidad() || !validarPrecio()) {
    toast("Revisa los campos del producto", "error"); return;
  }
  pushUndo("Agregar producto");
  const item = { ...leerItemForm(), id: Date.now() };
  store.items.push(item);
  $("codigoProducto").value = siguienteCodigoProducto();
  currentItemCargos = [];
  renderAll();
  persistir();
  toast("Producto agregado", "success");
}

function editarItem(id) {
  const item = store.items.find(p => p.id === id);
  if (!item) return;
  store.ui.editingItemId = id;
  escribirItemForm(item);
  $("itemFormTitle").textContent = `Editando: ${item.producto}`;
  $("btnAddItem").hidden = true;
  $("btnSaveEdit").hidden = false;
  $("btnCancelEdit").hidden = false;
  renderItemCargosList();
  renderTasaUI();
  goStep("productos");
  $("codigoProducto").focus();
}

function guardarEdicionItem() {
  if (!store.ui.editingItemId) return;
  if (!validarCantidad() || !validarPrecio()) {
    toast("Revisa los campos del producto", "error"); return;
  }
  pushUndo("Editar producto");
  const idx = store.items.findIndex(p => p.id === store.ui.editingItemId);
  if (idx >= 0) {
    store.items[idx] = { ...leerItemForm(), id: store.ui.editingItemId };
  }
  cancelarEdicionItem();
  renderAll();
  persistir();
  toast("Cambios guardados", "success");
}

function cancelarEdicionItem() {
  store.ui.editingItemId = null;
  $("itemFormTitle").textContent = "Nuevo producto";
  $("btnAddItem").hidden = false;
  $("btnSaveEdit").hidden = true;
  $("btnCancelEdit").hidden = true;
  $("codigoProducto").value = siguienteCodigoProducto();
  currentItemCargos = [];
  renderItemCargosList();
  renderItemList();
}

function eliminarItem(id) {
  const item = store.items.find(p => p.id === id);
  if (!item) return;
  pushUndo("Eliminar producto");
  store.items = store.items.filter(p => p.id !== id);
  if (store.ui.editingItemId === id) cancelarEdicionItem();
  $("codigoProducto").value = siguienteCodigoProducto();
  renderAll();
  persistir();
  toast("Producto eliminado · usa ↶ para deshacer", "info");
}

function limpiarItems() {
  if (!store.items.length) return;
  modal({
    title: "Eliminar todos los productos",
    body: `Vas a eliminar <b>${store.items.length} producto(s)</b>. Puedes deshacer con ↶.`,
    confirmLabel: "Sí, eliminar", danger: true,
    onConfirm: () => {
      pushUndo("Limpiar productos");
      store.items = [];
      $("codigoProducto").value = siguienteCodigoProducto();
      renderAll(); persistir();
      toast("Lista vaciada", "info");
    }
  });
}

// ── Cargos/descuentos del ítem en edición ──────────────────────────
function agregarCargoItem() {
  const codigo = $("codigo53").value;
  const c = getCat53(codigo);
  if (!c || c.l !== "Ítem") { toast("Código no válido para nivel ítem", "error"); return; }
  const modo = $("modoOp").value;
  const valor = parseFloat($("valorOp").value) || 0;
  if (c.f === null && valor <= 0) { toast("Ingresa un valor mayor a 0", "warn"); return; }
  if (currentItemCargos.some(cd => cd.codigo === codigo)) {
    toast(`El código ${codigo} ya está en el ítem`, "warn"); return;
  }
  currentItemCargos.push({ codigo, modo, valor: c.f !== null ? c.f * 100 : valor });
  renderItemCargosList();
  $("valorOp").value = 0;
  toast("Agregado al ítem", "info", 1800);
}

function quitarCargoItem(idx) {
  currentItemCargos.splice(idx, 1);
  renderItemCargosList();
}

// ── Globales del comprobante ────────────────────────────────────────
function agregarGlobal() {
  const g = leerGlobalForm();
  if (!g.codigo) return;
  const c = getCat53(g.codigo);
  if (c && c.f === null && g.valor <= 0) { toast("Ingresa un valor", "warn"); return; }
  pushUndo("Agregar global");
  store.globales.push({ ...g, id: Date.now() });
  renderAll(); persistir();
  toast(`Global ${g.codigo} agregado`, "success");
}

function eliminarGlobal(id) {
  pushUndo("Eliminar global");
  store.globales = store.globales.filter(g => g.id !== id);
  renderAll(); persistir();
  toast("Global eliminado", "info");
}

// ── Correlativo: consumir y avanzar al siguiente ────────────────────
function consumirCorrelativoActual() {
  const c = store.comprobante;
  const k = keyCorrelativo(c.tipo, c.serie);
  store.correlativos[k] = Math.max(store.correlativos[k] || 0, c.correlativo);
  c.correlativo = store.correlativos[k] + 1;
  if ($("correlativo")) $("correlativo").value = c.correlativo;
  persistir();
  renderAll();
}

// ── Auto-corrección de combinación afectación ↔ tributo ────────────
function aplicarSugerencia() {
  $("tributo").value = tributoSugerido($("afectacion").value);
  onCambioItemForm();
}

// ── Reset total (con confirmación) ──────────────────────────────────
function resetTodo() {
  modal({
    title: "¿Reset total?",
    body: "Esto borra todos los productos, globales, datos del comprobante y contadores de correlativo. Acción irreversible.",
    confirmLabel: "Sí, borrar todo", danger: true,
    onConfirm: () => {
      pushUndo("Reset total");
      store.items = []; store.globales = []; store.correlativos = {};
      store.comprobante = comprobanteDefault();
      localStorage.removeItem(STORAGE_KEY);
      escribirComprobanteForm();
      cancelarEdicionItem();
      renderAll();
      toast("Todo reiniciado", "info");
    }
  });
}
