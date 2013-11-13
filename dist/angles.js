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
                        if (token.type === "meta.tag" && token.value === "<") {
                          isOpeningTag = true;
                        } else if (token.type === "meta.tag" && token.value === "</") {
                          isClosingTag = true;
                        } else if (token.type === "meta.tag.r" && token.value === "/>") {
                          openTags.pop();
                          isOpeningTag = false;
                          isClosingTag = false;
                        } else if (token.type === "meta.tag.tag-name" && isOpeningTag) {
                          openTags.push(token.value);
                          isOpeningTag = false;
                        } else if (token.type === "meta.tag.tag-name" && isClosingTag) {
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

/*
 ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK *****
*/


(function() {
  if (typeof define !== "undefined" && define !== null) {
    define('ext/angles', ['require', 'exports', 'module', 'ace/snippets', 'ace/autocomplete', 'ace/config', 'ace/autocomplete/text_completer', 'ace/editor'], function(require, exports, module) {
      var Autocomplete, Editor, completers, config, expandSnippet, keyWordCompleter, onChangeMode, snippetCompleter, snippetManager, textCompleter;
      snippetManager = require("ace/snippets").snippetManager;
      Autocomplete = require("ace/autocomplete").Autocomplete;
      config = require("ace/config");
      textCompleter = require("ace/autocomplete/text_completer");
      keyWordCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
          var keywords;
          keywords = session.$mode.$keywordList || [];
          keywords = keywords.filter(function(w) {
            return w.lastIndexOf(prefix, 0) === 0;
          });
          return callback(null, keywords.map(function(word) {
            return {
              name: word,
              value: word,
              score: 0,
              meta: "keyword"
            };
          }));
        }
      };
      snippetCompleter = {
        getCompletions: function(editor, session, pos, prefix, callback) {
          var completions, scope, snippetMap,
            _this = this;
          scope = snippetManager.$getScope(editor);
          snippetMap = snippetManager.snippetMap;
          completions = [];
          [scope, "_"].forEach(function(scope) {
            var i, s, snippets, _i, _ref, _results;
            snippets = snippetMap[scope] || [];
            _results = [];
            for (i = _i = _ref = snippets.length; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
              s = snippets[i];
              if (s.tabTrigger && s.tabTrigger.indexOf(prefix) === 0) {
                _results.push(completions.push({
                  caption: s.tabTrigger,
                  snippet: s.content,
                  meta: "snippet"
                }));
              } else {
                _results.push(void 0);
              }
            }
            return _results;
          });
          return callback(null, completions);
        }
      };
      completers = [snippetCompleter, textCompleter, keyWordCompleter];
      exports.addCompleter = function(completer) {
        return completers.push(completer);
      };
      expandSnippet = {
        name: "expandSnippet",
        exec: function(editor) {
          var success;
          success = snippetManager.expandWithTab(editor);
          if (!success) {
            return editor.execCommand("indent");
          }
        },
        bindKey: "tab"
      };
      onChangeMode = function(e, editor) {
        var id, mode, snippetFilePath;
        mode = editor.session.$mode;
        id = mode.$id;
        if (!snippetManager.files) {
          snippetManager.files = {};
        }
        if (id && !snippetManager.files[id]) {
          snippetFilePath = id.replace("mode", "snippets");
          return config.loadModule(snippetFilePath, function(m) {
            if (m) {
              snippetManager.files[id] = m;
              m.snippets = snippetManager.parseSnippetFile(m.snippetText);
              return snippetManager.register(m.snippets, m.scope);
            }
          });
        }
      };
      Editor = require("ace/editor").Editor;
      return require("ace/config").defineOptions(Editor.prototype, "editor", {
        enableBasicAutocompletion: {
          set: function(val) {
            if (val) {
              this.completers = completers;
              return this.commands.addCommand(Autocomplete.startCommand);
            } else {
              return this.commands.removeCommand(Autocomplete.startCommand);
            }
          },
          value: false
        },
        enableODDAutocompletion: {
          set: function(val) {
            if (val) {
              this.completers = completers;
              return this.commands.addCommand(Autocomplete.startCommand);
            } else {
              return this.commands.removeCommand(Autocomplete.startCommand);
            }
          },
          value: false
        },
        enableSnippets: {
          set: function(val) {
            if (val) {
              this.commands.addCommand(expandSnippet);
              this.on("changeMode", onChangeMode);
              return onChangeMode(null, this);
            } else {
              this.commands.removeCommand(expandSnippet);
              return this.off("changeMode", onChangeMode);
            }
          },
          value: false
        }
      });
    });
    define('ace/snippets', ['require', 'exports', 'module', 'ace/lib/lang', 'ace/range', 'ace/keyboard/hash_handler', 'ace/tokenizer', 'ace/lib/dom'], function(require, exports, module) {
      var HashHandler, Range, SnippetManager, TabstopManager, Tokenizer, comparePoints, lang, movePoint, moveRelative;
      lang = require("./lib/lang");
      Range = require("./range").Range;
      HashHandler = require("./keyboard/hash_handler").HashHandler;
      Tokenizer = require("./tokenizer").Tokenizer;
      comparePoints = Range.comparePoints;
      SnippetManager = function() {
        this.snippetMap = {};
        return this.snippetNameMap = {};
      };
      (function() {
        this.getTokenizer = function() {
          var TabstopToken, escape;
          TabstopToken = function(str, _, stack) {
            str = str.substr(1);
            if (/^\d+$/.test(str) && !stack.inFormatString) {
              return [
                {
                  tabstopId: parseInt(str, 10)
                }
              ];
            } else {
              return [
                {
                  text: str
                }
              ];
            }
          };
          escape = function(ch) {
            return "(?:[^\\\\" + ch + "]|\\\\.)";
          };
          SnippetManager.$tokenizer = new Tokenizer({
            start: [
              {
                regex: /:/,
                onMatch: function(val, state, stack) {
                  if (stack.length && stack[0].expectIf) {
                    stack[0].expectIf = false;
                    stack[0].elseBranch = stack[0];
                    return [stack[0]];
                  } else {
                    return ":";
                  }
                }
              }, {
                regex: /\\./,
                onMatch: function(val, state, stack) {
                  var ch;
                  ch = val[1];
                  switch (false) {
                    case !(ch === "}" && stack.length):
                      val = ch;
                      break;
                    case "`$\\".indexOf(ch) === -1:
                      val = ch;
                      break;
                    case !stack.inFormatString:
                      switch (false) {
                        case ch !== "n":
                          val = "\n";
                          break;
                        case ch !== "t":
                          val = "\n";
                          break;
                        case "ulULE".indexOf(ch) === -1:
                          val = {
                            changeCase: ch,
                            local: ch > "a"
                          };
                      }
                  }
                  return [val];
                }
              }, {
                regex: /\}/,
                onMatch: function(val, state, stack) {
                  return [stack.length ? stack.shift() : val];
                }
              }, {
                regex: /\$(?:\d+|\w+)/,
                onMatch: TabstopToken
              }, {
                regex: /\$\{[\dA-Z_a-z]+/,
                onMatch: function(str, state, stack) {
                  var t;
                  t = TabstopToken(str.substr(1), state, stack);
                  stack.unshift(t[0]);
                  return t;
                },
                next: "snippetVar"
              }, {
                regex: /\n/,
                token: "newline",
                merge: false
              }
            ],
            snippetVar: [
              {
                regex: "\\|" + escape("\\|") + "*\\|",
                onMatch: function(val, state, stack) {
                  return stack[0].choices = val.slice(1, -1).split(",");
                },
                next: "start"
              }, {
                regex: "/(" + escape("/") + "+)/(?:(" + escape("/") + "*)/)(\\w*):?",
                onMatch: function(val, state, stack) {
                  var ts;
                  ts = stack[0];
                  ts.fmtString = val;
                  val = this.splitRegex.exec(val);
                  ts.guard = val[1];
                  ts.fmt = val[2];
                  ts.flag = val[3];
                  return "";
                },
                next: "start"
              }, {
                regex: "`" + escape("`") + "*`",
                onMatch: function(val, state, stack) {
                  stack[0].code = val.splice(1, -1);
                  return "";
                },
                next: "start"
              }, {
                regex: "\\?",
                onMatch: function(val, state, stack) {
                  if (stack[0]) {
                    return stack[0].expectIf = true;
                  }
                },
                next: "start"
              }, {
                regex: "([^:}\\\\]|\\\\.)*:?",
                token: "",
                next: "start"
              }
            ],
            formatString: [
              {
                regex: "/(" + escape("/") + "+)/",
                token: "regex"
              }, {
                regex: "",
                onMatch: function(val, state, stack) {
                  return stack.inFormatString = true;
                },
                next: "start"
              }
            ]
          });
          SnippetManager.prototype.getTokenizer = function() {
            return SnippetManager.$tokenizer;
          };
          return SnippetManager.$tokenizer;
        };
        this.tokenizeTmSnippet = function(str, startState) {
          return this.getTokenizer().getLineTokens(str, startState).tokens.map(function(x) {
            return x.value || x;
          });
        };
        this.$getDefaultValue = function(editor, name) {
          var i, r, s;
          switch (false) {
            case !/^[A-Z]\d+$/.test(name):
              i = name.substr(1);
              return (this.variables[name[0] + "__"] || {})[i];
            case !/^\d+$/.test(name):
              return (this.variables.__ || {})[name];
            default:
              name = name.replace(/^TM_/, "");
              if (!editor) {
                return;
              }
              s = editor.session;
              switch (name) {
                case "CURRENT_WORD":
                  return r = s.getWordRange();
                case "SELECTION":
                case "SELECTED_TEXT":
                  return s.getTextRange(r);
                case "CURRENT_LINE":
                  return s.getLine(e.getCursorPosition().row);
                case "LINE_INDEX":
                  return e.getCursorPosition().column;
                case "LINE_NUMBER":
                  return e.getCursorPosition().row + 1;
                case "SOFT_TABS":
                  if (s.getUseSoftTabs()) {
                    return "YES";
                  } else {
                    return "NO";
                  }
                  break;
                case "TAB_SIZE":
                  return s.getTabSize();
                case "FILENAME":
                case "FILEPATH":
                  return "ace.ajax.org";
                case "FULLNAME":
                  return "Ace";
              }
          }
        };
        this.variables = {};
        this.getVariableValue = function(editor, varName) {
          if (this.variables.hasOwnProperty(varName)) {
            return this.variables[varName](editor, varName) || "";
          } else {
            return this.$getDefaultValue(editor, varName) || "";
          }
        };
        this.tmStrFormat = function(str, ch, editor) {
          var flag, fmtTokens, formatted, re,
            _this = this;
          flag = ch.flag || "";
          re = ch.guard;
          re = new RegExp(re, flag.replace(/[^gi]/, ""));
          fmtTokens = this.tokenizeTmSnippet(ch.fmt, "formatString");
          formatted = str.replace(re, function() {
            var fmtParts, gChangeCase, i, next, _i, _ref;
            _this.variables.__ = arguments;
            fmtParts = _this.resolveVariables(fmtTokens, editor);
            gChangeCase = "E";
            for (i = _i = 0, _ref = fmtParts.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              ch = fmtParts[i];
              switch (false) {
                case typeof ch !== "object":
                  fmtParts[i] = "";
                  if (ch.changeCase && ch.local) {
                    next = fmtParts[i + 1];
                    if (next && typeof next === "string") {
                      if (ch.changeCase === "u") {
                        fmtParts[i] = next[0].toUpperCase();
                      } else {
                        fmtParts[i] = next[0].toLowerCase();
                      }
                      fmtParts[i + 1] = next.substr(1);
                    }
                  } else if (ch.changeCase) {
                    gChangeCase = ch.changeCase;
                  }
                  break;
                case gChangeCase !== "U":
                  fmtParts[i] = ch.toUpperCase();
                  break;
                case gChangeCase !== "L":
                  fmtParts[i] = ch.toLowerCase();
              }
            }
            return fmtParts.join("");
          });
          this.variables.__ = null;
          return formatted;
        };
        this.resolveVariables = function(snippet, editor) {
          var ch, gotoNext, i, result, value, _i, _ref;
          result = [];
          gotoNext = function(ch) {
            var i, i1;
            i1 = snippet.indexOf(ch, i + 1);
            if (i1 !== -1) {
              return i = i1;
            }
          };
          for (i = _i = 0, _ref = snippet.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            ch = snippet[i];
            switch (false) {
              case typeof ch !== "string":
                result.push(ch);
                break;
              case typeof ch === "object":
                continue;
              case !ch.skip:
                gotoNext(ch);
                break;
              case !(ch.processed < i):
                continue;
              case !ch.text:
                value = this.getVariableValue(editor, ch.text);
                if (value && ch.fmtString) {
                  value = this.tmStrFormat(value, ch);
                }
                ch.processed = i;
                if (ch.expectIf === null) {
                  if (value) {
                    result.push(value);
                    gotoNext(ch);
                  }
                } else {
                  if (value) {
                    ch.skip = ch.elseBranch;
                  } else {
                    gotoNext(ch);
                  }
                }
                break;
              case ch.tabstopId === null:
                result.push(ch);
                break;
              case ch.changeCase === null:
                result.push(ch);
            }
          }
          return result;
        };
        this.insertSnippet = function(editor, snippetText) {
          var column, cursor, end, indentString, line, range, row, tabString, tabstopManager, tabstops, text, tokens;
          cursor = editor.getCursorPosition();
          line = editor.session.getLine(cursor.row);
          indentString = line.match(/^\s*/)[0];
          tabString = editor.session.getTabString();
          tokens = this.tokenizeTmSnippet(snippetText);
          tokens = this.resolveVariables(tokens, editor);
          tokens = tokens.map(function(x) {
            if (x === "\n") {
              x + indentString;
            }
            if (typeof x === "string") {
              return x.replace(/\t/g, tabString);
            } else {
              return x;
            }
          });
          tabstops = [];
          tokens.forEach(function(p, i) {
            var i1, id, value;
            if (typeof p !== "object") {
              return;
            }
            id = p.tabstopId;
            if (!tabstops[id]) {
              tabstops[id] = [];
              tabstops[id].index = id;
              tabstops[id].value = "";
            }
            if (tabstops[id].indexOf(p) !== -1) {
              return;
            }
            tabstops[id].push(p);
            i1 = tokens.indexOf(p, i + 1);
            if (i1 === -1) {
              return;
            }
            value = tokens.slice(i + 1, i1).join("");
            if (value) {
              return tabstops[id].value = value;
            }
          });
          tabstops.forEach(function(ts) {
            return ts.value && ts.forEach(function(p) {
              var i, i1;
              i = tokens.indexOf(p);
              i1 = tokens.indexOf(p, i + 1);
              if (i1 === -1) {
                return tokens.splice(i + 1, 0, ts.value, p);
              } else if (i1 === i + 1) {
                return tokens.splice(i + 1, 0, ts.value);
              }
            });
          });
          row = 0;
          column = 0;
          text = "";
          tokens.forEach(function(t) {
            if (typeof t === "string") {
              if (t[0] === "\n") {
                column = t.length - 1;
                row += 1;
              } else {
                column += t.length;
              }
              return text += t;
            } else {
              if (!t.start) {
                return t.start = {
                  row: row,
                  column: column
                };
              } else {
                return t.end = {
                  row: row,
                  column: column
                };
              }
            }
          });
          range = editor.getSelectionRange();
          end = editor.session.replace(range, text);
          tabstopManager = new TabstopManager(editor);
          tabstopManager.addTabstops(tabstops, range.start, end);
          return tabstopManager.tabNext();
        };
        this.$getScope = function(editor) {
          var c, scope, state;
          scope = editor.session.$mode.$id || "";
          scope = scope.split("/").pop();
          if (editor.session.$mode.$modes) {
            c = editor.getCursorPosition();
            state = editor.session.getState(c.row);
            if (state.substring) {
              if (state.substring(0, 3) === "js-") {
                scope = "javascript";
              } else if (state.substring(0, 4) === "css-") {
                scope = "css";
              } else if (state.substring(0, 4) === "php-") {
                scope = "php";
              }
            }
          }
          return scope;
        };
        this.expandWithTab = function(editor) {
          var after, before, cursor, line, scope, snippetMap,
            _this = this;
          cursor = editor.getCursorPosition();
          line = editor.session.getLine(cursor.row);
          before = line.substring(0, cursor.column);
          after = line.substr(cursor.column);
          scope = this.$getScope(editor);
          snippetMap = this.snippetMap;
          snippet;
          [scope, "_"].some(function(scope) {
            var snippet, snippets;
            snippets = snippetMap[scope];
            if (snippets) {
              snippet = _this.findMatchingSnippet(snippets, before, after);
            }
            return !!snippet;
          });
          if (!snippet) {
            return false;
          } else {
            editor.session.doc.removeInLine(cursor.row, cursor.column - snippet.replaceBefore.length, cursor.column + snippet.replaceAfter.length);
            this.variables.M__ = snippet.matchBefore;
            this.variables.T__ = snippet.matchAfter;
            this.insertSnippet(editor, snippet.content);
            this.variables.M__ = this.variables.T__ = null;
            return true;
          }
        };
        this.findMatchingSnippet = function(snippetList, before, after) {
          var i, s, _i, _ref;
          for (i = _i = _ref = snippetList.length; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
            s = snippetList[i];
            if (s.startRe && !s.startRe.test(before)) {
              continue;
            }
            if (s.endRe && !s.endRe.test(after)) {
              continue;
            }
            if (!s.startRe && !s.endRe) {
              continue;
            }
            s.matchBefore = s.startRe ? s.startRe.exec(before) : [""];
            s.matchAfter = s.endRe ? s.endRe.exec(after) : [""];
            s.replaceBefore = s.triggerRe ? s.triggerRe.exec(before)[0] : "";
            s.replaceAfter = s.endTriggerRe ? s.endTriggerRe.exec(after)[0] : "";
            return s;
          }
        };
        this.snippetMap = {};
        this.snippetNameMap = {};
        this.register = function(snippets, scope) {
          var addSnippet, guardedRegexp, self, snippetMap, snippetNameMap, wrapRegexp;
          snippetMap = this.snippetMap;
          snippetNameMap = this.snippetNameMap;
          self = this;
          wrapRegexp = function(src) {
            if (src && !/^\^?\(.*\)\$?$|^\\b$/.test(src)) {
              src = "(?:" + src + ")";
            }
            return src || "";
          };
          guardedRegexp = function(re, guard, opening) {
            re = wrapRegexp(re);
            guard = wrapRegexp(guard);
            if (opening) {
              re = guard + re;
              if (re && re[re.length - 1] !== "$") {
                re = re + "$";
              }
            } else {
              re = re + guard;
              if (re && re[0] !== "^") {
                re = "^" + re;
              }
            }
            return new RegExp(re);
          };
          addSnippet = function(s) {
            var map, old;
            if (!s.scope) {
              s.scope = scope || "_";
            }
            scope = s.scope;
            if (!snippetMap[scope]) {
              snippetMap[scope] = [];
              snippetNameMap[scope] = {};
            }
            map = snippetNameMap[scope];
            if (s.name) {
              old = map[s.name];
              if (old) {
                self.unregister(old);
              }
              map[s.name] = s;
            }
            snippetMap[scope].push(s);
            if (s.tabTrigger && !s.trigger) {
              if (!s.guard && /^\w/.test(s.tabTrigger)) {
                s.guard = "\\b";
              }
              s.trigger = lang.escapeRegExp(s.tabTrigger);
            }
            s.startRe = guardedRegexp(s.trigger, s.guard, true);
            s.triggerRe = new RegExp(s.trigger, "", true);
            s.endRe = guardedRegexp(s.endTrigger, s.endGuard, true);
            return s.endTriggerRe = new RegExp(s.endTrigger, "", true);
          };
          if (snippets.content) {
            return addSnippet(snippets);
          } else if (Array.isArray(snippets)) {
            return snippets.forEach(addSnippet);
          }
        };
        this.unregister = function(snippets, scope) {
          var removeSnippet, snippetMap, snippetNameMap;
          snippetMap = this.snippetMap;
          snippetNameMap = this.snippetNameMap;
          removeSnippet = function(s) {
            var i, map, nameMap;
            nameMap = snippetNameMap[s.scope || scope];
            if (nameMap && nameMap[s.name]) {
              delete nameMap[s.name];
              map = snippetMap[s.scope || scope];
              i = map != null ? map.indexOf(s) : void 0;
              if (i >= 0) {
                return map.splice(i, 1);
              }
            }
          };
          if (snippets.content) {
            return removeSnippet(snippets);
          } else if (Array.isArray(snippets)) {
            return snippets.forEach(removeSnippet);
          }
        };
        this.parseSnippetFile = function(str) {
          var e, guardRe, key, list, m, re, snippet, val;
          str = str.replace(/\r/, "");
          list = [];
          snippet = {};
          re = /^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm;
          while (m = re.exec(str)) {
            if (m[1]) {
              try {
                snippet = JSON.parse(m[1]);
                list.push(snippet);
              } catch (_error) {
                e = _error;
              }
            }
            if (m[4]) {
              snippet.content = m[4].replace(/^\t/gm, "");
              list.push(snippet);
              snippet = {};
            } else {
              key = m[2];
              val = m[3];
              switch (key) {
                case "regex":
                  guardRe = /\/((?:[^\/\\]|\\.)*)|$/g;
                  snippet.guard = guardRe.exec(val)[1];
                  snippet.trigger = guardRe.exec(val)[1];
                  snippet.endTrigger = guardRe.exec(val)[1];
                  snippet.endGuard = guardRe.exec(val)[1];
                  break;
                case "snippet":
                  snippet.tabTrigger = val.match(/^\S*/)[0];
                  if (!snippet.name) {
                    snippet.name = val;
                  }
                  break;
                default:
                  snippet[key] = val;
              }
            }
          }
          return list;
        };
        return this.getSnippetByName = function(name, editor) {
          var scope, snippetMap,
            _this = this;
          scope = editor && this.$getScope(editor);
          snippetMap = this.snippetNameMap;
          [scope, "_"].some(function(scope) {
            var snippet, snippets;
            snippets = snippetMap[scope];
            if (snippets) {
              snippet = snippets[name];
            }
            return !!snippet;
          });
          return snippet;
        };
      }).call(SnippetManager.prototype);
      TabstopManager = function(editor) {
        if (editor.tabstopManager) {
          return editor.tabstopManager;
        } else {
          editor.tabstopManager = this;
          this.$onChange = this.onChange.bind(this);
          this.$onChangeSelection = lang.delayedCall(this.onChangeSelection.bind(this)).schedule;
          this.$onChangeSession = this.onChangeSession.bind(this);
          this.$onAfterExec = this.onAfterExec.bind(this);
          return this.attach(editor);
        }
      };
      (function() {
        this.attach = function(editor) {
          this.index = -1;
          this.ranges = [];
          this.tabstops = [];
          this.selectedTabstop = null;
          this.editor = editor;
          this.editor.on("change", this.$onChange);
          this.editor.on("changeSelection", this.$onChangeSelection);
          this.editor.on("changeSession", this.$onChangeSession);
          this.editor.commands.on("afterExec", this.$onAfterExec);
          return this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
        };
        this.detach = function() {
          this.tabstops.forEach(this.removeTabstopMarkers, this);
          this.ranges = null;
          this.tabstops = null;
          this.selectedTabstop = null;
          this.editor.removeListener("change", this.$onChange);
          this.editor.removeListener("changeSelection", this.$onChangeSelection);
          this.editor.removeListener("changeSession", this.$onChangeSession);
          this.editor.commands.removeListener("afterExec", this.$onAfterExec);
          this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
          this.editor.tabstopManager = null;
          return this.editor = null;
        };
        this.onChange = function(e) {
          var changeRange, changedOutside, colDiff, end, endRow, i, isRemove, lineDif, r, ranges, start, startRow, ts, _i, _ref;
          changeRange = e.data.range;
          isRemove = e.data.action[0] === "r";
          start = changeRange.start;
          end = changeRange.end;
          startRow = start.row;
          endRow = end.row;
          lineDif = endRow - startRow;
          colDiff = end.column - start.column;
          if (isRemove) {
            lineDif = -lineDif;
            colDiff = -colDiff;
          }
          if (!this.$inChange && isRemove) {
            ts = this.selectedTabstop;
            changedOutside = !ts.some(function(r) {
              return comparePoints(r.start, start) <= 0 && comparePoints(r.end, end) >= 0;
            });
            if (changedOutside) {
              return this.detach();
            }
          }
          ranges = this.ranges;
          for (i = _i = 0, _ref = ranges.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
            r = ranges[i];
            if (r.end.row < start.row) {
              continue;
            }
            if (comparePoints(start, r.start) < 0 && comparePoints(end, r.end) > 0) {
              this.removeRange(r);
              i--;
              continue;
            }
            if (r.start.row === startRow && r.start.column > start.column) {
              r.start.column += colDiff;
            }
            if (r.end.row === startRow && r.end.column >= start.column) {
              r.end.column += colDiff;
            }
            if (r.start.row >= startRow) {
              r.start.row += lineDif;
            }
            if (r.end.row >= startRow) {
              r.end.row += lineDif;
            }
            if (comparePoints(r.start, r.end) > 0) {
              this.removeRange(r);
            }
          }
          if (!ranges.length) {
            return this.detach();
          }
        };
        this.updateLinkedFields = function() {
          var fmt, i, range, session, text, ts, _i, _ref;
          ts = this.selectedTabstop;
          if (ts.hasLinkedRanges) {
            this.$inChange = true;
            session = this.editor.session;
            text = session.getTextRange(ts.firstNonLinked);
            for (i = _i = _ref = ts.length; _ref <= 0 ? _i < 0 : _i > 0; i = _ref <= 0 ? ++_i : --_i) {
              range = ts[i];
              if (!range.linked) {
                continue;
              }
              fmt = exports.snippetManager.tmStrFormat(text, range.original);
              session.replace(range, fmt);
            }
            return this.$inChange = false;
          }
        };
        this.onAfterExec = function(e) {
          if (e.command && !e.command.readOnly) {
            return this.updateLinkedFields();
          }
        };
        this.onChangeSelection = function() {
          var anchor, containsAnchor, containsLead, i, isEmpty, lead, _i, _ref;
          if (this.editor) {
            lead = this.editor.selection.lead;
            anchor = this.editor.selection.anchor;
            isEmpty = this.editor.selection.isEmpty();
            for (i = _i = _ref = this.ranges.length; _ref <= 0 ? _i < 0 : _i > 0; i = _ref <= 0 ? ++_i : --_i) {
              if (this.ranges[i].linked) {
                continue;
              }
              containsLead = this.ranges[i].contains(lead.row, lead.column);
              containsAnchor = isEmpty || this.ranges[i].contains(anchor.row, anchor.column);
              if (containsLead && containsAnchor) {
                return;
              }
            }
            return this.detach();
          }
        };
        this.onChangeSession = function() {
          return this.detach();
        };
        this.tabNext = function(dir) {
          var index, max;
          max = this.tabstops.length - 1;
          index = this.index + (dir || 1);
          index = Math.min(Math.max(index, 0), max);
          this.selectTabstop(index);
          if (index === max) {
            return this.detach();
          }
        };
        this.selectTabstop = function(index) {
          var i, sel, ts, _i, _ref;
          ts = this.tabstops[this.index];
          if (ts) {
            this.addTabstopMarkers(ts);
          }
          this.index = index;
          ts = this.tabstops[this.index];
          if (ts != null ? ts.length : void 0) {
            this.selectedTabstop = ts;
            if (!this.editor.inVirtualSelectionMode) {
              sel = this.editor.multiSelect;
              sel.toSingleRange(ts.firstNonLinked.clone());
              for (i = _i = _ref = ts.length; _ref <= 0 ? _i < 0 : _i > 0; i = _ref <= 0 ? ++_i : --_i) {
                if (ts.hasLinkedRanges && ts[i].linked) {
                  continue;
                }
                sel.addRange(ts[i].clone(), true);
              }
            } else {
              this.editor.selection.setRange(ts.firstNonLinked);
            }
            return this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
          }
        };
        this.addTabstops = function(tabstops, start, end) {
          var arg, editor, i, p, ranges,
            _this = this;
          if (!tabstops[0]) {
            p = Range.fromPoints(end, end);
            moveRelative(p.start, start);
            moveRelative(p.end, start);
            tabstops[0] = [p];
            tabstops[0].index = 0;
          }
          i = this.index;
          arg = [i, 0];
          ranges = this.ranges;
          editor = this.editor;
          tabstops.forEach(function(ts) {
            var range, _i, _ref;
            for (i = _i = _ref = ts.length; _ref <= 0 ? _i < 0 : _i > 0; i = _ref <= 0 ? ++_i : --_i) {
              p = ts[i];
              range = Range.fromPoints(p.start, p.end || p.start);
              movePoint(range.start, start);
              movePoint(range.end, start);
              range.original = p;
              range.tabstop = ts;
              ranges.push(range);
              ts[i] = range;
              if (p.fmtString) {
                range.linked = true;
                ts.hasLinkedRanges = true;
              } else if (!ts.firstNonLinked) {
                ts.firstNonLinked = range;
              }
            }
            if (!ts.firstNonLinked) {
              ts.hasLinkedRanges = false;
            }
            arg.push(ts);
            return _this.addTabstopMarkers(ts);
          });
          arg.push(arg.splice(2, 1)[0]);
          return this.tabstops.splice.apply(this.tabstops, arg);
        };
        this.addTabstopMarkers = function(ts) {
          var session;
          session = this.editor.session;
          return ts.forEach(function(range) {
            if (!range.markerId) {
              return range.markerId = session.addMarker(range, "ace_snippet-marker", "text");
            }
          });
        };
        this.removeTabstopMarkers = function(ts) {
          var session;
          session = this.editor.session;
          return ts.forEach(function(range) {
            session.removeMarker(range.markerId);
            return range.markerId = null;
          });
        };
        this.removeRange = function(range) {
          var i;
          i = range.tabstop.indexOf(range);
          range.tabstop.splice(i, 1);
          i = this.ranges.indexOf(range);
          this.ranges.splice(i, 1);
          return this.editor.session.removeMarker(range.markerId);
        };
        this.keyboardHandler = new HashHandler();
        return this.keyboardHandler.bindKeys({
          "Tab": function(ed) {
            return ed.tabstopManager.tabNext(1);
          },
          "Shift-Tab": function(ed) {
            return ed.tabstopManager.tabNext(-1);
          },
          "Esc": function(ed) {
            return ed.tabstopManager.detach();
          },
          "Return": function(ed) {
            return false;
          }
        });
      }).call(TabstopManager.prototype);
      movePoint = function(point, diff) {
        if (point.row === 0) {
          point.column += diff.column;
        }
        return point.row += diff.row;
      };
      moveRelative = function(point, start) {
        if (point.row === start.row) {
          point.column -= start.column;
        }
        return point.row -= start.row;
      };
      require("./lib/dom").importCssString(".ace_snippet-marker {\n    -moz-box-sizing: border-box;\n    box-sizing: border-box;\n    background: rgba(194, 193, 208, 0.09);\n    border: 1px dotted rgba(211, 208, 235, 0.62);\n    position: absolute;\n}");
      return exports.snippetManager = new SnippetManager();
    });
    define('ace/autocomplete', ['require', 'exports', 'module', 'ace/keyboard/hash_handler', 'ace/autocomplete/popup', 'ace/autocomplete/util', 'ace/lib/event', 'ace/lib/lang', 'ace/snippets'], function(require, exports, module) {
      var AcePopup, Autocomplete, FilteredList, HashHandler, event, lang, snippetManager, util;
      HashHandler = require("./keyboard/hash_handler").HashHandler;
      AcePopup = require("./autocomplete/popup").AcePopup;
      util = require("./autocomplete/util");
      event = require("./lib/event");
      lang = require("./lib/lang");
      snippetManager = require("./snippets").snippetManager;
      Autocomplete = function() {
        var _this = this;
        this.keyboardHandler = new HashHandler();
        this.keyboardHandler.bindKeys(this.commands);
        this.blurListener = this.blurListener.bind(this);
        this.changeListener = this.changeListener.bind(this);
        this.mousedownListener = this.mousedownListener.bind(this);
        this.mousewheelListener = this.mousewheelListener.bind(this);
        return this.changeTimer = lang.delayedCall(function() {
          return _this.updateCompletions(true);
        });
      };
      (function() {
        this.$init = function() {
          var _this = this;
          this.popup = new AcePopup(document.body || document.documentElement);
          return this.popup.on("click", function(e) {
            _this.insertMatch();
            return e.stop();
          });
        };
        this.openPopup = function(editor, keepPopupPosition) {
          var lineHeight, pos, rect, renderer;
          if (!this.popup) {
            this.$init();
          }
          ace.config._dispatchEvent('desc', {
            ident: this.completions.filtered[0].caption
          });
          this.popup.setData(this.completions.filtered);
          renderer = editor.renderer;
          if (!keepPopupPosition) {
            lineHeight = renderer.layerConfig.lineHeight;
            pos = renderer.$cursorLayer.getPixelPosition(null, true);
            rect = editor.container.getBoundingClientRect();
            pos.top += rect.top - renderer.layerConfig.offset;
            pos.left += rect.left;
            pos.left += renderer.$gutterLayer.gutterWidth;
            this.popup.show(pos, lineHeight);
          }
          return renderer.updateText();
        };
        this.detach = function() {
          var _ref;
          this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
          this.editor.removeEventListener("changeSelection", this.changeListener);
          this.editor.removeEventListener("blur", this.changeListener);
          this.editor.removeEventListener("mousedown", this.changeListener);
          this.changeTimer.cancel();
          if ((_ref = this.popup) != null) {
            _ref.hide();
          }
          return this.activated = false;
        };
        this.changeListener = function(e) {
          if (this.activated) {
            return this.changeTimer.schedule();
          } else {
            return this.detach();
          }
        };
        this.blurListener = function() {
          if (document.activeElement !== this.editor.textInput.getElement()) {
            return this.detach();
          }
        };
        this.mousedownListener = function(e) {
          return this.detach();
        };
        this.mousewheelListener = function(e) {
          return this.detach();
        };
        this.goTo = function(where) {
          var max, row;
          row = this.popup.getRow();
          max = this.popup.session.getLength() - 1;
          switch (where) {
            case "up":
              row = (row <= 0 ? max : row - 1);
              break;
            case "down":
              row = (row >= max ? 0 : row + 1);
              break;
            case "start":
              row = 0;
              break;
            case "end":
              row = max;
          }
          return this.popup.setRow(row);
        };
        this.insertMatch = function(data) {
          var range, _ref;
          this.detach();
          if (data == null) {
            data = this.popup.getData(this.popup.getRow());
          }
          if (!data) {
            return false;
          }
          if ((_ref = data.completer) != null ? _ref.insertMatch : void 0) {
            return data.completer.insertMatch(this.editor);
          } else {
            if (this.completions.filterText) {
              range = this.editor.selection.getRange();
              range.start.column -= this.completions.filterText.length;
              this.editor.session.remove(range);
            }
            if (data.snippet) {
              return snippetManager.insertSnippet(this.editor, data.snippet);
            } else {
              return this.editor.insert(data.value || data);
            }
          }
        };
        this.commands = {
          "Up": function(editor) {
            return editor.completer.goTo("up");
          },
          "Down": function(editor) {
            return editor.completer.goTo("down");
          },
          "Ctrl-Up|Ctrl-Home": function(editor) {
            return editor.completer.goTo("start");
          },
          "Ctrl-Down|Ctrl-End": function(editor) {
            return editor.completer.goTo("end");
          },
          "Esc": function(editor) {
            return editor.completer.detach();
          },
          "Space": function(editor) {
            editor.completer.detach();
            return editor.insert(" ");
          },
          "Return": function(editor) {
            return editor.completer.insertMatch();
          },
          "Shift-Return": function(editor) {
            return editor.completer.insertMatch(true);
          },
          "Tab": function(editor) {
            return editor.completer.insertMatch();
          },
          "PageUp": function(editor) {
            return editor.completer.popup.gotoPageDown();
          },
          "PageDown": function(editor) {
            return editor.completer.popup.gotoPageUp();
          }
        };
        this.gatherCompletions = function(editor, callback) {
          var line, matches, pos, prefix, session;
          session = editor.getSession();
          pos = editor.getCursorPosition();
          line = session.getLine(pos.row);
          prefix = util.retrievePrecedingIdentifier(line, pos.column);
          matches = [];
          util.parForEach(editor.completers, function(completer, next) {
            return completer.getCompletions(editor, session, pos, prefix, function(err, results) {
              if (!err) {
                matches = matches.concat(results);
              }
              return next();
            });
          }, function() {
            matches.sort(function(a, b) {
              return b.score - a.score;
            });
            return callback(null, {
              prefix: prefix,
              matches: matches
            });
          });
          return true;
        };
        this.showPopup = function(editor) {
          if (this.editor) {
            this.detach();
          }
          this.activated = true;
          this.editor = editor;
          if (editor.completer !== this) {
            if (editor.completer) {
              editor.completer.detach();
            }
            editor.completer = this;
          }
          editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
          editor.on("changeSelection", this.changeListener);
          editor.on("blur", this.blurListener);
          editor.on("mousedown", this.mousedownListener);
          return this.updateCompletions();
        };
        this.updateCompletions = function(keepPopupPosition) {
          var _this = this;
          return this.gatherCompletions(this.editor, function(err, results) {
            var matches;
            matches = results && results.matches;
            if (matches != null ? matches.length : void 0) {
              _this.completions = new FilteredList(matches);
              _this.completions.setFilter(results.prefix);
              return _this.openPopup(_this.editor, keepPopupPosition);
            } else {
              return _this.detach();
            }
          });
        };
        return this.cancelContextMenu = function() {
          var stop,
            _this = this;
          stop = function(e) {
            _this.editor.off("nativecontextmenu", stop);
            if (e != null ? e.domEvent : void 0) {
              return event.stopEvent(e.domEvent);
            }
          };
          setTimeout(stop, 10);
          return this.editor.on("nativecontextmenu", stop);
        };
      }).call(Autocomplete.prototype);
      Autocomplete.startCommand = {
        name: "startAutocomplete",
        exec: function(editor) {
          if (!editor.completer) {
            editor.completer = new Autocomplete();
          }
          editor.completer.showPopup(editor);
          editor.completer.cancelContextMenu();
          return editor.getSession().insert(editor.getCursorPosition(), '<');
        },
        bindKey: "<"
      };
      FilteredList = function(array, mutateData) {
        this.all = array;
        this.filtered = array.concat();
        return this.filterText = "";
      };
      (function() {
        return this.setFilter = function(str) {
          return this.filterText = str;
        };
      }).call(FilteredList.prototype);
      exports.Autocomplete = Autocomplete;
      exports.FilteredList = FilteredList;
      return exports;
    });
    define('ace/autocomplete/popup', ['require', 'exports', 'module', 'ace/edit_session', 'ace/virtual_renderer', 'ace/editor', 'ace/range', 'ace/lib/event', 'ace/lib/lang', 'ace/lib/dom'], function(require, exports, module) {
      var $singleLineEditor, AcePopup, EditSession, Editor, Range, Renderer, dom, event, lang;
      EditSession = require("ace/edit_session").EditSession;
      Renderer = require("ace/virtual_renderer").VirtualRenderer;
      Editor = require("ace/editor").Editor;
      Range = require("ace/range").Range;
      event = require("ace/lib/event");
      lang = require("ace/lib/lang");
      dom = require("ace/lib/dom");
      $singleLineEditor = function(el) {
        var editor, renderer;
        renderer = new Renderer(el);
        renderer.$maxLines = 4;
        editor = new Editor(renderer);
        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);
        editor.renderer.setShowGutter(false);
        editor.renderer.setHighlightGutterLine(false);
        editor.$mouseHandler.$focusWaitTimout = 0;
        return editor;
      };
      AcePopup = function(parentNode) {
        var bgTokenizer, el, hideHoverMarker, hoverMarker, noop, popup;
        el = dom.createElement("div");
        popup = new $singleLineEditor(el);
        if (parentNode) {
          parentNode.appendChild(el);
        }
        el.style.display = "none";
        popup.renderer.content.style.cursor = "default";
        popup.renderer.setStyle("ace_autocomplete");
        noop = function() {};
        popup.focus = noop;
        popup.$isFocused = true;
        popup.renderer.$cursorLayer.restartTimer = noop;
        popup.renderer.$cursorLayer.element.style.opacity = 0;
        popup.renderer.$maxLines = 8;
        popup.renderer.$keepTextAreaAtCursor = false;
        popup.setHighlightActiveLine(true);
        popup.session.highlight("");
        popup.session.$searchHighlight.clazz = "ace_highlight-marker";
        popup.on("mousedown", function(e) {
          var pos;
          pos = e.getDocumentPosition();
          popup.moveCursorToPosition(pos);
          popup.selection.clearSelection();
          return e.stop();
        });
        hoverMarker = new Range(-1, 0, -1, Infinity);
        hoverMarker.id = popup.session.addMarker(hoverMarker, "ace_line-hover", "fullLine");
        popup.on("mousemove", function(e) {
          var row;
          row = e.getDocumentPosition().row;
          hoverMarker.start.row = hoverMarker.end.row = row;
          return popup.session._emit("changeBackMarker");
        });
        hideHoverMarker = function() {
          hoverMarker.start.row = hoverMarker.end.row = -1;
          return popup.session._emit("changeBackMarker");
        };
        event.addListener(popup.container, "mouseout", hideHoverMarker);
        popup.on("hide", hideHoverMarker);
        popup.on("changeSelection", hideHoverMarker);
        popup.on("mousewheel", function(e) {
          return setTimeout(function() {
            return popup._signal("mousemove", e);
          });
        });
        popup.session.doc.getLength = function() {
          return popup.data.length;
        };
        popup.session.doc.getLine = function(i) {
          var data;
          data = popup.data[i];
          if (typeof data === "string") {
            return data;
          } else {
            return (data && data.value) || "";
          }
        };
        bgTokenizer = popup.session.bgTokenizer;
        bgTokenizer.$tokenizeRow = function(i) {
          var data, maxW, tokens;
          data = popup.data[i];
          tokens = [];
          if (!data) {
            return tokens;
          }
          if (typeof data === "string") {
            data = {
              value: data
            };
          }
          if (!data.caption) {
            data.caption = data.value;
          }
          tokens.push({
            type: data.className || "",
            value: data.caption
          });
          if (data.meta) {
            maxW = popup.renderer.$size.scrollerWidth / popup.renderer.layerConfig.characterWidth;
            if (data.meta.length + data.caption.length < maxW - 2) {
              tokens.push({
                type: "rightAlignedText",
                value: data.meta
              });
            }
          }
          return tokens;
        };
        bgTokenizer.$updateOnChange = noop;
        popup.session.$computeWidth = function() {
          return this.screenWidth = 0;
        };
        popup.data = [];
        popup.setData = function(list) {
          popup.data = list || [];
          return popup.setValue(lang.stringRepeat("\n", list.length), -1);
        };
        popup.getData = function(row) {
          return popup.data[row];
        };
        popup.getRow = function() {
          var line;
          line = this.getCursorPosition().row;
          if (line === 0 && !this.getHighlightActiveLine()) {
            line = -1;
          }
          return line;
        };
        popup.setRow = function(line) {
          popup.setHighlightActiveLine(line !== -1);
          popup.selection.clearSelection();
          popup.moveCursorTo(line, 0 || 0);
          return ace.config._dispatchEvent('desc', {
            ident: popup.getData(line).caption
          });
        };
        popup.setHighlight = function(re) {
          popup.session.highlight(re);
          return popup.session._emit("changeFrontMarker");
        };
        popup.hide = function() {
          this.container.style.display = "none";
          this._signal("hide");
          return ace.config._signal("desc:clear");
        };
        popup.show = function(pos, lineHeight) {
          el = this.container;
          if (pos.top > window.innerHeight / 2 + lineHeight) {
            el.style.top = "";
            el.style.bottom = window.innerHeight - pos.top + "px";
          } else {
            pos.top += lineHeight;
            el.style.top = pos.top + "px";
            el.style.bottom = "";
          }
          el.style.left = pos.left + "px";
          el.style.display = "";
          this.renderer.$textLayer.checkForSizeChanges();
          return this._signal("show");
        };
        return popup;
      };
      dom.importCssString(".ace_autocomplete.ace-tm .ace_marker-layer .ace_active-line {\n    background-color: #abbffe;\n}\n.ace_autocomplete.ace-tm .ace_line-hover {\n    border: 1px solid #abbffe;\n    position: absolute;\n    background: rgba(233,233,253,0.4);\n    z-index: 2;\n    margin-top: -1px;\n}\n.ace_rightAlignedText {\n    color: gray;\n    display: inline-block;\n    position: absolute;\n    right: 4px;\n    text-align: right;\n    z-index: -1;\n}\n.ace_autocomplete {\n    width: 200px;\n    height: 120px;\n    z-index: 200000;\n    background: #f8f8f8;\n    border: 1px lightgray solid;\n    position: fixed;\n    box-shadow: 2px 3px 5px rgba(0,0,0,.2);\n}");
      return exports.AcePopup = AcePopup;
    });
    define('ace/autocomplete/util', ['require', 'exports', 'module'], function(require, exports, module) {
      var ID_REGEX;
      exports.parForEach = function(array, fn, callback) {
        var arLength, completed, i, _i, _results;
        completed = 0;
        arLength = array.length;
        if (arLength === 0) {
          callback();
        }
        _results = [];
        for (i = _i = 0; 0 <= arLength ? _i <= arLength : _i >= arLength; i = 0 <= arLength ? ++_i : --_i) {
          _results.push(fn(array[i], function(result, err) {
            completed++;
            if (completed === arLength) {
              return callback(result, err);
            }
          }));
        }
        return _results;
      };
      ID_REGEX = /[a-zA-Z_0-9\$-]/;
      exports.retrievePrecedingIdentifier = function(text, pos, regex) {
        var buf, i, _i, _ref;
        regex = regex || ID_REGEX;
        buf = [];
        for (i = _i = _ref = pos - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
          if (regex.test(text[i])) {
            buf.push(text[i]);
          } else {
            break;
          }
        }
        return buf.reverse().join("");
      };
      return exports.retrieveFollowingIdentifier = function(text, pos, regex) {
        var buf, i, _i, _ref;
        regex = regex || ID_REGEX;
        buf = [];
        for (i = _i = pos, _ref = text.length; pos <= _ref ? _i < _ref : _i > _ref; i = pos <= _ref ? ++_i : --_i) {
          if (regex.test(text[i])) {
            buf.push(text[i]);
          } else {
            break;
          }
        }
        return buf;
      };
    });
    define('ace/autocomplete/text_completer', ['require', 'exports', 'module', 'ace/range'], function(require, exports, module) {
      var Range, filterPrefix, getWordIndex, splitRegex, wordDistance;
      Range = require("ace/range").Range;
      splitRegex = /[^a-zA-Z_0-9\$\-]+/;
      getWordIndex = function(doc, pos) {
        var textBefore;
        textBefore = doc.getTextRange(Range.fromPoints({
          row: 0,
          column: 0
        }, pos));
        return textBefore.split(splitRegex).length - 1;
      };
      filterPrefix = function(prefix, words) {
        var i, results, _i, _ref;
        results = [];
        for (i = _i = 0, _ref = words.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (words[i].lastIndexOf(prefix, 0) === 0) {
            results.push(words[i]);
          }
        }
        return results;
      };
      wordDistance = function(doc, pos) {
        var currentWord, prefixPos, wordScores, words;
        prefixPos = getWordIndex(doc, pos);
        words = doc.getValue().split(splitRegex);
        wordScores = Object.create(null);
        currentWord = words[prefixPos];
        words.forEach(function(word, idx) {
          var distance, score;
          if (word && word !== currentWord) {
            distance = Math.abs(prefixPos - idx);
            score = words.length - distance;
            return wordScores[word] = wordScores[word] ? Math.max(score, wordScores[word]) : score;
          }
        });
        return wordScores;
      };
      return exports.getCompletions = function(editor, session, pos, prefix, callback) {
        var wordList, wordScore;
        wordScore = wordDistance(session, pos, prefix);
        wordList = filterPrefix(prefix, Object.keys(wordScore));
        return callback(null, wordList.map(function(word) {
          return {
            name: word,
            value: word,
            score: wordScore[word],
            meta: "local"
          };
        }));
      };
    });
  }

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
            if (e.message.split(/\n/)[0] !== "Text data outside of root node.") {
              callbacks.error.call(_this, e);
            }
            return parser.resume();
          };
        } else {
          parser.onerror = function(e) {
            if (e.message.split(/\n/)[0] !== "Text data outside of root node.") {
              _this.validationError((e.message.split(/\n/))[0]);
            }
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
