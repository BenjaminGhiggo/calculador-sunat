// ════════════════════════════════════════════════════════════════════
// INFRASTRUCTURE · Loader de catálogos desde data.json
// Adaptador externo: lee un archivo remoto y reemplaza catálogos en memoria.
// Si falla (file://, CORS, 404), el dominio queda con sus fallbacks.
// ════════════════════════════════════════════════════════════════════

async function cargarDataJson() {
  // file:// bloquea fetch por CORS — saltar silenciosamente y usar fallback
  if (typeof location !== "undefined" && location.protocol === "file:") {
    return { ok: false, fileProtocol: true };
  }
  try {
    const res = await fetch("data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const d = await res.json();
    if (d.cat03) CAT03 = d.cat03;
    if (d.cat07) CAT07 = d.cat07;
    if (d.cat05) CAT05 = d.cat05;
    if (Array.isArray(d.cat53))     CAT53     = d.cat53;
    if (Array.isArray(d.productos)) PRODUCTOS = d.productos;
    if (d.comprobanteDefault) DEFAULTS_COMPROBANTE = d.comprobanteDefault;
    if (d._meta)              DATA_JSON_META      = d._meta;
    return { ok: true };
  } catch (e) {
    return { ok: false, err: e.message };
  }
}
