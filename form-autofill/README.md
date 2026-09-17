# form-autofill

Fills in a whole form with one click, so you don't have to type test data by hand.

Values are plausible and pass validation: it honours `type`, `pattern`, `min`/`max`/`step`,
`maxlength`/`minlength`, `accept` and `autocomplete`, and reads labels and placeholders in German
and English — so "PLZ" gets a postcode, an IBAN field gets a mod-97-valid IBAN, and a `TT.MM.JJJJ`
field gets a date in that format. A `pattern` is reversed into a matching value and every generated
value is checked against the real regex before it is written.

Beyond plain inputs it also handles:

- **Custom selects and datepickers** (react-select, MUI, select2, chosen, flatpickr and friends) by
  opening the widget and clicking an option, not just writing to native fields.
- **File uploads** — a real generated image, or a PDF for CV/invoice/attachment fields. The file kind
  follows `accept` and the question's own label, so "Photo of the meter" gets a PNG and "Datasheet"
  gets a PDF.
- **Conditional fields** — after filling everything it sweeps again, so fields that only appear once
  an earlier question is answered get filled too.

Values are written through the native setters and announced with real `input`/`change` events (plus a
jQuery `change` where jQuery is present), so React, Vue and Angular pick them up. Shadow DOM is
included.

Uploads run on the first sweep only: a repeating drop zone spawns a fresh empty one every time a file
is attached, so a file field that appears later is left for you to fill manually.

It overwrites every field on the page — keep it to test and staging forms.

## Install

Create a new bookmark and paste the contents of [`bookmarklet.min.js`](bookmarklet.min.js) as its URL.
