# --- ContextHelp --- 

class Angles.ContextHelp
  constructor: (options) ->
    dispatcher = @dispatcher = options.dispatcher
    @$odd = {}
    @$angles = options.anglesView

  setODD: (o) -> @$odd = o

  getODDfor: (e) ->
    elements = @$odd.members
    for item in elements
      if item.ident == e
        return item
    null

  getDescOf: (e) -> @getODDfor(e)?.desc

  getValidChildrenOf: (e) -> @getODDfor(e)?.desc