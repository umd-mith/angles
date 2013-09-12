#
# Events managed in the ACEEditorView.dispather:
#
#   editor:change - an editor change event
#   editor:reload - force the editor to reload content from the model
#   editor:error  - an error reported by the editor or wrapper
#
#   document:switch  - a request to change the document the editor is editing
#   document:save    - a request to save the document currently in the editor
#
#   validation:start - notice that validation is beginning
#   validation:end   - notice that validation has finished
#   validation:error - the report of a validation error
#
# If you replace the Angles.ACEEditorView with a different view to wrap
# a different editor, you will need to implement a getDocument() function
# that returns the same properties as the one here, but with data from
# your editor instance. This lets the validator not depend on the ACE
# API.
#
# To provide different storage for the collection, replace 
# Angles.XMLDocumentList (here, we're using local storage):
#
#  Angles.XMLDocumentList = Backbone.Collection.extend({
#    mode: Angles.XMLDocument,
#    localStorage: new Backbone.LocalStorage("SomeCollection")
#  });
#

window.Angles = {}
((Angles,_,Backbone,ace) ->
  ACEEditor = null

  # XMLDocument
  class Angles.XMLDocument extends Backbone.Model
    defaults:
      "name"   : "untitled"
      "content": ""

    validate: (attrs) ->
      # console.log(attrs);
      #if(attrs.name === undefined) {
      #  return "document must have a name";
      #}
      #if(attrs.name =~ /^\s*$/) {
      #  return "document must have a name";
      #}

  # XMLDocument List
  class Angles.XMLDocumentList extends Backbone.Collection
    model: Angles.XMLDocument

  # Notification
  class Angles.Notification extends Backbone.Model
    defaults:
      "type"    : ""
      "info"    : ""
      "message" : ""
      "resource": ""
      "location": 
        "column": -1
        "row"   : -1

  # Notification List
  class Angles.NotificationList extends Backbone.Collection
    model: Angles.Notification

  #
  # This file selector will list the documents in the Angles.XMLDocumentList
  # collection and allow selection of a document.
  #
  # Fires a document:change event when the selected file is to be loaded
  # into the editor. The event's data parameter is the model object from
  # which to get the content.
  #
  # options:
  #
  # * el: element into which this view should be rendered
  # * dispatcher: dispatcher object to use for events
  # * collection: collection of models from which a model should be selected
  #
  # template classes:
  #   .file-list - list of files - new files are appended to the end
  #   .new-file  - element that triggers a new file dialog
  #
  #
  # _.templateSettings =
  #   interpolate: /\{\{(.+?)\}\}/g
  #   escape: /\{\{-(.+?)\}\}/g

  class Angles.FileSelector extends Backbone.View
    template: _.template $('#file-list-template').html()

    initialize: ->

    render: ->
      @$el.html @template {}
      @collection.each @addOne, @
      @

    addOne: (model) ->
      view = new Angles.FileSelectorRow
        model: model
      @$("form").append view.render().$el

  class Angles.FileSelectorRow extends Backbone.View
    template: _.template $('#file-item-template').html()

    initialize: ->
      @listenTo @model, 'change', @render
      @listenTo @model, 'destroy', @remove

    render: ->
      @$el.html @template @model.toJSON()
      @

  class Angles.NotificationTable extends Backbone.View
    template: _.template $('#notification-list-template').html()

    initialize: ->

    render: ->
      @$el.html @template {}
      @listenTo @collection, 'add', @addOne
      @

    addOne: (model) ->
      view = new Angles.NotificationRow
        model: model
      @$("table").append view.render().$el

  class Angles.NotificationRow extends Backbone.View
    template: _.template $('#notification-template').html()

    initialize: ->
      @listenTo @model, 'change', @render
      @listenTo @model, 'destroy', @remove

    render: ->
      @$el.html @template @model.toJSON()
      @

  #
  # We intend ACEEditorView to be a singleton class for a particular area
  # on the page - not to be instantiated for each document in the collection.
  #
  # You may pass a dispatcher object into the initializer if you want to
  # use one from another application to allow integration.
  #

  class Angles.ACEEditorView extends Backbone.View
    tagName: "div"
    className: "ace-editor"

    initialize: ->
      annotations = []
      dispatcher = @options.dispatcher or _.clone Backbone.Events
      @dispatcher = dispatcher

      dispatcher.on "editor:reload", =>
        @clearAnnotations()
        @setContent()

      dispatcher.on "document:save", => @saveModel()

      dispatcher.on "validation:start", =>
        annotations = [];
        @dispatcher.trigger 'notification:clear'

      dispatcher.on "validation:error", (e) =>
        annotations.push(e)
        n =
          type: "validation"
          info: e.type
          message: e.text
          location:
            row: e.row
            column: e.column
        @dispatcher.trigger 'notification:push', n
      
      dispatcher.on "validation:end", =>
        select = @$editor.getSelection()

        @clearAnnotations()
        @$editor.focus()
        if annotations.length > 0
          @$editor.gotoLine annotations[0].row+1, annotations[0].column, true
          select.selectWordLeft()
          select.selectWordLeft()

        @$editor.session.setAnnotations(annotations)

      dispatcher.on "document:switch", (e) => @setModel(e)

    render: ->
      @$editor = ace.edit(@el);
      @$editor.getSession().on 'change', (e) => @dispatcher.trigger 'editor:change', e
      @$editor.getSession().setMode "ace/mode/xml"

      # Load ace modules #

      # ext_language_tools for autocompletion
      ace.config.set("basePath", "../deps/")      
      ace.config.loadModule 'ext/angles', () =>

        @$editor.setOptions
          enableODDAutocompletion: true

        completer = 
          getCompletions: (editor, session, pos, prefix, callback) => 
            if @$context?
              context = this.$context

              _findParent = (row, column) ->
                openTags = []
                closedTags = []
                isOpeningTag = false
                isClosingTag = false

                finalTag = ''

                _scanRow = (row, column) ->            
                  curColumn = 0
                  tokens = editor.getSession().getTokens(row)

                  for token in tokens
                    curColumn += token.value.length;
                    if curColumn > column
                      if token.type == "meta.tag.punctuation.begin" and token.value == "<"
                        isOpeningTag = true
                      else if token.type == "meta.tag.punctuation.begin" and token.value == "</"
                        isClosingTag = true
                      else if token.type == "meta.tag.punctuation.end" and token.value == "/>"
                        openTags.pop()
                        isOpeningTag = false
                        isClosingTag = false
                      else if token.type == "meta.tag.name" and isOpeningTag
                        openTags.push(token.value)
                        isOpeningTag = false
                      else if token.type == "meta.tag.name" && isClosingTag
                        closedTags.push(token.value)
                        isClosingTag = false

                  if closedTags.length == 0 
                    _scanRow(row+1, 0)
                  else if closedTags.length == 1 and openTags.length == 0
                    finalTag = closedTags[closedTags.length-1]
                  else  
                    i = openTags.length 
                    while i--
                      if closedTags[closedTags.length-1] == openTags[i]
                        openTags.splice(i)
                        closedTags.pop()
                        _scanRow(row+1, 0)
                      else 
                        finalTag = closedTags[closedTags.length-1]

                _scanRow(row, column)
                finalTag

              pos = editor.getCursorPosition()              
              ident = _findParent(pos.row, pos.column)
              completions = []

              children = context.getChildrenOf(ident);

              for c in children
                completions.push
                  # name: c.ident,
                  # value: "<#{c.ident}></#{c.ident}>",
                  # score: 0,
                  caption: c.ident,
                  snippet: "#{c.ident}></#{c.ident}>",
                  meta: "element"

              if completions.length > 0
                callback null, completions
            else
              0 #console.log 'Context Help component not loaded'  

        @$editor.completers = [completer]

        ace.config.on "desc", (e) =>
          @dispatcher.trigger("editor:context", e.ident)

        ace.config.on "desc:clear", (e) =>
          @dispatcher.trigger 'notification:clear'

      @

    setContent: -> @$editor.setValue @model.get('content')


    getContent: -> @$editor.getValue()

    getDocument: ->
      getValue: => @$editor.getValue()
      getLength: => @$editor.session.getDocument().getLength()
      getLine: (n) => @$editor.session.getDocument().getLine(n)

    saveModel: ->
      @model.set 'content', @getContent()
      @model.save
        success: => @dispatcher.trigger "editor:reload"
        error: => @dispatcher.trigger "editor:error", "Unable to change document"

    setModel: (m) ->
      @model = m;
      @dispatcher.trigger "editor:reload"

    clearAnnotations: -> @$editor.session.clearAnnotations()

    setMode: (m) -> @$editor.getSession().setMode(m)

    # clearNotifications: function() { this.$editor.session.notifications = null; },

)(window.Angles,_,Backbone,ace)
