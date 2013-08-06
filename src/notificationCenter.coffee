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
    n = new Angles.Notification()
    n.set m
    @$notifications.add n

  clear: -> 
    m.destroy() while m = @$notifications.first()
    null