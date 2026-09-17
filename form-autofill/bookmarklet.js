// Fills in a whole form with plausible random data: text fields, selects, radios,
// checkboxes, dates, custom select/datepicker widgets and file uploads. Honours the
// constraints the markup declares (type, pattern, min/max/step, maxlength, accept,
// autocomplete) and keeps sweeping so fields revealed by earlier answers get filled too.
(function () {
  var rnd = Math.random;
  var AL = 'abcdefghijklmnopqrstuvwxyz';
  function R(a, b) { return a + Math.floor(rnd() * (b - a + 1)); }
  function P(a) { return a[R(0, a.length - 1)]; }
  function pad(v, l) { v = String(v); while (v.length < (l || 2)) v = '0' + v; return v; }

  var FIRST = ['Anna','Ben','Clara','David','Elena','Felix','Greta','Hugo','Ida','Jonas','Karla','Lars','Mia','Noah','Olivia','Paul','Rosa','Sven','Tina','Uwe'];
  var LAST = ['Bauer','Fischer','Hoffmann','Keller','Lehmann','Meyer','Neumann','Richter','Schmidt','Wagner','Weber','Zimmermann'];
  var WORDS = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','tempor','incididunt','labore','magna','aliqua','veniam','quis','nostrud','commodo'];
  var STREETS = ['Hauptstrasse','Bahnhofstrasse','Gartenweg','Lindenallee','Schulstrasse','Am Markt'];
  var CITIES = ['Berlin','Hamburg','Muenchen','Koeln','Leipzig','Dresden','Stuttgart','Bremen'];
  var REGIONS = ['Bayern','Berlin','Hessen','Sachsen','Hamburg','Niedersachsen'];
  var COUNTRIES = ['Germany','Austria','Switzerland','Netherlands','France','Denmark'];
  var CODES = ['DE','AT','CH','NL','FR','DK'];
  var CORP = ['Nord','Vertex','Lumen','Aurora','Kappa','Orbit','Helios','Delta'];
  var CORP2 = ['GmbH','AG','Labs','Systems','Group','Works'];
  var JOBS = ['Product Manager','Software Engineer','Designer','Analyst','Consultant','Team Lead'];
  var TLD = ['com','net','org','io','de'];

  function words(n) { var o = [], i; for (i = 0; i < n; i++) o.push(P(WORDS)); return o.join(' '); }
  function sentence(n) { var s = words(n || R(6, 14)); return s.charAt(0).toUpperCase() + s.slice(1) + '.'; }
  function paragraph() { var o = [], i, n = R(2, 4); for (i = 0; i < n; i++) o.push(sentence()); return o.join(' '); }
  function title() { return words(R(2, 5)).replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function first() { return P(FIRST); }
  function last() { return P(LAST); }
  function person() { return first() + ' ' + last(); }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, ''); }
  function user() { return slug(first()) + '.' + slug(last()) + R(1, 99); }
  function email() { return user() + '@example.' + P(TLD); }
  function domain() { return slug(P(CORP)) + '-' + P(WORDS) + '.example.' + P(TLD); }
  function url() { return 'https://' + domain(); }
  /* real German mobile prefixes that are valid with a 7-digit subscriber number */
  var MOB = ['160','162','163','170','171','172','173','174','175','177','178','179'];
  /* If the field shows an example number, copy its exact shape and keep its leading
     digits (country/carrier prefix) so locale-aware validators stay happy. */
  function mask(el) {
    var s = el && (el.placeholder || el.getAttribute('aria-placeholder') ||
      el.getAttribute('data-placeholder') || el.getAttribute('data-mask') || '');
    s = (s || '').trim();
    if (!s || !/[0-9]/.test(s) || !/^[0-9\s()+.\/-]{6,}$/.test(s)) return null;
    var keep = 0;
    return s.replace(/[0-9]/g, function (c) { return keep++ < 4 ? c : String(R(0, 9)); });
  }
  function phone(el) {
    return mask(el) || '+49' + P(MOB) + pad(R(0, 9999999), 7);
  }
  function company() { return P(CORP) + P(CORP2) + ' ' + P(CORP2); }
  function street() { return P(STREETS) + ' ' + R(1, 199); }
  function postcode() { return String(R(10000, 99999)); }
  function hex() { return '#' + pad(R(0, 16777215).toString(16), 6); }
  function password() {
    var s = P('ABCDEFGHJKLMNPQRSTUVWXYZ') + P(AL) + P(AL) + P(AL), i;
    for (i = 0; i < 4; i++) s += P(AL);
    return s + R(10, 99) + P('!?#$%&*');
  }
  function luhn() {
    var d = [4], i, v, s = 0;
    for (i = 1; i < 15; i++) d.push(R(0, 9));
    for (i = 0; i < 15; i++) {
      v = d[14 - i];
      if (i % 2 === 0) { v *= 2; if (v > 9) v -= 9; }
      s += v;
    }
    return d.join('') + ((10 - s % 10) % 10);
  }
  function iban() {
    var b = '', i;
    for (i = 0; i < 18; i++) b += R(0, 9);
    try { return 'DE' + pad(String(98n - BigInt(b + '131400') % 97n)) + b; }
    catch (e) { return 'DE' + R(10, 99) + b; }
  }

  /* ---- dates, clamped to the field's own min/max ---- */
  function dateFor(el) {
    var Y = 31536e6, now = Date.now();
    var lo = Date.parse(el.min || ''), hi = Date.parse(el.max || '');
    if (isNaN(lo) && isNaN(hi)) { lo = now - 2 * Y; hi = now + Y; }
    else if (isNaN(lo)) lo = hi - 3 * Y;
    else if (isNaN(hi)) hi = lo + 3 * Y;
    if (hi < lo) hi = lo;
    return new Date(lo + Math.floor(rnd() * (hi - lo + 1)));
  }
  function ymd(d) { return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function hm(el, d) {
    var s = pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes());
    var st = parseFloat(el.step);
    return st > 0 && st % 60 !== 0 ? s + ':' + pad(d.getUTCSeconds()) : s;
  }
  function isoWeek(d) {
    var t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7) + 3);
    var y = t.getUTCFullYear(), f = new Date(Date.UTC(y, 0, 4));
    return y + '-W' + pad(1 + Math.round(((t - f) / 864e5 - 3 + ((f.getUTCDay() + 6) % 7)) / 7));
  }
  function birthday() { var y = R(1955, 2005); return y + '-' + pad(R(1, 12)) + '-' + pad(R(1, 28)); }
  function birthDate() { return new Date(Date.UTC(R(1955, 2005), R(0, 11), R(1, 28))); }
  /* Free-text date fields: follow the format the field advertises (dd.mm.yyyy,
     TT.MM.JJJJ, mm/dd/yyyy ...), else the document language, else ISO. */
  function dateText(el, d) {
    d = d || dateFor(el);
    var hint = ((el.placeholder || '') + ' ' + (el.getAttribute('aria-placeholder') || '') + ' ' +
      (el.getAttribute('data-format') || '') + ' ' + (el.getAttribute('data-date-format') || '') + ' ' +
      (el.getAttribute('title') || '')).toLowerCase();
    var m = hint.match(/[dtjmy]{1,4}[.\/-][dtjmy]{1,4}[.\/-][dtjmy]{1,4}/);
    if (m) {
      var sep = m[0].replace(/[dtjmy]/g, '').charAt(0);
      return m[0].split(/[.\/-]/).map(function (p) {
        var c = p.charAt(0);
        if (c === 'y' || c === 'j') return p.length <= 2 ? pad(d.getUTCFullYear() % 100) : String(d.getUTCFullYear());
        if (c === 'm') return pad(d.getUTCMonth() + 1);
        return pad(d.getUTCDate());
      }).join(sep);
    }
    var lang = (document.documentElement.getAttribute('lang') || navigator.language || 'en').toLowerCase();
    var D = pad(d.getUTCDate()), M = pad(d.getUTCMonth() + 1), Y = d.getUTCFullYear();
    if (/^(de|nl|ru|pl|cs|da|fi|tr|no|sv|at|ch)/.test(lang)) return D + '.' + M + '.' + Y;
    if (/^en-us|^en$/.test(lang)) return M + '/' + D + '/' + Y;
    if (/^(en|fr|es|it|pt|el)/.test(lang)) return D + '/' + M + '/' + Y;
    return Y + '-' + M + '-' + D;
  }

  /* ---- numbers, honouring min/max/step ---- */
  function num(el, lo, hi) {
    var mn = el.min !== '' && !isNaN(parseFloat(el.min)) ? parseFloat(el.min) : lo;
    var mx = el.max !== '' && !isNaN(parseFloat(el.max)) ? parseFloat(el.max) : hi;
    if (mx < mn) mx = mn;
    var sa = (el.getAttribute('step') || '').trim();
    var st = sa === 'any' ? 0 : parseFloat(sa) > 0 ? parseFloat(sa) : 1;
    var v;
    if (st) { v = mn + R(0, Math.max(0, Math.floor((mx - mn) / st))) * st; }
    else { v = mn + rnd() * (mx - mn); v = Math.round(v * 100) / 100; }
    return String(parseFloat(v.toFixed(10)));
  }
  function numFor(el, k) {
    var lo = 1, hi = 1000;
    if (/\bage\b|alter/.test(k)) { lo = 18; hi = 80; }
    else if (/year|jahr/.test(k)) { lo = 1970; hi = 2030; }
    else if (/month|monat/.test(k)) { lo = 1; hi = 12; }
    else if (/percent|rate|score|prozent/.test(k)) { lo = 0; hi = 100; }
    else if (/qty|quantity|anzahl|menge|count|seats|guests|people/.test(k)) { lo = 1; hi = 20; }
    else if (/price|cost|total|amount|betrag|preis|salary|budget/.test(k)) { lo = 5; hi = 5000; }
    else if (/zip|postal|plz/.test(k)) { lo = 10000; hi = 99999; }
    else if (/pin|code/.test(k)) { lo = 1000; hi = 9999; }
    return num(el, lo, hi);
  }

  /* ---- what the markup says this field is ---- */
  var AC = {
    'name': person, 'given-name': first, 'family-name': last,
    'additional-name': function () { return first().charAt(0) + '.'; },
    'honorific-prefix': function () { return P(['Dr.', 'Prof.', 'Mr.', 'Ms.']); },
    'nickname': first, 'username': user, 'email': email,
    'new-password': password, 'current-password': password,
    'organization': company, 'organization-title': function () { return P(JOBS); },
    'street-address': function () { return street() + ', ' + postcode() + ' ' + P(CITIES); },
    'address-line1': street, 'address-line2': function () { return 'Apt ' + R(1, 99); },
    'address-line3': function () { return 'c/o ' + person(); },
    'address-level1': function () { return P(REGIONS); }, 'address-level2': function () { return P(CITIES); },
    'postal-code': postcode, 'country': function () { return P(CODES); },
    'country-name': function () { return P(COUNTRIES); },
    'tel': phone, 'tel-national': function (el) { return mask(el) || '0' + P(MOB) + pad(R(0, 9999999), 7); },
    'tel-country-code': function () { return '+49'; },
    'tel-area-code': function () { return P(MOB); },
    'tel-local': function () { return String(R(1000000, 9999999)); },
    'tel-extension': function () { return String(R(10, 99)); },
    'url': url, 'photo': function () { return url() + '/avatar.png'; },
    'impp': function () { return 'sip:' + email(); },
    'bday': function (el) { return dateText(el, birthDate()); }, 'bday-day': function () { return String(R(1, 28)); },
    'bday-month': function () { return String(R(1, 12)); }, 'bday-year': function () { return String(R(1955, 2005)); },
    'sex': function () { return P(['female', 'male', 'other']); },
    'language': function () { return P(['de', 'en', 'fr', 'nl']); },
    'cc-name': person, 'cc-given-name': first, 'cc-family-name': last,
    'cc-number': luhn, 'cc-type': function () { return P(['Visa', 'Mastercard', 'Amex']); },
    'cc-csc': function () { return String(R(100, 999)); },
    'cc-exp': function () { return pad(R(1, 12)) + '/' + R(27, 32); },
    'cc-exp-month': function () { return pad(R(1, 12)); },
    'cc-exp-year': function () { return String(R(2027, 2032)); },
    'one-time-code': function () { return String(R(100000, 999999)); }
  };
  function acToken(el) {
    var a = (el.getAttribute('autocomplete') || '').toLowerCase().trim().split(/\s+/);
    var t = a[a.length - 1];
    return t && t !== 'on' && t !== 'off' ? t : '';
  }
  function labelText(el) {
    var t = '', l;
    try {
      if (el.id && window.CSS && CSS.escape) {
        l = (el.getRootNode() || document).querySelector('label[for="' + CSS.escape(el.id) + '"]');
        if (l) t += ' ' + l.textContent;
      }
      l = el.closest && el.closest('label');
      if (l) t += ' ' + l.textContent;
    } catch (e) {}
    return t;
  }
  function key(el) {
    return ((el.name || '') + ' ' + (el.id || '') + ' ' + acToken(el) + ' ' +
      (el.placeholder || '') + ' ' + (el.getAttribute('aria-label') || '') + ' ' +
      (el.getAttribute('data-testid') || '') + ' ' + labelText(el)).toLowerCase();
  }
  function textFor(el, k) {
    if (/(first|given|fore)[\s_-]*name|vorname/.test(k)) return first();
    if (/(last|family|sur)[\s_-]*name|nachname|familienname/.test(k)) return last();
    if (/middle[\s_-]*name/.test(k)) return first().charAt(0) + '.';
    if (/nick|user[\s_-]*name|username|login|handle|account|slug/.test(k)) return user();
    if (/e[\s_-]*mail/.test(k)) return email();
    if (/pass(word|wort)|\bpwd\b/.test(k)) return password();
    if (/phone|mobile|telefon|\btel\b|fax/.test(k)) return phone(el);
    if (/zip|postal|\bplz\b|postcode/.test(k)) return postcode();
    if (/city|town|\bort\b|stadt/.test(k)) return P(CITIES);
    if (/state|province|region|bundesland/.test(k)) return P(REGIONS);
    if (/country|\bland\b/.test(k)) return P(COUNTRIES);
    if (/street|address|\baddr|strasse|anschrift/.test(k)) return street();
    if (/compan|organi[sz]ation|firma|employer/.test(k)) return company();
    if (/job|position|role|title.*job|beruf/.test(k)) return P(JOBS);
    if (/iban|bank.*account|kontonummer/.test(k)) return iban();
    if (/\bbic\b|swift/.test(k)) return 'DEUTDEFF' + R(100, 999);
    if (/(card|cc)[\s_-]*(number|nr|no)|creditcard|kreditkarte/.test(k)) return luhn();
    if (/cvc|cvv|security[\s_-]*code|prufziffer/.test(k)) return String(R(100, 999));
    if (/vat|ust[\s_-]*id|tax[\s_-]*id/.test(k)) return 'DE' + R(100000000, 999999999);
    if (/url|website|homepage|link|domain/.test(k)) return url();
    if (/birth|geburt|\bdob\b/.test(k)) return dateText(el, birthDate());
    if (/date|datum|calendar|termin|deadline|valid|expir|from|until|von|bis/.test(k)) return dateText(el);
    /* a field whose only clue is a date mask in its placeholder, e.g. "DD/MM/YYYY" */
    if (/[dtjmy]{1,4}[.\/-][dtjmy]{1,4}[.\/-][dtjmy]{1,4}/.test(k)) return dateText(el);
    if (/message|comment|description|bio|about|note|remark|nachricht|kommentar|beschreibung/.test(k)) return paragraph();
    if (/search|query|suche|filter/.test(k)) return P(WORDS);
    if (/subject|betreff|headline|title|\bname\b/.test(k)) return title();
    if (/coupon|voucher|promo|referral/.test(k)) return P(WORDS).toUpperCase() + R(10, 99);
    if (/\bcode\b|\bpin\b|\botp\b/.test(k)) return String(R(100000, 999999));
    if (/quantity|amount|number|price|age|count|anzahl|menge|betrag/.test(k)) return numFor(el, k);
    return title();
  }

  /* ---- fit the value to length limits, pattern and datalist ---- */
  function listValue(el) {
    var id = el.getAttribute('list'), dl;
    if (!id) return null;
    try { dl = (el.getRootNode() || document).getElementById(id) || document.getElementById(id); } catch (e) {}
    return dl && dl.options && dl.options.length ? P(dl.options).value : null;
  }
  /* ---- reverse a pattern= regex into a value that satisfies it ---- */
  function cls(ch) {
    if (ch === 'd') return '0123456789';
    if (ch === 'D') return AL;
    if (ch === 'w') return AL + AL.toUpperCase() + '0123456789_';
    if (ch === 'W') return '-. ';
    if (ch === 's' || ch === 'n' || ch === 'r' || ch === 't') return ' ';
    if (ch === 'S') return AL + '0123456789';
    return ch;
  }
  function fromPattern(p) {
    var i = 0, ANY = AL + '0123456789';
    function atom() {
      var c = p.charAt(i), j, k, neg, set, v, depth;
      if (c === '(') {
        i++;
        if (p.charAt(i) === '?') {
          if (p.charAt(i + 1) === ':') i += 2;
          else {
            depth = 1; i++;
            while (i < p.length && depth) {
              if (p.charAt(i) === '(') depth++; else if (p.charAt(i) === ')') depth--;
              i++;
            }
            return function () { return ''; };
          }
        }
        v = alt();
        if (p.charAt(i) === ')') i++;
        return function () { return v; };
      }
      if (c === '[') {
        j = i + 1; neg = false; set = '';
        if (p.charAt(j) === '^') { neg = true; j++; }
        while (j < p.length && p.charAt(j) !== ']') {
          if (p.charAt(j) === '\\') { set += cls(p.charAt(j + 1)); j += 2; }
          else if (p.charAt(j + 1) === '-' && p.charAt(j + 2) && p.charAt(j + 2) !== ']') {
            for (k = p.charCodeAt(j); k <= p.charCodeAt(j + 2); k++) set += String.fromCharCode(k);
            j += 3;
          } else { set += p.charAt(j); j++; }
        }
        i = j + 1;
        if (neg) set = ANY.split('').filter(function (x) { return set.indexOf(x) < 0; }).join('');
        if (!set) set = 'x';
        return function () { return P(set); };
      }
      if (c === '\\') { set = cls(p.charAt(i + 1)); i += 2; return function () { return P(set); }; }
      if (c === '.') { i++; return function () { return P(ANY); }; }
      if (c === '^' || c === '$') { i++; return function () { return ''; }; }
      i++;
      return function () { return c; };
    }
    function quant() {
      var a = atom(), lo = 1, hi = 1, c = p.charAt(i), m, s = '', j;
      if (c === '*') { i++; lo = 0; hi = 3; }
      else if (c === '+') { i++; lo = 1; hi = 4; }
      else if (c === '?') { i++; lo = 0; hi = 1; }
      else if (c === '{') {
        m = /^\{(\d+)(,(\d*))?\}/.exec(p.slice(i));
        if (m) { i += m[0].length; lo = +m[1]; hi = m[2] == null ? lo : m[3] === '' ? lo + 2 : +m[3]; }
      }
      if (p.charAt(i) === '?' || p.charAt(i) === '+') i++;
      for (j = R(lo, hi); j > 0; j--) s += a();
      return s;
    }
    function seq() { var o = ''; while (i < p.length && p.charAt(i) !== '|' && p.charAt(i) !== ')') o += quant(); return o; }
    function alt() { var o = [seq()]; while (p.charAt(i) === '|') { i++; o.push(seq()); } return P(o); }
    return alt();
  }

  /* ---- fit a value to length limits and pattern ---- */
  function fit(el, v) {
    v = String(v);
    var ml = el.maxLength > 0 ? el.maxLength : 0;
    var mn = parseInt(el.getAttribute('minlength'), 10) || 0;
    var p = el.getAttribute('pattern'), re = null, i, j, g, cand, d, a;
    if (p) {
      try { re = new RegExp('^(?:' + p + ')$', 'u'); }
      catch (e) { try { re = new RegExp('^(?:' + p + ')$'); } catch (e2) { re = null; } }
    }
    function ok(s) { return (!re || re.test(s)) && s.length >= mn && (!ml || s.length <= ml); }
    while (v.length < mn) v += ' ' + P(WORDS);
    if (ml && v.length > ml) v = v.slice(0, ml).trim();
    if (ok(v)) return v;
    if (re) {
      cand = [v.replace(/\s+/g, ''), v.replace(/[^A-Za-z0-9]/g, ''), v.toUpperCase(), slug(person()),
        email(), phone().replace(/\D/g, ''), url(), postcode(), luhn(), iban(), password(), String(R(0, 9))];
      for (i = 0; i < cand.length; i++) if (ok(cand[i])) return cand[i];
      for (i = 0; i < 24; i++) { try { g = fromPattern(p); if (ok(g)) return g; } catch (e3) {} }
      for (i = 1; i <= 24; i++) {
        d = ''; a = '';
        for (j = 0; j < i; j++) { d += R(0, 9); a += P(AL); }
        if (ok(d)) return d;
        if (ok(a)) return a;
        if (ok(a.toUpperCase())) return a.toUpperCase();
      }
    }
    return v;
  }

  /* ---- write the value so frameworks notice ---- */
  function jq() {
    var q = window.jQuery || window.$;
    return q && q.fn && q.fn.jquery ? q : null;
  }
  function fire(el, blur) {
    ['input', 'change'].forEach(function (t) {
      el.dispatchEvent(new Event(t, { bubbles: true, composed: true }));
    });
    if (el.tagName !== 'SELECT') {
      try { el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Unidentified' })); } catch (e) {}
    }
    var q = jq();
    if (q) {
      try { q(el).trigger('change'); } catch (e) {}
      if (el.tagName === 'SELECT') { try { q(el).trigger('chosen:updated'); } catch (e) {} }
    }
    if (blur) el.dispatchEvent(new FocusEvent('blur', { bubbles: false }));
  }
  function nativeSet(el, prop, v) {
    var proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype
      : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, prop);
    try { if (d && d.set) d.set.call(el, v); else el[prop] = v; } catch (e) { el[prop] = v; }
  }
  function setValue(el, v) { nativeSet(el, 'value', v); fire(el, true); }
  function setChecked(el, b) { nativeSet(el, 'checked', b); fire(el, false); }

  /* ---- synthesize a real file for <input type="file"> ---- */
  var SIZES = [[800, 600], [1024, 768], [1200, 900], [640, 640], [1080, 1080]];
  function drawImage(w, h) {
    var c = document.createElement('canvas'), x, i;
    c.width = w; c.height = h;
    x = c.getContext('2d');
    /* flat opaque shapes only: a gradient with alpha blending pushes a 1200x900
       PNG past a megabyte, which trips upload size limits */
    x.fillStyle = hex(); x.fillRect(0, 0, w, h);
    for (i = 0; i < 4; i++) {
      x.fillStyle = hex();
      x.fillRect(R(0, w), R(0, h), R(Math.round(w / 8), Math.round(w / 3)), R(Math.round(h / 8), Math.round(h / 3)));
    }
    for (i = 0; i < 3; i++) {
      x.fillStyle = hex();
      x.beginPath();
      x.arc(R(0, w), R(0, h), R(Math.round(Math.min(w, h) / 12), Math.round(Math.min(w, h) / 4)), 0, 6.2832);
      x.fill();
    }
    x.fillStyle = '#fff'; x.textAlign = 'center';
    x.font = 'bold ' + Math.max(12, Math.round(w / 14)) + 'px system-ui,sans-serif';
    x.fillText(w + '×' + h, w / 2, h / 2);
    return c;
  }
  function toBlob(c, type, q) {
    return new Promise(function (res) {
      try { c.toBlob(function (b) { res(b); }, type, q); } catch (e) { res(null); }
    });
  }
  function svgImage(w, h) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
      '<rect width="100%" height="100%" fill="' + hex() + '"/>', i;
    for (i = 0; i < 5; i++) s += '<circle cx="' + R(0, w) + '" cy="' + R(0, h) + '" r="' +
      R(20, Math.round(Math.min(w, h) / 3)) + '" fill="' + hex() + '" opacity=".5"/>';
    return s + '<text x="50%" y="52%" text-anchor="middle" font-family="sans-serif" font-size="' +
      Math.round(w / 12) + '" fill="#fff">' + w + '×' + h + '</text></svg>';
  }
  function bytes(b64) {
    var bin = atob(b64), a = new Uint8Array(bin.length), i;
    for (i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i);
    return a;
  }
  /* a genuinely valid one-page PDF: real xref offsets, two fonts, Info dict */
  function pdfDoc(title) {
    function ps(t) { return String(t).replace(/([\\()])/g, '\\$1'); }
    var body = 'BT /F2 20 Tf 60 780 Td (' + ps(title) + ') Tj ET\n', y = 744, i, objs, out = '%PDF-1.4\n', off = [], xref;
    for (i = 0; i < 9; i++) { body += 'BT /F1 11 Tf 60 ' + y + ' Td (' + ps(sentence(R(7, 11))) + ') Tj ET\n'; y -= 20; }
    body += 'BT /F1 11 Tf 60 ' + (y - 20) + ' Td (' + ps(person() + ' -- ' + email()) + ') Tj ET\n';
    objs = ['<</Type/Catalog/Pages 2 0 R>>',
      '<</Type/Pages/Kids[3 0 R]/Count 1>>',
      '<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R/F2 6 0 R>>>>/Contents 4 0 R>>',
      '<</Length ' + body.length + '>>stream\n' + body + 'endstream',
      '<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>',
      '<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>',
      '<</Title(' + ps(title) + ')/Producer(autofill bookmarklet)>>'];
    for (i = 0; i < objs.length; i++) { off.push(out.length); out += (i + 1) + ' 0 obj\n' + objs[i] + '\nendobj\n'; }
    xref = out.length;
    out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
    for (i = 0; i < off.length; i++) out += pad(off[i], 10) + ' 00000 n \n';
    return out + 'trailer\n<</Size ' + (objs.length + 1) + '/Root 1 0 R/Info 7 0 R>>\nstartxref\n' + xref + '\n%%EOF';
  }

  /* what a field is asking for: its own name/label first, then the surrounding
     upload box copy ("Drag your invoice here", "CV (PDF only)", ...) */
  var DOCISH = /pdf|\bcv\b|resume|curriculum|lebenslauf|invoice|rechnung|receipt|beleg|quittung|contract|vertrag|document|dokument|attachment|anhang|upload your|report|bericht|certificate|zeugnis|urkunde|nachweis|statement|kontoauszug|auszug|offer|angebot|letter|brief|police|policy|bewerbung|paper|form/;
  var IMGISH = /image|photo|foto|picture|bild|logo|avatar|profile|profil|screenshot|thumbnail|banner|cover|gallery|galerie|portrait|headshot/;
  /* The element holding one question: climb until a level has exactly one
     label/heading. More than one means we left this question. */
  var LABELS = 'label,h1,h2,h3,h4,h5,legend';
  function blockOf(el) {
    var n = el, i, c;
    for (i = 0; i < 8 && n.parentElement; i++) {
      n = n.parentElement;
      c = is(n, LABELS) ? 1 : n.querySelectorAll(LABELS).length;
      if (c === 1) return n;
      if (c > 1) break;
    }
    return el.parentElement || el;
  }
  /* Stable name for a question: its label text does not change when files are
     attached, unlike the node itself, which a re-render may replace. */
  function findUpload(id) {
    var live = collect(document, 'input[type="file"]', []), j;
    for (j = 0; j < live.length; j++) {
      if (!live[j].disabled && !uploaded.has(live[j]) && fileId(live[j]) === id) return live[j];
    }
    return null;
  }
  function fileId(el) {
    var b = blockOf(el), lab = is(b, LABELS) ? b : b.querySelector(LABELS);
    return String((lab && lab.textContent) || el.name || el.id || el.accept || 'file')
      .replace(/\s+/g, ' ').trim().slice(0, 80);
  }
  function fileKey(el) {
    var b = blockOf(el), t = key(el), lab, ids, i, e;
    lab = is(b, LABELS) ? b : b.querySelector(LABELS);
    t += lab ? ' ' + (lab.textContent || '').slice(0, 120)
             : ' ' + (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    ids = (el.getAttribute('aria-describedby') || '').split(/\s+/);
    for (i = 0; i < ids.length; i++) {
      e = ids[i] && document.getElementById(ids[i]);
      if (e) t += ' ' + (e.textContent || '').slice(0, 200);
    }
    return t.toLowerCase();
  }

  function kindOf(a) {
    if (/png/.test(a)) return 'png';
    if (/jpe?g/.test(a)) return 'jpg';
    if (/webp/.test(a)) return 'webp';
    if (/svg/.test(a)) return 'svg';
    if (/gif/.test(a)) return 'gif';
    if (/pdf/.test(a)) return 'pdf';
    if (/csv/.test(a)) return 'csv';
    if (/json/.test(a)) return 'json';
    if (/te?xt|plain/.test(a)) return 'txt';
    if (/image/.test(a)) return 'png';
    return '';
  }
  var IMGKIND = /^(png|jpg|webp|svg|gif)$/;
  async function makeFile(el, idx) {
    var acc = (el.accept || '').toLowerCase().split(',').map(function (t) { return t.trim(); }).filter(Boolean);
    var kinds = [], own = key(el), all = fileKey(el), img, doc, kind = '', i, k, ext, sz, nm, blob, title;
    for (i = 0; i < acc.length; i++) { k = kindOf(acc[i]); if (k && kinds.indexOf(k) < 0) kinds.push(k); }
    /* accept lists something we cannot synthesize (.docx, .zip): keep its extension */
    if (!kinds.length && acc.length) {
      ext = (acc.join(',').match(/\.([a-z0-9]{2,5})\b/) || [])[1];
      if (ext) return new File([paragraph()], 'autofill-' + R(1000, 9999) + '.' + ext, { type: 'application/octet-stream' });
    }
    img = IMGISH.test(own); doc = DOCISH.test(own);
    if (!img && !doc) { img = IMGISH.test(all); doc = DOCISH.test(all); }
    if (kinds.length) {
      if (doc && !img && kinds.indexOf('pdf') >= 0) kind = 'pdf';
      if (!kind && img) for (i = 0; i < kinds.length; i++) if (IMGKIND.test(kinds[i])) { kind = kinds[i]; break; }
      if (!kind) kind = kinds[0];
    } else {
      kind = doc && !img ? 'pdf' : 'png';
    }
    sz = P(SIZES);
    nm = 'autofill-' + R(1000, 9999) + (idx ? '-' + (idx + 1) : '');
    if (kind === 'pdf') {
      var docs = [[/\bcv\b|resume|curriculum|lebenslauf|bewerbung/, 'Curriculum Vitae', 'cv'],
        [/invoice|rechnung/, 'Invoice ' + R(1000, 9999), 'invoice'],
        [/contract|vertrag/, 'Agreement', 'contract'],
        [/certificate|zeugnis|urkunde|nachweis/, 'Certificate', 'certificate'],
        [/report|bericht/, 'Report', 'report'],
        [/offer|angebot|quot/, 'Quotation', 'quotation'],
        [/statement|kontoauszug|auszug/, 'Statement', 'statement']];
      title = 'Document'; nm += '-document';
      for (i = 0; i < docs.length; i++) if (docs[i][0].test(all)) {
        title = docs[i][1]; nm = nm.replace(/-document$/, '') + '-' + docs[i][2]; break;
      }
      return new File([pdfDoc(title)], nm + '.pdf', { type: 'application/pdf' });
    }
    if (kind === 'svg') return new File([svgImage(sz[0], sz[1])], nm + '.svg', { type: 'image/svg+xml' });
    if (kind === 'gif') return new File([bytes('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==')], nm + '.gif', { type: 'image/gif' });
    if (kind === 'csv') return new File(['name,email,city\n' + [1, 2, 3].map(function () {
      return person() + ',' + email() + ',' + P(CITIES);
    }).join('\n') + '\n'], nm + '.csv', { type: 'text/csv' });
    if (kind === 'json') return new File([JSON.stringify({ name: person(), email: email(), city: P(CITIES) }, null, 2)], nm + '.json', { type: 'application/json' });
    if (kind === 'txt') return new File([paragraph()], nm + '.txt', { type: 'text/plain' });
    blob = await toBlob(drawImage(sz[0], sz[1]), kind === 'jpg' ? 'image/jpeg' : 'image/' + kind, 0.85);
    if (!blob) return new File([svgImage(sz[0], sz[1])], nm + '.svg', { type: 'image/svg+xml' });
    /* the browser may have ignored an unsupported type -- follow what it actually gave us */
    ext = blob.type === 'image/jpeg' ? 'jpg' : (blob.type.split('/')[1] || 'png');
    return new File([blob], nm + '.' + ext, { type: blob.type });
  }
  function attach(el, list) {
    var dt, i;
    try {
      dt = new DataTransfer();
      for (i = 0; i < list.length; i++) dt.items.add(list[i]);
      el.files = dt.files;
      if (el.files && el.files.length) { fire(el, false); return true; }
    } catch (e) {}
    /* uploaders that only listen for a real drop (dropzone, filepond, uppy) */
    try {
      var zone = (el.closest && el.closest('[data-dropzone],[class*="dropzone" i],[class*="drop-zone" i],[class*="upload" i]')) || el.parentElement || el;
      dt = new DataTransfer();
      for (i = 0; i < list.length; i++) dt.items.add(list[i]);
      ['dragenter', 'dragover', 'drop'].forEach(function (t) {
        zone.dispatchEvent(new DragEvent(t, { bubbles: true, cancelable: true, dataTransfer: dt }));
      });
      return true;
    } catch (e) {}
    return false;
  }
  async function upload(el) {
    var list = [await makeFile(el, 0)];
    if (el.multiple) list.push(await makeFile(el, 1));
    return attach(el, list);
  }

  /* ---- what to look at, and what counts as a widget rather than a plain field ---- */
  var FIELDS = 'input,textarea,select,[contenteditable]:not([contenteditable="false"])';
  var WIDGET = '[role="combobox"],[aria-haspopup="listbox"],[aria-autocomplete],' +
    '.select2-selection,.select2-choice,.chosen-single,.ss-main,' +
    'input[aria-haspopup="dialog"],input[aria-haspopup="grid"],' +
    'input[class*="datepicker" i],input[class*="date-picker" i],input[class*="flatpickr" i],' +
    'input[class*="calendar" i],input[id*="datepicker" i]';
  var OPT = '[role="option"]:not([aria-disabled="true"]):not([disabled]),' +
    '[role="menuitem"]:not([aria-disabled="true"]),' +
    '.select2-results__option:not(.select2-results__option--disabled),' +
    '.chosen-results li.active-result,li[data-value]';
  var DAY = '[role="gridcell"]:not([aria-disabled="true"]):not([disabled]),' +
    'button.MuiPickersDay-root:not(.Mui-disabled),' +
    '.flatpickr-day:not(.flatpickr-disabled):not(.notAllowed),' +
    '.react-datepicker__day:not(.react-datepicker__day--disabled),' +
    '.pika-button,.datepicker-days td.day:not(.disabled),' +
    '.ant-picker-cell:not(.ant-picker-cell-disabled) .ant-picker-cell-inner,' +
    '.vc-day-content:not(.is-disabled),.dp__cell_inner:not(.dp__cell_disabled),' +
    '.mat-calendar-body-cell:not(.mat-calendar-body-disabled),td[data-date]:not(.disabled)';
  var SKIP = /^(submit|button|reset|image|hidden)$/;
  var NEVER = 'a[href],button[type="submit"],input[type="submit"]';

  function collect(root, sel, out) {
    var i, all;
    try { all = root.querySelectorAll(sel); } catch (e) { return out; }
    for (i = 0; i < all.length; i++) if (out.indexOf(all[i]) < 0) out.push(all[i]);
    all = root.querySelectorAll('*');
    for (i = 0; i < all.length; i++) if (all[i].shadowRoot) collect(all[i].shadowRoot, sel, out);
    return out;
  }
  function shown(el) { return el.offsetParent !== null || !!(el.getClientRects && el.getClientRects().length); }
  function is(el, sel) { try { return !!(el.matches && el.matches(sel)); } catch (e) { return false; } }
  function locked(el) { return !!(el.readOnly || el.getAttribute('aria-readonly') === 'true'); }
  /* readonly text fields are nearly always driven by a picker widget, not typed into */
  function widgetish(el) { return el.tagName !== 'SELECT' && (is(el, WIDGET) || locked(el)); }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function clickIt(el) {
    var o = { bubbles: true, cancelable: true, composed: true, view: window, button: 0, detail: 1 };
    try { el.dispatchEvent(new PointerEvent('pointerdown', o)); } catch (e) {}
    el.dispatchEvent(new MouseEvent('mousedown', o));
    try { if (el.focus) el.focus(); } catch (e) {}
    try { el.dispatchEvent(new PointerEvent('pointerup', o)); } catch (e) {}
    el.dispatchEvent(new MouseEvent('mouseup', o));
    el.dispatchEvent(new MouseEvent('click', o));
  }
  function dismiss(el) {
    var o = { bubbles: true, cancelable: true, key: 'Escape', code: 'Escape', keyCode: 27, which: 27 };
    try { el.dispatchEvent(new KeyboardEvent('keydown', o)); } catch (e) {}
    try { document.dispatchEvent(new KeyboardEvent('keydown', o)); } catch (e) {}
    try { if (el.blur) el.blur(); } catch (e) {}
  }
  /* only ever click something that appeared *after* we opened the widget */
  function openList() { return collect(document, OPT + ',' + DAY, []).filter(shown); }
  function choose(before) {
    var list = collect(document, OPT, []).filter(function (o) { return shown(o) && before.indexOf(o) < 0; });
    if (!list.length) list = collect(document, DAY, []).filter(function (o) { return shown(o) && before.indexOf(o) < 0; });
    if (!list.length) return null;
    var lo = Math.floor(list.length / 4), hi = Math.floor(list.length * 3 / 4);
    var el = list[R(lo, hi > lo ? hi : lo)] || list[0], b;
    b = el.querySelector && el.querySelector('button:not([disabled]),[role="button"]');
    return b && shown(b) ? b : el;
  }
  async function drive(el) {
    var before = openList(), pick;
    clickIt(el);
    await sleep(160);
    pick = choose(before);
    if (!pick) { await sleep(320); pick = choose(before); }
    if (pick) { clickIt(pick); await sleep(120); }
    dismiss(el);
    await sleep(40);
    return !!pick;
  }

  /* ---- fill one plain field ---- */
  var groups = {}, forms = [], anon = 0;
  function gkey(el) {
    var f = el.form || null, i = forms.indexOf(f);
    if (i < 0) { forms.push(f); i = forms.length - 1; }
    return el.name ? i + '|' + el.name : 'anon' + (anon++);
  }
  function fill(el) {
    var tag = el.tagName.toLowerCase(), k, v, i, opts, pool, take, pick, f;

    if (tag === 'select') {
      opts = [].filter.call(el.options, function (o) {
        return !o.disabled && o.value !== '' && !/^(\s*(--+|please\b|select\b|choose\b|bitte\b|w[a-z]?hl))/i.test(o.text);
      });
      if (!opts.length) opts = [].filter.call(el.options, function (o) { return !o.disabled; });
      if (!opts.length) return false;
      if (el.multiple) {
        for (i = 0; i < el.options.length; i++) el.options[i].selected = false;
        pool = opts.slice();
        take = R(1, Math.min(3, pool.length));
        for (i = 0; i < take; i++) pool.splice(R(0, pool.length - 1), 1)[0].selected = true;
      } else {
        pick = P(opts);
        nativeSet(el, 'value', pick.value);
        if (el.value !== pick.value) el.selectedIndex = pick.index;
      }
      fire(el, true);
      return true;
    }
    if (tag === 'textarea') { setValue(el, fit(el, listValue(el) || paragraph())); return true; }
    if (tag !== 'input') { el.textContent = sentence(); fire(el, true); return true; }

    k = key(el);
    switch (el.type) {
      case 'checkbox': setChecked(el, el.required ? true : rnd() < 0.7); return true;
      case 'radio': (groups[gkey(el)] = groups[gkey(el)] || []).push(el); return false;
      case 'search': setValue(el, fit(el, listValue(el) || words(R(1, 2)))); return true;
      case 'color': setValue(el, hex()); return true;
      case 'range': setValue(el, num(el, 0, 100)); return true;
      case 'number': setValue(el, listValue(el) || numFor(el, k)); return true;
      case 'date': setValue(el, ymd(dateFor(el))); return true;
      case 'datetime-local': v = dateFor(el); setValue(el, ymd(v) + 'T' + hm(el, v)); return true;
      case 'month': v = dateFor(el); setValue(el, v.getUTCFullYear() + '-' + pad(v.getUTCMonth() + 1)); return true;
      case 'week': setValue(el, isoWeek(dateFor(el))); return true;
      case 'time': setValue(el, hm(el, dateFor(el))); return true;
      case 'email': setValue(el, fit(el, listValue(el) || (el.multiple ? email() + ', ' + email() : email()))); return true;
      case 'password': setValue(el, fit(el, password())); return true;
      case 'tel': setValue(el, fit(el, listValue(el) || phone(el))); return true;
      case 'url': setValue(el, fit(el, listValue(el) || url())); return true;
      default:
        pick = listValue(el);
        if (!pick) { f = AC[acToken(el)]; pick = f ? f(el) : textFor(el, k); }
        setValue(el, fit(el, pick));
        return true;
    }
  }

  function toast(count, passes) {
    var t = document.createElement('div');
    t.textContent = '✓ autofilled ' + count + ' field' + (count === 1 ? '' : 's') +
      (passes > 1 ? ' in ' + passes + ' passes' : '');
    t.style.cssText = 'position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:2147483647;' +
      'background:#111;color:#fff;font:600 13px/1.4 ui-sans-serif,system-ui,sans-serif;padding:8px 14px;' +
      'border-radius:999px;box-shadow:0 4px 16px rgba(0,0,0,.35);pointer-events:none;transition:opacity .4s';
    (document.body || document.documentElement).appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 500); }, 1800);
  }

  /* ---- one sweep: plain fields, then widgets, then leftovers, then uploads ---- */
  var n = 0, seen = new WeakSet(), driven = new WeakSet(), uploaded = new WeakSet();
  async function sweep(first) {
    var did = 0, deferred = [], pending = [], trig, i, t, v, blk;
    groups = {};

    collect(document, FIELDS, []).forEach(function (el) {
      if (seen.has(el) || el.disabled || (el.type && SKIP.test(el.type))) return;
      /* a <select> behind select2/chosen is display:none but still the real field;
         a file input is nearly always hidden behind a styled label or dropzone */
      if (el.tagName === 'SELECT') { seen.add(el); if (fill(el)) { n++; did++; } return; }
      /* Uploads run on the first sweep only: a repeating drop zone spawns a fresh
         empty one every time a file is attached, which would otherwise never end.
         Later sweeps still mark them handled so they are not reconsidered. */
      if (el.type === 'file') {
        seen.add(el);
        if (first) pending.push(fileId(el));
        return;
      }
      /* not on screen yet: leave it unseen so a later sweep can catch it once revealed */
      if (!shown(el)) return;
      if (widgetish(el)) { deferred.push(el); return; }
      seen.add(el);
      if (fill(el)) { n++; did++; }
    });

    Object.keys(groups).forEach(function (g) {
      var list = groups[g].filter(function (el) { return !el.disabled && shown(el); });
      list.forEach(function (el) { seen.add(el); });
      if (list.length) { setChecked(P(list), true); n++; did++; }
    });

    trig = collect(document, WIDGET, []);
    deferred.forEach(function (d) { if (trig.indexOf(d) < 0) trig.push(d); });
    for (i = 0; i < trig.length && i < 60; i++) {
      t = trig[i];
      if (driven.has(t) || !shown(t) || t.disabled) continue;
      if (t.tagName === 'SELECT' || t.tagName === 'OPTION' || is(t, NEVER)) continue;
      if (t.closest && t.closest('[role="listbox"],[role="menu"],[role="grid"]')) continue;
      driven.add(t);
      try { if (await drive(t)) { n++; did++; } } catch (e) {}
    }

    deferred.forEach(function (el) {
      seen.add(el);
      v = el.value !== undefined ? el.value : el.textContent;
      if (!v && fill(el)) { n++; did++; }
    });

    for (i = 0; i < pending.length && i < 20; i++) {
      /* look it up again every time: each attach re-renders the tiles below it,
         and a tile can be mid-render when we get to it */
      t = findUpload(pending[i]);
      if (!t) { await sleep(500); t = findUpload(pending[i]); }
      if (!t) continue;
      uploaded.add(t);
      try { if (await upload(t)) { n++; did++; } } catch (e) {}
    }
    return did;
  }

  /* A conditional field does not exist until its trigger has an answer, and the
     answer may arrive over the network, so keep sweeping -- waiting a little
     longer each time -- until a sweep turns up nothing new. */
  (async function () {
    var r, did, passes = 0;
    for (r = 1; r <= 8; r++) {
      did = await sweep(r === 1);
      if (did) passes++;
      if (!did || r === 8) break;
      await sleep(300 + r * 250);
    }
    /* One last look a second later: optional fields often appear just after the
       form settles. Once only, and uploads stay in the first sweep. */
    await sleep(1000);
    if (await sweep(false)) passes++;
    toast(n, passes);
  })();
})();
