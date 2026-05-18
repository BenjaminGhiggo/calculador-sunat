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

  // ── Sticky summary colapsable en mobile (tap en el h3) ─────────────
  const sticky = $("summarySticky");
  if (sticky) {
    const h3 = sticky.querySelector("h3");
    if (h3) {
      // Arrancar colapsado en mobile para no tapar contenido inicial
      if (window.matchMedia("(max-width: 1024px)").matches) {
        sticky.classList.add("is-collapsed");
      }
      h3.addEventListener("click", () => sticky.classList.toggle("is-collapsed"));
    }
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

  // 4) Poblar selects desde el dominio (single source of truth)
  // Cat.01 — Tipo de comprobante
  populateSelect("tipoComprobante", Object.entries(CAT01),
    ([, v]) => `${v.icon} ${v.nombre}`, ([k]) => k);
  // Cat.02 — Monedas
  populateSelect("moneda", Object.entries(CAT02),
    ([, v]) => `${v.sim}  ${v.nombre}`, ([k]) => k);
  // Cat.51 — Tipo de operación
  if ($("tipoOperacion")) {
    populateSelect("tipoOperacion", Object.entries(CAT51),
      ([k, v]) => `${k} — ${v}`, ([k]) => k);
  }
  // Régimen IGV
  if ($("regimenIgv")) {
    populateSelect("regimenIgv", REGIMENES_IGV,
      r => r.label, r => String(r.valor));
  }
  // Cat.06 — Tipo de documento del receptor
  populateSelect("receptorTipoDoc", Object.entries(CAT06),
    ([k, v]) => `${v.icon} ${v.nombre}${k !== "0" ? " (" + k + ")" : ""}`, ([k]) => k);

  // Cat.03 — Unidades de medida
  populateSelect("unidad", Object.entries(CAT03),
    ([k, v]) => `${k} — ${v}`, ([k]) => k);

  // Cat.07 — Afectación IGV (agrupado por grupo SUNAT)
  const afecGroups = {
    "Gravadas":    Object.entries(CAT07).filter(([k]) => k.startsWith("1")).map(([k,v]) => ({k,v})),
    "Exoneradas":  Object.entries(CAT07).filter(([k]) => k.startsWith("2")).map(([k,v]) => ({k,v})),
    "Inafectas":   Object.entries(CAT07).filter(([k]) => k.startsWith("3")).map(([k,v]) => ({k,v})),
    "Exportación": Object.entries(CAT07).filter(([k]) => k.startsWith("4")).map(([k,v]) => ({k,v})),
  };
  populateSelectGrouped("afectacion", afecGroups, ({k,v}) => `${k} — ${v}`, ({k}) => k);

  // Cat.05 — Tributos
  populateSelect("tributo", Object.entries(CAT05),
    ([k, v]) => `${k} — ${v.a} — ${v.n}`, ([k]) => k);

  // Cat.53 — Cargos/descuentos a nivel ítem (agrupado por tipo)
  const cat53Items = getCat53Items();
  populateSelectGrouped("codigo53", {
    "Descuentos": cat53Items.filter(c => c.t === "desc"),
    "Cargos":     cat53Items.filter(c => c.t === "cargo"),
  }, e => `${e.c} — ${e.d}`, e => e.c);

  // Cat.53 — Cargos/descuentos a nivel global (agrupado por tipo)
  const cat53Globals = getCat53Globals();
  populateSelectGrouped("codigo53Global", {
    "Descuentos":   cat53Globals.filter(c => c.t === "desc"),
    "Cargos":       cat53Globals.filter(c => c.t === "cargo" && !["51","52","53"].includes(c.c)),
    "Percepciones": cat53Globals.filter(c => ["51","52","53"].includes(c.c)),
  }, e => `${e.c} — ${e.d}`, e => e.c);

  populateSelect("producto", PRODUCTOS, e => e, e => e);

  // Canales de preview (UI, pero un solo lugar)
  if ($("canalPreview") && typeof CANALES_PREVIEW !== "undefined") {
    populateSelect("canalPreview", CANALES_PREVIEW,
      c => `${c.icon} ${c.label}`, c => c.id);
  }

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

  // 8.1) Tooltip Manager (Bento Grid Premium)
  if (typeof initTooltipManager === "function") initTooltipManager();

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
