// Fills every empty, editable text-like input and textarea with a dummy value.
(() => {
  const today = new Date().toISOString().slice(0, 10);
  const valueFor = (el) => {
    switch (el.type) {
      case "email": return "test@example.com";
      case "url": return "https://example.com";
      case "tel": return "+49 30 123456";
      case "number":
      case "range": return el.min !== "" ? el.min : el.max !== "" && +el.max < 1 ? el.max : "1";
      case "date": return today;
      case "time": return "12:00";
      case "datetime-local": return `${today}T12:00`;
      case "month": return today.slice(0, 7);
      case "password": return "Passw0rd!";
      default: {
        const text = `Test ${el.name || el.id || el.placeholder || "text"}`;
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
