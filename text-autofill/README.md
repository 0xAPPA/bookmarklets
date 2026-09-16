# text-autofill

Fills every empty, editable text-like `<input>` and `<textarea>` on the page with realistic random data. Skips hidden, disabled and readonly fields and fields that already have a value.

The value is picked from the field's type (`email`, `tel`, `number` within min/max, `date`, ...) and from hints in its `name`, `id`, `placeholder`, `autocomplete`, `aria-label` and `<label>`: first/last name, email, phone, company, street, zip, city, country, IBAN, birthday, title, website. Fields without a recognizable hint get short lorem text; textareas get a longer sentence. Names, email and phone are consistent within one run.

Sets values through the native setter and dispatches `input`/`change` events so React, Vue and friends pick them up.

## Install

Create a new bookmark and paste the contents of [`bookmarklet.min.js`](bookmarklet.min.js) as its URL.
