/* --- ContextHelp --- */

var ContextHelp = function() {};

ContextHelp.prototype.init = function(options) {
  var me = this;
  var dispatcher = this.dispatcher = options.dispatcher;

  this.$odd = {};
  this.$angles = options.anglesView;
};

ContextHelp.prototype.setODD = function(o) { 
  this.$odd = o;
};

ContextHelp.prototype.getODDfor = function(e) { 
  var elements = this.$odd.members
  for (var i=0;i<elements.length;i++) {
      var item = elements[i];
      if (item["ident"] == e) {
        return item;
      }
  }
};

ContextHelp.prototype.getDescOf = function(e) { 
  item = this.getODDfor(e);
  return item["desc"];
};

ContextHelp.prototype.getValidChildrenOf = function(e) { 
  item = this.getODDfor(e);
  return item["desc"];
};