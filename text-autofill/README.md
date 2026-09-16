# text-autofill

Fills every empty, editable text-like `<input>` and `<textarea>` on the page with a dummy value that fits its type (`email`, `url`, `tel`, `number`, `date`, ...). Plain text fields get `Test <name>`. Skips hidden, disabled and readonly fields and fields that already have a value.

Sets values through the native setter and dispatches `input`/`change` events so React, Vue and friends pick them up.

## Install

Create a new bookmark and paste the contents of [`bookmarklet.min.js`](bookmarklet.min.js) as its URL.
