---
name: bookmarklet
description: Create a new bookmarklet in this repo (or rework an existing one) end to end - scaffold the directory, write the IIFE source and README, build the minified javascript: URL, test it in headless Chrome, add it to the root README table, copy the build to the clipboard, and push to main. Use when the user runs `/bookmarklet <name> <what it should do>` or asks to create/add a bookmarklet.
---

# bookmarklet

Arguments: `<name> <description of what it should do>`. The name is kebab-case and becomes the directory name. If no name is given, derive a short kebab-case one from the description.

## Steps

1. **Scaffold** `<name>/` with two files, following the existing directories as reference:
   - `bookmarklet.js`: readable source wrapped in an IIFE `(() => { ... })();`, starting with a one-line comment saying what it does. Keep it self-contained (no imports, no external requests unless the task needs them). Rules:
     - No `#` characters anywhere in the source (`encodeURI` leaves them alone and browsers cut a `javascript:` URL at the fragment). Use named CSS colors, not hex.
     - When setting input values, use the prototype setter and dispatch bubbling `input` and `change` events so React/Vue notice.
     - Report results via `console.log`, not `alert`, unless the task is about showing something to the user.
   - `README.md`: title, one paragraph on what it does, and the standard install section:
     ```
     ## Install

     Create a new bookmark and paste the contents of [`bookmarklet.min.js`](bookmarklet.min.js) as its URL.
     ```
2. **Build** with `npm run build` (run `npm install` first if `node_modules` is missing). This writes `<name>/bookmarklet.min.js`. Commit the minified file too.
3. **Test the built file**, not the source. Write a fixture HTML page in the scratchpad directory that exercises the bookmarklet, append a `<script>` that runs the decoded `bookmarklet.min.js` and writes the observable result into a `<pre>`, then dump it with headless Chrome:
   ```
   CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
   node -e 'const fs=require("fs");const dec=f=>decodeURIComponent(fs.readFileSync(f,"utf8").trim().replace(/^javascript:/,""));
     fs.writeFileSync(process.argv[2], fs.readFileSync(process.argv[1],"utf8")+`<script>${dec("<name>/bookmarklet.min.js")}
     document.body.innerHTML="<pre>"+JSON.stringify(/* observable state */,null,1)+"</pre>";</script>`)' fixture.html run.html
   "$CHROME" --headless=old --disable-gpu --no-sandbox --no-first-run --user-data-dir=<scratchpad>/profile --virtual-time-budget=3000 --dump-dom "file://<scratchpad>/run.html" 2>/dev/null | sed -n '/<pre/,/<\/pre>/p'
   ```
   Wrap the Chrome call in a watchdog (poll `kill -0` for ~25s, then `kill`) because headless Chrome sometimes does not exit. The chrome-devtools MCP is usually unavailable here because the profile is locked by the running browser; do not spend time on it. Fix and rebuild until the output is right.
4. **Root README**: add a row `| [<name>](<name>/) | <one-line description> |` to the Bookmarklets table.
5. **Clipboard**: `tr -d '\n' < <name>/bookmarklet.min.js | pbcopy` and tell the user the build is on their clipboard.
6. **Commit and push to `main`** directly (no PR): message `Add <name> bookmarklet` for new ones, `<name>: <change>` for reworks.

## Reporting

Close with what the bookmarklet does, how it was tested (what the fixture covered and the result), and that the build is on the clipboard.
