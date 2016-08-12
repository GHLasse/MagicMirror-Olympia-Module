/* Magic Mirror
 * Module: olympia
 *
 * By Christopher Fenner https://github.com/CFenner
 * MIT Licensed.
 */
var NodeHelper = require('node_helper');
var request = require('request');

module.exports = NodeHelper.create({
  start: function () {
    console.log(this.name + ' helper started ...');
  },
  socketNotificationReceived: function(notification, payload) {
    //console.log(notification);
    if (notification === 'OLYMPIA_REQUEST') {
      var that = this;
      request({
          url: payload.url,
          method: 'GET'
        }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          that.sendSocketNotification('OLYMPIA_RESPONSE', {
            id: payload.id,
            data: JSON.parse(body)
          });
        }
      });
    }
  }
});
