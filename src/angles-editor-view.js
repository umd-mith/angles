/*
 * Events managed in the ACEEditorView.dispather:
 *
 *   editor:change - an editor change event
 *   editor:reload - force the editor to reload content from the model
 *   editor:error  - an error reported by the editor or wrapper
 *
 *   document:switch  - a request to change the document the editor is editing
 *   document:save    - a request to save the document currently in the editor
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
 *
 * To provide different storage for the collection, replace 
 * Angles.XMLDocumentList (here, we're using local storage):
 *
 *  Angles.XMLDocumentList = Backbone.Collection.extend({
 *    mode: Angles.XMLDocument,
 *    localStorage: new Backbone.LocalStorage("SomeCollection")
 *  });
 *
 */

var Angles = {};
(function(Angles,_,Backbone,ace) {
  var ACEEditor;

  // XMLDocument
  Angles.XMLDocument = Backbone.Model.extend({
    defaults: {
      "name": "untitled",
      "content": ""
    },
    validate: function(attrs) {
      //console.log(attrs);
      //if(attrs.name === undefined) {
      //  return "document must have a name";
      //}
      //if(attrs.name =~ /^\s*$/) {
      //  return "document must have a name";
      //}
    }
  });

  // XMLDocument List
  Angles.XMLDocumentList = Backbone.Collection.extend({
    model: Angles.XMLDocument
  });

  // Notification
  Angles.Notification = Backbone.Model.extend({
    defaults: {
      "type": "",
      "info": "",
      "message": "",
      "resource": "",
      "location": {"column":-1, "row":-1}
    }
  });

  // Notification List
  Angles.NotificationList = Backbone.Collection.extend({
    model: Angles.Notification
  });

  /*
   * This file selector will list the documents in the Angles.XMLDocumentList
   * collection and allow selection of a document.
   *
   * Fires a document:change event when the selected file is to be loaded
   * into the editor. The event's data parameter is the model object from
   * which to get the content.
   *
   * options:
   *
   * * el: element into which this view should be rendered
   * * dispatcher: dispatcher object to use for events
   * * collection: collection of models from which a model should be selected
   *
   * template classes:
   *   .file-list - list of files - new files are appended to the end
   *   .new-file  - element that triggers a new file dialog
   *
   *
   */
  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g,
    escape: /\{\{-(.+?)\}\}/g
  };

  Angles.FileSelector = Backbone.View.extend({
    template: _.template($('#file-list-template').html()),
    initialize: function() {
    },
    render: function() {
      this.$el.html(this.template({}));
      this.collection.each(this.addOne, this);
      return this;
    },
    addOne: function(model) {
      var view = new Angles.FileSelectorRow({model: model});
      this.$("form").append(view.render().$el);
    }
  });

  Angles.FileSelectorRow = Backbone.View.extend({
    template: _.template($('#file-item-template').html()),
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  Angles.NotificationTable = Backbone.View.extend({
    template: _.template($('#notification-list-template').html()),
    initialize: function() {
    },
    render: function() {
      this.$el.html(this.template({}));
      this.listenTo(this.collection, 'add', this.addOne);
      return this;
    },
    addOne: function(model) {
      var view = new Angles.NotificationRow({model: model});
      this.$("table").append(view.render().$el);
    }
  });

  Angles.NotificationRow = Backbone.View.extend({
    template: _.template($('#notification-template tbody').html()),
    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON().model));
      return this;
    }
  });

  /*
   * We intend ACEEditorView to be a singleton class for a particular area
   * on the page - not to be instantiated for each document in the collection.
   *
   * You may pass a dispatcher object into the initializer if you want to
   * use one from another application to allow integration.
   */
  Angles.ACEEditorView = Backbone.View.extend({
    tagName: "div",
    className: "ace-editor",

    initialize: function() {
      var annotations = [];
      var me = this;
      dispatcher = this.options.dispatcher || _.clone(Backbone.Events);
      this.dispatcher = dispatcher;
      dispatcher.on("editor:reload", function() {
        me.clearAnnotations();
        me.setContent();
      });
      dispatcher.on("document:save", function() {
        me.saveModel();
      });
      dispatcher.on("validation:start", function() {
        annotations = [];
        //me.clearNotifications();
      });
      dispatcher.on("validation:error", function(e) {
        annotations.push(e);
        var n = {
          type: "validation",
          info: e.type,
          message: e.text,
          location: {row: e.row, column: e.column}
        }
        me.dispatcher.trigger('notification:push', n);
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
      dispatcher.on("document:switch", function(e) {
        me.setModel(e);
      });
    },

    render: function() {
      var me = this;
      this.$editor = ace.edit(this.el);
      this.$editor.getSession().on('change', function(e) {
        me.dispatcher.trigger('editor:change', e);
      });
      this.$editor.getSession().setMode("ace/mode/xml");
      return this;
    },

    setContent: function() {
      this.$editor.setValue(this.model.get('content'));
    },

    getContent: function() {
      return this.$editor.getValue();
    },

    getDocument: function() {
      me = this;
      return {
        getValue: function() { return me.$editor.getValue(); },
        getLength: function() { return me.$editor.session.getDocument().getLength(); },
        getLine: function(n) { return me.$editor.session.getDocument().getLine(n); }
      };
    },

    saveModel: function() {
      this.model.set('content', this.getContent());
      this.model.save({
        success: function() {
          me.model = m;
          me.dispatcher.trigger("editor:reload");
        },
        error: function() {
          me.dispatcher.trigger("editor:error", "Unable to change document");
        },
      });
    },

    setModel: function(m) {
      this.model = m;
      this.dispatcher.trigger("editor:reload");
    },

    clearAnnotations: function() { this.$editor.session.clearAnnotations(); },

    setMode: function(m) { this.$editor.getSession().setMode(m); },

    // clearNotifications: function() { this.$editor.session.notifications = null; },
  });

}(Angles,_,Backbone,ace));
