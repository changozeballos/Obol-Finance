/* Adaptado de CurvedInput (React Bits) a HTML/CSS/JS vanilla, sin React.
   Simplificado para un solo uso: captura de email + botón curvo, sin la
   ventana de scroll para texto largo del original (se recorta en cambio). */
(function () {
  "use strict";

  var DEG = 180 / Math.PI;
  function round2(n) { return Math.round(n * 100) / 100; }
  function escXml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function buildGeometry(width, bend, thickness, pad) {
    var W = width, T = thickness;
    var s = Math.max(-W * 0.35, Math.min(bend, W * 0.35));
    var a = Math.abs(s);
    var dir = s >= 0 ? 1 : -1;
    var svgH = T + a + pad * 2;
    if (a < 0.75) {
      var midY = pad + T / 2;
      return {
        straight: true, W: W, svgH: svgH,
        point: function (u, v) { return [u, midY + v]; },
        angleAt: function () { return 0; }
      };
    }
    var R = (W * W * 0.25 + a * a) / (2 * a);
    var cx = W / 2;
    var apexY = pad + T / 2 + (dir > 0 ? 0 : a);
    var cy = apexY + dir * R;
    var phi = Math.asin(Math.min(1, W / (2 * R)));
    return {
      straight: false, W: W, svgH: svgH, R: R, dir: dir,
      point: function (u, v) {
        var th = ((u - cx) / cx) * phi;
        var rho = R - dir * v;
        return [cx + rho * Math.sin(th), cy - dir * rho * Math.cos(th)];
      },
      angleAt: function (u) { return dir * ((u - cx) / cx) * phi * DEG; }
    };
  }

  function fmt(g, u, v) {
    var p = g.point(u, v);
    return round2(p[0]) + ' ' + round2(p[1]);
  }
  function edgeSeg(g, uTo, v, ltr) {
    if (g.straight) return 'L ' + fmt(g, uTo, v);
    var rho = round2(g.R - g.dir * v);
    var sweep = (ltr === (g.dir > 0)) ? 1 : 0;
    return 'A ' + rho + ' ' + rho + ' 0 0 ' + sweep + ' ' + fmt(g, uTo, v);
  }
  function bentRectPath(g, u0, u1, vTop, vBot, radius) {
    var rc = Math.max(0, Math.min(radius, (vBot - vTop) / 2, (u1 - u0) / 2));
    return [
      'M ' + fmt(g, u0 + rc, vTop),
      edgeSeg(g, u1 - rc, vTop, true),
      'Q ' + fmt(g, u1, vTop) + ' ' + fmt(g, u1, vTop + rc),
      'L ' + fmt(g, u1, vBot - rc),
      'Q ' + fmt(g, u1, vBot) + ' ' + fmt(g, u1 - rc, vBot),
      edgeSeg(g, u0 + rc, vBot, false),
      'Q ' + fmt(g, u0, vBot) + ' ' + fmt(g, u0, vBot - rc),
      'L ' + fmt(g, u0, vTop + rc),
      'Q ' + fmt(g, u0, vTop) + ' ' + fmt(g, u0 + rc, vTop),
      'Z'
    ].join(' ');
  }
  function bentLinePath(g, u0, u1, v) {
    return 'M ' + fmt(g, u0, v) + ' ' + edgeSeg(g, u1, v, true);
  }

  var seq = 0;

  window.ObolCurvedInput = function (host, opts) {
    var o = Object.assign({
      placeholder: 'tu@mail.com',
      buttonText: 'Enviar',
      type: 'email',
      bg: '#101a34',
      text: '#ffffff',
      placeholderColor: 'rgba(255,255,255,.45)',
      border: 'rgba(255,255,255,.22)',
      accentFrom: '#ffe08a',
      accentTo: '#ffb24a',
      accentText: '#16213e',
      height: 54,
      bend: 16,
      cornerRadius: 999,
      borderWidth: 1.5,
      fontSize: 14.5,
      onSubmit: function () {}
    }, opts || {});

    var uid = 'oci' + (seq++);
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var value = '';
    var caretIndex = 0;
    var focused = false;
    var busy = false;
    var btnTextW = o.buttonText.length * o.fontSize * 0.6;

    host.style.position = 'relative';
    host.style.width = '100%';

    var svgNS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(svgNS, 'svg');
    svg.style.cssText = 'display:block;overflow:visible;width:100%;height:auto;cursor:text;user-select:none;-webkit-tap-highlight-color:transparent;';

    var input = document.createElement('input');
    input.type = o.type;
    input.autocomplete = o.type === 'email' ? 'email' : 'off';
    input.setAttribute('aria-label', o.placeholder);
    input.setAttribute('autocapitalize', 'none');
    input.setAttribute('autocorrect', 'off');
    input.setAttribute('spellcheck', 'false');
    input.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;opacity:0;border:0;padding:0;margin:0;background:transparent;color:transparent;caret-color:transparent;font-size:16px;outline:none;pointer-events:none;';

    svg.addEventListener('pointerdown', function (e) { e.preventDefault(); });

    host.appendChild(svg);
    host.appendChild(input);

    function layoutMetrics(geom) {
      var T = o.height;
      var btnInset = Math.max(5, o.borderWidth + 4);
      var chipH = Math.min(30, Math.max(16, T * 0.4));
      var chipW = chipH * 1.15;
      var iconU = 20 + chipW / 2;
      var textStartU = 20 + chipW + 12;
      var btnW = Math.max(btnTextW + o.fontSize * 2.6, T * 1.3);
      var btnU1 = geom.W - btnInset;
      var btnU0 = btnU1 - btnW;
      var textEndU = Math.max(textStartU + 20, btnU0 - 12);
      return { btnInset: btnInset, chipH: chipH, chipW: chipW, iconU: iconU, textStartU: textStartU, textEndU: textEndU, btnU0: btnU0, btnU1: btnU1 };
    }

    function render() {
      var w = host.clientWidth;
      if (w < 40) return;
      var pad = Math.ceil(o.borderWidth / 2) + 6;
      var geom = buildGeometry(w, o.bend, o.height, pad);
      var layout = layoutMetrics(geom);
      var T = o.height;
      var vBase = o.fontSize * 0.34;
      var display = o.type === 'password' ? '•'.repeat(value.length) : value;

      svg.setAttribute('width', geom.W);
      svg.setAttribute('height', round2(geom.svgH));
      svg.setAttribute('viewBox', '0 0 ' + geom.W + ' ' + round2(geom.svgH));

      var bandPath = bentRectPath(geom, 0, geom.W, -T / 2, T / 2, o.cornerRadius);
      var clipPath = bentRectPath(geom, layout.textStartU - 4, layout.textEndU + 4, -T / 2, T / 2, 0);
      var textPathD = bentLinePath(geom, layout.textStartU, geom.W, vBase);
      var iconPt = geom.point(layout.iconU, 0);
      var iconAngle = geom.angleAt(layout.iconU);
      var btnH = T - layout.btnInset * 2;
      var buttonPath = bentRectPath(geom, layout.btnU0, layout.btnU1, -T / 2 + layout.btnInset, T / 2 - layout.btnInset, Math.min(o.cornerRadius, btnH / 2));
      var buttonTextPath = bentLinePath(geom, layout.btnU0, layout.btnU1, vBase);
      var chipW = layout.chipW, chipH = layout.chipH;

      var caretLine = '';
      if (focused && !busy) {
        var caretH = Math.min(T * 0.5, o.fontSize * 1.4);
        var anim = reduceMotion ? '' : '<animate attributeName="opacity" values="1;0" dur="1.06s" calcMode="discrete" repeatCount="indefinite"></animate>';
        caretLine = '<g id="' + uid + '-caret"><line y1="' + (-caretH / 2) + '" y2="' + (caretH / 2) + '" stroke="' + o.text + '" stroke-width="1.5" stroke-linecap="round">' + anim + '</line></g>';
      }

      svg.innerHTML =
        '<defs><linearGradient id="' + uid + '-grad" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="' + o.accentFrom + '"></stop><stop offset="1" stop-color="' + o.accentTo + '"></stop>' +
        '</linearGradient><clipPath id="' + uid + '-clip"><path d="' + clipPath + '"></path></clipPath></defs>' +
        '<path d="' + bandPath + '" fill="none" stroke="url(#' + uid + '-grad)" stroke-width="' + (o.borderWidth + 6) + '" opacity="' + (focused ? 0.28 : 0) + '" style="transition:opacity .25s ease;"></path>' +
        '<path d="' + bandPath + '" fill="' + o.bg + '" stroke="' + o.border + '" stroke-width="' + o.borderWidth + '"></path>' +
        '<path id="' + uid + '-layout" d="' + textPathD + '" fill="none"></path>' +
        '<g transform="translate(' + round2(iconPt[0]) + ' ' + round2(iconPt[1]) + ') rotate(' + round2(iconAngle) + ')" aria-hidden="true">' +
          '<rect x="' + (-chipW / 2) + '" y="' + (-chipH / 2) + '" width="' + chipW + '" height="' + chipH + '" rx="' + (chipH * 0.27) + '" fill="url(#' + uid + '-grad)"></rect>' +
          '<rect x="' + (-chipW * 0.3) + '" y="' + (-chipH * 0.2) + '" width="' + (chipW * 0.6) + '" height="' + (chipH * 0.42) + '" rx="1.4" fill="none" stroke="' + o.accentText + '" stroke-width="1.5"></rect>' +
          '<path d="M ' + (-chipW * 0.28) + ' ' + (-chipH * 0.11) + ' L 0 ' + (chipH * 0.07) + ' L ' + (chipW * 0.28) + ' ' + (-chipH * 0.11) + '" fill="none" stroke="' + o.accentText + '" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>' +
        '</g>' +
        '<g clip-path="url(#' + uid + '-clip)">' +
          (display
            ? '<text font-size="' + o.fontSize + '" font-weight="500" fill="' + o.text + '"><textPath href="#' + uid + '-layout">' + escXml(display) + '</textPath></text>'
            : '<text font-size="' + o.fontSize + '" font-weight="500" fill="' + o.placeholderColor + '"><textPath href="#' + uid + '-layout">' + escXml(o.placeholder) + '</textPath></text>') +
          caretLine +
        '</g>' +
        '<g class="obol-ci-btn" style="cursor:pointer;" role="button" tabindex="0" aria-label="' + escXml(o.buttonText) + '">' +
          '<path d="' + buttonPath + '" fill="url(#' + uid + '-grad)" opacity="' + (busy ? 0.6 : 1) + '"></path>' +
          '<path id="' + uid + '-btnpath" d="' + buttonTextPath + '" fill="none"></path>' +
          '<text fill="' + o.accentText + '" text-anchor="middle" font-size="' + o.fontSize + '" font-weight="600" style="pointer-events:none;"><textPath href="#' + uid + '-btnpath" startOffset="50%">' + escXml(o.buttonText) + '</textPath></text>' +
        '</g>' +
        '<text id="' + uid + '-measure" font-size="' + o.fontSize + '" font-weight="600" x="-9999" y="-9999" visibility="hidden">' + escXml(o.buttonText) + '</text>';

      var measureEl = svg.getElementById ? svg.getElementById(uid + '-measure') : svg.querySelector('#' + uid + '-measure');
      if (measureEl) {
        try {
          var mw = measureEl.getComputedTextLength();
          if (Math.abs(mw - btnTextW) > 0.5) { btnTextW = mw; render(); return; }
        } catch (e) { /* getComputedTextLength unavailable */ }
      }

      if (focused && !busy) {
        var caretGroup = svg.querySelector('#' + uid + '-caret');
        var textEl = svg.querySelector('g[clip-path] text');
        var caret = Math.min(caretIndex, display.length);
        var caretLen = 0;
        if (textEl && display.length && caret > 0) {
          try { caretLen = textEl.getSubStringLength(0, caret); } catch (e) { /* not focused text yet */ }
        }
        var caretU = layout.textStartU + caretLen;
        var pt = geom.point(caretU, 0);
        var angle = geom.angleAt(caretU);
        if (caretGroup) caretGroup.setAttribute('transform', 'translate(' + round2(pt[0]) + ' ' + round2(pt[1]) + ') rotate(' + round2(angle) + ')');
      }

      var btnGroup = svg.querySelector('.obol-ci-btn');
      if (btnGroup && !busy) {
        btnGroup.addEventListener('click', function (e) {
          e.stopPropagation();
          o.onSubmit(value);
        });
        btnGroup.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.onSubmit(value); }
        });
      }
      svg.onclick = function (e) {
        if (e.target && e.target.closest && e.target.closest('.obol-ci-btn')) return;
        input.focus();
      };
    }

    input.addEventListener('input', function (e) {
      value = e.target.value;
      caretIndex = e.target.selectionStart != null ? e.target.selectionStart : value.length;
      render();
    });
    input.addEventListener('select', function (e) { caretIndex = e.target.selectionStart != null ? e.target.selectionStart : value.length; render(); });
    input.addEventListener('keyup', function (e) { caretIndex = e.target.selectionStart != null ? e.target.selectionStart : value.length; });
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); o.onSubmit(value); } });
    input.addEventListener('focus', function () { focused = true; render(); });
    input.addEventListener('blur', function () { focused = false; render(); });

    var lastW = 0;
    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        var w = host.clientWidth;
        if (Math.abs(w - lastW) > 1) { lastW = w; render(); }
      }).observe(host);
    } else {
      window.addEventListener('resize', render);
    }

    render();

    return {
      getValue: function () { return value; },
      setBusy: function (isBusy, text) {
        busy = isBusy;
        if (text) o.buttonText = text;
        render();
      },
      hide: function () { host.style.display = 'none'; },
      show: function () { host.style.display = ''; },
      focus: function () { input.focus(); }
    };
  };
})();
