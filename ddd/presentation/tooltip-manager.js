// ════════════════════════════════════════════════════════════════════
// PRESENTATION · Tooltip Manager (Bento Grid Premium)
// Reemplaza el tooltip CSS :hover::after por componente JS flotante.
// Parsea data-tip y extrae normas + UBL tags automáticamente — sin
// requerir actualizar los 51 tooltips existentes.
// ════════════════════════════════════════════════════════════════════

(function () {
  let _activeTooltip = null;
  let _activeTrigger = null;
  let _hideTimer = null;
  let _pinned = false;     // true cuando el tooltip está fijado por click

  // Patrones para extraer referencias normativas SUNAT
  const LAW_PATTERNS = [
    /R\.S\.\s*N?°?\s*\d+(?:[-./]\d+)*(?:\s*\/\s*SUNAT)?(?:\s+(?:Anexo|Art\.)\s*[\dIVX.]+)?/gi,
    /Ley\s+(?:N°\s*)?\d+(?:[-.]\d+)?(?:\s+Art\.\s*[\dIVX.]+)?/gi,
    /D\.S\.\s*N?°?\s*\d+[-./]\d+(?:[-./][A-Z]+)?(?:\s+Art\.\s*[\dIVX.]+)?/gi,
    /D\.\s*Leg\.\s*\d+/gi,
    /D\.L\.\s*\d+/gi,
    /TUO\s+(?:de\s+la\s+)?Ley\s+(?:del\s+)?IGV(?:\s+Art\.\s*[\dIVX.]+)?/gi,
    /Reglamento\s+de\s+Comprobantes\s+de\s+Pago(?:\s+Art\.\s*[\dIVX.]+)?/gi,
    /Reglamento\s+IGV(?:\s+Art\.\s*[\dIVX.]+)?/gi,
    /Código\s+Tributario(?:\s+Art\.\s*[\dIVX.]+)?/gi,
    /Anexo\s+(?:N°\s*)?\d+(?:\s+R\.S\.\s*\d+[-./]\d+)?/gi,
    /Cat[áa]logo\s+(?:SUNAT\s+)?N?°?\s*\d+/gi,
    /UN\/ECE\s+Rec\.?\s+\d+/gi,
    /Apéndice\s+[IVX]+(?:\s+Ley\s+IGV)?/gi,
  ];

  const XML_PATTERN = /(?:cbc|cac|ext|ds|sac):[A-Za-z][A-Za-z0-9_]*/g;

  function escHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function parseContent(text) {
    if (!text) return { desc: "", laws: [], xmls: [] };
    const laws = new Set();
    const xmls = new Set();
    let m;
    while ((m = XML_PATTERN.exec(text)) !== null) xmls.add(m[0]);
    XML_PATTERN.lastIndex = 0;
    for (const pat of LAW_PATTERNS) {
      while ((m = pat.exec(text)) !== null) laws.add(m[0].trim());
      pat.lastIndex = 0;
    }
    // Limpiar descripción: dejar todo el texto como está (la persona lee mejor con contexto)
    return { desc: text, laws: [...laws], xmls: [...xmls] };
  }

  // Categoría inferida del contexto (label cercano del trigger)
  function inferCategory(trigger) {
    const explicit = trigger.getAttribute("data-tip-cat");
    if (explicit) return explicit;
    // Buscar el label más cercano
    const label = trigger.closest("label");
    if (label) {
      // Quitar el "?" del span.help para sacar solo el texto del label
      const clone = label.cloneNode(true);
      clone.querySelectorAll(".help, .tip-i").forEach(e => e.remove());
      const txt = clone.textContent.trim().replace(/\s+/g, " ");
      // Tomar la primera "linea visible" (modo simple > exp > texto raw)
      const simple = label.querySelector(".simple-only");
      if (simple && simple.offsetParent !== null) return simple.textContent.trim();
      return txt.slice(0, 30);
    }
    // En headers de tabla
    const th = trigger.closest("th");
    if (th) {
      const clone = th.cloneNode(true);
      clone.querySelectorAll(".tip-i").forEach(e => e.remove());
      return clone.textContent.trim().slice(0, 30);
    }
    return "SUNAT";
  }

  function buildHtml(trigger, pinned) {
    const raw = trigger.getAttribute("data-tip") || "";
    const cat = inferCategory(trigger);
    const { desc, laws, xmls } = parseContent(raw);

    return `
      <div class="tp-card">
        <div class="tp-head">
          <span class="tp-cat">${escHtml(cat)}</span>
          <span class="tp-meta">SUNAT · UBL 2.1</span>
          ${pinned ? `<button class="tp-close" type="button" aria-label="Cerrar (Esc)" title="Cerrar (Esc)">×</button>` : `<span class="tp-hint">click para fijar</span>`}
        </div>
        <div class="tp-body">
          <p class="tp-desc">${escHtml(desc)}</p>
        </div>
        ${(laws.length || xmls.length) ? `<div class="tp-foot">
          ${laws.length ? `<div class="tp-block tp-block-law">
            <span class="tp-block-label">Base Legal</span>
            <span class="tp-block-val">${laws.map(escHtml).join(" · ")}</span>
          </div>` : ""}
          ${xmls.length ? `<div class="tp-block tp-block-xml">
            <span class="tp-block-label">UBL Tag</span>
            <span class="tp-block-val">${xmls.map(x => "&lt;" + escHtml(x) + "&gt;").join(" ")}</span>
          </div>` : ""}
        </div>` : ""}
        <div class="tp-arrow"></div>
      </div>
    `;
  }

  function show(trigger, opts) {
    opts = opts || {};
    if (_activeTrigger === trigger && !opts.force) return;
    hide({ force: true });
    clearTimeout(_hideTimer);
    const tt = document.createElement("div");
    tt.className = "tooltip-pro";
    if (opts.pin) tt.classList.add("pinned");
    tt.innerHTML = buildHtml(trigger, !!opts.pin);
    tt.setAttribute("role", "tooltip");
    document.body.appendChild(tt);
    position(trigger, tt);
    requestAnimationFrame(() => tt.classList.add("show"));
    _activeTooltip = tt;
    _activeTrigger = trigger;
    _pinned = !!opts.pin;
    // Sincronizar estado visual del trigger
    document.querySelectorAll(".help.pinned, .tip-i.pinned")
      .forEach(el => el.classList.remove("pinned"));
    if (_pinned) trigger.classList.add("pinned");
    // Botón de cerrar
    const closeBtn = tt.querySelector(".tp-close");
    if (closeBtn) closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      hide({ force: true });
    });
  }

  function hide(opts) {
    opts = opts || {};
    // Si está fijo y no es un cierre forzado, no cerrar
    if (_pinned && !opts.force) return;
    clearTimeout(_hideTimer);
    if (_activeTooltip) {
      const el = _activeTooltip;
      el.classList.remove("show");
      el.classList.add("leaving");
      setTimeout(() => el.remove(), 160);
      _activeTooltip = null;
      if (_activeTrigger) {
        _activeTrigger.classList.remove("pinned");
        _activeTrigger = null;
      }
      _pinned = false;
    }
  }

  function position(trigger, tooltip) {
    const tr = trigger.getBoundingClientRect();
    const tt = tooltip.getBoundingClientRect();
    const scY = window.scrollY;
    const scX = window.scrollX;
    const pad = 12;
    const gap = 10;

    // Default: arriba centrado
    let top = tr.top + scY - tt.height - gap;
    let left = tr.left + scX + tr.width / 2 - tt.width / 2;
    let side = "top";

    // Flip a abajo si no cabe arriba
    if (tr.top < tt.height + gap + 10) {
      top = tr.bottom + scY + gap;
      side = "bottom";
    }

    // Clamp horizontal
    if (left < pad) left = pad;
    const maxL = window.innerWidth + scX - tt.width - pad;
    if (left > maxL) left = maxL;

    tooltip.style.top = top + "px";
    tooltip.style.left = left + "px";

    // Posicionar flecha
    const arrow = tooltip.querySelector(".tp-arrow");
    if (arrow) {
      const aLeft = tr.left + scX + tr.width / 2 - left - 6;
      arrow.style.left = aLeft + "px";
      arrow.classList.remove("tp-arrow-top", "tp-arrow-bottom");
      arrow.classList.add(side === "top" ? "tp-arrow-bottom" : "tp-arrow-top");
    }
  }

  function init() {
    // mouseover/mouseout sí burbujea (a diferencia de mouseenter/leave)
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest && e.target.closest(".help, .tip-i");
      if (t && !_pinned) show(t);  // si está pinned, hover no cambia el activo
    });
    document.addEventListener("mouseout", (e) => {
      const t = e.target.closest && e.target.closest(".help, .tip-i");
      if (t && !_pinned) {
        clearTimeout(_hideTimer);
        _hideTimer = setTimeout(hide, 80);
      }
    });
    // Click: toggle pin
    document.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest(".help, .tip-i");
      const insideTooltip = e.target.closest && e.target.closest(".tooltip-pro");
      if (t) {
        e.preventDefault();
        e.stopPropagation();
        if (_pinned && _activeTrigger === t) {
          // Segundo click sobre el mismo trigger → cerrar
          hide({ force: true });
        } else {
          // Primer click o click sobre otro trigger → fijar
          show(t, { pin: true, force: true });
        }
      } else if (!insideTooltip) {
        // Click fuera del trigger y fuera del tooltip → cerrar (incluso si está fijo)
        hide({ force: true });
      }
    });
    // Focus por teclado
    document.addEventListener("focusin", (e) => {
      if (e.target.matches && e.target.matches(".help, .tip-i") && !_pinned) show(e.target);
    });
    document.addEventListener("focusout", (e) => {
      if (e.target.matches && e.target.matches(".help, .tip-i") && !_pinned) hide();
    });
    // Escape cierra siempre, incluso si está fijo
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") hide({ force: true });
    });
    // Scroll cierra solo en modo no-fijo (mantener fijo mientras scrolleas para leer)
    window.addEventListener("scroll", () => { if (!_pinned) hide(); }, { passive: true, capture: true });
  }

  // Exponer al global
  window.initTooltipManager = init;
  window.hideTooltip = hide;
})();
