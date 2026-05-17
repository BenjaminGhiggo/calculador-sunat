// ════════════════════════════════════════════════════════════════════
// DOMAIN · Autonumeración (códigos de producto y correlativos)
// Reglas puras — no acceden a store ni DOM.
// ════════════════════════════════════════════════════════════════════

// Detecta sufijo numérico y lo incrementa preservando padding y posibles sufijos no-numéricos.
// Ej: "001" → "002" · "PROD-100" → "PROD-101" · "ABC-A100" → "ABC-A101" · "ABC" → "ABC-1"
function nextCodigo(code) {
  if (!code || code === "-") return "001";
  const m = String(code).match(/^(.*?)(\d+)(\D*)$/);
  if (!m) return code + "-1";
  const [, prefix, num, suffix] = m;
  const next = String(parseInt(num, 10) + 1).padStart(num.length, "0");
  return prefix + next + suffix;
}

// Clave de contador por par tipo-serie. Ej: keyCorrelativo("03", "B001") = "03-B001"
function keyCorrelativo(tipo, serie) { return `${tipo}-${serie}`; }
