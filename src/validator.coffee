/* --- Validator --- */

var Validator = function() {};

Validator.prototype.init = function(options) {
  var me = this;
  var dispatcher = this.dispatcher = options.dispatcher;

  this.$schema = {};
  this.$errors = [];
  this.$angles = options.anglesView;
};

Validator.prototype.displayErrors = function() {
  var me = this;
  $(me.errors()).each(function(idx, e) {
    dispatcher.trigger("validation:error", e);
  });
  me.endValidation();
};

Validator.prototype.endValidation = function() {
  dispatcher.trigger("validation:end");
}

Validator.prototype.setSchema = function(s) { 
  this.$schema = s;
  this.dispatcher.trigger("validation");
};

Validator.prototype.errors = function() { return this.$errors; };