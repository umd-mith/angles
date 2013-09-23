# Angles - Demo

This demo shows a simple set up of Angles and all of its components. 

## Validation

### Client-side (TEI-Lite only)

See `index.html`. This uses the JSON file `rng.js` to validate the input in your browser.

### Server-side (via an online validator)

See `srvValidation.html`. This demonstrates how to hook to an online validation service. During development we used [a simple Scalatra service](https://github.com/travisbrown/validation-demo). 

If you want to use a different service or implement your own, you might need to override `Angles.ValidatorSRV.requestHandler` and `Angles.ValidatorSRV.validationHandler` to send the right request to your server.

## Other components

Other components are demonstrated in both `index.html` and `srvValidation.html`.

### Notifications
Display a message or update the status indicator (green/red box in top right corner)

### Contextual help

Type `<` to open a pop up showing the TEI elements allowed in a given context (TEI-all only).
This uses the JSON file `p5subset.js`, taken from [TEI's vault](http://www.tei-c.org/Vault/P5/current/xml/tei/odd/).

**N.B.** You can generate your own JSON for contextual help from any TEI ODD. Use [odd2json.xslt](https://github.com/TEIC/Stylesheets/blob/master/odds/odd2json.xsl) from the TEI GitHub Stylesheet repository - *make sure to set the paramenter showChildren to "true"*.

### Local storage
Save and load current document to your browser's HTML5 Local Storage (:warning: you'll have to clear your Locale Storage manually to remove unwanted data).

### Save to disk
Save your work to disk.

### Upload file from disk
Upload a file from your computer. Once loaded, it gets stored in the HTML5 Local Storage. 

