#
#  For example:
#    var parser = new SAXParser({
#      startDocument: function() { ... },
#      endDocument: function() { ... },
#      startElement: function(node) { ... },
#      endElement: function(node) { ... },
#      characters: function(text) { ... },
#      comment: function(comment) { ... }
#    });
#
#    parser.parse(editor);
#

# we expect to have the sax-js library available
class Angles.SAXParser
  constructor: (callbacks) ->
    @reset = ->
      parser = sax.parser true,
        xmlns: true
        noscript: true
        position: true
      
      if callbacks.error?
        parser.onerror = (e) =>
          callbacks.error.call @, e
          parser.resume()
      else
        parser.onerror = (e) =>
          @validationError (e.message.split(/\n/))[0] + "."
          parser.resume()

      if callbacks.characters?
        parser.ontext = (t) => callbacks.characters.call @, t

      if callbacks.startElement?
        parser.onopentag = (node) => callbacks.startElement.call @, node
 
      if callbacks.endElement?
        parser.onclosetag = (name) => callbacks.endElement.call @, name

      if callbacks.comment?
        parser.oncomment = (comment) => callbacks.comment.call @, comment

      if callbacks.startCdata?
        parser.onopencdata = => callbacks.startCdata.call @

      if callbacks.cdata?
        parser.oncdata = (cdata) => callbacks.cdata.call @, cdata

      if callbacks.endCdata?
        parser.onclosecdata = => callbacks.endCdata.call @

      if callbacks.endDocument?
        parser.onend = => callbacks.endDocument.call @

      if callbacks.startDocument?
        parser.onstart = => callbacks.startDocument.call @
      else
        parser.onstart = ->

      @$parser = parser
      @$errors = []

  parse: (doc) ->
    @reset()
    parser = @$parser
    n = doc.getLength()

    parser.onstart()

    for i in [0..n]
      parser.write doc.getLine(i)+"\n"
    parser.close()

    if @validated()
      true
    else
      false

  validationError: (text, type) ->
    parser = @$parser
    @$errors.push
      text: text
      row: parser.line
      column: parser.column
      type: if type? then type else "error"

  validated: -> @$errors.length == 0


# --- ValidatorSAX - Extends Validator ---
class Angles.ValidatorSAX extends Angles.Validator
  constructor: (options) ->
    super(options)
    @dispatcher.on "validation", =>
      doc = @$angles?.getDocument()
      if doc?
        @dispatcher.trigger "validation:start"
        @validate @$angles.getDocument()

  checkSchema: (parser, els) ->
    return unless @$schema?

    if els?.length == 1
      if not @$schema.hasOwnProperty els[0]?.name
        parser.validationError "Invalid root element: " + els[0].name + "."
      else
        rexp = new RegExp @$schema._start, "ig"
        if rexp.exec(els[0].name+",") == null
          parser.validationError "Invalid root element: " + els[0].name + "."
      return

    currentEl = els[0].name
    parentEl = els[1].name

    if not @$schema[parentEl]?
      parser.validationError "The #{currentEl} element is not allowed as a child of the #{parentEl} element."
    else if currentEl not in @$schema[parentEl]?.children
      parser.validationError "The #{currentEl} element is not allowed as a child of the #{parentEl} element."
      return

  checkChildren: (parser, els) ->
    return unless @$schema?

    return unless els.length > 0

    currentEl = els[0]
    childNames = currentEl.children.join(',')
    childNames += "," if childNames != ""

    return unless @$schema.hasOwnProperty(currentEl?.name)
    return unless @$schema[currentEl.name].hasOwnProperty("model")

    rexp = new RegExp @$schema[currentEl.name].model, "ig"
    if rexp.exec(childNames) == null
      parser.validationError currentEl.name + " is invalid: one or more required children are missing or its child elements are in the wrong order."

  validate: (editor) ->
    els = []
    parser = new Angles.SAXParser
      startDocument: => els = []
      endDocument: =>
        if els.length > 0
          names = (e.name for e in els)
          parser.validationError "Unclosed elements at end of document: #{names.join(", ")}"
      startElement: (node) =>
        if els.length > 0
          els[0].children.push node.local
        els.unshift
          name: node.local
          children: []
        @checkSchema parser, els
      characters: (t) =>
        if els.length > 0
          if t.match(/^[\s\r\n]*$/) == null
            els[0].children.push '_text_'
      endElement: (name) =>
        @checkChildren parser, els
        els.shift()
    parser.parse(editor)
    @$errors = parser.$errors
    @displayErrors()