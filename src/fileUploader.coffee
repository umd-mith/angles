# --- FileUploader --- 

class Angles.FileUploader
  constructor: (options) ->
    dispatcher = @dispatcher = options.dispatcher
    @$angles = options.anglesView
    @storedFiles = options.storedFiles

  _handleFileSelect: (evt) =>
    file = evt.target.files[0]

    reader = new FileReader()

    reader.onload = (e) => 

        same_name =  @storedFiles.find (model) -> 
          return model.get('name') == file.name
        
        # Overwrite if already in Local Storage
        if same_name?
          same_name.destroy()

        # Save new document on Local Storage
        newModel = @storedFiles.create
          name: file.name,
          content: e.target.result
        @dispatcher.trigger "document:switch", newModel          

    reader.readAsText(file,"UTF-8")    
  
  bind: (el) ->
    $(el).change @_handleFileSelect