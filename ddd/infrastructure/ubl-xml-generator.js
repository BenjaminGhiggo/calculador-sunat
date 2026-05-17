// ════════════════════════════════════════════════════════════════════
// INFRASTRUCTURE · Generador XML UBL 2.1 (SUNAT)
// Adaptador de salida: traduce el dominio a XML conforme a la guía SEE.
// NO incluye firma XMLDSig — debe inyectarse por firmador externo.
// ════════════════════════════════════════════════════════════════════

function escXml(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function cdata(s) {
  return `<![CDATA[${String(s || "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

// Mapeo Cat.07 (afectación) → categoría UBL + tributo SUNAT
function infoTributacion(afecKey, trib, tasaReal) {
  const grupo = getCat07Grupo(afecKey);
  if (grupo === "gravada")
    return {
      categoria: "S", taxTypeCode: "VAT",
      taxId:   trib.a === "IVAP" ? "1016" : "1000",
      taxName: trib.a === "IVAP" ? "IVAP" : "IGV",
      percent: round(tasaReal * 100, 2),
    };
  if (grupo === "exonerada")
    return { categoria: "E", taxTypeCode: "VAT", taxId: "9997", taxName: "EXO", percent: 0 };
  if (grupo === "inafecta")
    return { categoria: "O", taxTypeCode: "FRE", taxId: "9998", taxName: "INA", percent: 0 };
  if (grupo === "exportacion")
    return { categoria: "G", taxTypeCode: "FRE", taxId: "9995", taxName: "EXP", percent: 0 };
  return { categoria: "S", taxTypeCode: "VAT", taxId: "1000", taxName: "IGV", percent: 18 };
}

function xmlInvoiceLine(r, idx, currencyId) {
  const p = r.item;
  const info = infoTributacion(p.afectacion, r.trib, r.tasa);
  const qty  = (p.cantidad || 0).toFixed(2);
  const valU = r.valorUnitario.toFixed(2);
  const pVta = r.precioVentaUnitario.toFixed(2);
  const base = r.biFinal.toFixed(2);
  const igv  = r.igv.toFixed(2);

  // Múltiples AllowanceCharge por línea (UBL cardinalidad 0..n)
  const allowances = (r.cargosResultado || []).map(cr => `
    <cac:AllowanceCharge>
      <cbc:ChargeIndicator>${cr.cat53.t === "cargo" ? "true" : "false"}</cbc:ChargeIndicator>
      <cbc:AllowanceChargeReasonCode listAgencyName="PE:SUNAT" listName="Cargo/descuento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo53">${escXml(cr.cat53.c)}</cbc:AllowanceChargeReasonCode>
      ${cr.factor != null ? `<cbc:MultiplierFactorNumeric>${cr.factor.toFixed(5)}</cbc:MultiplierFactorNumeric>` : ""}
      <cbc:Amount currencyID="${currencyId}">${cr.monto.toFixed(2)}</cbc:Amount>
      <cbc:BaseAmount currencyID="${currencyId}">${r.baseImp.toFixed(2)}</cbc:BaseAmount>
    </cac:AllowanceCharge>`).join("");

  let icbperSubtotal = "";
  if (r.icbper > 0) {
    icbperSubtotal = `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currencyId}">${p.cantidad.toFixed(2)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currencyId}">${r.icbper.toFixed(2)}</cbc:TaxAmount>
        <cbc:BaseUnitMeasure unitCode="${escXml(p.unidad)}">${p.cantidad.toFixed(2)}</cbc:BaseUnitMeasure>
        <cac:TaxCategory>
          <cbc:PerUnitAmount currencyID="${currencyId}">${(p.tasaInput || 0).toFixed(2)}</cbc:PerUnitAmount>
          <cac:TaxScheme><cbc:ID>7152</cbc:ID><cbc:Name>ICBPER</cbc:Name><cbc:TaxTypeCode>OTH</cbc:TaxTypeCode></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>`;
  }

  return `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="${escXml(p.unidad)}" unitCodeListID="UN/ECE rec 20" unitCodeListAgencyName="United Nations Economic Commission for Europe">${qty}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currencyId}">${base}</cbc:LineExtensionAmount>
    <cac:PricingReference>
      <cac:AlternativeConditionPrice>
        <cbc:PriceAmount currencyID="${currencyId}">${pVta}</cbc:PriceAmount>
        <cbc:PriceTypeCode listName="Tipo de Precio" listAgencyName="PE:SUNAT" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo16">01</cbc:PriceTypeCode>
      </cac:AlternativeConditionPrice>
    </cac:PricingReference>${allowances}
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${currencyId}">${(r.igv + r.icbper).toFixed(2)}</cbc:TaxAmount>
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${currencyId}">${base}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${currencyId}">${igv}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:Percent>${info.percent.toFixed(2)}</cbc:Percent>
          <cbc:TaxExemptionReasonCode listAgencyName="PE:SUNAT" listName="Afectacion del IGV" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo07">${escXml(p.afectacion)}</cbc:TaxExemptionReasonCode>
          <cac:TaxScheme>
            <cbc:ID>${info.taxId}</cbc:ID><cbc:Name>${info.taxName}</cbc:Name><cbc:TaxTypeCode>${info.taxTypeCode}</cbc:TaxTypeCode>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>${icbperSubtotal}
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Description>${cdata(p.producto)}</cbc:Description>
      <cac:SellersItemIdentification><cbc:ID>${escXml(p.codigo)}</cbc:ID></cac:SellersItemIdentification>
    </cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="${currencyId}">${valU}</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>`;
}

function xmlAllowanceChargeGlobal(g, c, currencyId, idx) {
  const cat53 = getCat53(g.codigo);
  const det = c.detalleGlobales[idx];
  if (!cat53 || !det) return "";
  const factor = cat53.f !== null ? cat53.f : (g.modo === "porcentaje" ? g.valor / 100 : null);
  return `
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>${cat53.t === "cargo" ? "true" : "false"}</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReasonCode listAgencyName="PE:SUNAT" listName="Cargo/descuento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo53">${escXml(cat53.c)}</cbc:AllowanceChargeReasonCode>
    ${factor != null ? `<cbc:MultiplierFactorNumeric>${factor.toFixed(5)}</cbc:MultiplierFactorNumeric>` : ""}
    <cbc:Amount currencyID="${currencyId}">${det.monto.toFixed(2)}</cbc:Amount>
    <cbc:BaseAmount currencyID="${currencyId}">${det.baseRef.toFixed(2)}</cbc:BaseAmount>
  </cac:AllowanceCharge>`;
}

function generarUblXml(s) {
  const cb = s.comprobante;
  const c = calcComprobante({ items: s.items, globales: s.globales });
  const cid = cb.moneda;
  const docId = `${cb.serie}-${String(cb.correlativo).padStart(8, "0")}`;
  const rootEl = ["07","08"].includes(cb.tipo) ? (cb.tipo === "07" ? "CreditNote" : "DebitNote") : "Invoice";
  const rootNs = rootEl === "Invoice"    ? "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
               : rootEl === "CreditNote" ? "urn:oasis:names:specification:ubl:schema:xsd:CreditNote-2"
               :                           "urn:oasis:names:specification:ubl:schema:xsd:DebitNote-2";
  const tipoOperacion = cb.tipoOperacion || "0101";

  const lineas     = c.itemsRes.map((r, i) => xmlInvoiceLine(r, i, cid)).join("");
  const allowances = (s.globales || []).map((g, i) => xmlAllowanceChargeGlobal(g, c, cid, i)).join("");

  const taxTotalDoc = `
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${cid}">${(c.igvFinal + c.totalIcbper).toFixed(2)}</cbc:TaxAmount>
    ${c.totalGravadas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.baseGravadaAjustada.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">${c.igvFinal.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>1000</cbc:ID><cbc:Name>IGV</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalExoneradas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalExoneradas.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>9997</cbc:ID><cbc:Name>EXO</cbc:Name><cbc:TaxTypeCode>VAT</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalInafectas > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalInafectas.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>9998</cbc:ID><cbc:Name>INA</cbc:Name><cbc:TaxTypeCode>FRE</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalExportacion > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">${c.totalExportacion.toFixed(2)}</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">0.00</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>9995</cbc:ID><cbc:Name>EXP</cbc:Name><cbc:TaxTypeCode>FRE</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
    ${c.totalIcbper > 0 ? `<cac:TaxSubtotal>
      <cbc:TaxableAmount currencyID="${cid}">0.00</cbc:TaxableAmount>
      <cbc:TaxAmount currencyID="${cid}">${c.totalIcbper.toFixed(2)}</cbc:TaxAmount>
      <cac:TaxCategory><cac:TaxScheme><cbc:ID>7152</cbc:ID><cbc:Name>ICBPER</cbc:Name><cbc:TaxTypeCode>OTH</cbc:TaxTypeCode></cac:TaxScheme></cac:TaxCategory>
    </cac:TaxSubtotal>` : ""}
  </cac:TaxTotal>`;

  const sumLineExt     = c.itemsRes.reduce((s, r) => s + r.biFinal, 0);
  const allowanceTotal = c.descGlobalAfectaBI + c.descGlobalNoAfectaBI;
  const chargeTotal    = c.cargoGlobalAfectaBI + c.cargoGlobalNoAfectaBI;
  const monetaryTotal = `
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${cid}">${sumLineExt.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxInclusiveAmount currencyID="${cid}">${(c.importeTotal - c.percepcion).toFixed(2)}</cbc:TaxInclusiveAmount>
    ${allowanceTotal > 0 ? `<cbc:AllowanceTotalAmount currencyID="${cid}">${allowanceTotal.toFixed(2)}</cbc:AllowanceTotalAmount>` : ""}
    ${chargeTotal    > 0 ? `<cbc:ChargeTotalAmount currencyID="${cid}">${chargeTotal.toFixed(2)}</cbc:ChargeTotalAmount>` : ""}
    <cbc:PayableAmount currencyID="${cid}">${c.importeTotal.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>`;

  const supplier = `
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="6" schemeName="Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${escXml(cb.emisor.ruc)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyName><cbc:Name>${cdata(cb.emisor.razon)}</cbc:Name></cac:PartyName>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${cdata(cb.emisor.razon)}</cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cbc:AddressTypeCode>0000</cbc:AddressTypeCode>
          <cac:AddressLine><cbc:Line>${cdata(cb.emisor.direccion)}</cbc:Line></cac:AddressLine>
          <cac:Country><cbc:IdentificationCode>PE</cbc:IdentificationCode></cac:Country>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>`;

  const customer = `
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification>
        <cbc:ID schemeID="${escXml(cb.receptor.tipoDoc)}" schemeName="Documento de Identidad" schemeAgencyName="PE:SUNAT" schemeURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo06">${escXml(cb.receptor.doc)}</cbc:ID>
      </cac:PartyIdentification>
      <cac:PartyLegalEntity>
        <cbc:RegistrationName>${cdata(cb.receptor.razon)}</cbc:RegistrationName>
        <cac:RegistrationAddress>
          <cac:AddressLine><cbc:Line>${cdata(cb.receptor.direccion || "-")}</cbc:Line></cac:AddressLine>
        </cac:RegistrationAddress>
      </cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>`;

  const signature = `
  <cac:Signature>
    <cbc:ID>${escXml(docId)}</cbc:ID>
    <cac:SignatoryParty>
      <cac:PartyIdentification><cbc:ID>${escXml(cb.emisor.ruc)}</cbc:ID></cac:PartyIdentification>
      <cac:PartyName><cbc:Name>${cdata(cb.emisor.razon)}</cbc:Name></cac:PartyName>
    </cac:SignatoryParty>
    <cac:DigitalSignatureAttachment>
      <cac:ExternalReference><cbc:URI>#SignatureSP</cbc:URI></cac:ExternalReference>
    </cac:DigitalSignatureAttachment>
  </cac:Signature>`;

  const typeCodeTag = rootEl === "Invoice"
    ? `<cbc:InvoiceTypeCode listAgencyName="PE:SUNAT" listName="Tipo de Documento" listURI="urn:pe:gob:sunat:cpe:see:gem:catalogos:catalogo01" listID="${tipoOperacion}">${cb.tipo}</cbc:InvoiceTypeCode>`
    : "";

  const lineWrap = rootEl === "Invoice"    ? "InvoiceLine"
                 : rootEl === "CreditNote" ? "CreditNoteLine"
                 :                           "DebitNoteLine";

  return `<?xml version="1.0" encoding="UTF-8"?>
<${rootEl}
  xmlns="${rootNs}"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2"
  xmlns:ds="http://www.w3.org/2000/09/xmldsig#"
  xmlns:ext="urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2"
  xmlns:sac="urn:sunat:names:specification:ubl:peru:schema:xsd:SunatAggregateComponents-1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <ext:UBLExtensions>
    <ext:UBLExtension>
      <ext:ExtensionContent>
        <!-- Firma digital del emisor (XMLDSig) — inyectar antes de enviar a SUNAT -->
      </ext:ExtensionContent>
    </ext:UBLExtension>
  </ext:UBLExtensions>
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>2.0</cbc:CustomizationID>
  <cbc:ID>${escXml(docId)}</cbc:ID>
  <cbc:IssueDate>${escXml(cb.fechaEmision)}</cbc:IssueDate>
  <cbc:IssueTime>${new Date().toTimeString().slice(0,8)}</cbc:IssueTime>
  ${typeCodeTag}
  <cbc:DocumentCurrencyCode>${escXml(cid)}</cbc:DocumentCurrencyCode>
  ${signature}
  ${supplier}
  ${customer}${allowances}
  ${taxTotalDoc}
  ${monetaryTotal}
${lineas.replace(/InvoiceLine/g, lineWrap)}
</${rootEl}>
`;
}
