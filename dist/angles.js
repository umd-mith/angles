(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.Angles = {};

  (function(Angles, _, Backbone, ace) {
    var ACEEditor, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
    ACEEditor = null;
    Angles.XMLDocument = (function(_super) {
      __extends(XMLDocument, _super);

      function XMLDocument() {
        _ref = XMLDocument.__super__.constructor.apply(this, arguments);
        return _ref;
      }

      XMLDocument.prototype.defaults = {
        "name": "untitled",
        "content": ""
      };

      XMLDocument.prototype.validate = function(attrs) {};

      return XMLDocument;

    })(Backbone.Model);
    Angles.XMLDocumentList = (function(_super) {
      __extends(XMLDocumentList, _super);

      function XMLDocumentList() {
        _ref1 = XMLDocumentList.__super__.constructor.apply(this, arguments);
        return _ref1;
      }

      XMLDocumentList.prototype.model = Angles.XMLDocument;

      return XMLDocumentList;

    })(Backbone.Collection);
    Angles.Notification = (function(_super) {
      __extends(Notification, _super);

      function Notification() {
        _ref2 = Notification.__super__.constructor.apply(this, arguments);
        return _ref2;
      }

      Notification.prototype.defaults = {
        "type": "",
        "info": "",
        "message": "",
        "resource": "",
        "location": {
          "column": -1,
          "row": -1
        }
      };

      return Notification;

    })(Backbone.Model);
    Angles.NotificationList = (function(_super) {
      __extends(NotificationList, _super);

      function NotificationList() {
        _ref3 = NotificationList.__super__.constructor.apply(this, arguments);
        return _ref3;
      }

      NotificationList.prototype.model = Angles.Notification;

      return NotificationList;

    })(Backbone.Collection);
    Angles.FileSelector = (function(_super) {
      __extends(FileSelector, _super);

      function FileSelector() {
        _ref4 = FileSelector.__super__.constructor.apply(this, arguments);
        return _ref4;
      }

      FileSelector.prototype.initialize = function() {
        return this.template = _.template($('#file-list-template').html());
      };

      FileSelector.prototype.render = function() {
        this.$el.html(this.template({}));
        this.collection.each(this.addOne, this);
        return this;
      };

      FileSelector.prototype.addOne = function(model) {
        var view;
        view = new Angles.FileSelectorRow({
          model: model
        });
        return this.$("form").append(view.render().$el);
      };

      return FileSelector;

    })(Backbone.View);
    Angles.FileSelectorRow = (function(_super) {
      __extends(FileSelectorRow, _super);

      function FileSelectorRow() {
        _ref5 = FileSelectorRow.__super__.constructor.apply(this, arguments);
        return _ref5;
      }

      FileSelectorRow.prototype.initialize = function() {
        this.template = _.template($('#file-item-template').html());
        this.listenTo(this.model, 'change', this.render);
        return this.listenTo(this.model, 'destroy', this.remove);
      };

      FileSelectorRow.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      };

      return FileSelectorRow;

    })(Backbone.View);
    Angles.NotificationTable = (function(_super) {
      __extends(NotificationTable, _super);

      function NotificationTable() {
        _ref6 = NotificationTable.__super__.constructor.apply(this, arguments);
        return _ref6;
      }

      NotificationTable.prototype.initialize = function() {
        return this.template = _.template($('#notification-list-template').html());
      };

      NotificationTable.prototype.render = function() {
        this.$el.html(this.template({}));
        this.listenTo(this.collection, 'add', this.addOne);
        return this;
      };

      NotificationTable.prototype.addOne = function(model) {
        var view;
        view = new Angles.NotificationRow({
          model: model
        });
        return this.$(".notifications").append(view.render().$el);
      };

      return NotificationTable;

    })(Backbone.View);
    Angles.NotificationRow = (function(_super) {
      __extends(NotificationRow, _super);

      function NotificationRow() {
        _ref7 = NotificationRow.__super__.constructor.apply(this, arguments);
        return _ref7;
      }

      NotificationRow.prototype.initialize = function() {
        this.template = _.template($('#notification-template').html());
        this.listenTo(this.model, 'change', this.render);
        return this.listenTo(this.model, 'destroy', this.remove);
      };

      NotificationRow.prototype.render = function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
      };

      return NotificationRow;

    })(Backbone.View);
    return Angles.ACEEditorView = (function(_super) {
      __extends(ACEEditorView, _super);

      function ACEEditorView() {
        _ref8 = ACEEditorView.__super__.constructor.apply(this, arguments);
        return _ref8;
      }

      ACEEditorView.prototype.tagName = "div";

      ACEEditorView.prototype.className = "ace-editor";

      ACEEditorView.prototype.initialize = function() {
        var annotations, dispatcher,
          _this = this;
        annotations = [];
        dispatcher = this.options.dispatcher || _.clone(Backbone.Events);
        this.dispatcher = dispatcher;
        dispatcher.on("editor:reload", function() {
          _this.clearAnnotations();
          return _this.setContent();
        });
        dispatcher.on("document:save", function() {
          return _this.saveModel();
        });
        dispatcher.on("validation:start", function() {
          annotations = [];
          return _this.dispatcher.trigger('notification:clear');
        });
        dispatcher.on("validation:error", function(e) {
          var n;
          annotations.push(e);
          n = {
            type: "validation",
            info: e.type,
            message: e.text,
            location: {
              row: e.row,
              column: e.column
            }
          };
          return _this.dispatcher.trigger('notification:push', n);
        });
        dispatcher.on("validation:end", function() {
          var select;
          select = _this.$editor.getSelection();
          _this.clearAnnotations();
          _this.$editor.focus();
          if (annotations.length > 0) {
            _this.$editor.gotoLine(annotations[0].row + 1, annotations[0].column, true);
            select.selectWordLeft();
            select.selectWordLeft();
          }
          return _this.$editor.session.setAnnotations(annotations);
        });
        return dispatcher.on("document:switch", function(e) {
          return _this.setModel(e);
        });
      };

      ACEEditorView.prototype.render = function() {
        var _this = this;
        this.$editor = ace.edit(this.el);
        this.$editor.getSession().on('change', function(e) {
          return _this.dispatcher.trigger('editor:change', e);
        });
        this.$editor.getSession().setMode("ace/mode/xml");
        ace.config.set("basePath", "../deps/");
        ace.config.loadModule('ext/angles', function() {
          var completer;
          _this.$editor.setOptions({
            enableODDAutocompletion: true
          });
          completer = {
            getCompletions: function(editor, session, pos, prefix, callback) {
              var c, children, completions, context, ident, _findParent, _i, _len;
              if (_this.$context != null) {
                context = _this.$context;
                _findParent = function(row, column) {
                  var closedTags, finalTag, isClosingTag, isOpeningTag, openTags, _scanRow;
                  openTags = [];
                  closedTags = [];
                  isOpeningTag = false;
                  isClosingTag = false;
                  finalTag = '';
                  _scanRow = function(row, column) {
                    var curColumn, i, token, tokens, _i, _len, _results;
                    curColumn = 0;
                    tokens = editor.getSession().getTokens(row);
                    for (_i = 0, _len = tokens.length; _i < _len; _i++) {
                      token = tokens[_i];
                      curColumn += token.value.length;
                      if (curColumn > column) {
                        if (token.type === "meta.tag.punctuation.begin" && token.value === "<") {
                          isOpeningTag = true;
                        } else if (token.type === "meta.tag.punctuation.begin" && token.value === "</") {
                          isClosingTag = true;
                        } else if (token.type === "meta.tag.punctuation.end" && token.value === "/>") {
                          openTags.pop();
                          isOpeningTag = false;
                          isClosingTag = false;
                        } else if (token.type === "meta.tag.name" && isOpeningTag) {
                          openTags.push(token.value);
                          isOpeningTag = false;
                        } else if (token.type === "meta.tag.name" && isClosingTag) {
                          closedTags.push(token.value);
                          isClosingTag = false;
                        }
                      }
                    }
                    if (closedTags.length === 0) {
                      return _scanRow(row + 1, 0);
                    } else if (closedTags.length === 1 && openTags.length === 0) {
                      return finalTag = closedTags[closedTags.length - 1];
                    } else {
                      i = openTags.length;
                      _results = [];
                      while (i--) {
                        if (closedTags[closedTags.length - 1] === openTags[i]) {
                          openTags.splice(i);
                          closedTags.pop();
                          _results.push(_scanRow(row + 1, 0));
                        } else {
                          _results.push(finalTag = closedTags[closedTags.length - 1]);
                        }
                      }
                      return _results;
                    }
                  };
                  _scanRow(row, column);
                  return finalTag;
                };
                pos = editor.getCursorPosition();
                ident = _findParent(pos.row, pos.column);
                completions = [];
                children = context.getChildrenOf(ident);
                if (children != null) {
                  for (_i = 0, _len = children.length; _i < _len; _i++) {
                    c = children[_i];
                    completions.push({
                      caption: c.ident,
                      snippet: "" + c.ident + "></" + c.ident + ">",
                      meta: "element"
                    });
                  }
                } else {
                  completions.push({
                    caption: "unknown parent",
                    snippet: "",
                    meta: "element"
                  });
                }
                if (completions.length > 0) {
                  return callback(null, completions);
                }
              } else {
                return 0;
              }
            }
          };
          _this.$editor.completers = [completer];
          ace.config.on("desc", function(e) {
            return _this.dispatcher.trigger("editor:context", e.ident);
          });
          return ace.config.on("desc:clear", function(e) {
            return _this.dispatcher.trigger('notification:clear');
          });
        });
        return this;
      };

      ACEEditorView.prototype.setContent = function() {
        return this.$editor.setValue(this.model.get('content'));
      };

      ACEEditorView.prototype.getContent = function() {
        return this.$editor.getValue();
      };

      ACEEditorView.prototype.getDocument = function() {
        var _this = this;
        return {
          getValue: function() {
            return _this.$editor.getValue();
          },
          getLength: function() {
            return _this.$editor.session.getDocument().getLength();
          },
          getLine: function(n) {
            return _this.$editor.session.getDocument().getLine(n);
          }
        };
      };

      ACEEditorView.prototype.saveModel = function() {
        var _this = this;
        this.model.set('content', this.getContent());
        return this.model.save({
          success: function() {
            return _this.dispatcher.trigger("editor:reload");
          },
          error: function() {
            return _this.dispatcher.trigger("editor:error", "Unable to change document");
          }
        });
      };

      ACEEditorView.prototype.setModel = function(m) {
        this.model = m;
        return this.dispatcher.trigger("editor:reload");
      };

      ACEEditorView.prototype.clearAnnotations = function() {
        return this.$editor.session.clearAnnotations();
      };

      ACEEditorView.prototype.setMode = function(m) {
        return this.$editor.getSession().setMode(m);
      };

      return ACEEditorView;

    })(Backbone.View);
  })(window.Angles, _, Backbone, ace);

}).call(this);

(function() {
  Angles.ContextHelp = (function() {
    function ContextHelp(options) {
      var dispatcher;
      dispatcher = this.dispatcher = options.dispatcher;
      this.$odd = {};
      this.$angles = options.anglesView;
    }

    ContextHelp.prototype.setODD = function(o) {
      return this.$odd = o;
    };

    ContextHelp.prototype.getODDfor = function(e) {
      var elements, item, _i, _len;
      elements = this.$odd.members;
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        item = elements[_i];
        if (item.ident === e) {
          return item;
        }
      }
      return null;
    };

    ContextHelp.prototype.getDescOf = function(e) {
      var _ref;
      return (_ref = this.getODDfor(e)) != null ? _ref.desc : void 0;
    };

    ContextHelp.prototype.getChildrenOf = function(e) {
      var _ref;
      return (_ref = this.getODDfor(e)) != null ? _ref.children : void 0;
    };

    return ContextHelp;

  })();

}).call(this);

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Angles.FileUploader = (function() {
    function FileUploader(options) {
      this._handleFileSelect = __bind(this._handleFileSelect, this);
      var dispatcher;
      dispatcher = this.dispatcher = options.dispatcher;
      this.$angles = options.anglesView;
      this.storedFiles = options.storedFiles;
    }

    FileUploader.prototype._handleFileSelect = function(evt) {
      var file, reader,
        _this = this;
      file = evt.target.files[0];
      reader = new FileReader();
      reader.onload = function(e) {
        var newModel, same_name;
        same_name = _this.storedFiles.find(function(model) {
          return model.get('name') === file.name;
        });
        if (same_name != null) {
          same_name.destroy();
        }
        newModel = _this.storedFiles.create({
          name: file.name,
          content: e.target.result
        });
        return _this.dispatcher.trigger("document:switch", newModel);
      };
      return reader.readAsText(file, "UTF-8");
    };

    FileUploader.prototype.bind = function(el) {
      return $(el).change(this._handleFileSelect);
    };

    return FileUploader;

  })();

}).call(this);

(function() {
  Angles.NotificationCenter = (function() {
    function NotificationCenter(options) {
      var dispatcher,
        _this = this;
      dispatcher = this.dispatcher = options.dispatcher;
      this.$angles = options.anglesView;
      this.$notifications = new Angles.NotificationList();
      dispatcher.on("notification:push", function(e) {
        return _this.push(e);
      });
      dispatcher.on("notification:clear", function(e) {
        return _this.clear();
      });
    }

    NotificationCenter.prototype.push = function(m) {
      return this.$notifications.add(m);
    };

    NotificationCenter.prototype.clear = function() {
      var m;
      while (m = this.$notifications.first()) {
        m.destroy();
      }
      return null;
    };

    return NotificationCenter;

  })();

}).call(this);

(function() {
  Angles.Validator = (function() {
    function Validator(options) {
      var dispatcher;
      dispatcher = this.dispatcher = options.dispatcher;
      this.$schema = {};
      this.$errors = [];
      this.$angles = options.anglesView;
    }

    Validator.prototype.displayErrors = function() {
      var e, _i, _len, _ref;
      _ref = this.errors();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        this.dispatcher.trigger("validation:error", e);
      }
      return this.endValidation();
    };

    Validator.prototype.addError = function(e) {
      return this.$errors.push(e);
    };

    Validator.prototype.clearErrors = function() {
      return this.$errors = [];
    };

    Validator.prototype.endValidation = function() {
      return this.dispatcher.trigger("validation:end");
    };

    Validator.prototype.setSchema = function(s) {
      this.$schema = s;
      return this.dispatcher.trigger("validation");
    };

    Validator.prototype.errors = function() {
      return this.$errors;
    };

    Validator.prototype.hasErrors = function() {
      return this.$errors.length !== 0;
    };

    return Validator;

  })();

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Angles.SAXParser = (function() {
    function SAXParser(callbacks) {
      this.reset = function() {
        var parser,
          _this = this;
        parser = sax.parser(true, {
          xmlns: true,
          noscript: true,
          position: true
        });
        if (callbacks.error != null) {
          parser.onerror = function(e) {
            callbacks.error.call(_this, e);
            return parser.resume();
          };
        } else {
          parser.onerror = function(e) {
            _this.validationError((e.message.split(/\n/))[0] + ".");
            return parser.resume();
          };
        }
        if (callbacks.characters != null) {
          parser.ontext = function(t) {
            return callbacks.characters.call(_this, t);
          };
        }
        if (callbacks.startElement != null) {
          parser.onopentag = function(node) {
            return callbacks.startElement.call(_this, node);
          };
        }
        if (callbacks.endElement != null) {
          parser.onclosetag = function(name) {
            return callbacks.endElement.call(_this, name);
          };
        }
        if (callbacks.comment != null) {
          parser.oncomment = function(comment) {
            return callbacks.comment.call(_this, comment);
          };
        }
        if (callbacks.startCdata != null) {
          parser.onopencdata = function() {
            return callbacks.startCdata.call(_this);
          };
        }
        if (callbacks.cdata != null) {
          parser.oncdata = function(cdata) {
            return callbacks.cdata.call(_this, cdata);
          };
        }
        if (callbacks.endCdata != null) {
          parser.onclosecdata = function() {
            return callbacks.endCdata.call(_this);
          };
        }
        if (callbacks.endDocument != null) {
          parser.onend = function() {
            return callbacks.endDocument.call(_this);
          };
        }
        if (callbacks.startDocument != null) {
          parser.onstart = function() {
            return callbacks.startDocument.call(_this);
          };
        } else {
          parser.onstart = function() {};
        }
        this.$parser = parser;
        return this.$errors = [];
      };
    }

    SAXParser.prototype.parse = function(doc) {
      var i, n, parser, _i;
      this.reset();
      parser = this.$parser;
      n = doc.getLength();
      parser.onstart();
      for (i = _i = 0; 0 <= n ? _i <= n : _i >= n; i = 0 <= n ? ++_i : --_i) {
        parser.write(doc.getLine(i) + "\n");
      }
      parser.close();
      if (this.validated()) {
        return true;
      } else {
        return false;
      }
    };

    SAXParser.prototype.validationError = function(text, type) {
      var parser;
      parser = this.$parser;
      return this.$errors.push({
        text: text,
        row: parser.line,
        column: parser.column,
        type: type != null ? type : "error"
      });
    };

    SAXParser.prototype.validated = function() {
      return this.$errors.length === 0;
    };

    return SAXParser;

  })();

  Angles.ValidatorSAX = (function(_super) {
    __extends(ValidatorSAX, _super);

    function ValidatorSAX(options) {
      var _this = this;
      ValidatorSAX.__super__.constructor.call(this, options);
      this.dispatcher.on("validation", function() {
        var doc, _ref;
        doc = (_ref = _this.$angles) != null ? _ref.getDocument() : void 0;
        if (doc != null) {
          _this.dispatcher.trigger("validation:start");
          return _this.validate(_this.$angles.getDocument());
        }
      });
    }

    ValidatorSAX.prototype.checkSchema = function(parser, els) {
      var currentEl, parentEl, rexp, _ref, _ref1;
      if (this.$schema == null) {
        return;
      }
      if ((els != null ? els.length : void 0) === 1) {
        if (!this.$schema.hasOwnProperty((_ref = els[0]) != null ? _ref.name : void 0)) {
          parser.validationError("Invalid root element: " + els[0].name + ".");
        } else {
          rexp = new RegExp(this.$schema._start, "ig");
          if (rexp.exec(els[0].name + ",") === null) {
            parser.validationError("Invalid root element: " + els[0].name + ".");
          }
        }
        return;
      }
      currentEl = els[0].name;
      parentEl = els[1].name;
      if (this.$schema[parentEl] == null) {
        return parser.validationError("The " + currentEl + " element is not allowed as a child of the " + parentEl + " element.");
      } else if (__indexOf.call((_ref1 = this.$schema[parentEl]) != null ? _ref1.children : void 0, currentEl) < 0) {
        parser.validationError("The " + currentEl + " element is not allowed as a child of the " + parentEl + " element.");
      }
    };

    ValidatorSAX.prototype.checkChildren = function(parser, els) {
      var childNames, currentEl, rexp;
      if (this.$schema == null) {
        return;
      }
      if (!(els.length > 0)) {
        return;
      }
      currentEl = els[0];
      childNames = currentEl.children.join(',');
      if (childNames !== "") {
        childNames += ",";
      }
      if (!this.$schema.hasOwnProperty(currentEl != null ? currentEl.name : void 0)) {
        return;
      }
      if (!this.$schema[currentEl.name].hasOwnProperty("model")) {
        return;
      }
      rexp = new RegExp(this.$schema[currentEl.name].model, "ig");
      if (rexp.exec(childNames) === null) {
        return parser.validationError(currentEl.name + " is invalid: one or more required children are missing or its child elements are in the wrong order.");
      }
    };

    ValidatorSAX.prototype.validate = function(editor) {
      var els, parser,
        _this = this;
      els = [];
      parser = new Angles.SAXParser({
        startDocument: function() {
          return els = [];
        },
        endDocument: function() {
          var e, names;
          if (els.length > 0) {
            names = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = els.length; _i < _len; _i++) {
                e = els[_i];
                _results.push(e.name);
              }
              return _results;
            })();
            return parser.validationError("Unclosed elements at end of document: " + (names.join(", ")));
          }
        },
        startElement: function(node) {
          if (els.length > 0) {
            els[0].children.push(node.local);
          }
          els.unshift({
            name: node.local,
            children: []
          });
          return _this.checkSchema(parser, els);
        },
        characters: function(t) {
          if (els.length > 0) {
            if (t.match(/^[\s\r\n]*$/) === null) {
              return els[0].children.push('_text_');
            }
          }
        },
        endElement: function(name) {
          _this.checkChildren(parser, els);
          return els.shift();
        }
      });
      parser.parse(editor);
      this.$errors = parser.$errors;
      return this.displayErrors();
    };

    return ValidatorSAX;

  })(Angles.Validator);

}).call(this);

(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Angles.ValidatorSRV = (function(_super) {
    var requestHandler, validationHandler;

    __extends(ValidatorSRV, _super);

    function ValidatorSRV(options) {
      var _this = this;
      ValidatorSRV.__super__.constructor.call(this, options);
      this.$validatorUrl = options.validator;
      this.$requestHandler = options.requestHandler != null ? options.requestHandler : requestHandler;
      this.$validationHandler = options.validationHandler != null ? options.validationHandler : validationHandler;
      this.dispatcher.on("validation", function() {
        _this.dispatcher.trigger("validation:start");
        return _this.$requestHandler(_this);
      });
    }

    requestHandler = function(validator) {
      var doc, xmlDocument,
        _this = this;
      doc = validator.$angles.getDocument();
      xmlDocument = escape(doc.getValue());
      return $.ajax({
        url: validator.$validatorUrl,
        type: "POST",
        crossDomain: true,
        processData: false,
        data: "schema=" + validator.$schema + "&document=" + xmlDocument,
        dataType: "json",
        success: function(data) {
          return validator.$validationHandler(validator, data);
        },
        error: function(xhr, textStatus, thrownError, data) {
          var n;
          _this.dispatcher.trigger('notification:clear');
          thrownError = xhr.status === 0 ? "Cannot reach server" : thrownError;
          n = {
            type: "Server",
            info: "Status: " + xhr.status,
            message: thrownError,
            location: {
              row: -1,
              column: -1
            }
          };
          return _this.dispatcher.trigger('notification:push', n);
        }
      });
    };

    validationHandler = function(validator, data) {
      var datum, _i, _len;
      validator.$errors = [];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        datum = data[_i];
        validator.$errors.push({
          text: datum.message,
          row: datum.line - 1,
          column: datum.column,
          type: datum.type
        });
      }
      return validator.displayErrors();
    };

    return ValidatorSRV;

  })(Angles.Validator);

}).call(this);
