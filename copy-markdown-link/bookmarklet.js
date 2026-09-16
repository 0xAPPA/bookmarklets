// Copies the current page as a markdown link: [title](url)
(() => {
  const title = document.title.trim() || location.href;
  const text = `[${title}](${location.href})`;

  navigator.clipboard.writeText(text).then(
    () => alert(`Copied:\n${text}`),
    () => prompt("Copy manually:", text)
  );
})();
