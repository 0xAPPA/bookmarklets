# bookmarklets

A collection of JavaScript bookmarklets. Each lives in its own directory:

```
<name>/
├── README.md           # what it does and how to use it
├── bookmarklet.js      # readable source
└── bookmarklet.min.js  # generated, paste this into a bookmark's URL field
```

## Bookmarklets

| Name | Description |
| --- | --- |
| [form-autofill](form-autofill/) | Fills a whole form in one click: fields, custom widgets, file uploads and conditionally revealed fields |

## Install a bookmarklet

1. Open the bookmarklet's `bookmarklet.min.js`.
2. Create a new bookmark in your browser and paste the file's contents as its URL.
3. Click the bookmark on any page to run it.

## Add a bookmarklet

1. Create a directory with a `README.md` and a `bookmarklet.js` (wrap the code in an IIFE).
2. Run `npm install && npm run build` to generate `bookmarklet.min.js`.
3. Add a row to the table above and commit everything, including the minified file.
