/*
  For example:
    var parser = new SAXParser({
      startDocument: function() { ... },
      endDocument: function() { ... },
      startElement: function(node) { ... },
      endElement: function(node) { ... },
      characters: function(text) { ... },
      comment: function(comment) { ... }
    });

    parser.parse(editor);
*/

/* we expect to have the sax-js library available */
var SAXParser = function(callbacks) {

  this.reset = function() {
    var me = this;
    var parser = sax.parser(true, {
      xmlns: true,
      noscript: true,
      position: true
    });
    
    if(callbacks['error']) {
      parser.onerror = function(e) {
        callbacks.error.call(me, e);
        parser.resume();
      };
    }
    else {
      parser.onerror = function(e) {
        me.validationError((e.message.split(/\n/))[0] + ".");
        parser.resume();
      };
    }

    if(callbacks['characters']) {
      parser.ontext = function(t) {
        callbacks.characters.call(me, t);
      };
    }

    if(callbacks['startElement']) {
      parser.onopentag = function(node) {
        callbacks.startElement.call(me, node);
      };
    }

    if(callbacks['endElement']) {
      parser.onclosetag = function(name) {
        callbacks.endElement.call(me, name);
      };
    }

    if(callbacks['comment']) {
      parser.oncomment = function(comment) {
        callbacks.comment.call(me, comment);
      };
    }

    if(callbacks['startCdata']) {
      parser.onopencdata = function() {
      };
    }

    if(callbacks['cdata']) {
      parser.oncdata = function(cdata) {
      };
    }

    if(callbacks['endCdata']) {
      parser.onclosecdata = function() {
      };
    }

    if(callbacks['endDocument']) {
      parser.onend = function() {
        callbacks.endDocument.call(me);
      };
    }

    if(callbacks['startDocument']) {
      parser.onstart = function() {
        callbacks.startDocument.call(me);
      };
    }
    else {
      parser.onstart = function() { };
    }
  
    this.$parser = parser;
    this.$errors = [];
  };
};

SAXParser.prototype.parse = function(editor) {
  this.reset();
  var parser = this.$parser;
  var i, doc = editor.session.getDocument(),
      n = doc.getLength();

  parser.onstart();
  
  for(i = 0; i < n; i += 1) {
    parser.write(doc.getLine(i) + "\n");
  }

  parser.close();

  editor.session.clearAnnotations();

  if(this.validated()) {
    return true;
  }
  else {
    editor.session.setAnnotations(this.$errors);
    return false;
  }
};

SAXParser.prototype.validationError = function(text, type) {
  var parser = this.$parser;
  this.$errors.push({
    text: text,
    row: parser.line,
    column: parser.column,
    type: (typeof type === "undefined" ? "error" : type)
  });
};

SAXParser.prototype.validated = function() {
  return(this.$errors.length == 0);
};

/* --- Validator --- */

var TEIValidator = function() {
  this.$schema = {};

  this.setSchema = function(s) { this.$schema = s; }

  this.checkSchema = function(parser,els) {
    if(els.length == 1) {
      if(!this.$schema.hasOwnProperty(els[0].name)) {
        parser.validationError("Invalid root element: " + els[0].name + ".");
      }
      else {
        var rexp = new RegExp(this.$schema._start, "ig");
        if(rexp.exec(els[0].name+",") == null) {
          parser.validationError("Invalid root element: " + els[0].name + ".");
        }
      }
      return;
    }

    var currentEl = els[0].name,
        parentEl = els[1].name;

    if(this.$schema[parentEl].children.indexOf(currentEl) == -1) {
      parser.validationError("The " + currentEl + " element is not allowed as a child of the " + parentEl + " element.");
      return;
    }
  };

  this.checkChildren = function(parser,els) {
    // we only need the last element
    if(els.length == 0) { return; }
    var currentEl = els[0];
    var childNames = currentEl.children.join(',');
    if(childNames !== "") { childNames += ","; }

    if(!this.$schema.hasOwnProperty(currentEl.name)) { return; }
    if(!this.$schema[currentEl.name].hasOwnProperty("model")) { return; }

    var rexp = new RegExp(this.$schema[currentEl.name].model, "ig");
    if(rexp.exec(childNames) == null) {
      parser.validationError(currentEl.name + " is invalid: one or more required children are missing or its child elements are in the wrong order.");
    }
  };

  this.validate = function(editor) {
    var els, parser, me = this;
    els = [];
    parser = new SAXParser({
      startDocument: function() { els = []; },
      endDocument: function() {
        if(els.length > 0) {
          var names = [];
          for(e in els) {
            names.push(e.name);
          }
          parser.validationError("Unclosed elements at end of document: " + e.join(", "));
        }
      },
      startElement: function(node) {
        if(els.length > 0) {
          els[0].children.push(node.local);
        }
        els.unshift({name: node.local, children: []});
        // check against schema
        me.checkSchema(parser,els);
      },
      characters: function(t) {
        if(els.length > 0) {
          if(t.match(/^[\s\r\n]*$/) == null) {
            els[0].children.push('_text_');
          }
        }
      },
      endElement: function(name) {
        me.checkChildren(parser,els);
        els.shift();
      }
    });
    parser.parse(editor);
    this.$errors = parser.$errors;
  };

  this.errors = function() { return this.$errors; }
};
