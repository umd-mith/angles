(function() {
  /*
     ======== A Handy Little QUnit Reference ========
http://api.qunitjs.com/

Test methods:
module(name, {[setup][ ,teardown]})
test(name, callback)
expect(numberOfAssertions)
stop(increment)
start(decrement)
Test assertions:
ok(value, [message])
equal(actual, expected, [message])
notEqual(actual, expected, [message])
deepEqual(actual, expected, [message])
notDeepEqual(actual, expected, [message])
strictEqual(actual, expected, [message])
notStrictEqual(actual, expected, [message])
throws(block, [expected], [message])
*/

  test("Check namespaces", function() {
    expect(4);
    ok(typeof ace !== "undefined" && ace !== null, "Ace namespace defined");
    ok(typeof _ !== "undefined" && _ !== null, "Underscore namespace defined");
    ok(typeof Backbone !== "undefined" && Backbone !== null, "Backbone namepsace defined");
    ok(typeof Angles !== "undefined" && Angles !== null, "Angles namespace defined");
  });

  test("Check base validation class", function() {
    var validator = new Angles.Validator({
      dispatcher: _.clone(Backbone.Events)
    }), dispatcher, validationEventTriggered = 0, validationEndEventTriggered = 0, validationErrorEventTriggered = 0;

    expect(22);

    dispatcher = validator.dispatcher;

    dispatcher.on("validation", function() {
      validationEventTriggered += 1;
    });
    dispatcher.on("validation:end", function() {
      validationEndEventTriggered += 1;
    });
    dispatcher.on("validation:error", function() {
      validationErrorEventTriggered += 1;
    });

    ok(typeof validator !== "undefined" && validator !== null, "Validator object is created");
    ok(typeof validator.displayErrors !== "undefined" && validator.displayErrors !== null, "displayErrors method exists");
    ok(typeof validator.endValidation !== "undefined" && validator.endValidation !== null, "endValidation method exists");
    ok(typeof validator.setSchema !== "undefined" && validator.setSchema !== null, "setSchema method exists");
    ok(typeof validator.errors !== "undefined" && validator.errors !== null, "errors method exists");

    validator.setSchema({});
    equal(validationEventTriggered, 1, "validation event was triggered by setting the schema");
    equal(validationErrorEventTriggered, 0, "validation:error not triggered by setting the schema");
    equal(validationEndEventTriggered, 0, "validation:end not triggered by setting the schema");

    validationEventTriggered = 0;
    validationErrorEventTriggered = 0;
    validationEndEventTriggered = 0;

    validator.endValidation();
    equal(validationEventTriggered, 0, "validation event not triggered by endValidation");
    equal(validationErrorEventTriggered, 0, "validation:error not triggered by endValidation");
    equal(validationEndEventTriggered, 1, "validation:end was triggered by endValidation");

    validationEventTriggered = 0;
    validationErrorEventTriggered = 0;
    validationEndEventTriggered = 0;

    ok(!validator.hasErrors(), "validator has no errors");
    validator.addError({});
    validator.addError({});
    equal(validationEventTriggered, 0, "validation event not triggered by addError");
    equal(validationErrorEventTriggered, 0, "validation:error not triggered by addError");
    equal(validationEndEventTriggered, 0, "validation:end not triggered by addError");
    ok(validator.hasErrors(), "validator now has errors");
    equal(validator.errors().length, 2, "validator has two errors");
    validator.displayErrors();
    equal(validationEventTriggered, 0, "validation event not triggered by displayErrors");
    equal(validationErrorEventTriggered, 2, "validation:error triggered twice by displayErrors");
    equal(validationEndEventTriggered, 1, "validation:end triggered by displayErrors");

    validationEventTriggered = 0;
    validationErrorEventTriggered = 0;
    validationEndEventTriggered = 0;

    validator.clearErrors();
    ok(!validator.hasErrors(), "validator has no errors after clearErrors");
    equal(validator.errors().length, 0, "validator errors() returns empty array after clearErrors");
  });

  test("Check SAX/browser-based validation class", function() {
    var validator, dispatcher, validationEventTriggered = 0, validationEndEventTriggered = 0, 
      validationErrorEventTriggered = 0, doc;

    expect(17);

    validator = new Angles.ValidatorSAX({
      dispatcher: _.clone(Backbone.Events)
    });

    ok(typeof validator !== "undefined" && validator !== null, "Validator object is created");
    ok(typeof validator.displayErrors !== "undefined" && validator.displayErrors !== null, "displayErrors method exists");
    ok(typeof validator.endValidation !== "undefined" && validator.endValidation !== null, "endValidation method exists");
    ok(typeof validator.setSchema !== "undefined" && validator.setSchema !== null, "setSchema method exists");
    ok(typeof validator.errors !== "undefined" && validator.errors !== null, "errors method exists");

    dispatcher = validator.dispatcher;

    dispatcher.on("validation", function() {
      validationEventTriggered += 1;
    });
    dispatcher.on("validation:end", function() {
      validationEndEventTriggered += 1;
    });
    dispatcher.on("validation:error", function() {
      validationErrorEventTriggered += 1;
    });

    ok(typeof window.testSchema !== "undefined" && window.testSchema !== null, "Schema loaded");
    validator.setSchema(window.testSchema);
    
    equal(validationEventTriggered, 1, "validation event was triggered by setting the schema");
    equal(validationErrorEventTriggered, 0, "validation:error not triggered by setting the schema");
    equal(validationEndEventTriggered, 0, "validation:end not triggered by setting the schema");

    validationEventTriggered = 0;
    validationErrorEventTriggered = 0;
    validationEndEventTriggered = 0;

    doc = {
      getLine: function(i) {
        return doc.$lines[i];
      },
      getLength: function() { return doc.$lines.length; },
      $lines: [
        "<TEI>",
        "</TEI>"
      ]
    };

    validator.validate(doc);

    equal(validationEventTriggered, 0, "validation event not triggered by validation");
    equal(validationErrorEventTriggered, 1, "validation:error triggered by validation");
    equal(validationEndEventTriggered, 1, "validation:end triggered by validation");
    equal(validator.errors().length, 1, "one error");
    equal(validator.errors()[0].row, 1, "on row one");
    equal(validator.errors()[0].type, "error", "an error (not a warning)");

    // no RDF allowed in the browser-based validation schema, so RDF removed. Otherwise, this is the document 
    // from https://github.com/opensiddur/opensiddur/blob/master/code/tests/minimal-valid.xml

    doc.$lines = [
      '<tei:TEI xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:j="http://jewishliturgy.org/ns/jlptei/1.0" xmlns:cc="http://web.resource.org/cc/" xml:base="http://jewishliturgy.org/base/text/contributors">',
      '  <tei:teiHeader>',
      '    <tei:fileDesc>',
      '      <tei:titleStmt>',
      '          <tei:title xml:lang="en">Minimal valid JLPTEI</tei:title>',
      '      </tei:titleStmt>',
      '      <tei:publicationStmt>',
      '          <tei:availability status="free">',
      '              <tei:p xml:lang="en">To the extent possible under law, ',
      'the contributors who associated  ',
      '<tei:ref type="license" target="licenses/cc0/1.0">Creative Commons Zero</tei:ref> ',
      'with this work have waived all copyright and related or ',
      'neighboring rights to this work.  ',
      'A list of contributors is available at ',
      '<tei:ref type="attribution" target="http://jewishliturgy.org/base/text/contributors">http://jewishliturgy.org/base/text/contributors</tei:ref>.',
      '</tei:p>',
      '          </tei:availability>',
      '          <tei:idno type="svn">$Id: minimal-valid.xml 411 2010-01-03 06:58:09Z efraim.feinstein $</tei:idno>',
      '      </tei:publicationStmt>',
      '      <tei:sourceDesc>',
      '          <tei:p>Born digital.</tei:p>',
      '      </tei:sourceDesc>',
      '  </tei:fileDesc>',
    '</tei:teiHeader>',
    '<tei:text>',
      '  <tei:body>',
      '      <tei:div xml:lang="en">',
      '        <tei:head>Shortest document ever</tei:head>',
      '        <tei:p>Yay!</tei:p>',
      '      </tei:div>',
      '  </tei:body>',
    '</tei:text>',
'</tei:TEI>'
    ];

    validationEventTriggered = 0;
    validationErrorEventTriggered = 0;
    validationEndEventTriggered = 0;
    validator.clearErrors();

    ok(!validator.hasErrors(), "Errors cleared");

    validator.validate(doc);
    ok(!validator.hasErrors(), "no errors after validating valid document");
  });

  test("Check notification infrastructure", function() {
    var note, noteList, note1, note2, noteCenter, dispatcher;

    expect(22);

    ok(typeof Angles.Notification !== "undefined" && Angles.Notification !== null, "Notification class is defined");
    ok(typeof Angles.NotificationList !== "undefined" && Angles.NotificationList !== null, "NotificationList class is defined");
    ok(typeof Angles.NotificationCenter !== "undefined" && Angles.NotificationCenter !== null, "NotificationCenter class is defined");

    note = new Angles.Notification();
    ok(typeof note !== "undefined" && note !== null, "Created Angles.Notification successfully");
    deepEqual(note.attributes, {
      info: "",
      location: {
        column: -1,
        row: -1
      },
      message: "",
      resource: "",
      type: ""
    }, "Proper initialized default attributes");

    note = new Angles.Notification({
      info: "info",
      location: {
        column: 10,
        row: 20
      },
      message: "message",
      resource: "resource",
      type: "type"
    });
    ok(typeof note !== "undefined" && note !== null, "Created Angles.Notification successfully with custom data");
    deepEqual(note.attributes, {
      info: "info",
      location: {
        column: 10,
        row: 20
      },
      message: "message",
      resource: "resource",
      type: "type"
    }, "Proper initialized given attributes");

    noteList = new Angles.NotificationList();
    ok(typeof noteList !== "undefined" && noteList !== null, "Created Angles.NotificationList");

    equal(noteList.length, 0, "note list is empty");
    noteList.add(note);
    equal(noteList.length, 1, "note list should have one entry");
    noteList.add(note);
    equal(noteList.length, 1, "note list should have one entry");
    noteList.add({
      info: "info2",
      message: "Message2",
      resource: "resource2",
      type: 'type2'
    });
    equal(noteList.length, 2, "note list should have two entries");

    note1 = noteList.at(0);
    note2 = noteList.at(1);
    ok(typeof note1 !== "undefined" && note1 !== null, "first item in noteList is defined");
    ok(typeof note2 !== "undefined" && note2 !== null, "second item in noteList is defined");

    equal(note1.get('info'), 'info', 'First note was inserted first');
    equal(note2.get('info'), 'info2', 'Second note was inserted second');

    noteCenter = new Angles.NotificationCenter({
      dispatcher: _.clone(Backbone.Events)
    });
    ok(typeof noteCenter !== "undefined" && noteCenter !== null, "notification center object was created");

    dispatcher = noteCenter.dispatcher;
    ok(typeof dispatcher !== "undefined" && dispatcher !== null, "notification center dispatcher was created");

    equal(noteCenter.$notifications.length, 0, "No notifications");

    noteCenter.push({})

    equal(noteCenter.$notifications.length, 1, "One notification now");

    dispatcher.trigger("notification:push", {});

    equal(noteCenter.$notifications.length, 2, "Two notifications now");

    dispatcher.trigger("notification:clear");

    equal(noteCenter.$notifications.length, 0, "No notifications after notification:clear trigger");

  });

  test("Check context help", function() {
    var contextHelp, dispatcher;
    //expect(0);
    ok(typeof Angles.ContextHelp !== "undefined" && Angles.ContextHelp !== null, "ContextHelp class is defined");
 
    ok(typeof window.testODD !== "undefined" && window.testODD !== null, "Test ODD file loaded");
/*
  setODD: (o) -> @$odd = o

  getODDfor: (e) ->
    elements = @$odd.members
    for item in elements
      if item.ident == e
        return item
    null

  getDescOf: (e) -> @getODDfor(e)?.desc

  getChildrenOf: (e) -> 
    @getODDfor(e)?.children
*/

    contextHelp = new Angles.ContextHelp({
      dispatcher: _.clone(Backbone.Events)
    });
    dispatcher = contextHelp.dispatcher;
    contextHelp.setODD(window.testODD);

    ok(contextHelp.getODDfor("p"), "There's something for 'p'");
    ok(!contextHelp.getODDfor("foobar"), "There's nothing for 'foobar'");
    console.log(contextHelp.getODDfor("p"));
  });

  test("Check XMLDocument(List)", function() {
    expect(0);
  });

})();
