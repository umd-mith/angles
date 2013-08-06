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

  endValidation: -> @dispatcher.trigger "validation:end"

  setSchema: (s) ->
    @$schema = s
    @dispatcher.trigger "validation"

  errors: -> @$errors