// ════════════════════════════════════════════════════════════════════
// DOMAIN · Entidad Comprobante + migración de modelo viejo
// ════════════════════════════════════════════════════════════════════

// Estado base del comprobante. Se sobreescribe con DEFAULTS_COMPROBANTE
// si data.json los provee.
function comprobanteDefault() {
  const base = {
    tipo: "03", serie: "B001", correlativo: 1, moneda: "PEN",
    fechaEmision: new Date().toISOString().slice(0, 10),
    tipoOperacion: "0101",       // Cat.51 — venta interna por defecto
    regimenIgv: 18,              // 18 general | 10.5 MYPE turismo
    emisor:   { ruc: "20123456789", razon: "MI EMPRESA S.A.C.", direccion: "Av. Principal 123, Lima" },
    receptor: { tipoDoc: "1", doc: "00000000", razon: "CLIENTE VARIOS", direccion: "-" },
  };
  if (!DEFAULTS_COMPROBANTE) return base;
  return {
    ...base, ...DEFAULTS_COMPROBANTE,
    fechaEmision: DEFAULTS_COMPROBANTE.fechaEmision || base.fechaEmision,
    emisor:   { ...base.emisor,   ...(DEFAULTS_COMPROBANTE.emisor   || {}) },
    receptor: { ...base.receptor, ...(DEFAULTS_COMPROBANTE.receptor || {}) },
  };
}

// Migra ítems del modelo viejo (codigo53Item/modoOp/valorOp) al nuevo (cargosDescuentos[]).
// Esto permite cargar JSON exportado por versiones anteriores sin pérdida.
function migrarItem(item) {
  if (Array.isArray(item.cargosDescuentos)) return item;
  const cd = [];
  if (item.codigo53Item) {
    const c = getCat53(item.codigo53Item);
    if (c && (item.valorOp > 0 || c.f !== null)) {
      cd.push({
        codigo: item.codigo53Item,
        modo: item.modoOp || "porcentaje",
        valor: item.valorOp || 0,
      });
    }
  }
  return { ...item, cargosDescuentos: cd };
}
