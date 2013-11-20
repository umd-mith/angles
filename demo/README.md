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

If the installation was completed correctly, the page will show an editable basic TEI file, a group of buttons on the left for saving and loading documents, and a validation button on top.

![Image of Angles demo interface][start]

### Contextual help

When typing a new XML element (with `<`) a pop up will appear showing the TEI elements allowed in a given context (TEI-all only).
This uses the JSON file `p5subset.js`, taken from [TEI's vault](http://www.tei-c.org/Vault/P5/current/xml/tei/odd/). 

A description of a selected element from the pop up will appear below the editor in the notification area. Click or press `Enter` on the desired element and it will be inserted at the position of the cursor.

![Example of context help interface][context]

**N.B.** You can generate your own JSON for contextual help from any TEI ODD. Use [odd2json.xslt](https://github.com/TEIC/Stylesheets/blob/master/odds/odd2json.xsl) from the TEI GitHub Stylesheet repository - *make sure to set the paramenter showChildren to "true"*.

### Notifications

Notifications can be used to display any type of message to the user. The demo shows how they can be used to drive the validation status indicator (green/red box in top right corner), validation errors, and element descriptions from the contextual help.

![Usage of notifications in the UI][notifications]

### Local storage operations

Save and load current document to the user's browser's HTML5 Local Storage. The user can store multiple files and will be shown the latest open file when visiting the page again.

![Local Storage operations][loadsave]

:warning: The demo does not include a way of removing any file stored in the Local Storage. The Local Storage can be cleared manually in a browser's settings.

### Save and Upload files 

The user can also save (download) or upload a file. Once a file is uploaded, it also gets stored in the HTML5 Local Storage. 

### Validation

This demonstration uses the [`rng.js`](https://github.com/umd-mith/angles/blob/master/demo/rng.js) JSON file as the JavaScript-friendly representation of a light-weight TEI schema for simple validation of the TEI without requiring a separate server process.

The file is validated when it is loaded, at other times the user has to click on "Validate" to validate the file.

## `srvValidation.html`

## Validation

When a more sophisticated validation is needed, Angles must be hooked up to a local or online validation service. This page demonstrates how to hook to an online validation service. During development we used [a simple Scalatra service](https://github.com/travisbrown/validation-demo).

The validation server is able to fetch RelaxNG schemata from the web, so the interface links to several schemata on the web and allows the user to choose one. URLs to other schemata can be included in `srvValidation.html` by adding a new `<button>` to `div#schema`.

``` html
<button type="button" class="btn active" value="http://example.org/my_schema.rng">My schema</button>
```

If you want to use a different service or implement your own, you might need to override `Angles.ValidatorSRV.requestHandler` and `Angles.ValidatorSRV.validationHandler` to send the right request to your service and handle the response.

`Angles.ValidatorSRV.requestHandler` handles the request to the service. We POST two parameters: `schema` (the URL to an RelaxNG document) and `document` (the content of the editor). Another service is likely to expect different paramenters and a different negotiation process. 

``` coffeescript
$.ajax
  url: validator.$validatorUrl
  type: "POST"
  crossDomain: true
  processData: false
  data: "schema="+validator.$schema+"&document="+xmlDocument
  dataType: "json",
```

`Angles.ValidatorSRV.validationHandler` handles the service's response and passes it on to flag errors in the editor and to show error notifications. All you will have to change here is where to find each piece of information in your service's response.

``` coffeescript
for datum in data
  validator.$errors.push
    text: datum.message
    row: datum.line-1
    column: datum.column
    type: datum.type
```

[start]: img/readme_start.png "Angles demo interface"
[context]: img/readme_context.png "Context help"
[notifications]: img/readme_notification.png "Notifications"
[loadsave]: img/readme_loadsave.png "Local Storage operations"