// ════════════════════════════════════════════════════════════════════
// MAIN · Entry point — orquesta init + bind de eventos
// Carga al final de la cascada de scripts; ninguna otra capa lo requiere.
// ════════════════════════════════════════════════════════════════════

function bindEvents() {
  // ── Producto select (toggle de campo custom + recálculo) ────────────
  $("producto").addEventListener("change", function () {
    $("productoCustomField").hidden = this.value !== "Otro (personalizado)";
    onCambioItemForm();
  });

  // ── Form de ítem ────────────────────────────────────────────────────
  ["tributo","afectacion","unidad","tipoPrecio","codigo53","modoOp"].forEach(id => {
    if ($(id)) $(id).addEventListener("change", onCambioItemForm);
  });
  ["codigoProducto","cantidad","precioUnit","tasaInput","valorOp","productoCustom"].forEach(id => {
    if ($(id)) $(id).addEventListener("input", onCambioItemForm);
  });
  $("btnAddItem").addEventListener("click", agregarItem);
  $("btnSaveEdit").addEventListener("click", guardarEdicionItem);
  $("btnCancelEdit").addEventListener("click", cancelarEdicionItem);
  $("btnAddCargoItem").addEventListener("click", agregarCargoItem);

  // ── Form de globales ───────────────────────────────────────────────
  $("codigo53Global").addEventListener("change", onCambioGlobalForm);
  $("modoOpGlobal").addEventListener("change", onCambioGlobalForm);
  $("valorOpGlobal").addEventListener("input", onCambioGlobalForm);
  $("btnAddGlobal").addEventListener("click", agregarGlobal);

  // ── Form del comprobante ───────────────────────────────────────────
  $("tipoComprobante").addEventListener("change", onCambioTipoOSerie);
  $("serie").addEventListener("input", onCambioTipoOSerie);
  ["moneda","receptorTipoDoc","tipoOperacion","regimenIgv"].forEach(id => {
    if ($(id)) $(id).addEventListener("change", onCambioComprobante);
  });
  ["correlativo","fechaEmision","emisorRuc","emisorRazon","emisorDireccion",
   "receptorDoc","receptorRazon","receptorDireccion"].forEach(id => {
    if ($(id)) $(id).addEventListener("input", onCambioComprobante);
  });

  // ── Stepper ────────────────────────────────────────────────────────
  document.querySelectorAll(".stepper .step").forEach(b => {
    b.addEventListener("click", () => goStep(b.dataset.step));
  });
  document.querySelectorAll("[data-go]").forEach(b => {
    b.addEventListener("click", () => goStep(b.dataset.go));
  });

  // ── Topbar tools ───────────────────────────────────────────────────
  $("btnUndo").addEventListener("click", undo);
  $("toggleExperto").addEventListener("change", function () {
    store.ui.modoExperto = this.checked;
    document.documentElement.dataset.mode = this.checked ? "experto" : "simple";
    persistir();
    toast(`Modo ${this.checked ? "experto" : "simple"} activado`, "info", 1800);
  });
  $("btnAyuda").addEventListener("click", () => {
    modal({
      title: "Atajos de teclado",
      body: `<ul style="line-height:1.8">
        <li><b>Ctrl + Z</b> · Deshacer</li>
        <li><b>Ctrl + 1/2/3/4</b> · Saltar a paso N</li>
        <li><b>Ctrl + Enter</b> · Agregar producto (en paso 2)</li>
        <li><b>Esc</b> · Cerrar modal / drawer</li>
      </ul>`,
      confirmLabel: "Entendido", cancelLabel: ""
    });
  });
  $("btnNormativa").addEventListener("click", openDrawer);
  $("drawerNormativa").querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);

  // ── Reset ──────────────────────────────────────────────────────────
  $("btnReset").addEventListener("click", resetTodo);

  // ── Modal cierre con click fuera ───────────────────────────────────
  $("modalOverlay").addEventListener("click", e => {
    if (e.target.id === "modalOverlay") closeModal();
  });

  // ── Selector de canal de preview ───────────────────────────────────
  if ($("canalPreview")) {
    $("canalPreview").addEventListener("change", () => renderComprobante());
  }

  // ── Atajos de teclado ──────────────────────────────────────────────
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); closeDrawer(); }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault(); undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "4") {
      e.preventDefault();
      goStep(["comprobante","productos","globales","resumen"][parseInt(e.key, 10) - 1]);
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && store.ui.step === "productos") {
      e.preventDefault();
      store.ui.editingItemId ? guardarEdicionItem() : agregarItem();
    }
  });
}

async function init() {
  // 1) Catálogos (data.json o fallback)
  const { ok, err, fileProtocol } = await cargarDataJson();
  if (!ok) {
    if (fileProtocol) {
      banner("data",
        `ℹ️ Estás abriendo con <b>file://</b> — los navegadores bloquean leer <code>data.json</code> por seguridad. ` +
        `La calculadora funciona igual con los catálogos del código. ` +
        `Para editar <code>data.json</code> arranca <code>python3 -m http.server</code> desde esta carpeta y abre <code>http://localhost:8000</code>.`,
        "info"
      );
    } else {
      banner("data", `⚠️ Catálogos: usando los del código (data.json: ${err}).`, "warn", [
        { label: "Reintentar", onClick: async () => {
          const r = await cargarDataJson();
          if (r.ok) { closeBanner("data"); init(); }
        }}
      ]);
    }
  }

  // 2) Estado inicial del comprobante (defaults posiblemente del data.json)
  store.comprobante = comprobanteDefault();

  // 3) Cargar persistencia (sobreescribe defaults)
  cargar();

  // 4) Poblar selects
  const afecGroups = {
    "Gravadas":    Object.entries(CAT07).filter(([k]) => k.startsWith("1")).map(([k,v]) => ({k,v})),
    "Exoneradas":  Object.entries(CAT07).filter(([k]) => k.startsWith("2")).map(([k,v]) => ({k,v})),
    "Inafectas":   Object.entries(CAT07).filter(([k]) => k.startsWith("3")).map(([k,v]) => ({k,v})),
    "Exportación": Object.entries(CAT07).filter(([k]) => k.startsWith("4")).map(([k,v]) => ({k,v})),
  };
  populateSelect("unidad",   Object.entries(CAT03), ([k,v]) => `${k} — ${v}`, ([k]) => k);
  populateSelectGrouped("afectacion", afecGroups, ({k,v}) => `${k} — ${v}`, ({k}) => k);
  populateSelect("tributo",  Object.entries(CAT05), ([k,v]) => `${k} — ${v.a} — ${v.n}`, ([k]) => k);

  const cat53Items = getCat53Items();
  populateSelectGrouped("codigo53", {
    "Descuentos": cat53Items.filter(c => c.t === "desc"),
    "Cargos":     cat53Items.filter(c => c.t === "cargo"),
  }, e => `${e.c} — ${e.d}`, e => e.c);

  const cat53Globals = getCat53Globals();
  populateSelectGrouped("codigo53Global", {
    "Descuentos":   cat53Globals.filter(c => c.t === "desc"),
    "Cargos":       cat53Globals.filter(c => c.t === "cargo" && !["51","52","53"].includes(c.c)),
    "Percepciones": cat53Globals.filter(c => ["51","52","53"].includes(c.c)),
  }, e => `${e.c} — ${e.d}`, e => e.c);

  populateSelect("producto", PRODUCTOS, e => e, e => e);

  // 5) Reflejar comprobante guardado en el form
  escribirComprobanteForm();
  $("codigoProducto").value = siguienteCodigoProducto();

  // 6) Modo experto persistido
  document.documentElement.dataset.mode = store.ui.modoExperto ? "experto" : "simple";
  $("toggleExperto").checked = store.ui.modoExperto;

  // 7) Step inicial
  goStep("comprobante");

  // 8) Bind events
  bindEvents();

  // 9) Render inicial
  renderAll();
  updateUndoBtn();

  // 10) Info de fuente
  if ($("persistInfo")) {
    $("persistInfo").textContent = DATA_JSON_META
      ? `📂 Catálogos data.json v${DATA_JSON_META.version || "?"} (${DATA_JSON_META.actualizado || "—"}) · auto-guardado activo.`
      : `📦 Catálogos por defecto · auto-guardado activo.`;
  }
}

init();
