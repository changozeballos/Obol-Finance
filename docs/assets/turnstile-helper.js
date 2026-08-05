/* Envoltorio chico para usar Cloudflare Turnstile en modo invisible
   (sin checkbox, sin fricción) desde código vanilla, sin depender de
   cuándo termina de cargar el script de Cloudflare. */
(function () {
  "use strict";

  window.ObolTurnstile = function (siteKey) {
    var widgetId = null;
    var container = null;
    var pendingCb = null;

    function ensureContainer() {
      if (container) return container;
      container = document.createElement('div');
      container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:0;height:0;overflow:hidden;';
      document.body.appendChild(container);
      return container;
    }

    function getToken(cb, timeoutMs) {
      if (!window.turnstile) { cb(null); return; }
      var done = false;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        pendingCb = null;
        cb(null);
      }, timeoutMs || 8000);

      function finish(token) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        cb(token);
      }
      pendingCb = finish;

      try {
        if (widgetId === null) {
          widgetId = window.turnstile.render(ensureContainer(), {
            sitekey: siteKey,
            size: 'invisible',
            execution: 'execute',
            callback: function (token) { if (pendingCb) pendingCb(token); },
            'error-callback': function () { if (pendingCb) pendingCb(null); },
            'expired-callback': function () { if (pendingCb) pendingCb(null); }
          });
        } else {
          window.turnstile.reset(widgetId);
        }
        window.turnstile.execute(widgetId);
      } catch (e) {
        finish(null);
      }
    }

    return { getToken: getToken };
  };
})();
