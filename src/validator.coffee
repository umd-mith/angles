# --- Validator --- 

class Angles.Validator
  constructor: (options) ->
    dispatcher = @dispatcher = options.dispatcher
    @$schema = {}
    @$errors = []
    @$angles = options.anglesView

  displayErrors: ->
    for e in @errors()
      @dispatcher.trigger "validation:error", e
    @endValidation()

  addError: (e) ->
    @$errors.push e

  clearErrors: -> @$errors = []

  endValidation: -> @dispatcher.trigger "validation:end"

  setSchema: (s) ->
    @$schema = s
    @dispatcher.trigger "validation"

  errors: -> @$errors

  hasErrors: -> @$errors.length != 0