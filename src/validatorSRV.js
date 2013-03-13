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
    dataType: "jsonp",
    success: function (data) {validator.$validationHandler(validator, data)},
    error: function(data) { console.log("Server cannot be reached");}
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