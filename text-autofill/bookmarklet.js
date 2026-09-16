// Fills every empty, editable text-like input and textarea with realistic random data.
(() => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const int = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const pad = (n, len = 2) => String(n).padStart(len, "0");

  const first = ["Anna", "Lukas", "Mia", "Jonas", "Lea", "Felix", "Emma", "Paul", "Sofia", "Max", "Laura", "Tim", "Clara", "Noah", "Julia", "Ben"];
  const last = ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Hoffmann", "Koch", "Richter", "Klein", "Wolf", "Braun", "Krüger"];
  const streets = ["Hauptstraße", "Bahnhofstraße", "Gartenweg", "Schulstraße", "Lindenallee", "Bergstraße", "Dorfstraße", "Ringstraße", "Kirchplatz", "Am Anger"];
  const cities = ["Berlin", "Hamburg", "München", "Köln", "Frankfurt", "Stuttgart", "Leipzig", "Dresden", "Hannover", "Nürnberg", "Bremen", "Freiburg"];
  const companies = ["Sonnenkraft GmbH", "Nordwind Energie", "Meyer & Söhne", "Grünstrom AG", "Haustechnik Weber", "Elektro Klein", "Wärmewerk Berlin", "Solaris Systems"];
  const words = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco".split(" ");
  const sentence = (n) => {
    const s = Array.from({ length: n }, () => pick(words)).join(" ");
    return s[0].toUpperCase() + s.slice(1) + ".";
  };
  const strip = (s) => s.toLowerCase().replace(/[äöü]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue" })[c]);

  const fn = pick(first), ln = pick(last);
  const email = () => `${strip(fn)}.${strip(ln)}${int(1, 99)}@${pick(["example.com", "mail.de", "web.de", "gmx.net"])}`;
  const phone = () => `+49 ${int(150, 179)} ${int(1000000, 9999999)}`;
  const date = (y) => `${y}-${pad(int(1, 12))}-${pad(int(1, 28))}`;

  // Best-effort semantic guess from the field's own attributes and label.
  const hint = (el) => {
    const label = el.labels?.[0]?.textContent || "";
    const h = `${el.autocomplete} ${el.name} ${el.id} ${el.placeholder} ${el.getAttribute("aria-label") || ""} ${label}`.toLowerCase();
    const has = (...keys) => keys.some((k) => h.includes(k));
    if (has("mail")) return email();
    if (has("phone", "tel", "mobil", "handy")) return phone();
    if (has("first", "given", "vorname")) return fn;
    if (has("last", "family", "surname", "nachname")) return ln;
    if (has("full name", "fullname", "name")) return `${fn} ${ln}`;
    if (has("company", "firma", "organi")) return pick(companies);
    if (has("street", "straße", "strasse", "address-line1", "adresse")) return `${pick(streets)} ${int(1, 120)}`;
    if (has("zip", "postal", "plz")) return pad(int(10000, 99999), 5);
    if (has("city", "stadt", "ort")) return pick(cities);
    if (has("country", "land")) return "Deutschland";
    if (has("iban")) return `DE${pad(int(0, 99))} 3704 0044 0532 0130 00`;
    if (has("birth", "geburt")) return date(int(1955, 2000));
    if (has("title", "titel", "subject", "betreff")) return sentence(int(3, 6)).slice(0, -1);
    if (has("url", "website", "web")) return `https://www.${strip(ln)}-${strip(pick(cities))}.de`;
    return null;
  };

  const valueFor = (el) => {
    switch (el.type) {
      case "email": return email();
      case "url": return `https://www.${strip(pick(companies)).replace(/[^a-z]/g, "")}.de`;
      case "tel": return phone();
      case "number":
      case "range": {
        const min = el.min !== "" ? +el.min : 0, max = el.max !== "" ? +el.max : min + 1000;
        return String(int(min, max));
      }
      case "date": return date(int(2018, 2026));
      case "time": return `${pad(int(7, 18))}:${pick(["00", "15", "30", "45"])}`;
      case "datetime-local": return `${date(int(2018, 2026))}T${pad(int(7, 18))}:00`;
      case "month": return `${int(2018, 2026)}-${pad(int(1, 12))}`;
      case "password": return `${pick(first)}${int(1000, 9999)}!`;
      default: {
        const text = hint(el) ?? (el instanceof HTMLTextAreaElement ? sentence(int(12, 30)) : sentence(int(2, 4)).slice(0, -1));
        return el.maxLength > 0 ? text.slice(0, el.maxLength) : text;
      }
    }
  };

  const skip = new Set(["hidden", "checkbox", "radio", "file", "submit", "button", "reset", "image", "color"]);
  let n = 0;
  for (const el of document.querySelectorAll("input, textarea")) {
    if (skip.has(el.type) || el.disabled || el.readOnly || el.value !== "") continue;
    // Use the prototype setter so React/Vue notice the change on the following input event.
    const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(el, valueFor(el));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    n++;
  }
  console.log(`text-autofill: filled ${n} field(s)`);
})();
