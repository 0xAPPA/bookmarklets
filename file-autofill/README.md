# file-autofill

Attaches a generated dummy file to every empty `<input type="file">` on the page. The file type follows the input's `accept` attribute: a 64x64 PNG or JPEG for images, a minimal PDF for `.pdf`/`application/pdf`, otherwise a small text file (using the first `.ext` from `accept` if there is one). Skips disabled inputs and inputs that already have a file.

Dispatches `input`/`change` events so framework upload components react as if the user had picked a file.

## Install

Create a new bookmark and paste the contents of [`bookmarklet.min.js`](bookmarklet.min.js) as its URL.
