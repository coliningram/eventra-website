/* Eventra Online Consultant — widget shell + branching question flow + lead capture (EVE-252)
   Self-contained: injects its own styles + DOM into every page.
   No frameworks, no dependencies. Vanilla JS. */
(function () {
  'use strict';

  if (window.__eventraOnlineConsultantLoaded) return;
  window.__eventraOnlineConsultantLoaded = true;

  var WEB3FORMS_URL = 'https://api.web3forms.com/submit';
  var WEB3FORMS_ACCESS_KEY = '6b1b9f4c-cee8-480f-b58b-d08099358faa';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    '.oc-screen-region{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;}',
    '.oc-screen{display:flex;flex-direction:column;flex:1 1 auto;}',
    '.oc-screen[data-focus],.oc-screen [data-focus]{outline:none;}',

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

    '.oc-step-meta{',
      'display:flex;align-items:center;justify-content:space-between;gap:12px;',
      'margin-bottom:18px;',
    '}',
    '.oc-back{',
      'appearance:none;background:transparent;border:none;cursor:pointer;',
      'padding:6px 0;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:11px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;',
      'color:#6B6B6B;',
      'transition:color .15s ease;',
    '}',
    '.oc-back:hover,.oc-back:focus-visible{color:#0A3D2E;}',
    '.oc-back:focus-visible{outline:2px solid #B8966B;outline-offset:3px;}',
    '.oc-progress{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:10px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;',
      'color:#B8966B;',
    '}',

    '.oc-step-heading{',
      'font-family:"Cormorant Garamond","Times New Roman",serif;',
      'font-size:24px;font-weight:400;line-height:1.3;',
      'color:#0A3D2E;margin-bottom:22px;',
    '}',

    '.oc-options{display:flex;flex-direction:column;gap:10px;margin-bottom:18px;}',
    '.oc-option{',
      'appearance:none;cursor:pointer;',
      'display:block;width:100%;text-align:left;',
      'padding:14px 18px;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:14px;font-weight:500;letter-spacing:0.02em;line-height:1.4;',
      'color:#1A1A1A;background:#FFFFFF;',
      'border:1px solid rgba(10,61,46,0.18);border-radius:4px;',
      'transition:background .15s ease,border-color .15s ease,color .15s ease,box-shadow .15s ease;',
    '}',
    '.oc-option:hover,.oc-option:focus-visible{background:#0A3D2E;border-color:#0A3D2E;color:#FFFFFF;box-shadow:0 6px 18px rgba(10,61,46,0.16);}',
    '.oc-option:focus-visible{outline:2px solid #B8966B;outline-offset:3px;}',

    '.oc-branch-options{display:flex;flex-direction:column;gap:14px;}',
    '.oc-branch{',
      'appearance:none;cursor:pointer;',
      'display:flex;flex-direction:column;align-items:flex-start;gap:6px;',
      'width:100%;text-align:left;',
      'padding:22px;',
      'font-family:"Cormorant Garamond","Times New Roman",serif;',
      'font-size:20px;font-weight:400;letter-spacing:0.01em;',
      'color:#0A3D2E;background:#FFFFFF;',
      'border:1px solid rgba(10,61,46,0.16);border-radius:4px;',
      'transition:background .2s ease,border-color .2s ease,color .2s ease,box-shadow .2s ease;',
    '}',
    '.oc-branch:hover,.oc-branch:focus-visible{background:#0A3D2E;border-color:#0A3D2E;color:#FFFFFF;box-shadow:0 10px 28px rgba(10,61,46,0.18);}',
    '.oc-branch:focus-visible{outline:2px solid #B8966B;outline-offset:3px;}',
    '.oc-branch__sub{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:12px;font-weight:400;letter-spacing:0.04em;color:#6B6B6B;',
    '}',
    '.oc-branch:hover .oc-branch__sub,.oc-branch:focus-visible .oc-branch__sub{color:rgba(255,255,255,0.82);}',

    '.oc-input-label{',
      'display:block;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:10px;font-weight:500;letter-spacing:0.22em;text-transform:uppercase;',
      'color:#B8966B;margin-bottom:8px;',
    '}',
    '.oc-input{',
      'appearance:none;width:100%;box-sizing:border-box;',
      'padding:14px 16px;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:14px;font-weight:400;line-height:1.5;',
      'color:#1A1A1A;background:#FFFFFF;',
      'border:1px solid rgba(10,61,46,0.22);border-radius:4px;',
      'margin-bottom:18px;',
      'transition:border-color .15s ease,box-shadow .15s ease;',
    '}',
    '.oc-input:focus-visible{outline:none;border-color:#0A3D2E;box-shadow:0 0 0 3px rgba(184,150,107,0.25);}',
    '.oc-input::placeholder{color:#A0A0A0;}',

    '.oc-continue{',
      'align-self:flex-start;',
      'appearance:none;cursor:pointer;',
      'padding:14px 28px;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;',
      'color:#FFFFFF;background:#0A3D2E;',
      'border:1px solid #0A3D2E;',
      'transition:background .2s ease,border-color .2s ease,color .2s ease;',
    '}',
    '.oc-continue:hover,.oc-continue:focus-visible{background:#B8966B;border-color:#B8966B;color:#FFFFFF;}',
    '.oc-continue:focus-visible{outline:2px solid #0A3D2E;outline-offset:3px;}',

    '.oc-form{display:block;}',
    '.oc-form .oc-cta{margin-top:0;}',
    '.oc-form-field{margin-bottom:6px;}',
    '.oc-form-field .oc-input,.oc-form-field .oc-textarea{margin-bottom:4px;}',
    '.oc-textarea{',
      'appearance:none;width:100%;box-sizing:border-box;',
      'padding:12px 16px;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:14px;font-weight:400;line-height:1.5;',
      'color:#1A1A1A;background:#FFFFFF;',
      'border:1px solid rgba(10,61,46,0.22);border-radius:4px;',
      'min-height:72px;resize:vertical;',
      'transition:border-color .15s ease,box-shadow .15s ease;',
    '}',
    '.oc-textarea:focus-visible{outline:none;border-color:#0A3D2E;box-shadow:0 0 0 3px rgba(184,150,107,0.25);}',
    '.oc-textarea::placeholder{color:#A0A0A0;}',
    '.oc-input.is-invalid,.oc-textarea.is-invalid{border-color:#B85A52;box-shadow:0 0 0 3px rgba(184,90,82,0.18);}',
    '.oc-form-error{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:11px;font-weight:500;line-height:1.4;letter-spacing:0.02em;',
      'color:#B85A52;min-height:14px;margin:0 0 6px;',
    '}',
    '.oc-form-subtext{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:12px;font-weight:400;line-height:1.55;letter-spacing:0.02em;',
      'color:#6B6B6B;margin:8px 0 16px;',
    '}',
    '.oc-form-disclaimer{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:11px;font-weight:400;line-height:1.5;letter-spacing:0.02em;',
      'color:#8A8A8A;margin:14px 0 0;',
    '}',
    '.oc-cta:disabled,.oc-continue:disabled{opacity:0.6;cursor:default;pointer-events:none;}',

    '.oc-conf-slot{min-height:8px;}',

    '.oc-conf-phone{margin:8px 0 22px;padding:16px 18px;background:rgba(184,150,107,0.08);border:1px solid rgba(184,150,107,0.22);border-radius:4px;}',
    '.oc-conf-phone__heading{',
      'font-family:"Cormorant Garamond","Times New Roman",serif;',
      'font-size:17px;font-weight:400;line-height:1.3;',
      'color:#0A3D2E;margin:0 0 6px;',
    '}',
    '.oc-conf-phone__copy{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:12px;font-weight:400;line-height:1.55;letter-spacing:0.01em;',
      'color:#6B6B6B;margin:0 0 12px;',
    '}',
    '.oc-conf-phone__input{',
      'appearance:none;width:100%;box-sizing:border-box;',
      'padding:10px 14px;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:13px;font-weight:400;line-height:1.5;',
      'color:#1A1A1A;background:#FFFFFF;',
      'border:1px solid rgba(10,61,46,0.18);border-radius:4px;',
      'margin:0 0 10px;',
      'transition:border-color .15s ease,box-shadow .15s ease;',
    '}',
    '.oc-conf-phone__input:focus-visible{outline:none;border-color:#0A3D2E;box-shadow:0 0 0 3px rgba(184,150,107,0.25);}',
    '.oc-conf-phone__input::placeholder{color:#A0A0A0;}',
    '.oc-conf-phone__btn{',
      'appearance:none;cursor:pointer;',
      'padding:9px 18px;',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:10px;font-weight:600;letter-spacing:0.16em;text-transform:uppercase;',
      'color:#0A3D2E;background:transparent;',
      'border:1px solid #0A3D2E;border-radius:0;',
      'transition:background .2s ease,color .2s ease,border-color .2s ease;',
    '}',
    '.oc-conf-phone__btn:hover,.oc-conf-phone__btn:focus-visible{background:#0A3D2E;color:#FFFFFF;border-color:#0A3D2E;}',
    '.oc-conf-phone__btn:focus-visible{outline:2px solid #B8966B;outline-offset:3px;}',
    '.oc-conf-phone__confirm{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:12px;font-weight:400;line-height:1.55;letter-spacing:0.01em;',
      'color:#0A3D2E;margin:0;',
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
      '.oc-step-heading{font-size:22px;}',
      '.oc-options,.oc-branch-options{flex-direction:column;}',
    '}',

    '@media (prefers-reduced-motion: reduce){',
      '.oc-launcher,.oc-panel,.oc-option,.oc-branch,.oc-cta,.oc-continue,.oc-back,.oc-close,.oc-input,.oc-textarea{transition:none;}',
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

  // ---- Question flow data + state -----------------------------------------

  var FLOWS = {
    bespoke: [
      {
        id: 'bespoke-1', stateKey: 'region',
        heading: 'Which region are you drawn to?',
        options: [
          { value: 'africa', label: 'Africa' },
          { value: 'europe', label: 'Europe' },
          { value: 'asia', label: 'Asia' },
          { value: 'americas', label: 'Americas' },
          { value: 'multi-region', label: 'Multi-region' },
          { value: 'open', label: 'Open to suggestions' }
        ]
      },
      {
        id: 'bespoke-2', stateKey: 'when',
        heading: 'When are you thinking of travelling?',
        options: [
          { value: 'within-3', label: 'Within 3 months' },
          { value: '3-6', label: '3-6 months' },
          { value: '6-12', label: '6-12 months' },
          { value: 'beyond-1y', label: 'More than a year out' },
          { value: 'flexible', label: 'Flexible' }
        ]
      },
      {
        id: 'bespoke-3', stateKey: 'travellers',
        heading: 'How many travellers?',
        options: [
          { value: 'just-me', label: 'Just me' },
          { value: 'couple', label: 'A couple' },
          { value: 'family', label: 'A family' },
          { value: 'small-group', label: 'A small group (3-8)' },
          { value: 'large-group', label: 'A larger group (9+)' }
        ]
      },
      {
        id: 'bespoke-4', stateKey: 'tripType',
        heading: 'What kind of trip do you have in mind?',
        options: [
          { value: 'special-occasion', label: 'A special occasion' },
          { value: 'relaxing-escape', label: 'A relaxing escape' },
          { value: 'adventure', label: 'An adventure' },
          { value: 'cultural', label: 'A cultural journey' },
          { value: 'multi-purpose', label: 'Multi-purpose / not sure yet' }
        ]
      }
    ],
    sports: [
      {
        id: 'sports-1', stateKey: 'sport',
        heading: 'Which sport interests you?',
        options: [
          { value: 'rugby', label: 'Rugby' },
          { value: 'cricket', label: 'Cricket' },
          { value: 'f1', label: 'F1 / Motor Racing' },
          { value: 'tennis', label: 'Tennis' },
          { value: 'football', label: 'Football' },
          { value: 'concerts-culture', label: 'Concerts & Culture' },
          { value: 'other', label: 'Other / not sure yet' }
        ]
      },
      {
        id: 'sports-2', stateKey: 'eventName',
        heading: 'Do you have a specific event in mind?',
        type: 'text',
        inputLabel: 'Specific event',
        ariaLabel: 'Specific event in mind',
        placeholder: "e.g. Springboks vs All Blacks, Wimbledon, Monaco GP, or 'open to suggestions'"
      },
      {
        id: 'sports-3', stateKey: 'when',
        heading: 'When is the event (if known)?',
        options: [
          { value: 'within-3', label: 'Within 3 months' },
          { value: '3-6', label: '3-6 months' },
          { value: '6-12', label: '6-12 months' },
          { value: 'beyond-1y', label: 'More than a year out' },
          { value: 'unknown', label: "Don't know yet" }
        ]
      },
      {
        id: 'sports-4', stateKey: 'party',
        heading: 'How many in your party?',
        options: [
          { value: 'just-me', label: 'Just me' },
          { value: 'couple', label: 'A couple' },
          { value: 'family', label: 'A family' },
          { value: 'small-group', label: 'A small group (3-8)' },
          { value: 'large-group', label: 'A larger group (9+)' }
        ]
      }
    ]
  };

  var BRANCH_LABELS = { bespoke: 'Bespoke Travel', sports: 'Sports & Events' };

  var ANSWER_LABELS = {
    bespoke: { region: 'Region', when: 'Timing', travellers: 'Party size', tripType: 'Trip type' },
    sports:  { sport: 'Sport', eventName: 'Specific event', when: 'Timing', party: 'Party size' }
  };

  function cleanPhoneForWa(s) {
    return String(s || '').replace(/^\+/, '').replace(/[\s()\-]/g, '');
  }

  function formatAnswers(branch, st) {
    if (!branch || !FLOWS[branch] || !st[branch]) return 'None provided';
    var flow = FLOWS[branch];
    var labels = ANSWER_LABELS[branch] || {};
    var lines = [];
    for (var i = 0; i < flow.length; i++) {
      var q = flow[i];
      var val = st[branch][q.stateKey];
      var leftLabel = labels[q.stateKey] || q.stateKey;
      if (q.type === 'text') {
        var trimmed = (val || '').toString().trim();
        if (trimmed) lines.push(leftLabel + ': ' + trimmed);
      } else if (val) {
        var match = null;
        for (var j = 0; j < q.options.length; j++) {
          if (q.options[j].value === val) { match = q.options[j].label; break; }
        }
        if (match) lines.push(leftLabel + ': ' + match);
      }
    }
    return lines.length ? lines.join('\n') : 'None provided';
  }

  function postWithTimeout(url, payload, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var done = false;
      var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
      var timer = setTimeout(function () {
        if (done) return;
        done = true;
        if (controller) { try { controller.abort(); } catch (e) {} }
        reject(new Error('timeout'));
      }, timeoutMs);

      var opts = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      };
      if (controller) opts.signal = controller.signal;

      try {
        fetch(url, opts).then(function (res) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          if (res && res.ok) resolve(res);
          else reject(new Error('http_' + (res && res.status)));
        }, function (err) {
          if (done) return;
          done = true;
          clearTimeout(timer);
          reject(err);
        });
      } catch (err) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(err);
      }
    });
  }

  var state = window.__eventraOnlineConsultantState || {
    branch: null,
    bespoke: { region: null, when: null, travellers: null, tripType: null },
    sports:  { sport: null, eventName: '', when: null, party: null },
    contact: { name: '', email: '', notes: '' },
    submitted: false,
    phoneFollowupSent: false
  };
  if (!state.contact) state.contact = { name: '', email: '', notes: '' };
  if (typeof state.submitted !== 'boolean') state.submitted = false;
  if (typeof state.phoneFollowupSent !== 'boolean') state.phoneFollowupSent = false;
  window.__eventraOnlineConsultantState = state;

  var stack = [];
  var current = 'welcome';

  function escAttr(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }
  function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function parseQuestionId(name) {
    var m = /^(bespoke|sports)-([1-4])$/.exec(name);
    if (!m) return null;
    return { branch: m[1], idx: parseInt(m[2], 10) - 1 };
  }

  function renderWelcome() {
    return [
      '<div class="oc-screen oc-screen--welcome" data-screen="welcome">',
        '<p class="oc-intro__eyebrow">A senior consultant, on hand</p>',
        '<h2 class="oc-intro__heading">Welcome to Eventra.</h2>',
        '<p class="oc-intro__copy">Whether you’re planning a sporting trip, a curated journey abroad, or a combination of both, our consultants will help you shape something exceptional.</p>',
        '<p class="oc-intro__copy">Tell us a little about what you have in mind and a senior consultant will be in touch within two business hours.</p>',
        '<button type="button" id="oc-begin" class="oc-cta" data-focus>Begin</button>',
        '<p class="oc-footnote">Replies within two business hours, Monday–Friday.</p>',
      '</div>'
    ].join('');
  }

  function renderBranchPicker() {
    return [
      '<div class="oc-screen oc-screen--branch" data-screen="branch-picker">',
        '<div class="oc-step-meta">',
          '<button type="button" class="oc-back" data-back aria-label="Back to welcome">← Back</button>',
          '<span class="oc-progress">Step 1 of 5</span>',
        '</div>',
        '<h2 class="oc-step-heading" tabindex="-1" data-focus>What kind of experience are you exploring?</h2>',
        '<div class="oc-branch-options" role="group" aria-label="Choose experience type">',
          '<button type="button" class="oc-branch" data-branch="bespoke">',
            '<span class="oc-branch__label">Bespoke Travel</span>',
            '<span class="oc-branch__sub">Curated journeys, tailored to you</span>',
          '</button>',
          '<button type="button" class="oc-branch" data-branch="sports">',
            '<span class="oc-branch__label">Sports &amp; Events</span>',
            '<span class="oc-branch__sub">Premium hospitality and tour packages</span>',
          '</button>',
        '</div>',
      '</div>'
    ].join('');
  }

  function renderQuestion(branch, idx) {
    var q = FLOWS[branch][idx];
    var stepNum = idx + 2; // branch picker is step 1
    var body;

    if (q.type === 'text') {
      var inputId = 'oc-input-' + q.stateKey;
      var currentVal = state[branch][q.stateKey] || '';
      body = [
        '<label class="oc-input-label" for="' + inputId + '">' + escHtml(q.inputLabel) + '</label>',
        '<input type="text" id="' + inputId + '" class="oc-input" data-text-input ',
          'placeholder="' + escAttr(q.placeholder) + '" ',
          'aria-label="' + escAttr(q.ariaLabel) + '" ',
          'value="' + escAttr(currentVal) + '" />',
        '<button type="button" class="oc-continue" data-continue>Continue</button>'
      ].join('');
    } else {
      var opts = '';
      for (var i = 0; i < q.options.length; i++) {
        var o = q.options[i];
        opts += '<button type="button" class="oc-option" data-option="' + escAttr(o.value) + '">' + escHtml(o.label) + '</button>';
      }
      body = '<div class="oc-options" role="group" aria-label="' + escAttr(q.heading) + '">' + opts + '</div>';
    }

    return [
      '<div class="oc-screen oc-screen--question" data-screen="' + q.id + '">',
        '<div class="oc-step-meta">',
          '<button type="button" class="oc-back" data-back aria-label="Back to previous step">← Back</button>',
          '<span class="oc-progress">Step ' + stepNum + ' of 5</span>',
        '</div>',
        '<h2 class="oc-step-heading" tabindex="-1" data-focus>' + escHtml(q.heading) + '</h2>',
        body,
      '</div>'
    ].join('');
  }

  function renderLeadForm() {
    var c = state.contact;
    return [
      '<div class="oc-screen oc-screen--lead-form" data-screen="lead-form">',
        '<div class="oc-step-meta">',
          '<button type="button" class="oc-back" data-back aria-label="Back to previous step">← Back</button>',
        '</div>',
        '<h2 class="oc-step-heading" tabindex="-1" data-focus>How can we reach you?</h2>',
        '<form id="oc-lead-form" class="oc-form" novalidate>',
          '<div class="oc-form-field">',
            '<label class="oc-input-label" for="oc-lead-name">Full name *</label>',
            '<input id="oc-lead-name" type="text" class="oc-input" autocomplete="name" aria-required="true" aria-describedby="oc-lead-name-error" value="' + escAttr(c.name) + '" />',
            '<p id="oc-lead-name-error" class="oc-form-error" aria-live="polite"></p>',
          '</div>',
          '<div class="oc-form-field">',
            '<label class="oc-input-label" for="oc-lead-email">Email *</label>',
            '<input id="oc-lead-email" type="email" class="oc-input" autocomplete="email" aria-required="true" aria-describedby="oc-lead-email-error" value="' + escAttr(c.email) + '" />',
            '<p id="oc-lead-email-error" class="oc-form-error" aria-live="polite"></p>',
          '</div>',
          '<div class="oc-form-field">',
            '<label class="oc-input-label" for="oc-lead-notes">Anything else?</label>',
            '<textarea id="oc-lead-notes" class="oc-textarea" rows="3">' + escHtml(c.notes) + '</textarea>',
          '</div>',
          '<p class="oc-form-subtext">A senior consultant will be in touch within 2 business hours during 8am–6pm SAST Monday–Friday. Out-of-hours enquiries answered first thing the next business day.</p>',
          '<button type="submit" id="oc-lead-submit" class="oc-cta">Send enquiry</button>',
          '<p id="oc-lead-submit-error" class="oc-form-error" aria-live="polite"></p>',
          '<p class="oc-form-disclaimer">By submitting, you agree to be contacted by Eventra Group regarding your enquiry.</p>',
        '</form>',
      '</div>'
    ].join('');
  }

  function renderConfirmation() {
    var name = (state.contact.name || '').trim();
    var firstName = name ? name.split(/\s+/)[0] : 'there';
    return [
      '<div class="oc-screen oc-screen--confirmation" data-screen="confirmation">',
        '<p class="oc-intro__eyebrow">Enquiry received</p>',
        '<h2 class="oc-intro__heading" tabindex="-1" data-focus>Thank you, ' + escHtml(firstName) + '.</h2>',
        '<p class="oc-intro__copy">Your enquiry has reached us and a senior consultant will be in touch within 2 business hours.</p>',
        '<div class="oc-conf-phone" data-conf-phone' + (state.phoneFollowupSent ? ' hidden' : '') + '>',
          '<p class="oc-conf-phone__heading">Want a faster response?</p>',
          '<p class="oc-conf-phone__copy">Share your number and a consultant will call or WhatsApp you directly.</p>',
          '<label class="oc-input-label" for="oc-conf-phone-input">Phone</label>',
          '<input id="oc-conf-phone-input" type="tel" class="oc-conf-phone__input" autocomplete="tel" placeholder="e.g. +44 7700 900000" aria-label="Phone number (optional)" />',
          '<button type="button" id="oc-conf-phone-btn" class="oc-conf-phone__btn">Add my number</button>',
          '<p id="oc-conf-phone-error" class="oc-form-error" aria-live="polite"></p>',
        '</div>',
        (state.phoneFollowupSent
          ? '<p class="oc-conf-phone__confirm" data-conf-phone-confirm>Thanks — we have your number.</p>'
          : ''),
        '<div class="oc-conf-slot" data-conf-slot><!-- TASK 5: prefilled content goes here --></div>',
        '<button type="button" id="oc-conf-close" class="oc-cta">Close</button>',
      '</div>'
    ].join('');
  }

  function getMarkup(name) {
    if (name === 'welcome') return renderWelcome();
    if (name === 'branch-picker') return renderBranchPicker();
    if (name === 'lead-form') return renderLeadForm();
    if (name === 'confirmation') return renderConfirmation();
    var parsed = parseQuestionId(name);
    if (parsed) return renderQuestion(parsed.branch, parsed.idx);
    return renderWelcome();
  }

  // ---- Markup + wiring -----------------------------------------------------

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
          '<div id="oc-screen-region" class="oc-screen-region" aria-live="polite"></div>',
        '</div>',
      '</div>'
    ].join('');

    return root;
  }

  function wire(root) {
    var launcher = root.querySelector('#oc-launcher');
    var panel = root.querySelector('#oc-panel');
    var closeBtn = root.querySelector('#oc-close');
    var screenRegion = root.querySelector('#oc-screen-region');

    var FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    var lastFocused = null;

    function render() {
      screenRegion.innerHTML = getMarkup(current);
      wireScreen();
    }

    function applyFocus() {
      setTimeout(function () {
        var target = screenRegion.querySelector('[data-focus]');
        if (target && typeof target.focus === 'function') target.focus();
      }, 30);
    }

    function navigate(name) {
      stack.push(current);
      current = name;
      render();
      if (panel.classList.contains('is-open')) applyFocus();
    }

    function goBack() {
      if (stack.length === 0) return;
      current = stack.pop();
      render();
      if (panel.classList.contains('is-open')) applyFocus();
    }

    function goNextFromQuestion(branch, idx) {
      if (idx + 1 < FLOWS[branch].length) {
        navigate(branch + '-' + (idx + 2));
      } else {
        navigate('lead-form');
      }
    }

    function reset() {
      state.branch = null;
      state.bespoke = { region: null, when: null, travellers: null, tripType: null };
      state.sports  = { sport: null, eventName: '', when: null, party: null };
      state.contact = { name: '', email: '', notes: '' };
      state.submitted = false;
      state.phoneFollowupSent = false;
      stack.length = 0;
      current = 'welcome';
      render();
    }

    function wireScreen() {
      var begin = screenRegion.querySelector('#oc-begin');
      if (begin) {
        begin.addEventListener('click', function () {
          if (state.submitted) return;
          navigate('branch-picker');
        });
      }

      var back = screenRegion.querySelector('[data-back]');
      if (back) {
        back.addEventListener('click', goBack);
      }

      var branches = screenRegion.querySelectorAll('[data-branch]');
      for (var bi = 0; bi < branches.length; bi++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            var br = btn.getAttribute('data-branch');
            state.branch = br;
            navigate(br + '-1');
          });
        })(branches[bi]);
      }

      var opts = screenRegion.querySelectorAll('[data-option]');
      for (var oi = 0; oi < opts.length; oi++) {
        (function (btn) {
          btn.addEventListener('click', function () {
            var parsed = parseQuestionId(current);
            if (!parsed) return;
            var q = FLOWS[parsed.branch][parsed.idx];
            state[parsed.branch][q.stateKey] = btn.getAttribute('data-option');
            goNextFromQuestion(parsed.branch, parsed.idx);
          });
        })(opts[oi]);
      }

      var continueBtn = screenRegion.querySelector('[data-continue]');
      var textInput = screenRegion.querySelector('[data-text-input]');
      function commitText() {
        var parsed = parseQuestionId(current);
        if (!parsed) return;
        var q = FLOWS[parsed.branch][parsed.idx];
        state[parsed.branch][q.stateKey] = textInput ? textInput.value.trim() : '';
        goNextFromQuestion(parsed.branch, parsed.idx);
      }
      if (continueBtn) continueBtn.addEventListener('click', commitText);
      if (textInput) {
        textInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            commitText();
          }
        });
      }

      var leadForm = screenRegion.querySelector('#oc-lead-form');
      if (leadForm) wireLeadForm(leadForm);

      var confClose = screenRegion.querySelector('#oc-conf-close');
      if (confClose) {
        confClose.addEventListener('click', function () {
          close();
        });
      }

      var confPhoneInput = screenRegion.querySelector('#oc-conf-phone-input');
      var confPhoneBtn = screenRegion.querySelector('#oc-conf-phone-btn');
      var confPhoneErr = screenRegion.querySelector('#oc-conf-phone-error');
      if (confPhoneBtn && confPhoneInput) {
        confPhoneBtn.addEventListener('click', function () {
          if (state.phoneFollowupSent) return;
          var phone = confPhoneInput.value.trim();
          if (!phone) return;

          if (confPhoneErr) confPhoneErr.textContent = '';
          var prevBtnText = confPhoneBtn.textContent;
          confPhoneBtn.disabled = true;
          confPhoneBtn.textContent = 'Sending…';

          var followupPayload = {
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: 'Eventra Group Online Consultant — Phone Number Added',
            from_name: state.contact.name,
            name: state.contact.name,
            email: state.contact.email,
            phone: phone,
            whatsapp_link: 'https://wa.me/' + cleanPhoneForWa(phone) + '?text=Hi%2C%20re%20your%20Eventra%20enquiry%20-'
          };

          postWithTimeout(WEB3FORMS_URL, followupPayload, 10000).then(function () {
            state.phoneFollowupSent = true;
            var wrap = screenRegion.querySelector('[data-conf-phone]');
            if (wrap && wrap.parentNode) {
              var confirm = document.createElement('p');
              confirm.className = 'oc-conf-phone__confirm';
              confirm.setAttribute('data-conf-phone-confirm', '');
              confirm.setAttribute('aria-live', 'polite');
              confirm.textContent = 'Thanks — we have your number.';
              wrap.parentNode.replaceChild(confirm, wrap);
            }
          }, function () {
            state.phoneFollowupSent = false;
            confPhoneBtn.disabled = false;
            confPhoneBtn.textContent = prevBtnText;
            if (confPhoneErr) confPhoneErr.textContent = "Couldn't add the number — please try again or include it in a follow-up email.";
          });
        });
      }
    }

    function setFieldError(input, errorEl, msg) {
      if (msg) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        if (errorEl) errorEl.textContent = msg;
      } else {
        input.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        if (errorEl) errorEl.textContent = '';
      }
    }

    function wireLeadForm(form) {
      var nameInput  = form.querySelector('#oc-lead-name');
      var emailInput = form.querySelector('#oc-lead-email');
      var notesInput = form.querySelector('#oc-lead-notes');
      var submitBtn  = form.querySelector('#oc-lead-submit');
      var nameErr    = form.querySelector('#oc-lead-name-error');
      var emailErr   = form.querySelector('#oc-lead-email-error');

      function validate() {
        var ok = true;
        var name  = nameInput.value.trim();
        var email = emailInput.value.trim();

        if (!name) { setFieldError(nameInput, nameErr, 'Please enter your name.'); ok = false; }
        else setFieldError(nameInput, nameErr, '');

        if (!email) { setFieldError(emailInput, emailErr, 'Please enter your email.'); ok = false; }
        else if (!EMAIL_RE.test(email)) { setFieldError(emailInput, emailErr, 'Please enter a valid email.'); ok = false; }
        else setFieldError(emailInput, emailErr, '');

        return ok;
      }

      function submitLead() {
        state.contact.name  = nameInput.value.trim();
        state.contact.email = emailInput.value.trim();
        state.contact.notes = notesInput.value.trim();

        if (!validate()) {
          var firstInvalid = form.querySelector('.is-invalid');
          if (firstInvalid && typeof firstInvalid.focus === 'function') firstInvalid.focus();
          return;
        }

        var submitErr = form.querySelector('#oc-lead-submit-error');
        if (submitErr) submitErr.textContent = '';

        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        var branch = state.branch;
        var branchLabel = BRANCH_LABELS[branch] || '';
        var notesValue = state.contact.notes ? state.contact.notes : 'None provided';

        var payload = {
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Eventra Group Online Consultant Enquiry',
          from_name: state.contact.name,
          name: state.contact.name,
          email: state.contact.email,
          branch: branchLabel,
          answers: formatAnswers(branch, state),
          notes: notesValue
        };

        postWithTimeout(WEB3FORMS_URL, payload, 10000).then(function () {
          if (submitErr) submitErr.textContent = '';
          state.submitted = true;
          navigate('confirmation');
        }, function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send enquiry';
          if (submitErr) submitErr.textContent = 'Sorry — something went wrong. Please email enquire@eventragroup.com directly.';
        });
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        submitLead();
      });
    }

    function open() {
      if (panel.classList.contains('is-open')) return;
      lastFocused = document.activeElement;
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
      launcher.setAttribute('aria-expanded', 'true');
      launcher.classList.add('is-hidden');
      applyFocus();
    }

    function close() {
      if (!panel.classList.contains('is-open')) return;
      var shouldReset = (current === 'confirmation' || state.submitted);
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.classList.remove('is-hidden');
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      } else {
        launcher.focus();
      }
      if (shouldReset) reset();
    }

    launcher.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

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

    // Initial render
    render();
  }

  function mount() {
    if (document.getElementById('oc-root')) return;
    injectStyles();
    var root = buildMarkup();
    document.body.appendChild(root);
    wire(root);
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
