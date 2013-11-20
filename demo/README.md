# Angles - Demonstration and Examples

The HTML pages in this directory demonstrate how to use Angles with a number of optional components.

To install all of the dependencies and build the ANGLES library, you can install the required node libraries and then run the 'demo' grunt task:

``` bash
$ npm install -g grunt-cli
$ npm install
$ grunt demo
```

This will run through various installation procedures and end by printing out a list of available demonstration files.

See the [top-level README](../README.md) for more information on installing grunt and associated dependencies.

## `index.html`

This basic demonstration shows all features of Angles that do no need any server-side component. With this kind of set up, one could use Angles offline, or embed it into a website as a TEI editor. Angles will perform basic TEI-Lite validation, allow users to save their work in the browser, and save and load files from disk. The following sections will guide you through each component.

### The Demo Interface

If the installation was completed correctly, the page will show an editable basic TEI file, a group of button on the left to save and load documents, and a validation button on top.



### Contextual help

Type `<` to open a pop up showing the TEI elements allowed in a given context (TEI-all only).
This uses the JSON file `p5subset.js`, taken from [TEI's vault](http://www.tei-c.org/Vault/P5/current/xml/tei/odd/).

**N.B.** You can generate your own JSON for contextual help from any TEI ODD. Use [odd2json.xslt](https://github.com/TEIC/Stylesheets/blob/master/odds/odd2json.xsl) from the TEI GitHub Stylesheet repository - *make sure to set the paramenter showChildren to "true"*.

### Notifications

Display a message or update the status indicator (green/red box in top right corner)

### Local storage

Save and load current document to your browser's HTML5 Local Storage (:warning: you'll have to clear your Locale Storage manually to remove unwanted data).

### Save to disk

Save your work to disk.

### Upload file from disk

Upload a file from your computer. Once loaded, it gets stored in the HTML5 Local Storage. 

### Validation

This demonstration uses the `rng.js` JSON file as the JavaScript-friendly representation of a light-weight TEI schema for simple validation of the TEI without requiring a separate server process.


## `srvValidation.html`

## Validation

This demonstrates how to hook to an online validation service. During development we used [a simple Scalatra service](https://github.com/travisbrown/validation-demo). 

If you want to use a different service or implement your own, you might need to override `Angles.ValidatorSRV.requestHandler` and `Angles.ValidatorSRV.validationHandler` to send the right request to your server.

[start]: img/readme_start.png "Angles demo interface"