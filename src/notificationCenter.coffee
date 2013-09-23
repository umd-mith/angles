# --- NotificationCenter ---

class Angles.NotificationCenter
  constructor: (options) ->
    dispatcher = @dispatcher = options.dispatcher

    @$angles = options.anglesView
    @$notifications = new Angles.NotificationList()

    #console.log(@$notifications)

    dispatcher.on "notification:push", (e) => @push e

    dispatcher.on "notification:clear", (e) => @clear()

  push: (m) ->
    @$notifications.add m

  clear: -> 
    m.destroy() while m = @$notifications.first()
    null