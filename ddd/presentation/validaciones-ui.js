// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Adaptadores DOM de las reglas de validación del dominio
// Lee del DOM, evalúa con dominio puro, escribe el estado visual.
// ════════════════════════════════════════════════════════════════════

function validarEmisor() {
  return setInvalid("emisorRuc", "emisorRucErr",
    validRuc($("emisorRuc").value.trim())
      ? ""
      : "RUC debe tener 11 dígitos y empezar con 10/15/17/20.");
}

function validarReceptor() {
  const tipo = $("receptorTipoDoc").value;
  const doc  = $("receptorDoc").value.trim();
  if (tipo === "0") return setInvalid("receptorDoc", "receptorDocErr", "");
  if (tipo === "1") return setInvalid("receptorDoc", "receptorDocErr",
    validDni(doc) ? "" : "DNI debe tener 8 dígitos numéricos.");
  if (tipo === "6") return setInvalid("receptorDoc", "receptorDocErr",
    validRuc(doc) ? "" : "RUC del receptor: 11 dígitos.");
  return setInvalid("receptorDoc", "receptorDocErr",
    doc ? "" : "Ingresa el número de documento.");
}

function validarSerie() {
  const tipo  = $("tipoComprobante").value;
  const serie = $("serie").value.toUpperCase().trim();
  const patron = (tipo === "01" || tipo === "08") ? /^F\d{3}$/
              :  (tipo === "03") ? /^B\d{3}$/
              :  (tipo === "07") ? /^(F|B)\d{3}$/
              :  /^[A-Z0-9]{4}$/;
  const tipoLbl = tipo === "03" ? "B###" : "F###";
  return setInvalid("serie", "serieErr",
    patron.test(serie) ? "" : `Serie esperada: ${tipoLbl} (ej. ${tipo === "03" ? "B001" : "F001"}).`);
}

function validarFecha() {
  const v = $("fechaEmision").value;
  if (!v) return setInvalid("fechaEmision", "fechaErr", "Fecha requerida.");
  const f = new Date(v + "T00:00:00");
  const hoy = new Date(); hoy.setHours(23, 59, 59, 999);
  return setInvalid("fechaEmision", "fechaErr", f > hoy ? "La fecha no puede ser futura." : "");
}

function validarCantidad() {
  const v = parseFloat($("cantidad").value) || 0;
  return setInvalid("cantidad", "cantidadErr", v > 0 ? "" : "Cantidad debe ser > 0.");
}

function validarPrecio() {
  const v = parseFloat($("precioUnit").value) || 0;
  return setInvalid("precioUnit", "precioErr", v >= 0 ? "" : "Precio no puede ser negativo.");
}
