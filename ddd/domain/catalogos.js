// ════════════════════════════════════════════════════════════════════
// DOMAIN · Catálogos SUNAT (fallback en código)
// Reglas: estos valores son sustituidos por data.json si la carga
//         remota funciona (ver infrastructure/data-json-loader.js).
// ════════════════════════════════════════════════════════════════════

// Cat.03 — Unidades de medida (UN/ECE Rec 20)
let CAT03 = {
  "NIU":"Unidad (bienes)","ZZ":"Servicio","KGM":"Kilogramo","GRM":"Gramo",
  "LBR":"Libra","MTR":"Metro","MMT":"Milímetro","LTR":"Litro","MLT":"Mililitro",
  "MTQ":"Metro cúbico","DZN":"Docena","HUR":"Hora","DAY":"Día","MON":"Mes",
  "KWH":"Kilowatt hora","TNE":"Tonelada métrica","FOT":"Pie","INH":"Pulgada",
  "M2":"Metro cuadrado","M3":"Metro cúbico",
};

// Cat.07 — Afectación IGV
let CAT07 = {
  "10":"Gravado - Operación onerosa","11":"Gravado - Retiro por premio",
  "12":"Gravado - Retiro por donación","13":"Gravado - Retiro",
  "14":"Gravado - Retiro por publicidad","15":"Gravado - Bonificaciones",
  "16":"Gravado - Retiro entrega a trabajadores","17":"Gravado - IVAP",
  "20":"Exonerado",
  "30":"Inafecto - Operación no onerosa","31":"Inafecto - Retiro por mudanza",
  "32":"Inafecto - Muestra médica","33":"Inafecto - Retiro por sorteo",
  "34":"Inafecto - Retiro entrega a trabajadores","35":"Inafecto - Retiro por grado",
  "36":"Inafecto - IVAP",
  "40":"Exportación",
};

// Cat.05 — Tributos. t = tasa fija (null = libre); modo = "pct" (% sobre base) | "unit" (monto × cantidad)
let CAT05 = {
  "1000":{n:"IGV - Impuesto General a las Ventas",a:"IGV",t:0.18,modo:"pct"},
  "1016":{n:"IVAP - Impuesto Venta Arroz Pilado",a:"IVAP",t:0.04,modo:"pct"},
  "2000":{n:"ISC - Impuesto Selectivo al Consumo",a:"ISC",t:null,modo:"pct"},
  "3000":{n:"IR - Impuesto a la Renta",a:"IR",t:null,modo:"pct"},
  "7152":{n:"ICBPER - Bolsas Plásticas",a:"ICBPER",t:null,modo:"unit"},
  "9995":{n:"Exportación",a:"EXP",t:0,modo:"pct"},
  "9996":{n:"Gratuito",a:"GRA",t:0,modo:"pct"},
  "9997":{n:"Exonerado",a:"EXO",t:0,modo:"pct"},
  "9998":{n:"Inafecto",a:"INA",t:0,modo:"pct"},
  "9999":{n:"Otros tributos",a:"OTROS",t:null,modo:"pct"},
};

// Cat.53 — Cargos/Descuentos. l = nivel (Ítem/Global) · t = desc/cargo · ab = afecta base imp · f = factor fijo · base = base de cálculo
let CAT53 = [
  {c:"00",d:"Descuentos que afectan BI IGV/IVAP",l:"Ítem",t:"desc",ab:true,f:null,base:"base"},
  {c:"01",d:"Descuentos que NO afectan BI IGV/IVAP",l:"Ítem",t:"desc",ab:false,f:null,base:"base"},
  {c:"02",d:"Descuentos globales que afectan BI IGV/IVAP",l:"Global",t:"desc",ab:true,f:null,base:"base"},
  {c:"03",d:"Descuentos globales que NO afectan BI IGV/IVAP",l:"Global",t:"desc",ab:false,f:null,base:"base"},
  {c:"04",d:"Descuentos globales x anticipos gravados afectan BI",l:"Global",t:"desc",ab:true,f:null,base:"base"},
  {c:"05",d:"Descuentos globales x anticipos exonerados",l:"Global",t:"desc",ab:false,f:null,base:"base"},
  {c:"06",d:"Descuentos globales x anticipos inafectos",l:"Global",t:"desc",ab:false,f:null,base:"base"},
  {c:"07",d:"Factor compensación - DU 010-2004",l:"Ítem",t:"desc",ab:true,f:null,base:"base"},
  {c:"45",d:"FISE",l:"Global",t:"cargo",ab:false,f:null,base:"base+igv"},
  {c:"46",d:"Recargo al consumo y/o propinas",l:"Global",t:"cargo",ab:false,f:null,base:"base+igv"},
  {c:"47",d:"Cargos que afectan BI IGV/IVAP",l:"Ítem",t:"cargo",ab:true,f:null,base:"base"},
  {c:"48",d:"Cargos que NO afectan BI IGV/IVAP",l:"Ítem",t:"cargo",ab:false,f:null,base:"base"},
  {c:"49",d:"Cargos globales que afectan BI IGV/IVAP",l:"Global",t:"cargo",ab:true,f:null,base:"base"},
  {c:"50",d:"Cargos globales que NO afectan BI IGV/IVAP",l:"Global",t:"cargo",ab:false,f:null,base:"base"},
  {c:"51",d:"Percepción venta interna",l:"Global",t:"cargo",ab:false,f:0.02,base:"base+igv"},
  {c:"52",d:"Percepción adquisición combustible",l:"Global",t:"cargo",ab:false,f:0.01,base:"base+igv"},
  {c:"53",d:"Percepción agente percepción tasa especial",l:"Global",t:"cargo",ab:false,f:0.005,base:"base+igv"},
  {c:"54",d:"Factor aportación - DU 010-2004",l:"Ítem",t:"cargo",ab:true,f:null,base:"base"},
  {c:"61",d:"Retención de renta por anticipos",l:"Global",t:"desc",ab:false,f:null,base:"base"},
];

let PRODUCTOS = [
  "Laptop HP Pavilion 15","Smartphone Samsung Galaxy S24","Teclado mecánico Logitech",
  'Monitor Dell 27" 4K',"Mouse inalámbrico MX Master 3","Audífonos Sony WH-1000XM5",
  "Impresora HP LaserJet","Escritorio ergonómico","Silla de oficina ejecutiva",
  "Útiles de escritorio (kit)","Servicio de consultoría TI","Servicio de desarrollo web",
  "Otro (personalizado)",
];

// Defaults remotos (cargados desde data.json si existe)
let DEFAULTS_COMPROBANTE = null;
let DATA_JSON_META = null;

// ── Helpers de catálogo ─────────────────────────────────────────────
function getCat53(c)       { return CAT53.find(e => e.c === c); }
function getCat53Items()   { return CAT53.filter(e => e.l === "Ítem"); }
function getCat53Globals() { return CAT53.filter(e => e.l === "Global"); }
function getCat07Grupo(c)  {
  if (!c) return "otro";
  if (c.startsWith("1")) return "gravada";
  if (c.startsWith("2")) return "exonerada";
  if (c.startsWith("3")) return "inafecta";
  if (c.startsWith("4")) return "exportacion";
  return "otro";
}
function esIgvAplicable(afecKey) { return (afecKey || "").startsWith("1"); }
