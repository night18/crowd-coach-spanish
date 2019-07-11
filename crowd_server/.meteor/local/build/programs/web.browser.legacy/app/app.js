var require = meteorInstall({"lib":{"router.js":function(){

////////////////////////////////////////////////////////////////////////////////
//                                                                            //
// lib/router.js                                                              //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
                                                                              //
Router.route("/", {
  where: "server"
}).post(function () {
  var _this = this;

  // console.log(this.request.body); //{ content: 'test1', hitType: 'audio' }
  var requestBody = this.request.body;

  if (typeof requestBody.method != "undefined") {
    switch (requestBody.method) {
      case "provideTip":
        Meteor.call("provideTip", requestBody, function (err, result) {
          if (!err) {
            _this.response.end("success");
          }
        }); //Todo: error controller

        break;

      case "getTip":
        Meteor.call("getTip", requestBody, function (err, result) {
          _this.response.end(result);
        });
        break;

      case "upvoteTip":
        Meteor.call("upvoteTip", requestBody, function (err, result) {
          if (!err) {
            _this.response.end(result);
          }
        });
        break;

      case "downvoteTip":
        Meteor.call("downvoteTip", requestBody, function (err, result) {
          if (!err) {
            _this.response.end(result);
          }
        });
        break;

      case "getFeedback":
        Meteor.call("getFeedback", requestBody, function (err, result) {
          if (!err) {
            _this.response.end(result);
          }
        });
        break;
    }
  }
});
////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/lib/router.js");