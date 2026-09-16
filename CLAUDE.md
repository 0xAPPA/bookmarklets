# bookmarklets

- Whenever a bookmarklet gets a new version (after `npm run build`), copy its `bookmarklet.min.js` contents to the clipboard (`tr -d '\n' < <name>/bookmarklet.min.js | pbcopy`) so it can be pasted into the bookmark right away. If several changed, copy the one just worked on and say so.
- Commit and push straight to `main`, no PRs.
