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
    me.pushNotification(e);
  });

};

NotificationCenter.prototype.pushNotification = function(n) {
  this.$notifications.add({model:n});
}