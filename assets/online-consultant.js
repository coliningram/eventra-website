/* Eventra Online Consultant — widget shell (Task 1 of 5, EVE-248)
   Self-contained: injects its own styles + DOM into every page.
   No frameworks, no dependencies. Vanilla JS. */
(function () {
  'use strict';

  if (window.__eventraOnlineConsultantLoaded) return;
  window.__eventraOnlineConsultantLoaded = true;

  var STYLES = [
    '.oc-launcher{',
      'position:fixed;right:24px;bottom:24px;',
      'z-index:9998;',
      'display:inline-flex;align-items:center;gap:10px;',
      'padding:14px 22px;',
      'font-family:"Inter",system-ui,-apple-system,sans-serif;',
      'font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;',
      'color:#FFFFFF;background:#0A3D2E;',
      'border:1px solid #0A3D2E;border-radius:999px;',
      'box-shadow:0 8px 28px rgba(10,61,46,0.28);',
      'cursor:pointer;',
      'opacity:0;transform:translateY(12px);',
      'transition:opacity .35s ease,transform .35s ease,background .2s ease,border-color .2s ease,box-shadow .2s ease;',
    '}',
    '.oc-launcher.is-ready{opacity:1;transform:translateY(0);}',
    '.oc-launcher:hover,.oc-launcher:focus-visible{background:#0E5239;border-color:#B8966B;box-shadow:0 12px 32px rgba(10,61,46,0.34);}',
    '.oc-launcher:focus-visible{outline:2px solid #B8966B;outline-offset:3px;}',
    '.oc-launcher__dot{width:8px;height:8px;border-radius:50%;background:#B8966B;display:inline-block;flex:none;}',
    '.oc-launcher.is-hidden{opacity:0;pointer-events:none;transform:translateY(12px);}',

    '.oc-panel{',
      'position:fixed;right:24px;bottom:24px;',
      'width:380px;max-width:calc(100vw - 48px);',
      'height:560px;max-height:calc(100vh - 48px);',
      'background:#F8F5F0;',
      'border:1px solid rgba(10,61,46,0.12);',
      'border-radius:10px;',
      'box-shadow:0 24px 60px rgba(0,0,0,0.22);',
      'z-index:9999;',
      'display:flex;flex-direction:column;',
      'overflow:hidden;',
      'opacity:0;transform:translateY(16px) scale(.98);',
      'transition:opacity .25s ease,transform .25s ease;',
      'pointer-events:none;',
    '}',
    '.oc-panel.is-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}',

    '.oc-header{',
      'display:flex;align-items:center;justify-content:space-between;',
      'padding:18px 20px;',
      'background:#0A3D2E;color:#FFFFFF;',
      'border-bottom:1px solid rgba(255,255,255,0.08);',
    '}',
    '.oc-header__title{',
      'font-family:"Cormorant Garamond","Times New Roman",serif;',
      'font-size:20px;font-weight:400;letter-spacing:0.02em;',
      'line-height:1.2;',
    '}',
    '.oc-header__sub{',
      'display:block;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:10px;font-weight:500;letter-spacing:0.18em;text-transform:uppercase;',
      'color:#B8966B;margin-bottom:4px;',
    '}',
    '.oc-close{',
      'appearance:none;background:transparent;border:none;cursor:pointer;',
      'width:34px;height:34px;border-radius:50%;',
      'display:inline-flex;align-items:center;justify-content:center;',
      'color:#FFFFFF;',
      'transition:background .15s ease,color .15s ease;',
    '}',
    '.oc-close:hover,.oc-close:focus-visible{background:rgba(255,255,255,0.08);color:#B8966B;}',
    '.oc-close:focus-visible{outline:2px solid #B8966B;outline-offset:2px;}',
    '.oc-close svg{width:16px;height:16px;display:block;}',

    '.oc-body{',
      'flex:1 1 auto;overflow-y:auto;',
      'padding:32px 26px 26px;',
      'display:flex;flex-direction:column;',
      'color:#1A1A1A;',
    '}',

    '.oc-intro__eyebrow{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:10px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;',
      'color:#B8966B;margin-bottom:14px;',
    '}',
    '.oc-intro__heading{',
      'font-family:"Cormorant Garamond","Times New Roman",serif;',
      'font-size:26px;font-weight:400;line-height:1.25;',
      'color:#0A3D2E;margin-bottom:18px;',
    '}',
    '.oc-intro__copy{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:14px;font-weight:400;line-height:1.65;',
      'color:#3A3A3A;margin-bottom:14px;',
    '}',
    '.oc-intro__copy:last-of-type{margin-bottom:28px;}',

    '.oc-cta{',
      'margin-top:auto;align-self:flex-start;',
      'appearance:none;border:none;cursor:pointer;',
      'padding:14px 28px;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;',
      'color:#FFFFFF;background:#0A3D2E;',
      'border:1px solid #0A3D2E;',
      'transition:background .2s ease,border-color .2s ease,color .2s ease;',
    '}',
    '.oc-cta:hover,.oc-cta:focus-visible{background:#B8966B;border-color:#B8966B;color:#FFFFFF;}',
    '.oc-cta:focus-visible{outline:2px solid #0A3D2E;outline-offset:3px;}',

    '.oc-footnote{',
      'margin-top:18px;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:11px;font-weight:400;letter-spacing:0.04em;line-height:1.5;',
      'color:#6B6B6B;',
    '}',

    '@media (max-width: 600px){',
      '.oc-launcher{right:16px;bottom:16px;padding:12px 18px;font-size:10px;}',
      '.oc-panel{',
        'right:0;bottom:0;left:0;top:0;',
        'width:100%;max-width:100%;height:100%;max-height:100%;',
        'border-radius:0;border:none;',
      '}',
      '.oc-body{padding:28px 22px 24px;}',
      '.oc-intro__heading{font-size:24px;}',
    '}',

    '@media (prefers-reduced-motion: reduce){',
      '.oc-launcher,.oc-panel{transition:none;}',
      '.oc-launcher{transform:none;}',
    '}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('oc-styles')) return;
    var style = document.createElement('style');
    style.id = 'oc-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function buildMarkup() {
    var root = document.createElement('div');
    root.id = 'oc-root';

    root.innerHTML = [
      '<button type="button" id="oc-launcher" class="oc-launcher" aria-haspopup="dialog" aria-expanded="false" aria-controls="oc-panel">',
        '<span class="oc-launcher__dot" aria-hidden="true"></span>',
        '<span class="oc-launcher__label">Online Consultant</span>',
      '</button>',
      '<div id="oc-panel" class="oc-panel" role="dialog" aria-modal="false" aria-labelledby="oc-title" aria-hidden="true">',
        '<div class="oc-header">',
          '<div>',
            '<span class="oc-header__sub">Eventra</span>',
            '<span id="oc-title" class="oc-header__title">Online Consultant</span>',
          '</div>',
          '<button type="button" id="oc-close" class="oc-close" aria-label="Close consultant panel">',
            '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2 2 L14 14 M14 2 L2 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',
          '</button>',
        '</div>',
        '<div class="oc-body">',
          '<p class="oc-intro__eyebrow">A senior consultant, on hand</p>',
          '<h2 class="oc-intro__heading">Welcome to Eventra.</h2>',
          '<p class="oc-intro__copy">Whether you’re planning a sporting trip, a curated journey abroad, or a combination of both, our consultants will help you shape something exceptional.</p>',
          '<p class="oc-intro__copy">Tell us a little about what you have in mind and a senior consultant will be in touch within two business hours.</p>',
          '<button type="button" id="oc-begin" class="oc-cta">Begin</button>',
          '<p class="oc-footnote">Replies within two business hours, Monday–Friday.</p>',
        '</div>',
      '</div>'
    ].join('');

    return root;
  }

  function wire(root) {
    var launcher = root.querySelector('#oc-launcher');
    var panel = root.querySelector('#oc-panel');
    var closeBtn = root.querySelector('#oc-close');
    var beginBtn = root.querySelector('#oc-begin');

    var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    var lastFocused = null;

    function open() {
      if (panel.classList.contains('is-open')) return;
      lastFocused = document.activeElement;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      launcher.setAttribute('aria-expanded', 'true');
      launcher.classList.add('is-hidden');
      // shift initial focus into the panel
      setTimeout(function () {
        if (beginBtn) beginBtn.focus();
      }, 30);
    }

    function close() {
      if (!panel.classList.contains('is-open')) return;
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.classList.remove('is-hidden');
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      } else {
        launcher.focus();
      }
    }

    launcher.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    beginBtn.addEventListener('click', function () {
      console.log('begin clicked');
    });

    // Escape closes; Tab is trapped within the panel while open.
    document.addEventListener('keydown', function (e) {
      if (!panel.classList.contains('is-open')) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== 'Tab') return;

      var nodes = panel.querySelectorAll(FOCUSABLE);
      var visible = [];
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        if (!n.hasAttribute('disabled') && n.offsetParent !== null) visible.push(n);
      }
      if (visible.length === 0) return;
      var first = visible[0];
      var last = visible[visible.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  function mount() {
    if (document.getElementById('oc-root')) return;
    injectStyles();
    var root = buildMarkup();
    document.body.appendChild(root);
    wire(root);
    // entrance animation
    var launcher = root.querySelector('#oc-launcher');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { launcher.classList.add('is-ready'); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
