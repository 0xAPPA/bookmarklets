// Attaches a generated dummy file to every empty file input, honoring its `accept` attribute.
(() => {
  const makeImage = (mime) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "hotpink";
    ctx.fillRect(0, 0, 64, 64);
    const bytes = atob(canvas.toDataURL(mime).split(",")[1]);
    return Uint8Array.from(bytes, (c) => c.charCodeAt(0));
  };
  const pdf =
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>";

  const fileFor = (el) => {
    const accept = el.accept.toLowerCase().split(",").map((s) => s.trim()).filter(Boolean);
    const wants = (...keys) => accept.some((a) => keys.some((k) => a.includes(k)));
    if (wants("image/jpeg", ".jpg", ".jpeg") && !wants("image/*", "image/png", ".png"))
      return new File([makeImage("image/jpeg")], "test.jpg", { type: "image/jpeg" });
    if (wants("image")) return new File([makeImage("image/png")], "test.png", { type: "image/png" });
    if (wants("pdf")) return new File([pdf], "test.pdf", { type: "application/pdf" });
    const ext = accept.find((a) => a.startsWith("."));
    return new File(["test"], `test${ext || ".txt"}`, { type: "text/plain" });
  };

  let n = 0;
  for (const el of document.querySelectorAll('input[type="file"]')) {
    if (el.disabled || el.files.length) continue;
    const dt = new DataTransfer();
    dt.items.add(fileFor(el));
    el.files = dt.files;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    n++;
  }
  console.log(`file-autofill: filled ${n} file input(s)`);
})();
