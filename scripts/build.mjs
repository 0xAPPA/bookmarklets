// Minifies every <dir>/bookmarklet.js into <dir>/bookmarklet.min.js,
// prefixed with "javascript:" so it can be pasted straight into a bookmark.
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { minify } from "terser";

const root = new URL("..", import.meta.url).pathname;

for (const dir of await readdir(root)) {
  const src = join(root, dir, "bookmarklet.js");
  try {
    await stat(src);
  } catch {
    continue;
  }

  const code = await readFile(src, "utf8");
  const result = await minify(code, {
    compress: true,
    mangle: true,
    format: { ascii_only: true },
  });

  // encodeURI leaves "#" alone, which would cut the URL off at the fragment.
  const out = `javascript:${encodeURI(result.code).replace(/#/g, "%23")}\n`;
  await writeFile(join(root, dir, "bookmarklet.min.js"), out);
  console.log(`built ${dir}/bookmarklet.min.js (${out.length} bytes)`);
}
