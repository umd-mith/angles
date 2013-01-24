/*
 * Events managed in the ACEEditorView.dispather:
 *
 *   ace:change - an ace editor change event
 *   ace:reload - force the ace editor to reload content from the model
 *   ace:error  - an error reported by the ace editor or wrapper
 *
 *   document:change  - a request to change the document the ace editor is editing
 *
 *   validation:start - notice that validation is beginning
 *   validation:end   - notice that validation has finished
 *   validation:error - the report of a validation error
 *
 * If you replace the Angles.ACEEditorView with a different view to wrap
 * a different editor, you will need to implement a getDocument() function
 * that returns the same properties as the one here, but with data from
 * your editor instance. This lets the validator not depend on the ACE
 * API.
 */

var Angles = {};
(function(Angles,_,Backbone,ace) {
  var XMLDocument, ACEEditor;

  // XMLDocument
  Angles.XMLDocument = XMLDocument = Backbone.Model.extend({
    defaults: {
      "name": "untitled",
      "content": ""
    },
    validate: function(attrs) {
      if(attrs.name === undefined) {
        return "document must have a name";
      }
      if(attrs.name =~ /^\s*$/) {
        return "document must have a name";
      }
    }
  });

  // XMLDocument List
  Angles.XMLDocumentList = Backbone.Collection.extend({
    model: XMLDocument
  });

  /*
   * We intent ACEEditorView to be a singleton class for a particular area
   * on the page - not to be instantiated for each document in the collection.
   */
  Angles.ACEEditorView = Backbone.View.extend({
    tagName: "div",
    className: "ace-editor",

    initialize: function() {
      var annotations = [];
      var me = this;
      var dispatcher = _.clone(Backbone.Events);
      this.dispatcher = dispatcher;
      dispatcher.on("ace:reload", function() {
        me.clearAnnotations();
        me.setContent();
      });
      dispatcher.on("validation:start", function() {
        annotations = [];
      });
      dispatcher.on("validation:error", function(e) {
        annotations.push(e);
      });
      dispatcher.on("validation:end", function() {
        var select = me.$editor.getSelection();

        me.clearAnnotations();
        me.$editor.focus();
        if(annotations.length > 0) {
          me.$editor.gotoLine(annotations[0].row+1,annotations[0].column, true);
          select.selectWordLeft();
          select.selectWordLeft();
        }
        me.$editor.session.setAnnotations(annotations);
      });
      dispatcher.on("document:change", function(m) {
        me.setModel(e);
      });
    },

    render: function() {
      var me = this;
      this.$editor = ace.edit(this.el);
      this.$editor.getSession().on('change', function(e) {
        me.dispatcher.trigger('ace:change', e);
      });
      this.$editor.getSession().setMode("ace/mode/xml");
      return this;
    },

    setContent: function() {
      this.$editor.setValue(this.model.get('content'));
    },

    getDocument: function() {
      me = this;
      return {
        getValue: function() { return me.$editor.getValue(); },
        getLength: function() { return me.$editor.session.getDocument().getLength(); },
        getLine: function(n) { return me.$editor.session.getDocument().getLine(n); }
      };
    },

    setModel: function(m) {
      var me = this;
      if(this.model) {
        this.model.save({
          success: function() {
            me.model = m;
            me.dispatcher.trigger("ace:reload");
          },
          error: function() {
            me.dispatcher.trigger("ace:error", "Unable to change document");
          },
        });
      }
      else {
        me.model = m;
        me.dispatcher.trigger("ace:reload");
      }
    },

    clearAnnotations: function() { this.$editor.session.clearAnnotations(); },

    setMode: function(m) { this.$editor.getSession().setMode(m); },
  });

}(Angles,_,Backbone,ace));
