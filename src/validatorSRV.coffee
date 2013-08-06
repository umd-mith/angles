/* --- ValidatorSRV - Extends Validator --- */

var ValidatorSRV = function(options) { 
	this.init(options); 
	this.$validatorUrl = options.validator

	/* If an ajax request to a server and a request handler are provided, set them here.
	Otherwise use example handlers below. */
	this.$requestHandler = options.requestHandler != undefined ? options.requestHandler : requestHandler;
	this.$validationHandler = options.validationHandler != undefined ? options.validationHandler : validationHandler;

	var me = this;	

	dispatcher.on("validation", function() {
	    var errors, select;
	    dispatcher.trigger("validation:start");
	    me.$requestHandler(me);
	});
};

ValidatorSRV.prototype = new Validator();

/* Override this, or provide your own validation handler if your validator returns a different response */
requestHandler = function(validator) {
  doc = validator.$angles.getDocument();
  xmlDocument = escape(doc.getValue());
  $.ajax({
    url: validator.$validatorUrl,
    type: "POST",
    crossDomain: true,
    processData: false,
    data: "schema="+validator.$schema+"&document="+xmlDocument,
    dataType: "json",
    success: function (data) {validator.$validationHandler(validator, data)},
    error: function(xhr, textStatus, thrownError, data) { 
      me.dispatcher.trigger('notification:clear');
      thrownError = xhr.status == 0 ? "Cannot reach server" : thrownError;
      var n = {
        type: "Server",
        info: xhr.status,
        message: thrownError,
        location: {row: 0, column: 0}
      }
      me.dispatcher.trigger('notification:push', n);
    }
  });

};

/* Override this, or provide your own validation handler if your validator returns a different response */
validationHandler = function (validator, data) {
  validator.$errors = [];
  for (var i=0; i<data.length; i++) {
    validator.$errors.push({
      text: data[i]["message"],
      row: data[i]["line"]-1, // Empirical adjustment. FIX.
      column: data[i]["column"],
      type: data[i]["type"]
    });
  }
  validator.displayErrors();
};