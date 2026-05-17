// ════════════════════════════════════════════════════════════════════
// APPLICATION · Undo stack (snapshots inmutables)
// Cada acción destructiva debe llamar pushUndo("label") antes de mutar.
// ════════════════════════════════════════════════════════════════════

function pushUndo(label) {
  store.undoStack.push({ label, state: snapshot(), ts: Date.now() });
  if (store.undoStack.length > 20) store.undoStack.shift();
  updateUndoBtn();
}

function undo() {
  const last = store.undoStack.pop();
  if (!last) return;
  store.items        = last.state.items;
  store.globales     = last.state.globales;
  store.comprobante  = last.state.comprobante;
  store.correlativos = last.state.correlativos;
  escribirComprobanteForm();
  renderAll();
  persistir();
  toast(`Deshecho: ${last.label}`, "info");
  updateUndoBtn();
}

function updateUndoBtn() {
  const btn = $("btnUndo");
  if (!btn) return;
  btn.disabled = store.undoStack.length === 0;
  const last = store.undoStack[store.undoStack.length - 1];
  btn.title = last ? `Deshacer "${last.label}" (Ctrl+Z)` : "Nada para deshacer";
}
