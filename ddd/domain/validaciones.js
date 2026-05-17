// ════════════════════════════════════════════════════════════════════
// DOMAIN · Reglas de validación (puras, sin DOM)
// ════════════════════════════════════════════════════════════════════

// Validación de identificadores SUNAT
function validRuc(s) { return /^(10|15|17|20)\d{9}$/.test(s); }
function validDni(s) { return /^\d{8}$/.test(s); }

// Regla: tributo sugerido según afectación (Cat.07 → Cat.05)
function tributoSugerido(afecKey) {
  const grupo = getCat07Grupo(afecKey);
  if (afecKey === "17" || afecKey === "36") return "1016"; // IVAP
  if (grupo === "gravada")     return "1000";
  if (grupo === "exonerada")   return "9997";
  if (grupo === "inafecta")    return "9998";
  if (grupo === "exportacion") return "9995";
  return "1000";
}

// Una combinación (afectación, tributo) es válida si coincide con la sugerida
// o si el tributo es genérico "Otros tributos" (9999).
function combinacionValida(afecKey, tribKey) {
  return tributoSugerido(afecKey) === tribKey || tribKey === "9999";
}

// Schema mínimo para JSON importado
function validarJsonImport(data) {
  if (!data || typeof data !== "object") return "El archivo no contiene un objeto JSON válido.";
  if (data.items && !Array.isArray(data.items)) return "'items' debe ser un array.";
  if (data.globales && !Array.isArray(data.globales)) return "'globales' debe ser un array.";
  if (data.items) {
    for (let i = 0; i < data.items.length; i++) {
      const it = data.items[i];
      if (typeof it !== "object" || !it.producto || typeof it.cantidad !== "number" || typeof it.precioUnit !== "number") {
        return `Ítem #${i+1} incompleto: requiere producto, cantidad y precioUnit numéricos.`;
      }
    }
  }
  return null;
}
