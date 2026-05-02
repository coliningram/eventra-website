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
    '.oc-form-help{',
      'font-family:"Inter",system-ui,sans-serif;',
      'font-size:11px;font-weight:400;line-height:1.5;letter-spacing:0.02em;',
      'color:#8A8A8A;margin:-2px 0 6px;',
    '}',
    '.oc-cta:disabled,.oc-continue:disabled{opacity:0.6;cursor:default;pointer-events:none;}',

    '.oc-conf-slot{',
      'min-height:8px;',
      'border-top:1px solid #B8966B;',
      'padding-top:22px;margin-top:26px;',
    '}',
    '.oc-conf-heading{',
      'font-family:"Cormorant Garamond","Times New Roman",serif;',
      'font-size:19px;font-weight:500;line-height:1.3;letter-spacing:0.01em;',
      'color:#0A3D2E;margin:0 0 10px;',
    '}',
    '.oc-conf-snippet{',
      'font-family:"Inter",system-ui,-apple-system,sans-serif;',
      'font-size:13px;font-weight:400;line-height:1.65;letter-spacing:0.01em;',
      'color:#4A4A4A;margin:0;',
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

  // ---- Confirmation snippets ----------------------------------------------
  // Snippet content — edit here to update what visitors see on the confirmation
  // screen. Each snippet should be 60-90 words, factual, and align with what
  // Eventra can actually deliver. Update when product offerings change
  // (especially CONCERTS which references specific current artist tours).
  var SNIPPETS = {
    BESPOKE_AFRICA: {
      heading: "Bespoke Africa",
      body: "Curated journeys across the continent — Cape Town and the Garden Route, Kruger and the private reserves of the Sabi Sands, Victoria Falls, Botswana's Okavango, Namibia's deserts, Zambia, Zimbabwe, Madagascar, and the Indian Ocean islands. From a long weekend escape to a multi-week journey of a lifetime. Three tiers — Classic, Signature, Prestige — and every itinerary built around the people we know on the ground."
    },
    BESPOKE_EUROPE: {
      heading: "Bespoke Europe",
      body: "Tailor-made journeys across the British Isles, France and Monaco, Italy, Spain and Portugal, Switzerland and Austria, Greece, Croatia and the Adriatic, the Nordic countries, and Central and Eastern Europe. Designed around the way you want to travel — a city weekend, a private villa with the family, a self-drive through wine country, a multi-country grand tour. Every journey priced on enquiry, with the right contacts and properties chosen for what you have in mind."
    },
    BESPOKE_GENERAL: {
      heading: "Eventra Bespoke",
      body: "Tailor-made journeys with our destination contacts in Africa, Europe, and beyond. Whether you have a specific destination in mind or want our recommendations based on what you're looking for, we'll build something that fits. Every itinerary priced on enquiry, designed around the way you want to travel."
    },
    SPRINGBOKS: {
      heading: "Springboks Hospitality",
      body: "Premium hospitality at every Springbok test in South Africa — DHL Stadium, Loftus Versfeld, Ellis Park, Kings Park, Mbombela, Free State — and on tour overseas. Private suites for groups, executive hospitality for smaller parties, premium tickets where preferred. Match-day only, match plus accommodation in the host city, or multi-day inbound packages built around safari, the Cape, and the wider country. Built around your group, your budget, and the rugby you want to be at."
    },
    CRICKET: {
      heading: "Cricket Hospitality",
      body: "Premium cricket experiences at all five major South African venues — Newlands, Wanderers, Centurion, Kingsmead, St George's Park — across Tests, ODIs, T20s, and domestic finals where the moment calls for it. Currently building toward the England vs South Africa Test at Newlands, January 2027, with private VIP suites and inbound packages built around the match. Beyond home tests, hospitality at Lord's, the Oval, the Ashes, and the Springboks of cricket — the Proteas — wherever they're touring."
    },
    F1_MOTOGP: {
      heading: "F1 & MotoGP Hospitality",
      body: "Hospitality at most rounds on the F1 calendar — Monaco yacht weekends, Paddock Club at Silverstone and Monza, the Champions Club in Austria, the Green Room in Singapore, premium trackside lounges everywhere from Melbourne to Las Vegas. MotoGP rounds where the calendar allows. Race weekend only, race-plus-city, or multi-day stays built around the wider region. From a single ticket to a full corporate group, every package built to the way you want to experience the weekend."
    },
    TENNIS: {
      heading: "Tennis Hospitality",
      body: "Three of the four Grand Slams — Wimbledon, Roland Garros, and the US Open — with hospitality across the spectrum: Wimbledon debenture seats, Roland Garros' La Mezzanine, premium upper-tier seating at Flushing Meadows, and box hire where the moment justifies it. From a single match-day to multi-day stays built around the city. Finals-focused for the showcase moment, full-tournament for the proper tennis traveller. Built around what the match means to you."
    },
    FOOTBALL: {
      heading: "Football Hospitality",
      body: "Premier League fixtures across every club, every weekend — and the moments that matter most: Champions League and Europa League finals, the FA Cup final, England internationals at major venues. Hospitality boxes, premium lounges with full pre and post-match service, player meet-and-greets where the access exists. From a single derby weekend to multi-match tours built around the football and the city. Built around the club you support, the match you want to be at, the way you want the day to feel."
    },
    CONCERTS: {
      heading: "Concerts & Culture Hospitality",
      body: "Premium hospitality at the UK's biggest live music tours. Currently confirmed for Harry Styles, Bruno Mars, The Weeknd, and Bon Jovi — stadium and arena packages with hospitality boxes, premium tickets, dining and transfers built into the night. From a single show to a weekend in London or Manchester built around the gig. Beyond live music, we'll arrange access to the cultural moments that matter to you wherever availability allows — tell us what you'd like to be at."
    },
    SPORTS_GENERAL: {
      heading: "Eventra Sports & Events",
      body: "Premium hospitality at the world's most iconic sporting and cultural moments — from rugby and cricket to F1, tennis, football, and live music. Tell us the event you want to be at and we'll handle the access, the hospitality, the accommodation, and the transfers. Built around what you'd most like to see."
    }
  };

  function pickSnippetKey() {
    var branch = state && state.branch;
    if (branch === 'bespoke') {
      var region = state.bespoke && state.bespoke.region;
      if (region === 'africa' || region === 'multi-region') return 'BESPOKE_AFRICA';
      if (region === 'europe') return 'BESPOKE_EUROPE';
      return 'BESPOKE_GENERAL';
    }
    if (branch === 'sports') {
      var sport = state.sports && state.sports.sport;
      if (sport === 'rugby') return 'SPRINGBOKS';
      if (sport === 'cricket') return 'CRICKET';
      if (sport === 'f1') return 'F1_MOTOGP';
      if (sport === 'tennis') return 'TENNIS';
      if (sport === 'football') return 'FOOTBALL';
      if (sport === 'concerts-culture') return 'CONCERTS';
      return 'SPORTS_GENERAL';
    }
    return 'BESPOKE_GENERAL';
  }

  function renderConfirmationSnippet() {
    var snippet = SNIPPETS[pickSnippetKey()] || SNIPPETS.BESPOKE_GENERAL;
    return [
      '<div class="oc-conf-slot" data-conf-slot>',
        '<h3 class="oc-conf-heading">While you wait — about ' + escHtml(snippet.heading) + '</h3>',
        '<p class="oc-conf-snippet">' + escHtml(snippet.body) + '</p>',
      '</div>'
    ].join('');
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
    bespoke_africa: [
      {
        id: 'bespoke_africa-1', stateKey: 'experience',
        heading: 'What kind of African experience are you looking for?',
        options: [
          { value: 'classic-safari', label: 'Classic safari — Big Five game viewing' },
          { value: 'off-grid-wilderness', label: 'Off-grid wilderness — remote camps, no other guests' },
          { value: 'safari-and-beach', label: 'Safari and beach — combine bush with coast' },
          { value: 'cultural-historical', label: 'Cultural and historical — South Africa, Zimbabwe, Egypt' },
          { value: 'wildlife-specialty', label: 'Wildlife specialty — gorillas, primates, big cats, photographic' },
          { value: 'active-adventure', label: 'Active and adventure — walking safaris, mobile camps, exploration' },
          { value: 'mix', label: 'Something else / mix — tell us in the next step' }
        ]
      },
      {
        id: 'bespoke_africa-2', stateKey: 'beyondSafari',
        heading: 'Beyond the safari, where do you want to be?',
        options: [
          { value: 'coast-islands', label: 'Coast and islands — Cape Town, Indian Ocean islands, Mozambique' },
          { value: 'wine-country', label: 'Wine country and the Cape — Stellenbosch, Franschhoek, Cape Town' },
          { value: 'city-culture', label: 'City and culture — Cape Town, Joburg, beyond' },
          { value: 'pure-wilderness', label: 'Pure wilderness — let the safari be the whole trip, no add-ons' },
          { value: 'surprise-us', label: 'Surprise us — open to suggestions' }
        ]
      },
      {
        id: 'bespoke_africa-3', stateKey: 'accommodation',
        heading: 'What style of accommodation suits you?',
        options: [
          { value: 'excellent-value', label: 'Excellent properties, well-priced — comfortable, well-located, good value' },
          { value: 'premium', label: 'Premium properties, the better experience — top-tier within their category, often boutique' },
          { value: 'very-best', label: 'The very best — no compromises — flagship lodges, suites, private villas' },
          { value: 'mix', label: "Mix across the trip — splash out where it matters, save where it doesn't" }
        ]
      },
      {
        id: 'bespoke_africa-4', stateKey: 'when',
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
        id: 'bespoke_africa-5', stateKey: 'travellers',
        heading: 'How many travellers?',
        options: [
          { value: 'just-me', label: 'Just me' },
          { value: 'couple', label: 'A couple' },
          { value: 'family', label: 'A family' },
          { value: 'small-group', label: 'A small group (3-8)' },
          { value: 'large-group', label: 'A larger group (9+)' }
        ]
      }
    ],
    bespoke_europe: [
      {
        id: 'bespoke_europe-1', stateKey: 'subRegion',
        heading: 'Which part of Europe draws you most?',
        options: [
          { value: 'british-isles', label: 'British Isles — UK, Ireland' },
          { value: 'france-monaco-med', label: 'France, Monaco & the Mediterranean coast' },
          { value: 'italy', label: 'Italy — north and south' },
          { value: 'spain-portugal', label: 'Spain & Portugal' },
          { value: 'alps', label: 'The Alps — Switzerland, Austria, Tyrol' },
          { value: 'greece-croatia-adriatic', label: 'Greece, Croatia & the Adriatic' },
          { value: 'northern-scandinavia', label: 'Northern Europe & Scandinavia' },
          { value: 'central-eastern', label: 'Central & Eastern Europe — Czech, Hungary, Poland, Bosnia' },
          { value: 'multi-country', label: 'Multi-country grand tour' },
          { value: 'open', label: 'Open to suggestions' }
        ]
      },
      {
        id: 'bespoke_europe-2', stateKey: 'experienceType',
        heading: 'What kind of trip are you imagining?',
        options: [
          { value: 'city-culture', label: 'City and culture — capital cities, museums, fine dining' },
          { value: 'coastal-seaside', label: 'Coastal and seaside — beaches, sailing, harbour towns' },
          { value: 'wine-gastronomy', label: 'Wine country and gastronomy — vineyards, cooking, food regions' },
          { value: 'mountain-alpine', label: 'Mountain and alpine — ski, hike, mountain lodges' },
          { value: 'countryside-slow', label: 'Countryside and slow travel — villas, country houses, villages' },
          { value: 'multi-country-tour', label: 'A multi-country grand tour — multiple destinations, properly paced' },
          { value: 'celebration', label: 'A celebration — milestone trip, anniversary, big birthday' },
          { value: 'mix', label: 'Something else / mix' }
        ]
      },
      {
        id: 'bespoke_europe-3', stateKey: 'accommodation',
        heading: 'What style of accommodation suits you?',
        options: [
          { value: 'excellent-value', label: 'Excellent properties, well-priced — comfortable, well-located, good value' },
          { value: 'premium', label: 'Premium properties, the better experience — top-tier within their category, often boutique' },
          { value: 'very-best', label: 'The very best — no compromises — flagship lodges, suites, private villas' },
          { value: 'mix', label: "Mix across the trip — splash out where it matters, save where it doesn't" }
        ]
      },
      {
        id: 'bespoke_europe-4', stateKey: 'when',
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
        id: 'bespoke_europe-5', stateKey: 'travellers',
        heading: 'How many travellers?',
        options: [
          { value: 'just-me', label: 'Just me' },
          { value: 'couple', label: 'A couple' },
          { value: 'family', label: 'A family' },
          { value: 'small-group', label: 'A small group (3-8)' },
          { value: 'large-group', label: 'A larger group (9+)' }
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
    ],
    sports_rugby: [
      {
        id: 'sports_rugby-1', stateKey: 'fixture',
        heading: 'Which Springbok fixture interests you?',
        // Update annually — fixture list goes stale year to year. Refresh before each new Springbok season.
        options: [
          { value: 'all-blacks-2026', label: 'All Blacks tour 2026 — the August Cape Town test' },
          { value: 'england-2026', label: 'England inbound 2026 — the July test series' },
          { value: 'scotland-2026', label: 'Scotland inbound 2026 — the July Loftus test' },
          { value: 'lions-2027', label: 'British & Irish Lions 2027 — the July tour' },
          { value: 'other-home-2026', label: 'Other 2026 home test — Wallabies, Argentina, France, etc.' },
          { value: 'away-tour', label: 'Springbok away tour — UK November tour, NZ/Australia' },
          { value: 'open', label: 'Open to suggestions — flexible on which match' }
        ]
      },
      {
        id: 'sports_rugby-2', stateKey: 'hospitality',
        heading: 'What kind of hospitality experience?',
        options: [
          { value: 'private-suite', label: 'Private suite for the group — full suite hire, 18-40 pax, dedicated entertaining space' },
          { value: 'executive', label: 'Executive hospitality — premium hospitality lounge access, smaller groups' },
          { value: 'premium-seating', label: 'Premium ticketed seating — top-category seats, no formal hospitality' },
          { value: 'open', label: 'Open to recommendations — show me what works for the match and group size' }
        ]
      },
      {
        id: 'sports_rugby-3', stateKey: 'travelScope',
        heading: 'How much of the trip should we handle?',
        options: [
          { value: 'match-only', label: "Match day only — tickets and hospitality, we'll handle the rest" },
          { value: 'match-accom', label: 'Match plus accommodation — hotel in the host city around the fixture' },
          { value: 'match-extend', label: 'Match plus safari or sightseeing — extend with a Cape Town stay, Garden Route, or safari' },
          { value: 'full-package', label: 'Full inbound package — flights, transfers, accommodation, multi-day itinerary, the lot' }
        ]
      },
      {
        id: 'sports_rugby-4', stateKey: 'accommodation',
        heading: 'What style of accommodation suits you?',
        options: [
          { value: 'not-applicable', label: 'Not applicable — match day only, no accommodation needed' },
          { value: 'excellent-value', label: 'Excellent properties, well-priced — comfortable, well-located, good value' },
          { value: 'premium', label: 'Premium properties, the better experience — top-tier within their category, often boutique' },
          { value: 'very-best', label: 'The very best — no compromises — flagship lodges, suites, private villas' },
          { value: 'mix', label: "Mix across the trip — splash out where it matters, save where it doesn't" }
        ]
      },
      {
        id: 'sports_rugby-5', stateKey: 'when',
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
        id: 'sports_rugby-6', stateKey: 'party',
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
    bespoke_africa: { experience: 'Experience', beyondSafari: 'Beyond safari', accommodation: 'Accommodation', when: 'Timing', travellers: 'Party size' },
    bespoke_europe: { subRegion: 'Sub-region', experienceType: 'Experience', accommodation: 'Accommodation', when: 'Timing', travellers: 'Party size' },
    sports:  { sport: 'Sport', eventName: 'Specific event', when: 'Timing', party: 'Party size' },
    sports_rugby: { fixture: 'Fixture', hospitality: 'Hospitality', travelScope: 'Travel scope', accommodation: 'Accommodation', when: 'Timing', party: 'Party size' }
  };

  function formatAnswers(branch, st) {
    if (branch === 'bespoke' && st.bespoke && st.bespoke.region === 'africa') {
      var afLines = [];
      var regionQ = FLOWS.bespoke[0];
      var regionLabel = null;
      for (var ri = 0; ri < regionQ.options.length; ri++) {
        if (regionQ.options[ri].value === 'africa') { regionLabel = regionQ.options[ri].label; break; }
      }
      afLines.push((ANSWER_LABELS.bespoke.region || 'Region') + ': ' + (regionLabel || 'Africa'));
      var afFlow = FLOWS.bespoke_africa;
      var afLabels = ANSWER_LABELS.bespoke_africa || {};
      var afState = st.bespoke_africa || {};
      for (var ai = 0; ai < afFlow.length; ai++) {
        var aq = afFlow[ai];
        var aval = afState[aq.stateKey];
        var aLeft = afLabels[aq.stateKey] || aq.stateKey;
        if (aval) {
          var aMatch = null;
          for (var aj = 0; aj < aq.options.length; aj++) {
            if (aq.options[aj].value === aval) { aMatch = aq.options[aj].label; break; }
          }
          if (aMatch) afLines.push(aLeft + ': ' + aMatch);
        }
      }
      return afLines.length ? afLines.join('\n') : 'None provided';
    }
    if (branch === 'bespoke' && st.bespoke && st.bespoke.region === 'europe') {
      var euLines = [];
      var euRegionQ = FLOWS.bespoke[0];
      var euRegionLabel = null;
      for (var eri = 0; eri < euRegionQ.options.length; eri++) {
        if (euRegionQ.options[eri].value === 'europe') { euRegionLabel = euRegionQ.options[eri].label; break; }
      }
      euLines.push((ANSWER_LABELS.bespoke.region || 'Region') + ': ' + (euRegionLabel || 'Europe'));
      var euFlow = FLOWS.bespoke_europe;
      var euLabels = ANSWER_LABELS.bespoke_europe || {};
      var euState = st.bespoke_europe || {};
      for (var ei = 0; ei < euFlow.length; ei++) {
        var eq = euFlow[ei];
        var eval_ = euState[eq.stateKey];
        var eLeft = euLabels[eq.stateKey] || eq.stateKey;
        if (eval_) {
          var eMatch = null;
          for (var ej = 0; ej < eq.options.length; ej++) {
            if (eq.options[ej].value === eval_) { eMatch = eq.options[ej].label; break; }
          }
          if (eMatch) euLines.push(eLeft + ': ' + eMatch);
        }
      }
      return euLines.length ? euLines.join('\n') : 'None provided';
    }
    if (branch === 'sports' && st.sports && st.sports.sport === 'rugby') {
      var ruLines = [];
      var sportQ = FLOWS.sports[0];
      var sportLabel = null;
      for (var rsi = 0; rsi < sportQ.options.length; rsi++) {
        if (sportQ.options[rsi].value === 'rugby') { sportLabel = sportQ.options[rsi].label; break; }
      }
      ruLines.push((ANSWER_LABELS.sports.sport || 'Sport') + ': ' + (sportLabel || 'Rugby'));
      var ruFlow = FLOWS.sports_rugby;
      var ruLabels = ANSWER_LABELS.sports_rugby || {};
      var ruState = st.sports_rugby || {};
      for (var rui = 0; rui < ruFlow.length; rui++) {
        var rq = ruFlow[rui];
        var rval = ruState[rq.stateKey];
        var rLeft = ruLabels[rq.stateKey] || rq.stateKey;
        if (rval) {
          var rMatch = null;
          for (var ruj = 0; ruj < rq.options.length; ruj++) {
            if (rq.options[ruj].value === rval) { rMatch = rq.options[ruj].label; break; }
          }
          if (rMatch) ruLines.push(rLeft + ': ' + rMatch);
        }
      }
      return ruLines.length ? ruLines.join('\n') : 'None provided';
    }
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
    bespoke_africa: { experience: null, beyondSafari: null, accommodation: null, when: null, travellers: null },
    bespoke_europe: { subRegion: null, experienceType: null, accommodation: null, when: null, travellers: null },
    sports:  { sport: null, eventName: '', when: null, party: null },
    sports_rugby: { fixture: null, hospitality: null, travelScope: null, accommodation: null, when: null, party: null },
    contact: { name: '', email: '', phone: '', notes: '' },
    submitted: false
  };
  if (!state.contact) state.contact = { name: '', email: '', phone: '', notes: '' };
  if (typeof state.contact.phone !== 'string') state.contact.phone = '';
  if (typeof state.submitted !== 'boolean') state.submitted = false;
  if (!state.bespoke_africa) state.bespoke_africa = { experience: null, beyondSafari: null, accommodation: null, when: null, travellers: null };
  if (!state.bespoke_europe) state.bespoke_europe = { subRegion: null, experienceType: null, accommodation: null, when: null, travellers: null };
  if (!state.sports_rugby) state.sports_rugby = { fixture: null, hospitality: null, travelScope: null, accommodation: null, when: null, party: null };
  window.__eventraOnlineConsultantState = state;

  var stack = [];
  var current = 'welcome';

  function escAttr(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;'); }
  function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function parseQuestionId(name) {
    var m = /^(bespoke_africa|bespoke_europe|sports_rugby|bespoke|sports)-(\d+)$/.exec(name);
    if (!m) return null;
    var branch = m[1];
    var idx = parseInt(m[2], 10) - 1;
    if (!FLOWS[branch] || idx < 0 || idx >= FLOWS[branch].length) return null;
    return { branch: branch, idx: idx };
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

  var TOTAL_STEPS = { bespoke: 5, bespoke_africa: 7, bespoke_europe: 7, sports: 5, sports_rugby: 8 };
  var STEP_OFFSET = { bespoke: 2, bespoke_africa: 3, bespoke_europe: 3, sports: 2, sports_rugby: 3 };

  function renderQuestion(branch, idx) {
    var q = FLOWS[branch][idx];
    var offset = STEP_OFFSET[branch] || 2;
    var totalSteps = TOTAL_STEPS[branch] || 5;
    var stepNum = idx + offset;
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
          '<span class="oc-progress">Step ' + stepNum + ' of ' + totalSteps + '</span>',
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
            '<label class="oc-input-label" for="oc-lead-phone">Phone</label>',
            '<input id="oc-lead-phone" type="tel" class="oc-input" autocomplete="tel" placeholder="e.g. +44 7700 900000" value="' + escAttr(c.phone) + '" />',
            '<p class="oc-form-help">Optional — share if you’d like a faster response by call or WhatsApp.</p>',
          '</div>',
          '<div class="oc-form-field">',
            '<label class="oc-input-label" for="oc-lead-notes">Anything else?</label>',
            '<textarea id="oc-lead-notes" class="oc-textarea" rows="3">' + escHtml(c.notes) + '</textarea>',
          '</div>',
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
        '<p class="oc-intro__copy">Your enquiry has reached us and a senior consultant will be in touch within 2 business hours during 8am–6pm SAST Monday–Friday. Out-of-hours enquiries answered first thing the next business day.</p>',
        renderConfirmationSnippet(),
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
      if (branch === 'bespoke' && idx === 0 && state.bespoke.region === 'africa') {
        navigate('bespoke_africa-1');
        return;
      }
      if (branch === 'bespoke' && idx === 0 && state.bespoke.region === 'europe') {
        navigate('bespoke_europe-1');
        return;
      }
      if (branch === 'sports' && idx === 0 && state.sports.sport === 'rugby') {
        navigate('sports_rugby-1');
        return;
      }
      if (idx + 1 < FLOWS[branch].length) {
        navigate(branch + '-' + (idx + 2));
      } else {
        navigate('lead-form');
      }
    }

    function reset() {
      state.branch = null;
      state.bespoke = { region: null, when: null, travellers: null, tripType: null };
      state.bespoke_africa = { experience: null, beyondSafari: null, accommodation: null, when: null, travellers: null };
      state.bespoke_europe = { subRegion: null, experienceType: null, accommodation: null, when: null, travellers: null };
      state.sports  = { sport: null, eventName: '', when: null, party: null };
      state.sports_rugby = { fixture: null, hospitality: null, travelScope: null, accommodation: null, when: null, party: null };
      state.contact = { name: '', email: '', phone: '', notes: '' };
      state.submitted = false;
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
      var phoneInput = form.querySelector('#oc-lead-phone');
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
        state.contact.phone = phoneInput ? phoneInput.value.trim() : '';
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
        var notesValue = state.contact.notes ? state.contact.notes : '';
        var phoneValue = state.contact.phone ? state.contact.phone : '';

        var payload = {
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: 'Eventra Group Online Consultant Enquiry',
          from_name: state.contact.name,
          name: state.contact.name,
          email: state.contact.email,
          phone: phoneValue,
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
