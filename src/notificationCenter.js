/* --- NotificationCenter --- */

var NotificationCenter = function(options) {
	this.init(options);
};

NotificationCenter.prototype.init = function(options) {  
  var me = this;
  var dispatcher = this.dispatcher = options.dispatcher;

  this.$angles = options.anglesView;
  this.$notifications = new Angles.NotificationList();  

  //console.log(this.$notifications);

  dispatcher.on("notification:push", function(e) {
    me.push(e);
  });

  dispatcher.on("notification:clear", function(e) {
    me.clear();
  });

};

NotificationCenter.prototype.push = function(m) {
  n = new Angles.Notification();
  n.set(m);
  this.$notifications.add(n);
}

NotificationCenter.prototype.clear = function(){
  var m;
  while (m = this.$notifications.first()) {
    m.destroy();
  }
}