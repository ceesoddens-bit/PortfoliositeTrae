/**
 * ARC Ultimate Booking & Events Widget
 * -----------------------------------
 * Een universele, kant-en-klare widget-script die restaurants eenvoudig kunnen
 * kopiëren en plakken. De werking kan volledig worden beheerd via het CONFIG object hieronder.
 */
(function() {
  // ── CONFIGURATIE ───────────────────────────────────────────────────────────
  var CONFIG = {
    // 1. Jouw unieke ARC Restaurant ID (vervang dit door de ID van het restaurant)
    restaurantId: "IVTBpFtSaHL7jragotiu",

    // 2. Modus: 
    //    - "booking": Toont "Reserveren" & "Cadeaubon" knoppen
    //    - "events":  Toont alleen de "Evenement of zaal boeken" knop
    //    - "both":    Toont alle drie de knoppen (indien gewenst)
    mode: "booking", 

    // 3. Positie:
    //    - "fixed":  Zwevend rechtsonder in het scherm (aanbevolen)
    //    - "inline": Wordt geplaatst binnen het element met ID 'arc-widget-container'
    position: "fixed",

    // 4. Standaard Knoppenteksten
    bookingButtonText: "Reserveren",
    giftButtonTitle: "Cadeaubon kopen",
    eventsButtonText: "Evenement of zaal boeken",

    // 5. Fallback Huisstijlkleuren (als de backend-kleuren nog niet zijn geladen)
    fallbackPrimaryColor: "#A59354", // Goud/brons tint
    fallbackHeaderColor: "#111827"   // Donkergrijs/zwart
  };

  // Basis URLs
  var BASE_URL = "https://arc-booking.vercel.app/widget/" + CONFIG.restaurantId;
  var EVENTS_URL = BASE_URL + "/events";

  var DESKTOP = window.innerWidth >= 768;
  window.addEventListener('resize', function() {
    DESKTOP = window.innerWidth >= 768;
  });

  // Helper om viewport hoogte te bepalen (werkt ook met mobiele zoom/in-app browsers)
  function getViewportHeight() {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight;
  }

  // ── INJECTEER CSS STYLES ───────────────────────────────────────────────────
  var style = document.createElement('style');
  style.innerHTML = 
    /* Backdrop overlay voor geopende widget */
    ".arc-widget-backdrop {" +
    "  position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999998;opacity:0;pointer-events:none;backdrop-filter:blur(4px);transition:opacity 0.28s ease;" +
    "}" +
    ".arc-widget-backdrop.visible {" +
    "  opacity:1;pointer-events:auto;" +
    "}" +
    
    /* Widget container */
    ".arc-widget-wrap {" +
    "  position:fixed;z-index:9999999;border-radius:16px;box-shadow:0 12px 32px rgba(0,0,0,0.25);background:#ffffff;overflow:hidden;box-sizing:border-box;" +
    "  opacity:0;pointer-events:none;" +
    "}" +
    ".arc-widget-iframe {" +
    "  width:100%;height:100%;border:none;display:block;background:transparent;" +
    "}" +
    
    /* Desktop layout & animatie */
    "@media (min-width: 768px) {" +
    "  .arc-widget-wrap {" +
    "    bottom:90px;right:24px;" +
    "    width:420px;height:400px;" +
    "    transform-origin:bottom right;transform:translateY(16px);" +
    "    transition:transform 0.28s cubic-bezier(0.22,1,0.36,1),opacity 0.2s ease,width 0.26s cubic-bezier(0.4,0,0.2,1);" +
    "  }" +
    "  .arc-widget-wrap.open {" +
    "    opacity:1;transform:translateY(0);pointer-events:auto;" +
    "  }" +
    "  .arc-widget-wrap.expanded {" +
    "    width:960px;max-width:95vw;height:860px;max-height:90vh;" +
    "    transition:transform 0.28s cubic-bezier(0.22,1,0.36,1),opacity 0.2s ease,width 0.26s cubic-bezier(0.4,0,0.2,1),height 0.42s cubic-bezier(0.4,0,0.2,1);" +
    "  }" +
    "}" +
    
    /* Mobiel layout & animatie */
    "@media (max-width: 767px) {" +
    "  .arc-widget-wrap {" +
    "    bottom:90px;right:16px;" +
    "    width:calc(100vw - 32px);max-width:400px;height:400px;" +
    "    transform-origin:bottom right;transform:translateY(16px) scale(0);" +
    "    transition:transform 0.38s cubic-bezier(0.34,1.4,0.64,1),opacity 0.25s ease,width 0.26s cubic-bezier(0.4,0,0.2,1);" +
    "    max-height:calc(100vh - 120px);max-height:calc(100dvh - 120px);" +
    "  }" +
    "  .arc-widget-wrap.open {" +
    "    opacity:1;transform:translateY(0) scale(1);pointer-events:auto;" +
    "  }" +
    "}";
  document.head.appendChild(style);

  // ── KNOPPEN CONTAINER AANMAKEN ─────────────────────────────────────────────
  var btnWrap = document.createElement('div');
  if (CONFIG.position === "fixed") {
    btnWrap.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;align-items:center;gap:12px;";
  } else {
    btnWrap.style.cssText = "display:inline-flex;align-items:center;gap:12px;";
  }

  // ── HOOFD WIDGET ELEMENTEN (Boekingsscherm + Backdrop) ─────────────────────
  var backdrop = document.createElement('div');
  backdrop.className = 'arc-widget-backdrop';

  var wrap = document.createElement('div');
  wrap.className = 'arc-widget-wrap';

  var iframe = document.createElement('iframe');
  iframe.src = BASE_URL;
  iframe.className = 'arc-widget-iframe';
  wrap.appendChild(iframe);

  var isOpen = false;
  var isExpanded = false;

  // ── APART OVERLAY VOOR EVENTS (Grote modal voor zalen/events) ──────────────
  var eventsOverlay = document.createElement('div');
  eventsOverlay.style.cssText = "display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:99999999;align-items:flex-start;justify-content:center;padding:20px 16px;overflow-y:auto;backdrop-filter:blur(4px);";

  var eventsModal = document.createElement('div');
  eventsModal.style.cssText = "background:#fff;border-radius:18px;width:100%;max-width:1100px;box-shadow:0 24px 64px rgba(0,0,0,0.25);overflow:hidden;display:flex;flex-direction:column;";

  var eventsHeader = document.createElement('div');
  eventsHeader.style.cssText = "display:flex;justify-content:flex-end;padding:12px 16px;border-bottom:1px solid #f1f5f9;flex-shrink:0;";

  var eventsCloseBtn = document.createElement('button');
  eventsCloseBtn.innerHTML = "&#x2715;";
  eventsCloseBtn.style.cssText = "width:36px;height:36px;border-radius:50%;border:1px solid #e2e8f0;background:#f8fafc;cursor:pointer;font-size:18px;color:#374151;display:flex;align-items:center;justify-content:center;transition:transform 0.15s;";
  eventsCloseBtn.onmouseover = function() { eventsCloseBtn.style.transform = 'scale(1.05)'; };
  eventsCloseBtn.onmouseout  = function() { eventsCloseBtn.style.transform = 'scale(1)'; };

  var eventsIframe = document.createElement('iframe');
  eventsIframe.style.cssText = "width:100%;height:400px;border:none;";

  function openEventsWidget() {
    eventsIframe.style.transition = '';
    eventsIframe.src = EVENTS_URL;
    eventsIframe.style.height = (getViewportHeight() - 40) + 'px';
    setTimeout(function() { eventsIframe.style.transition = 'height 0.3s ease'; }, 50);
    eventsOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    closeStandardWidget();
  }

  function closeEventsWidget() {
    eventsOverlay.style.display = 'none';
    eventsIframe.src = '';
    document.body.style.overflow = '';
  }

  eventsCloseBtn.onclick = closeEventsWidget;
  eventsOverlay.onclick  = function(e) { if (e.target === eventsOverlay) closeEventsWidget(); };

  eventsHeader.appendChild(eventsCloseBtn);
  eventsModal.appendChild(eventsHeader);
  eventsModal.appendChild(eventsIframe);
  eventsOverlay.appendChild(eventsModal);
  document.body.appendChild(eventsOverlay);

  // ── HOOFD WIDGET SCHAAL & BEHEER FUNCTIES ──────────────────────────────────
  function expandWidget() {
    if (isExpanded) return;
    isExpanded = true;
    wrap.classList.add('expanded');
    backdrop.classList.add('visible');
    if (DESKTOP) {
      wrap.style.width = '';
      wrap.style.height = '';
    }
  }

  function shrinkWidget() {
    if (!isExpanded) return;
    isExpanded = false;
    wrap.classList.remove('expanded');
    if (DESKTOP) {
      backdrop.classList.remove('visible');
      wrap.style.width = '420px';
      wrap.style.height = iframeHeight + 'px';
    }
  }

  function openStandardWidget() {
    isOpen = true;
    wrap.classList.add('open');
    if (!DESKTOP) {
      backdrop.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'arc-widget-open-event' }, '*');
      }
    } catch (err) {}
  }

  function closeStandardWidget() {
    isOpen = false;
    wrap.classList.remove('open');
    backdrop.classList.remove('visible');
    document.body.style.overflow = '';
    
    if (isExpanded) {
      isExpanded = false;
      wrap.classList.remove('expanded');
      if (DESKTOP) {
        wrap.style.width = '420px';
        wrap.style.height = iframeHeight + 'px';
      }
    }
  }

  function setTab(tab) {
    if (iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'arc-widget-tab', tab: tab }, '*');
    }
    iframe.style.transition = '';
    setTimeout(function() {
      iframe.style.transition = 'height 0.3s ease';
    }, 50);
    if (tab === 'reserveren') {
      iframe.style.height = '400px';
    }
  }

  // ── COMFORTABELE HOOGTE TRACKING VIA POSTMESSAGE ───────────────────────────
  var iframeHeight = 400;
  var firstMsgReceived = false;
  var rafId = null;
  var rafTargetHeight = null;
  var isWidgetAnimating = false;

  function startHeightTracking(durationMs) {
    if (rafId !== null) cancelAnimationFrame(rafId);
    var start = performance.now();
    function tick(now) {
      if (rafTargetHeight !== null && (!isExpanded || !DESKTOP)) {
        wrap.style.height = rafTargetHeight + 'px';
      }
      if (now - start < durationMs) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  window.addEventListener('message', function(e) {
    if (!e.data || e.source !== iframe.contentWindow) return;

    if (e.data.type === 'arc-widget-resize') {
      var limit = DESKTOP ? 110 : 40;
      iframeHeight = Math.min(Math.max(e.data.height, 400), getViewportHeight() - limit);
      rafTargetHeight = iframeHeight;
      if (!isWidgetAnimating && (!isExpanded || !DESKTOP)) {
        wrap.style.height = iframeHeight + 'px';
      }
      if (!firstMsgReceived) {
        firstMsgReceived = true;
        setTimeout(function() { iframe.style.transition = ''; }, 50);
      }
    }

    if (e.data.type === 'arc-widget-colors') {
      var pc = e.data.primaryColor || CONFIG.fallbackPrimaryColor;
      var hc = e.data.headerColor || CONFIG.fallbackHeaderColor;
      
      // Update knoppen styling dynamisch met backend kleuren
      if (giftBtn) giftBtn.style.background = pc;
      if (bookingBtn) bookingBtn.style.background = hc;
      if (eventsBtn) eventsBtn.style.background = pc;

      // Fade-in effect aanzetten
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          if (giftBtn) giftBtn.style.opacity = '1';
          if (bookingBtn) bookingBtn.style.opacity = '1';
          if (eventsBtn) eventsBtn.style.opacity = '1';
        });
      });
    }

    if (e.data.type === 'arc-widget-animation-start') {
      isWidgetAnimating = true;
      startHeightTracking(e.data.duration || 260);
      setTimeout(function() { isWidgetAnimating = false; }, e.data.duration || 260);
    }

    if (e.data.type === 'arc-widget-view') {
      var v = e.data.view;
      if (v === 'contact' || v === 'payment' || v === 'confirmation') {
        expandWidget();
      } else if (v === 'selection') {
        shrinkWidget();
      }
    }

    if (e.data.type === 'arc-widget-close') {
      closeStandardWidget();
    }

    if (e.data.type === 'arc-widget-open-events') {
      openEventsWidget();
    }
  });

  // ── ELEMENTEN OPBOUWEN GEBASEERD OP MODUS ──────────────────────────────────
  var bookingBtn, giftBtn, eventsBtn;
  var baseBtnStyle = "height:52px;border:none;color:#ffffff;font-weight:600;font-size:14px;box-shadow:0 4px 15px rgba(0,0,0,0.15);cursor:pointer;font-family:sans-serif;transition:transform 0.2s, opacity 0.3s ease;opacity:0;";

  if (CONFIG.mode === "booking" || CONFIG.mode === "both") {
    // 1. Cadeaubon Knop
    giftBtn = document.createElement('button');
    giftBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>';
    giftBtn.title = CONFIG.giftButtonTitle;
    giftBtn.style.cssText = baseBtnStyle + "width:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:" + CONFIG.fallbackPrimaryColor + ";";
    giftBtn.onmouseover = function() { giftBtn.style.transform = 'scale(1.05)'; };
    giftBtn.onmouseout  = function() { giftBtn.style.transform = 'scale(1)'; };
    giftBtn.onclick = function() {
      if (isOpen && currentTab === 'cadeaubon') {
        closeStandardWidget();
      } else {
        currentTab = 'cadeaubon';
        setTab('cadeaubon');
        openStandardWidget();
      }
    };
    btnWrap.appendChild(giftBtn);

    // 2. Reserveren Knop
    bookingBtn = document.createElement('button');
    bookingBtn.innerText = CONFIG.bookingButtonText;
    bookingBtn.style.cssText = baseBtnStyle + "padding:0 24px;border-radius:50px;display:flex;align-items:center;justify-content:center;background:" + CONFIG.fallbackHeaderColor + ";";
    bookingBtn.onmouseover = function() { bookingBtn.style.transform = 'scale(1.05)'; };
    bookingBtn.onmouseout  = function() { bookingBtn.style.transform = 'scale(1)'; };
    
    var currentTab = 'reserveren';
    bookingBtn.onclick = function() {
      if (isOpen && currentTab === 'reserveren') {
        closeStandardWidget();
      } else {
        currentTab = 'reserveren';
        setTab('reserveren');
        openStandardWidget();
      }
    };
    btnWrap.appendChild(bookingBtn);

    // Voeg hoofd-overlay toe
    document.body.appendChild(wrap);
    document.body.appendChild(backdrop);
    backdrop.onclick = closeStandardWidget;
  }

  if (CONFIG.mode === "events" || CONFIG.mode === "both") {
    // 3. Evenementen / Zalen Knop
    eventsBtn = document.createElement('button');
    eventsBtn.innerText = CONFIG.eventsButtonText;
    eventsBtn.style.cssText = baseBtnStyle + "padding:0 24px;border-radius:50px;display:flex;align-items:center;justify-content:center;background:" + CONFIG.fallbackPrimaryColor + ";";
    eventsBtn.onmouseover = function() { eventsBtn.style.transform = 'scale(1.05)'; };
    eventsBtn.onmouseout  = function() { eventsBtn.style.transform = 'scale(1)'; };
    eventsBtn.onclick = openEventsWidget;
    btnWrap.appendChild(eventsBtn);
  }

  // ── APPEND IN HET DOCUMENT ─────────────────────────────────────────────────
  if (CONFIG.position === "fixed") {
    document.body.appendChild(btnWrap);
  } else {
    // Zoek naar container
    var container = document.getElementById('arc-widget-container');
    if (container) {
      container.appendChild(btnWrap);
    } else {
      // Fallback naar body floating
      btnWrap.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;align-items:center;gap:12px;";
      document.body.appendChild(btnWrap);
    }
  }

  // Als er geen postmessage color event komt, fade de knoppen alsnog in na 1 seconde
  setTimeout(function() {
    if (giftBtn && giftBtn.style.opacity !== '1') giftBtn.style.opacity = '1';
    if (bookingBtn && bookingBtn.style.opacity !== '1') bookingBtn.style.opacity = '1';
    if (eventsBtn && eventsBtn.style.opacity !== '1') eventsBtn.style.opacity = '1';
  }, 1000);

})();
