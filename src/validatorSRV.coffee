# --- ValidatorSRV - Extends Validator ---

class Angles.ValidatorSRV extends Angles.Validator
  constructor: (options) ->
    super(options)
    @$validatorUrl = options.validator

    # If an ajax request to a server and a request handler are provided, set them here.
    # Otherwise use example handlers below.
    @$requestHandler = if options.requestHandler? then options.requestHandler else requestHandler
    @$validationHandler = if options.validationHandler? then options.validationHandler else validationHandler

    @dispatcher.on "validation", =>
      @dispatcher.trigger "validation:start"
      @$requestHandler @

  # Override this, or provide your own validation handler if your validator returns a different response
  requestHandler = (validator) ->
    doc = validator.$angles.getDocument()
    xmlDocument = escape(doc.getValue())
    $.ajax
      url: validator.$validatorUrl
      type: "POST"
      crossDomain: true
      processData: false
      data: "schema="+validator.$schema+"&document="+xmlDocument
      dataType: "json",
      success: (data) ->
        validator.$validationHandler validator, data
      error: (xhr, textStatus, thrownError, data) =>
        @dispatcher.trigger 'notification:clear'
        thrownError = if xhr.status == 0 then "Cannot reach server" else thrownError
        n =
          type: "Server"
          info: xhr.status
          message: thrownError
          location:
            row: 0
            column: 0
        @dispatcher.trigger 'notification:push', n

  # Override this, or provide your own validation handler if your validator returns a different response
  validationHandler = (validator, data) ->
    validator.$errors = []
    for datum in data
      validator.$errors.push
        text: datum.message
        row: datum.line-1
        column: datum.column
        type: datum.type
    validator.displayErrors()