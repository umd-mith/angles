# --- FileUploader --- 

class Angles.FileUploader
  constructor: (options) ->
    dispatcher = @dispatcher = options.dispatcher
    @$angles = options.anglesView

  _handleFileSelect: (evt) =>
    file = evt.target.files[0]

    reader = new FileReader()

    reader.onload = (e) => 

        @$angles.$editor.setValue e.target.result

        #Save new document on Local Storage
        newModel = collection.create
          name: file.name,
          content: @$angles.getContent()
        
        @$angles.dispatcher.trigger "document:switch", newModel

    reader.readAsText(file,"UTF-8")    
  
  bind: (el) ->
    $(el).change @_handleFileSelect