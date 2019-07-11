var require = meteorInstall({"lib":{"router.js":function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// lib/router.js                                                                                            //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
Router.route("/", {
  where: "server"
}).post(function () {
  // console.log(this.request.body); //{ content: 'test1', hitType: 'audio' }
  let requestBody = this.request.body;

  if (typeof requestBody.method != "undefined") {
    switch (requestBody.method) {
      case "provideTip":
        Meteor.call("provideTip", requestBody, (err, result) => {
          if (!err) {
            this.response.end("success");
          }
        }); //Todo: error controller

        break;

      case "getTip":
        Meteor.call("getTip", requestBody, (err, result) => {
          this.response.end(result);
        });
        break;

      case "upvoteTip":
        Meteor.call("upvoteTip", requestBody, (err, result) => {
          if (!err) {
            this.response.end(result);
          }
        });
        break;

      case "downvoteTip":
        Meteor.call("downvoteTip", requestBody, (err, result) => {
          if (!err) {
            this.response.end(result);
          }
        });
        break;

      case "getFeedback":
        Meteor.call("getFeedback", requestBody, (err, result) => {
          if (!err) {
            this.response.end(result);
          }
        });
        break;
    }
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"server":{"dataScheme.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// server/dataScheme.js                                                                                     //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
let Mongo;
module.watch(require("meteor/mongo"), {
  Mongo(v) {
    Mongo = v;
  }

}, 0);
Tips = new Mongo.Collection("tips");
HITType = new Mongo.Collection("hit_type");
Feedback = new Mongo.Collection("feedback");
Worker = new Mongo.Collection("worker");
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"main.js":function(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// server/main.js                                                                                           //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
let Meteor;
module.watch(require("meteor/meteor"), {
  Meteor(v) {
    Meteor = v;
  }

}, 0);
module.watch(require("./dataScheme.js"));
Meteor.startup(() => {
  const MAXTOPTIP = 4;
  const MAXTYPETOPTIP = 3;

  function shuffle(tmparray) {
    let currentIndex = tmparray.length,
        temporaryValue,
        randomIndex; // While there remain elements to shuffle...

    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1; // And swap it with the current element.

      temporaryValue = tmparray[currentIndex];
      tmparray[currentIndex] = tmparray[randomIndex];
      tmparray[randomIndex] = temporaryValue;
    }

    return tmparray;
  }

  function guessHITType(id, title, description, requester) {
    let tipsByID = Tips.find({
      hit_set_id: id
    }).fetch();
    let type = "";
    let typeArray = [];

    if (tipsByID.length > 2) {
      let maxCount = 0;

      for (let i = 0; i < tipsByID.length; i++) {
        if (typeof typeArray[tipsByID[i].hit_set_id] == "undefined") {
          typeArray[tipsByID[i].hit_set_id] = 1;
        } else {
          typeArray[tipsByID[i].hit_set_id]++;
        }

        if (typeArray[tipsByID[i].hit_set_id] > maxCount) {
          type = tipsByID[i].hit_type;
          maxCount = typeArray[tipsByID[i].hit_set_id];
        }
      }

      return type;
    } else {
      //Todo: use machine learning
      if (title.includes("media")) {
        return "audio";
      } else if (title.includes("data")) {
        return "data";
      } else if (title.includes("website")) {
        return "data";
      } else if (title.includes("webpage")) {
        return "data";
      } else if (title.includes("web page")) {
        return "data";
      } else if (title.includes("receipt")) {
        return "imgtrans";
      } else if (title.includes("survey")) {
        return "survey";
      } else if (title.includes("tag")) {
        return "imgtag";
      } else if (title.includes("categorization")) {
        return "categorize";
      } else if (title.includes("categorize")) {
        return "categorize";
      } else if (title.includes("category")) {
        return "categorize";
      } else if (title.includes("class")) {
        return "categorize";
      } else if (title.includes("collect")) {
        return "categorize";
      } else if (title.includes("label")) {
        return "imgtag";
      } else if (title.includes("article")) {
        return "write";
      } else if (title.includes("write")) {
        return "write";
      } else if (title.includes("writing")) {
        return "write";
      } else if (title.includes("indicate")) {
        return "survey";
      } else if (title.includes("postcard")) {
        return "imgtrans";
      } else if (title.includes("contact")) {
        return "data";
      } else if (title.includes("match")) {
        return "categorize";
      } else if (title.includes("clean")) {
        return "write";
      } else if (title.includes("video")) {
        return "audio";
      } else if (title.includes("audio")) {
        return "audio";
      } else if (title.includes("coin")) {
        return "imgtag";
      } else if (title.includes("company")) {
        return "data";
      } else if (title.includes("predict")) {
        return "survey";
      } else if (title.includes("study")) {
        return "survey";
      } else if (title.includes("questionnaire")) {
        return "survey";
      } else if (title.includes("second")) {
        return "audio";
      } else if (title.includes("transcribe")) {
        return "imgtrans";
      } else if (title.includes("speech")) {
        return "audio";
      } else if (title.includes("draw")) {
        return "imgtag";
      } else if (title.includes("yourself")) {
        return "survey";
      } else if (title.includes("official")) {
        return "data";
      }

      return "others";
    }
  }

  function getTopTip(tipArray, getCount) {
    let returnTips = [];

    if (tipArray.length > 0) {
      tipArray.sort(function (a, b) {
        return b.score - a.score;
      }); // console.log(tipArray);

      let tmpTips = []; //Handle the tips which has the same score 

      let prvScore = -3; //The plugin do not display the tips which score is lower than -3

      for (let i = 0; i < tipArray.length; i++) {
        //Have the same score with previous one
        if (tipArray[i].score == prvScore) {
          tmpTips.push(tipArray[i]);

          if (i == tipArray.length - 1) {
            if (tmpTips.length > 0) {
              tmpTips = shuffle(tmpTips); //Return tip list has enough space to put all temporary tip list 

              if (tmpTips.length <= getCount - returnTips.length) {
                let tmpLength = tmpTips.length;

                for (let j = 0; j < tmpLength; j++) {
                  returnTips.push(tmpTips.pop());
                }

                return returnTips;
              } else {
                //Return tip list don't have enough space to put all temporary tip list 
                let tmpLength = getCount - returnTips.length;

                for (let j = 0; j < tmpLength; j++) {
                  returnTips.push(tmpTips.pop());
                }

                return returnTips;
              }
            }
          }
        } else {
          //The first one or different score
          if (tmpTips.length > 0) {
            tmpTips = shuffle(tmpTips); //Return tip list has enough space to put all temporary tip list 

            if (tmpTips.length <= getCount - returnTips.length) {
              let tmpLength = tmpTips.length;

              for (let j = 0; j < tmpLength; j++) {
                returnTips.push(tmpTips.pop());
              }
            } else {
              //Return tip list don't have enough space to put all temporary tip list 
              let tmpLength = getCount - returnTips.length;

              for (let j = 0; j < tmpLength; j++) {
                returnTips.push(tmpTips.pop());
              }

              return returnTips;
            }
          }

          prvScore = tipArray[i].score;
          tmpTips.push(tipArray[i]);
        }

        if (returnTips.length == getCount) {
          break;
        }
      }

      return returnTips;
    } else {
      //Todo: error message
      console.log("There are no tips for the same hit id");
      return returnTips;
    }
  }

  Meteor.methods({
    storeTip: function (requestBody) {
      Tips.insert({
        provider_id: requestBody.providerID,
        hit_set_id: requestBody.hitSetID,
        hit_type: requestBody.hitType,
        tip: requestBody.content,
        score: 0
      }); //console.log("Success store raw tips to database");
    },
    storeRawType: function (requestBody) {
      //Todo: think whether require to store the raw tips info
      HTType.insert({
        hit_set_id: requestBody.hitSetID,
        hit_raw_type: requestBody.hitType,
        worker_id: requestBody.providerID
      });
    },
    provideTip: function (requestBody) {
      Tips.insert({
        provider_id: requestBody.providerID,
        hit_set_id: requestBody.hitSetID,
        hit_type: requestBody.hitType,
        tip: requestBody.content,
        score: 0,
        create_timestamp: requestBody.create_timestamp
      });
      console.log("Success store raw tips to database");
    },
    getTip: function (requestBody) {
      let topTips = [];
      console.log(requestBody.hitTitle.toLowerCase()); //Same ID

      let tipsByID = Tips.find({
        hit_set_id: requestBody.hitSetID
      }).fetch();

      if (tipsByID.length > 0) {
        let topTipsByID = getTopTip(tipsByID, MAXTOPTIP);
        topTips.push.apply(topTips, topTipsByID);
      } //Same type top


      let hitType = guessHITType(requestBody.hitSetID, requestBody.hitTitle.toLowerCase(), requestBody.hitDesc.toLowerCase(), requestBody.requesterID);

      if (hitType != "others") {
        console.log(hitType);
        let tipsByType = Tips.find({
          hit_type: hitType,
          hit_set_id: {
            $ne: requestBody.hitSetID
          }
        }).fetch();

        if (tipsByType.length > 0) {
          let topTipsByType = getTopTip(tipsByType, MAXTYPETOPTIP);
          topTips.push.apply(topTips, topTipsByType); // console.log(topTips);
        }
      }

      if (hitType != "others") {
        //Same type New, only add one new to the tip list
        let tipsByTypeID = Tips.find({
          hit_type: hitType
        }).fetch();
        tipsByTypeID = shuffle(tipsByTypeID); //random choose a advice from database

        for (let i = tipsByTypeID.length - 1; i >= 0; i--) {
          let isAlreadyIn = false;

          if (tipsByTypeID[i].score > -3) {
            for (let j = 0; j < topTips.length; j++) {
              if (tipsByTypeID[i]._id == topTips[j]._id) {
                isAlreadyIn = true;
                break;
              }
            }

            if (!isAlreadyIn) {
              topTips.push(tipsByTypeID.pop());
              break;
            }
          }
        }
      }

      topTips = shuffle(topTips);
      Worker.insert({
        hit_title: requestBody.hitTitle,
        hit_set_id: requestBody.hitSetID,
        worker_id: requestBody.workerID,
        requester_id: requestBody.requesterID
      });

      if (topTips.length > 0) {
        console.log(topTips);
        return JSON.stringify(topTips);
      } else {
        return "";
      }
    },
    "getFeedback": function (requestBody) {
      let feedback = Feedback.find({
        tip_id: requestBody.tip_id,
        feedbacker_id: requestBody.feedbacker_id
      }).fetch();

      if (feedback.length == 0) {
        return '{"score":0}';
      } else {
        return '{"score":' + feedback[0].score + '}';
      }
    },
    "upvoteTip": function (requestBody) {
      let feedback = Feedback.find({
        tip_id: requestBody.tip_id,
        feedbacker_id: requestBody.feedbacker_id
      }).fetch();
      let tip = Tips.find({
        _id: requestBody.tip_id
      }).fetch()[0];

      if (feedback.length == 0) {
        //the user hasn't provide feedback to the hit.
        Feedback.insert({
          feedbacker_id: requestBody.feedbacker_id,
          tip_id: requestBody.tip_id,
          score: 1,
          create_timestamp: requestBody.create_timestamp
        });
        let tipScore = tip.score + 1;
        Tips.update({
          _id: requestBody.tip_id
        }, {
          $set: {
            score: tipScore
          }
        });
        return '{"score":1}';
      } else {
        if (feedback[0].score == 1) {
          Feedback.update({
            tip_id: requestBody.tip_id,
            feedbacker_id: requestBody.feedbacker_id
          }, {
            $set: {
              score: 0
            }
          });
          let tipScore = tip.score - 1;
          Tips.update({
            _id: requestBody.tip_id
          }, {
            $set: {
              score: tipScore
            }
          });
          return '{"score":0}';
        } else if (feedback[0].score == 0) {
          Feedback.update({
            tip_id: requestBody.tip_id,
            feedbacker_id: requestBody.feedbacker_id
          }, {
            $set: {
              score: 1
            }
          });
          let tipScore = tip.score + 1;
          Tips.update({
            _id: requestBody.tip_id
          }, {
            $set: {
              score: tipScore
            }
          });
          return '{"score":1}';
        } else if (feedback[0].score == -1) {
          Feedback.update({
            tip_id: requestBody.tip_id,
            feedbacker_id: requestBody.feedbacker_id
          }, {
            $set: {
              score: 1
            }
          });
          let tipScore = tip.score + 2;
          Tips.update({
            _id: requestBody.tip_id
          }, {
            $set: {
              score: tipScore
            }
          });
          return '{"score":1}';
        }
      }
    },
    "downvoteTip": function (requestBody) {
      let feedback = Feedback.find({
        tip_id: requestBody.tip_id,
        feedbacker_id: requestBody.feedbacker_id
      }).fetch();
      let tip = Tips.find({
        _id: requestBody.tip_id
      }).fetch()[0];

      if (feedback.length == 0) {
        //the user hasn't provide feedback to the hit.
        Feedback.insert({
          feedbacker_id: requestBody.feedbacker_id,
          tip_id: requestBody.tip_id,
          score: -1,
          create_timestamp: requestBody.create_timestamp
        });
        let tipScore = tip.score - 1;
        Tips.update({
          _id: requestBody.tip_id
        }, {
          $set: {
            score: tipScore
          }
        });
        return '{"score":-1}';
      } else {
        if (feedback[0].score == 1) {
          Feedback.update({
            tip_id: requestBody.tip_id,
            feedbacker_id: requestBody.feedbacker_id
          }, {
            $set: {
              score: -1
            }
          });
          let tipScore = tip.score - 2;
          Tips.update({
            _id: requestBody.tip_id
          }, {
            $set: {
              score: tipScore
            }
          });
          return '{"score":-1}';
        } else if (feedback[0].score == 0) {
          Feedback.update({
            tip_id: requestBody.tip_id,
            feedbacker_id: requestBody.feedbacker_id
          }, {
            $set: {
              score: -1
            }
          });
          let tipScore = tip.score - 1;
          Tips.update({
            _id: requestBody.tip_id
          }, {
            $set: {
              score: tipScore
            }
          });
          return '{"score":-1}';
        } else if (feedback[0].score == -1) {
          Feedback.update({
            tip_id: requestBody.tip_id,
            feedbacker_id: requestBody.feedbacker_id
          }, {
            $set: {
              score: 0
            }
          });
          let tipScore = tip.score + 1;
          Tips.update({
            _id: requestBody.tip_id
          }, {
            $set: {
              score: tipScore
            }
          });
          return '{"score":0}';
        }
      }
    }
  });
});
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});
require("/lib/router.js");
require("/server/dataScheme.js");
require("/server/main.js");
//# sourceURL=meteor://💻app/app/app.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvbGliL3JvdXRlci5qcyIsIm1ldGVvcjovL/CfkrthcHAvc2VydmVyL2RhdGFTY2hlbWUuanMiLCJtZXRlb3I6Ly/wn5K7YXBwL3NlcnZlci9tYWluLmpzIl0sIm5hbWVzIjpbIlJvdXRlciIsInJvdXRlIiwid2hlcmUiLCJwb3N0IiwicmVxdWVzdEJvZHkiLCJyZXF1ZXN0IiwiYm9keSIsIm1ldGhvZCIsIk1ldGVvciIsImNhbGwiLCJlcnIiLCJyZXN1bHQiLCJyZXNwb25zZSIsImVuZCIsIk1vbmdvIiwibW9kdWxlIiwid2F0Y2giLCJyZXF1aXJlIiwidiIsIlRpcHMiLCJDb2xsZWN0aW9uIiwiSElUVHlwZSIsIkZlZWRiYWNrIiwiV29ya2VyIiwic3RhcnR1cCIsIk1BWFRPUFRJUCIsIk1BWFRZUEVUT1BUSVAiLCJzaHVmZmxlIiwidG1wYXJyYXkiLCJjdXJyZW50SW5kZXgiLCJsZW5ndGgiLCJ0ZW1wb3JhcnlWYWx1ZSIsInJhbmRvbUluZGV4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiZ3Vlc3NISVRUeXBlIiwiaWQiLCJ0aXRsZSIsImRlc2NyaXB0aW9uIiwicmVxdWVzdGVyIiwidGlwc0J5SUQiLCJmaW5kIiwiaGl0X3NldF9pZCIsImZldGNoIiwidHlwZSIsInR5cGVBcnJheSIsIm1heENvdW50IiwiaSIsImhpdF90eXBlIiwiaW5jbHVkZXMiLCJnZXRUb3BUaXAiLCJ0aXBBcnJheSIsImdldENvdW50IiwicmV0dXJuVGlwcyIsInNvcnQiLCJhIiwiYiIsInNjb3JlIiwidG1wVGlwcyIsInBydlNjb3JlIiwicHVzaCIsInRtcExlbmd0aCIsImoiLCJwb3AiLCJjb25zb2xlIiwibG9nIiwibWV0aG9kcyIsInN0b3JlVGlwIiwiaW5zZXJ0IiwicHJvdmlkZXJfaWQiLCJwcm92aWRlcklEIiwiaGl0U2V0SUQiLCJoaXRUeXBlIiwidGlwIiwiY29udGVudCIsInN0b3JlUmF3VHlwZSIsIkhUVHlwZSIsImhpdF9yYXdfdHlwZSIsIndvcmtlcl9pZCIsInByb3ZpZGVUaXAiLCJjcmVhdGVfdGltZXN0YW1wIiwiZ2V0VGlwIiwidG9wVGlwcyIsImhpdFRpdGxlIiwidG9Mb3dlckNhc2UiLCJ0b3BUaXBzQnlJRCIsImFwcGx5IiwiaGl0RGVzYyIsInJlcXVlc3RlcklEIiwidGlwc0J5VHlwZSIsIiRuZSIsInRvcFRpcHNCeVR5cGUiLCJ0aXBzQnlUeXBlSUQiLCJpc0FscmVhZHlJbiIsIl9pZCIsImhpdF90aXRsZSIsIndvcmtlcklEIiwicmVxdWVzdGVyX2lkIiwiSlNPTiIsInN0cmluZ2lmeSIsImZlZWRiYWNrIiwidGlwX2lkIiwiZmVlZGJhY2tlcl9pZCIsInRpcFNjb3JlIiwidXBkYXRlIiwiJHNldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQUEsT0FBT0MsS0FBUCxDQUFhLEdBQWIsRUFBa0I7QUFBQ0MsU0FBTztBQUFSLENBQWxCLEVBQ0VDLElBREYsQ0FDTyxZQUFXO0FBQ2hCO0FBRUEsTUFBSUMsY0FBYyxLQUFLQyxPQUFMLENBQWFDLElBQS9COztBQUNBLE1BQUcsT0FBT0YsWUFBWUcsTUFBbkIsSUFBNkIsV0FBaEMsRUFBNEM7QUFDM0MsWUFBT0gsWUFBWUcsTUFBbkI7QUFDQyxXQUFLLFlBQUw7QUFDQ0MsZUFBT0MsSUFBUCxDQUFZLFlBQVosRUFBMEJMLFdBQTFCLEVBQXVDLENBQUNNLEdBQUQsRUFBS0MsTUFBTCxLQUFnQjtBQUN0RCxjQUFHLENBQUNELEdBQUosRUFBUTtBQUNQLGlCQUFLRSxRQUFMLENBQWNDLEdBQWQsQ0FBa0IsU0FBbEI7QUFDQTtBQUNELFNBSkQsRUFERCxDQU1DOztBQUNBOztBQUNELFdBQUssUUFBTDtBQUNDTCxlQUFPQyxJQUFQLENBQVksUUFBWixFQUFzQkwsV0FBdEIsRUFBbUMsQ0FBQ00sR0FBRCxFQUFNQyxNQUFOLEtBQWlCO0FBQ25ELGVBQUtDLFFBQUwsQ0FBY0MsR0FBZCxDQUFrQkYsTUFBbEI7QUFDQSxTQUZEO0FBR0E7O0FBQ0QsV0FBSyxXQUFMO0FBQ0NILGVBQU9DLElBQVAsQ0FBWSxXQUFaLEVBQXlCTCxXQUF6QixFQUFzQyxDQUFDTSxHQUFELEVBQUtDLE1BQUwsS0FBZ0I7QUFDckQsY0FBRyxDQUFDRCxHQUFKLEVBQVE7QUFDUCxpQkFBS0UsUUFBTCxDQUFjQyxHQUFkLENBQWtCRixNQUFsQjtBQUNBO0FBQ0QsU0FKRDtBQUtBOztBQUNELFdBQUssYUFBTDtBQUNDSCxlQUFPQyxJQUFQLENBQVksYUFBWixFQUEyQkwsV0FBM0IsRUFBd0MsQ0FBQ00sR0FBRCxFQUFLQyxNQUFMLEtBQWdCO0FBQ3ZELGNBQUcsQ0FBQ0QsR0FBSixFQUFRO0FBQ1AsaUJBQUtFLFFBQUwsQ0FBY0MsR0FBZCxDQUFrQkYsTUFBbEI7QUFDQTtBQUNELFNBSkQ7QUFLQTs7QUFDRCxXQUFLLGFBQUw7QUFDQ0gsZUFBT0MsSUFBUCxDQUFZLGFBQVosRUFBMkJMLFdBQTNCLEVBQXdDLENBQUNNLEdBQUQsRUFBTUMsTUFBTixLQUFpQjtBQUN4RCxjQUFHLENBQUNELEdBQUosRUFBUTtBQUNQLGlCQUFLRSxRQUFMLENBQWNDLEdBQWQsQ0FBa0JGLE1BQWxCO0FBQ0E7QUFDRCxTQUpEO0FBS0E7QUFsQ0Y7QUFvQ0E7QUFFRCxDQTVDRixFOzs7Ozs7Ozs7OztBQ0FBLElBQUlHLEtBQUo7QUFBVUMsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGNBQVIsQ0FBYixFQUFxQztBQUFDSCxRQUFNSSxDQUFOLEVBQVE7QUFBQ0osWUFBTUksQ0FBTjtBQUFROztBQUFsQixDQUFyQyxFQUF5RCxDQUF6RDtBQUVWQyxPQUFPLElBQUlMLE1BQU1NLFVBQVYsQ0FBcUIsTUFBckIsQ0FBUDtBQUNBQyxVQUFVLElBQUlQLE1BQU1NLFVBQVYsQ0FBcUIsVUFBckIsQ0FBVjtBQUNBRSxXQUFXLElBQUlSLE1BQU1NLFVBQVYsQ0FBcUIsVUFBckIsQ0FBWDtBQUNBRyxTQUFTLElBQUlULE1BQU1NLFVBQVYsQ0FBcUIsUUFBckIsQ0FBVCxDOzs7Ozs7Ozs7OztBQ0xBLElBQUlaLE1BQUo7QUFBV08sT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGVBQVIsQ0FBYixFQUFzQztBQUFDVCxTQUFPVSxDQUFQLEVBQVM7QUFBQ1YsYUFBT1UsQ0FBUDtBQUFTOztBQUFwQixDQUF0QyxFQUE0RCxDQUE1RDtBQUErREgsT0FBT0MsS0FBUCxDQUFhQyxRQUFRLGlCQUFSLENBQWI7QUFHMUVULE9BQU9nQixPQUFQLENBQWUsTUFBTTtBQUNwQixRQUFNQyxZQUFZLENBQWxCO0FBQ0EsUUFBTUMsZ0JBQWdCLENBQXRCOztBQUdBLFdBQVNDLE9BQVQsQ0FBaUJDLFFBQWpCLEVBQTJCO0FBQzFCLFFBQUlDLGVBQWVELFNBQVNFLE1BQTVCO0FBQUEsUUFBb0NDLGNBQXBDO0FBQUEsUUFBb0RDLFdBQXBELENBRDBCLENBRzFCOztBQUNBLFdBQU8sTUFBTUgsWUFBYixFQUEyQjtBQUUzQjtBQUNBRyxvQkFBY0MsS0FBS0MsS0FBTCxDQUFXRCxLQUFLRSxNQUFMLEtBQWdCTixZQUEzQixDQUFkO0FBQ0FBLHNCQUFnQixDQUFoQixDQUoyQixDQU0zQjs7QUFDQUUsdUJBQWlCSCxTQUFTQyxZQUFULENBQWpCO0FBQ0FELGVBQVNDLFlBQVQsSUFBeUJELFNBQVNJLFdBQVQsQ0FBekI7QUFDQUosZUFBU0ksV0FBVCxJQUF3QkQsY0FBeEI7QUFDQzs7QUFDRixXQUFPSCxRQUFQO0FBQ0M7O0FBRUQsV0FBU1EsWUFBVCxDQUFzQkMsRUFBdEIsRUFBMEJDLEtBQTFCLEVBQWlDQyxXQUFqQyxFQUE4Q0MsU0FBOUMsRUFBd0Q7QUFFdkQsUUFBSUMsV0FBV3RCLEtBQUt1QixJQUFMLENBQVU7QUFBQ0Msa0JBQVlOO0FBQWIsS0FBVixFQUE0Qk8sS0FBNUIsRUFBZjtBQUNBLFFBQUlDLE9BQU8sRUFBWDtBQUNBLFFBQUlDLFlBQVksRUFBaEI7O0FBQ0EsUUFBR0wsU0FBU1gsTUFBVCxHQUFrQixDQUFyQixFQUF1QjtBQUN0QixVQUFJaUIsV0FBVyxDQUFmOztBQUNBLFdBQUksSUFBSUMsSUFBSSxDQUFaLEVBQWVBLElBQUlQLFNBQVNYLE1BQTVCLEVBQW9Da0IsR0FBcEMsRUFBd0M7QUFDdkMsWUFBSSxPQUFPRixVQUFVTCxTQUFTTyxDQUFULEVBQVlMLFVBQXRCLENBQVAsSUFBNEMsV0FBaEQsRUFBNEQ7QUFDM0RHLG9CQUFVTCxTQUFTTyxDQUFULEVBQVlMLFVBQXRCLElBQW9DLENBQXBDO0FBQ0EsU0FGRCxNQUVLO0FBQ0pHLG9CQUFVTCxTQUFTTyxDQUFULEVBQVlMLFVBQXRCO0FBQ0E7O0FBQ0QsWUFBR0csVUFBVUwsU0FBU08sQ0FBVCxFQUFZTCxVQUF0QixJQUFvQ0ksUUFBdkMsRUFBZ0Q7QUFDL0NGLGlCQUFPSixTQUFTTyxDQUFULEVBQVlDLFFBQW5CO0FBQ0FGLHFCQUFXRCxVQUFVTCxTQUFTTyxDQUFULEVBQVlMLFVBQXRCLENBQVg7QUFDQTtBQUNEOztBQUNELGFBQU9FLElBQVA7QUFDQSxLQWRELE1BY0s7QUFDSjtBQUNBLFVBQUdQLE1BQU1ZLFFBQU4sQ0FBZSxPQUFmLENBQUgsRUFBMkI7QUFDMUIsZUFBTyxPQUFQO0FBQ0EsT0FGRCxNQUVNLElBQUdaLE1BQU1ZLFFBQU4sQ0FBZSxNQUFmLENBQUgsRUFBMEI7QUFDL0IsZUFBTyxNQUFQO0FBQ0EsT0FGSyxNQUVBLElBQUdaLE1BQU1ZLFFBQU4sQ0FBZSxTQUFmLENBQUgsRUFBNkI7QUFDbEMsZUFBTyxNQUFQO0FBQ0EsT0FGSyxNQUVBLElBQUdaLE1BQU1ZLFFBQU4sQ0FBZSxTQUFmLENBQUgsRUFBNkI7QUFDbEMsZUFBTyxNQUFQO0FBQ0EsT0FGSyxNQUVBLElBQUdaLE1BQU1ZLFFBQU4sQ0FBZSxVQUFmLENBQUgsRUFBOEI7QUFDbkMsZUFBTyxNQUFQO0FBQ0EsT0FGSyxNQUVBLElBQUdaLE1BQU1ZLFFBQU4sQ0FBZSxTQUFmLENBQUgsRUFBNkI7QUFDbEMsZUFBTyxVQUFQO0FBQ0EsT0FGSyxNQUVBLElBQUdaLE1BQU1ZLFFBQU4sQ0FBZSxRQUFmLENBQUgsRUFBNEI7QUFDakMsZUFBTyxRQUFQO0FBQ0EsT0FGSyxNQUVBLElBQUdaLE1BQU1ZLFFBQU4sQ0FBZSxLQUFmLENBQUgsRUFBeUI7QUFDOUIsZUFBTyxRQUFQO0FBQ0EsT0FGSyxNQUVBLElBQUdaLE1BQU1ZLFFBQU4sQ0FBZSxnQkFBZixDQUFILEVBQW9DO0FBQ3pDLGVBQU8sWUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsWUFBZixDQUFILEVBQWdDO0FBQ3JDLGVBQU8sWUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsVUFBZixDQUFILEVBQThCO0FBQ25DLGVBQU8sWUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsT0FBZixDQUFILEVBQTJCO0FBQ2hDLGVBQU8sWUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsU0FBZixDQUFILEVBQTZCO0FBQ2xDLGVBQU8sWUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsT0FBZixDQUFILEVBQTJCO0FBQ2hDLGVBQU8sUUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsU0FBZixDQUFILEVBQTZCO0FBQ2xDLGVBQU8sT0FBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsT0FBZixDQUFILEVBQTJCO0FBQ2hDLGVBQU8sT0FBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsU0FBZixDQUFILEVBQTZCO0FBQ2xDLGVBQU8sT0FBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsVUFBZixDQUFILEVBQThCO0FBQ25DLGVBQU8sUUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsVUFBZixDQUFILEVBQThCO0FBQ25DLGVBQU8sVUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsU0FBZixDQUFILEVBQTZCO0FBQ2xDLGVBQU8sTUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsT0FBZixDQUFILEVBQTJCO0FBQ2hDLGVBQU8sWUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsT0FBZixDQUFILEVBQTJCO0FBQ2hDLGVBQU8sT0FBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsT0FBZixDQUFILEVBQTJCO0FBQ2hDLGVBQU8sT0FBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsT0FBZixDQUFILEVBQTJCO0FBQ2hDLGVBQU8sT0FBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsTUFBZixDQUFILEVBQTBCO0FBQy9CLGVBQU8sUUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsU0FBZixDQUFILEVBQTZCO0FBQ2xDLGVBQU8sTUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsU0FBZixDQUFILEVBQTZCO0FBQ2xDLGVBQU8sUUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsT0FBZixDQUFILEVBQTJCO0FBQ2hDLGVBQU8sUUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsZUFBZixDQUFILEVBQW1DO0FBQ3hDLGVBQU8sUUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsUUFBZixDQUFILEVBQTRCO0FBQ2pDLGVBQU8sT0FBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsWUFBZixDQUFILEVBQWdDO0FBQ3JDLGVBQU8sVUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsUUFBZixDQUFILEVBQTRCO0FBQ2pDLGVBQU8sT0FBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsTUFBZixDQUFILEVBQTBCO0FBQy9CLGVBQU8sUUFBUDtBQUNBLE9BRkssTUFFQSxJQUFHWixNQUFNWSxRQUFOLENBQWUsVUFBZixDQUFILEVBQThCO0FBQ25D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bnQiOlsiUm91dGVyLnJvdXRlKFwiL1wiLCB7d2hlcmU6IFwic2VydmVyXCJ9KVxuXHQucG9zdChmdW5jdGlvbigpIHtcblx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLnJlcXVlc3QuYm9keSk7IC8veyBjb250ZW50OiAndGVzdDEnLCBoaXRUeXBlOiAnYXVkaW8nIH1cblx0XHRcblx0XHRsZXQgcmVxdWVzdEJvZHkgPSB0aGlzLnJlcXVlc3QuYm9keTtcblx0XHRpZih0eXBlb2YgcmVxdWVzdEJvZHkubWV0aG9kICE9IFwidW5kZWZpbmVkXCIpe1xuXHRcdFx0c3dpdGNoKHJlcXVlc3RCb2R5Lm1ldGhvZCl7XG5cdFx0XHRcdGNhc2UgXCJwcm92aWRlVGlwXCI6XG5cdFx0XHRcdFx0TWV0ZW9yLmNhbGwoXCJwcm92aWRlVGlwXCIsIHJlcXVlc3RCb2R5LCAoZXJyLHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYoIWVycil7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2UuZW5kKFwic3VjY2Vzc1wiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9ICk7XG5cdFx0XHRcdFx0Ly9Ub2RvOiBlcnJvciBjb250cm9sbGVyXG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJnZXRUaXBcIjpcblx0XHRcdFx0XHRNZXRlb3IuY2FsbChcImdldFRpcFwiLCByZXF1ZXN0Qm9keSwgKGVyciwgcmVzdWx0KSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlLmVuZChyZXN1bHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrOyBcblx0XHRcdFx0Y2FzZSBcInVwdm90ZVRpcFwiOlxuXHRcdFx0XHRcdE1ldGVvci5jYWxsKFwidXB2b3RlVGlwXCIsIHJlcXVlc3RCb2R5LCAoZXJyLHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYoIWVycil7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2UuZW5kKHJlc3VsdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiZG93bnZvdGVUaXBcIjpcblx0XHRcdFx0XHRNZXRlb3IuY2FsbChcImRvd252b3RlVGlwXCIsIHJlcXVlc3RCb2R5LCAoZXJyLHJlc3VsdCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYoIWVycil7XG5cdFx0XHRcdFx0XHRcdHRoaXMucmVzcG9uc2UuZW5kKHJlc3VsdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiZ2V0RmVlZGJhY2tcIjpcblx0XHRcdFx0XHRNZXRlb3IuY2FsbChcImdldEZlZWRiYWNrXCIsIHJlcXVlc3RCb2R5LCAoZXJyLCByZXN1bHQpID0+IHtcblx0XHRcdFx0XHRcdGlmKCFlcnIpe1xuXHRcdFx0XHRcdFx0XHR0aGlzLnJlc3BvbnNlLmVuZChyZXN1bHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRcblx0fSk7IiwiaW1wb3J0IHsgTW9uZ28gfSBmcm9tIFwibWV0ZW9yL21vbmdvXCI7XG5cblRpcHMgPSBuZXcgTW9uZ28uQ29sbGVjdGlvbihcInRpcHNcIik7XG5ISVRUeXBlID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJoaXRfdHlwZVwiKTtcbkZlZWRiYWNrID0gbmV3IE1vbmdvLkNvbGxlY3Rpb24oXCJmZWVkYmFja1wiKTtcbldvcmtlciA9IG5ldyBNb25nby5Db2xsZWN0aW9uKFwid29ya2VyXCIpOyIsImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IFwiLi9kYXRhU2NoZW1lLmpzXCI7XG5cbk1ldGVvci5zdGFydHVwKCgpID0+IHtcblx0Y29uc3QgTUFYVE9QVElQID0gNDtcblx0Y29uc3QgTUFYVFlQRVRPUFRJUCA9IDM7XG5cblxuXHRmdW5jdGlvbiBzaHVmZmxlKHRtcGFycmF5KSB7XG5cdFx0bGV0IGN1cnJlbnRJbmRleCA9IHRtcGFycmF5Lmxlbmd0aCwgdGVtcG9yYXJ5VmFsdWUsIHJhbmRvbUluZGV4O1xuXG5cdFx0Ly8gV2hpbGUgdGhlcmUgcmVtYWluIGVsZW1lbnRzIHRvIHNodWZmbGUuLi5cblx0XHR3aGlsZSAoMCAhPT0gY3VycmVudEluZGV4KSB7XG5cblx0XHQvLyBQaWNrIGEgcmVtYWluaW5nIGVsZW1lbnQuLi5cblx0XHRyYW5kb21JbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGN1cnJlbnRJbmRleCk7XG5cdFx0Y3VycmVudEluZGV4IC09IDE7XG5cblx0XHQvLyBBbmQgc3dhcCBpdCB3aXRoIHRoZSBjdXJyZW50IGVsZW1lbnQuXG5cdFx0dGVtcG9yYXJ5VmFsdWUgPSB0bXBhcnJheVtjdXJyZW50SW5kZXhdO1xuXHRcdHRtcGFycmF5W2N1cnJlbnRJbmRleF0gPSB0bXBhcnJheVtyYW5kb21JbmRleF07XG5cdFx0dG1wYXJyYXlbcmFuZG9tSW5kZXhdID0gdGVtcG9yYXJ5VmFsdWU7XG5cdFx0fVxuXHRyZXR1cm4gdG1wYXJyYXk7XG5cdH1cblxuXHRmdW5jdGlvbiBndWVzc0hJVFR5cGUoaWQgLHRpdGxlLCBkZXNjcmlwdGlvbiwgcmVxdWVzdGVyKXtcblxuXHRcdGxldCB0aXBzQnlJRCA9IFRpcHMuZmluZCh7aGl0X3NldF9pZDogaWR9KS5mZXRjaCgpO1xuXHRcdGxldCB0eXBlID0gXCJcIjtcblx0XHRsZXQgdHlwZUFycmF5ID0gW107XG5cdFx0aWYodGlwc0J5SUQubGVuZ3RoID4gMil7XG5cdFx0XHRsZXQgbWF4Q291bnQgPSAwO1xuXHRcdFx0Zm9yKGxldCBpID0gMDsgaSA8IHRpcHNCeUlELmxlbmd0aDsgaSsrKXtcblx0XHRcdFx0aWYgKHR5cGVvZiB0eXBlQXJyYXlbdGlwc0J5SURbaV0uaGl0X3NldF9pZF0gPT0gXCJ1bmRlZmluZWRcIil7XG5cdFx0XHRcdFx0dHlwZUFycmF5W3RpcHNCeUlEW2ldLmhpdF9zZXRfaWRdID0gMTtcblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0dHlwZUFycmF5W3RpcHNCeUlEW2ldLmhpdF9zZXRfaWRdKys7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYodHlwZUFycmF5W3RpcHNCeUlEW2ldLmhpdF9zZXRfaWRdID4gbWF4Q291bnQpe1xuXHRcdFx0XHRcdHR5cGUgPSB0aXBzQnlJRFtpXS5oaXRfdHlwZTtcblx0XHRcdFx0XHRtYXhDb3VudCA9IHR5cGVBcnJheVt0aXBzQnlJRFtpXS5oaXRfc2V0X2lkXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHR5cGU7XG5cdFx0fWVsc2V7XG5cdFx0XHQvL1RvZG86IHVzZSBtYWNoaW5lIGxlYXJuaW5nXG5cdFx0XHRpZih0aXRsZS5pbmNsdWRlcyhcIm1lZGlhXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiYXVkaW9cIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwiZGF0YVwiKSl7XG5cdFx0XHRcdHJldHVybiBcImRhdGFcIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwid2Vic2l0ZVwiKSl7XG5cdFx0XHRcdHJldHVybiBcImRhdGFcIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwid2VicGFnZVwiKSl7XG5cdFx0XHRcdHJldHVybiBcImRhdGFcIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwid2ViIHBhZ2VcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJkYXRhXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcInJlY2VpcHRcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJpbWd0cmFuc1wiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJzdXJ2ZXlcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJzdXJ2ZXlcIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwidGFnXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiaW1ndGFnXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcImNhdGVnb3JpemF0aW9uXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiY2F0ZWdvcml6ZVwiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJjYXRlZ29yaXplXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiY2F0ZWdvcml6ZVwiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJjYXRlZ29yeVwiKSl7XG5cdFx0XHRcdHJldHVybiBcImNhdGVnb3JpemVcIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwiY2xhc3NcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJjYXRlZ29yaXplXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcImNvbGxlY3RcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJjYXRlZ29yaXplXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcImxhYmVsXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiaW1ndGFnXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcImFydGljbGVcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJ3cml0ZVwiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJ3cml0ZVwiKSl7XG5cdFx0XHRcdHJldHVybiBcIndyaXRlXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcIndyaXRpbmdcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJ3cml0ZVwiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJpbmRpY2F0ZVwiKSl7XG5cdFx0XHRcdHJldHVybiBcInN1cnZleVwiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJwb3N0Y2FyZFwiKSl7XG5cdFx0XHRcdHJldHVybiBcImltZ3RyYW5zXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcImNvbnRhY3RcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJkYXRhXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcIm1hdGNoXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiY2F0ZWdvcml6ZVwiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJjbGVhblwiKSl7XG5cdFx0XHRcdHJldHVybiBcIndyaXRlXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcInZpZGVvXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiYXVkaW9cIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwiYXVkaW9cIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJhdWRpb1wiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJjb2luXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiaW1ndGFnXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcImNvbXBhbnlcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJkYXRhXCI7XG5cdFx0XHR9ZWxzZSBpZih0aXRsZS5pbmNsdWRlcyhcInByZWRpY3RcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJzdXJ2ZXlcIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwic3R1ZHlcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJzdXJ2ZXlcIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwicXVlc3Rpb25uYWlyZVwiKSl7XG5cdFx0XHRcdHJldHVybiBcInN1cnZleVwiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJzZWNvbmRcIikpe1xuXHRcdFx0XHRyZXR1cm4gXCJhdWRpb1wiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJ0cmFuc2NyaWJlXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiaW1ndHJhbnNcIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwic3BlZWNoXCIpKXtcblx0XHRcdFx0cmV0dXJuIFwiYXVkaW9cIjtcblx0XHRcdH1lbHNlIGlmKHRpdGxlLmluY2x1ZGVzKFwiZHJhd1wiKSl7XG5cdFx0XHRcdHJldHVybiBcImltZ3RhZ1wiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJ5b3Vyc2VsZlwiKSl7XG5cdFx0XHRcdHJldHVybiBcInN1cnZleVwiO1xuXHRcdFx0fWVsc2UgaWYodGl0bGUuaW5jbHVkZXMoXCJvZmZpY2lhbFwiKSl7XG5cdFx0XHRcdHJldHVybiBcImRhdGFcIjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBcIm90aGVyc1wiO1xuXHRcdH1cblx0fVxuXHRcdFxuXHRmdW5jdGlvbiBnZXRUb3BUaXAodGlwQXJyYXksIGdldENvdW50KXtcblx0XHRsZXQgcmV0dXJuVGlwcyA9IFtdO1xuXHRcdGlmKHRpcEFycmF5Lmxlbmd0aCA+IDApe1xuXHRcdFx0XHR0aXBBcnJheS5zb3J0KGZ1bmN0aW9uKGEsYil7cmV0dXJuIGIuc2NvcmUgLSBhLnNjb3JlfSk7XG5cdFx0XHRcdC8vIGNvbnNvbGUubG9nKHRpcEFycmF5KTtcblx0XHRcdFx0bGV0IHRtcFRpcHMgPSBbXTsgLy9IYW5kbGUgdGhlIHRpcHMgd2hpY2ggaGFzIHRoZSBzYW1lIHNjb3JlIFxuXHRcdFx0XHRsZXQgcHJ2U2NvcmUgPSAtMzsgLy9UaGUgcGx1Z2luIGRvIG5vdCBkaXNwbGF5IHRoZSB0aXBzIHdoaWNoIHNjb3JlIGlzIGxvd2VyIHRoYW4gLTNcblx0XHRcdFx0Zm9yKGxldCBpID0gMCA7IGkgPCB0aXBBcnJheS5sZW5ndGg7IGkrKyl7XG5cdFx0XHRcdFx0Ly9IYXZlIHRoZSBzYW1lIHNjb3JlIHdpdGggcHJldmlvdXMgb25lXG5cdFx0XHRcdFx0aWYodGlwQXJyYXlbaV0uc2NvcmUgPT0gcHJ2U2NvcmUpe1xuXHRcdFx0XHRcdFx0dG1wVGlwcy5wdXNoKHRpcEFycmF5W2ldKTtcblx0XHRcdFx0XHRcdGlmKCBpID09IHRpcEFycmF5Lmxlbmd0aCAtMSl7XG5cdFx0XHRcdFx0XHRcdGlmKHRtcFRpcHMubGVuZ3RoID4gMCl7XG5cdFx0XHRcdFx0XHRcdFx0dG1wVGlwcyA9IHNodWZmbGUodG1wVGlwcyk7XG5cdFx0XHRcdFx0XHRcdFx0Ly9SZXR1cm4gdGlwIGxpc3QgaGFzIGVub3VnaCBzcGFjZSB0byBwdXQgYWxsIHRlbXBvcmFyeSB0aXAgbGlzdCBcblx0XHRcdFx0XHRcdFx0XHRpZih0bXBUaXBzLmxlbmd0aCA8PSBnZXRDb3VudCAtIHJldHVyblRpcHMubGVuZ3RoICl7XG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgdG1wTGVuZ3RoID0gdG1wVGlwcy5sZW5ndGg7XG5cdFx0XHRcdFx0XHRcdFx0XHRmb3IobGV0IGogPSAwOyBqIDwgdG1wTGVuZ3RoOyBqKyspe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm5UaXBzLnB1c2godG1wVGlwcy5wb3AoKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXR1cm5UaXBzO1xuXG5cdFx0XHRcdFx0XHRcdFx0fWVsc2V7IC8vUmV0dXJuIHRpcCBsaXN0IGRvbid0IGhhdmUgZW5vdWdoIHNwYWNlIHRvIHB1dCBhbGwgdGVtcG9yYXJ5IHRpcCBsaXN0IFxuXHRcdFx0XHRcdFx0XHRcdFx0bGV0IHRtcExlbmd0aCA9IGdldENvdW50IC0gcmV0dXJuVGlwcy5sZW5ndGhcblx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgdG1wTGVuZ3RoOyBqKyspe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm5UaXBzLnB1c2godG1wVGlwcy5wb3AoKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXR1cm5UaXBzO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1lbHNleyAvL1RoZSBmaXJzdCBvbmUgb3IgZGlmZmVyZW50IHNjb3JlXG5cdFx0XHRcdFx0XHRpZih0bXBUaXBzLmxlbmd0aCA+IDApe1xuXHRcdFx0XHRcdFx0XHR0bXBUaXBzID0gc2h1ZmZsZSh0bXBUaXBzKTtcblx0XHRcdFx0XHRcdFx0Ly9SZXR1cm4gdGlwIGxpc3QgaGFzIGVub3VnaCBzcGFjZSB0byBwdXQgYWxsIHRlbXBvcmFyeSB0aXAgbGlzdCBcblx0XHRcdFx0XHRcdFx0aWYodG1wVGlwcy5sZW5ndGggPD0gZ2V0Q291bnQgLSByZXR1cm5UaXBzLmxlbmd0aCApe1xuXHRcdFx0XHRcdFx0XHRcdGxldCB0bXBMZW5ndGggPSB0bXBUaXBzLmxlbmd0aDtcblx0XHRcdFx0XHRcdFx0XHRmb3IobGV0IGogPSAwOyBqIDwgdG1wTGVuZ3RoOyBqKyspe1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuVGlwcy5wdXNoKHRtcFRpcHMucG9wKCkpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fWVsc2V7IC8vUmV0dXJuIHRpcCBsaXN0IGRvbid0IGhhdmUgZW5vdWdoIHNwYWNlIHRvIHB1dCBhbGwgdGVtcG9yYXJ5IHRpcCBsaXN0IFxuXHRcdFx0XHRcdFx0XHRcdGxldCB0bXBMZW5ndGggPSBnZXRDb3VudCAtIHJldHVyblRpcHMubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCB0bXBMZW5ndGg7IGorKyl7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm5UaXBzLnB1c2godG1wVGlwcy5wb3AoKSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXR1cm5UaXBzO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cHJ2U2NvcmUgPSB0aXBBcnJheVtpXS5zY29yZTtcblx0XHRcdFx0XHRcdHRtcFRpcHMucHVzaCh0aXBBcnJheVtpXSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYocmV0dXJuVGlwcy5sZW5ndGggPT0gZ2V0Q291bnQpe1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gcmV0dXJuVGlwcztcblx0XHRcdH1lbHNle1xuXHRcdFx0XHQvL1RvZG86IGVycm9yIG1lc3NhZ2Vcblx0XHRcdFx0Y29uc29sZS5sb2coXCJUaGVyZSBhcmUgbm8gdGlwcyBmb3IgdGhlIHNhbWUgaGl0IGlkXCIpO1xuXHRcdFx0XHRyZXR1cm4gcmV0dXJuVGlwcztcblx0XHRcdH1cblxuXHR9XG5cblxuXHRNZXRlb3IubWV0aG9kcyh7XG5cdFx0c3RvcmVUaXA6IGZ1bmN0aW9uKHJlcXVlc3RCb2R5KXtcblx0XHRcdFRpcHMuaW5zZXJ0KHtcblx0XHRcdFx0cHJvdmlkZXJfaWQ6IHJlcXVlc3RCb2R5LnByb3ZpZGVySUQsXG5cdFx0XHRcdGhpdF9zZXRfaWQ6IHJlcXVlc3RCb2R5LmhpdFNldElELFxuXHRcdFx0XHRoaXRfdHlwZSA6IHJlcXVlc3RCb2R5LmhpdFR5cGUsXG5cdFx0XHRcdHRpcDogcmVxdWVzdEJvZHkuY29udGVudCxcblx0XHRcdFx0c2NvcmU6IDBcblx0XHRcdH0pO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIlN1Y2Nlc3Mgc3RvcmUgcmF3IHRpcHMgdG8gZGF0YWJhc2VcIik7XG5cdFx0fSxcblx0XHRzdG9yZVJhd1R5cGU6IGZ1bmN0aW9uKHJlcXVlc3RCb2R5KXtcblx0XHRcdC8vVG9kbzogdGhpbmsgd2hldGhlciByZXF1aXJlIHRvIHN0b3JlIHRoZSByYXcgdGlwcyBpbmZvXG5cdFx0XHRIVFR5cGUuaW5zZXJ0KHtcblx0XHRcdFx0aGl0X3NldF9pZDogcmVxdWVzdEJvZHkuaGl0U2V0SUQsXG5cdFx0XHRcdGhpdF9yYXdfdHlwZTogcmVxdWVzdEJvZHkuaGl0VHlwZSxcblx0XHRcdFx0d29ya2VyX2lkOiByZXF1ZXN0Qm9keS5wcm92aWRlcklEXG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdHByb3ZpZGVUaXA6IGZ1bmN0aW9uKHJlcXVlc3RCb2R5KXtcblx0XHRcdFRpcHMuaW5zZXJ0KHtcblx0XHRcdFx0cHJvdmlkZXJfaWQ6IHJlcXVlc3RCb2R5LnByb3ZpZGVySUQsXG5cdFx0XHRcdGhpdF9zZXRfaWQ6IHJlcXVlc3RCb2R5LmhpdFNldElELFxuXHRcdFx0XHRoaXRfdHlwZSA6IHJlcXVlc3RCb2R5LmhpdFR5cGUsXG5cdFx0XHRcdHRpcDogcmVxdWVzdEJvZHkuY29udGVudCxcblx0XHRcdFx0c2NvcmU6IDAsXG5cdFx0XHRcdGNyZWF0ZV90aW1lc3RhbXA6IHJlcXVlc3RCb2R5LmNyZWF0ZV90aW1lc3RhbXBcblx0XHRcdH0pO1xuXHRcdFx0Y29uc29sZS5sb2coXCJTdWNjZXNzIHN0b3JlIHJhdyB0aXBzIHRvIGRhdGFiYXNlXCIpO1xuXHRcdFx0XG5cdFx0fSxcblx0XHRnZXRUaXA6IGZ1bmN0aW9uKHJlcXVlc3RCb2R5KXtcblx0XHRcdGxldCB0b3BUaXBzID0gW107XG5cdFx0XHRjb25zb2xlLmxvZyhyZXF1ZXN0Qm9keS5oaXRUaXRsZS50b0xvd2VyQ2FzZSgpKTtcblx0XHRcdC8vU2FtZSBJRFxuXHRcdFx0bGV0IHRpcHNCeUlEID0gVGlwcy5maW5kKHtoaXRfc2V0X2lkOiByZXF1ZXN0Qm9keS5oaXRTZXRJRH0pLmZldGNoKCk7XG5cdFx0XHRpZih0aXBzQnlJRC5sZW5ndGggPiAwKXtcblx0XHRcdFx0bGV0IHRvcFRpcHNCeUlEID0gZ2V0VG9wVGlwKHRpcHNCeUlELCBNQVhUT1BUSVApO1xuXHRcdFx0XHR0b3BUaXBzLnB1c2guYXBwbHkodG9wVGlwcywgdG9wVGlwc0J5SUQpO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHQvL1NhbWUgdHlwZSB0b3Bcblx0XHRcdGxldCBoaXRUeXBlID0gZ3Vlc3NISVRUeXBlKHJlcXVlc3RCb2R5LmhpdFNldElELCByZXF1ZXN0Qm9keS5oaXRUaXRsZS50b0xvd2VyQ2FzZSgpLCByZXF1ZXN0Qm9keS5oaXREZXNjLnRvTG93ZXJDYXNlKCksIHJlcXVlc3RCb2R5LnJlcXVlc3RlcklEKTtcblx0XHRcdGlmKGhpdFR5cGUgIT0gXCJvdGhlcnNcIil7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGhpdFR5cGUpO1xuXHRcdFx0XHRsZXQgdGlwc0J5VHlwZSA9IFRpcHMuZmluZCh7aGl0X3R5cGU6IGhpdFR5cGUsIGhpdF9zZXRfaWQ6IHskbmU6IHJlcXVlc3RCb2R5LmhpdFNldElEfX0pLmZldGNoKCk7XG5cdFx0XHRcdGlmKHRpcHNCeVR5cGUubGVuZ3RoID4gMCl7XG5cdFx0XHRcdFx0bGV0IHRvcFRpcHNCeVR5cGUgPSBnZXRUb3BUaXAodGlwc0J5VHlwZSwgTUFYVFlQRVRPUFRJUCk7XG5cdFx0XHRcdFx0dG9wVGlwcy5wdXNoLmFwcGx5KHRvcFRpcHMsIHRvcFRpcHNCeVR5cGUpO1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKHRvcFRpcHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKGhpdFR5cGUgIT0gXCJvdGhlcnNcIil7XG5cdFx0XHRcdC8vU2FtZSB0eXBlIE5ldywgb25seSBhZGQgb25lIG5ldyB0byB0aGUgdGlwIGxpc3Rcblx0XHRcdFx0bGV0IHRpcHNCeVR5cGVJRCA9IFRpcHMuZmluZCh7aGl0X3R5cGU6IGhpdFR5cGV9KS5mZXRjaCgpO1xuXHRcdFx0XHR0aXBzQnlUeXBlSUQgPSBzaHVmZmxlKHRpcHNCeVR5cGVJRCk7IC8vcmFuZG9tIGNob29zZSBhIGFkdmljZSBmcm9tIGRhdGFiYXNlXG5cdFx0XHRcdGZvcihsZXQgaSA9IHRpcHNCeVR5cGVJRC5sZW5ndGgtMTsgaSA+PSAwIDsgaS0tKXtcblx0XHRcdFx0XHRsZXQgaXNBbHJlYWR5SW4gPSBmYWxzZTtcblx0XHRcdFx0XHRpZih0aXBzQnlUeXBlSURbaV0uc2NvcmUgPiAtMyApe1xuXHRcdFx0XHRcdFx0Zm9yKGxldCBqID0gMCA7IGogPCB0b3BUaXBzLmxlbmd0aDsgaisrKXtcblx0XHRcdFx0XHRcdFx0aWYodGlwc0J5VHlwZUlEW2ldLl9pZCA9PSB0b3BUaXBzW2pdLl9pZCl7XG5cdFx0XHRcdFx0XHRcdFx0aXNBbHJlYWR5SW4gPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZighaXNBbHJlYWR5SW4pe1xuXHRcdFx0XHRcdFx0XHR0b3BUaXBzLnB1c2godGlwc0J5VHlwZUlELnBvcCgpKTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHRvcFRpcHMgPSBzaHVmZmxlKHRvcFRpcHMpO1xuXG5cdFx0XHRXb3JrZXIuaW5zZXJ0KHtcblx0XHRcdFx0aGl0X3RpdGxlOiByZXF1ZXN0Qm9keS5oaXRUaXRsZSxcblx0XHRcdFx0aGl0X3NldF9pZDogcmVxdWVzdEJvZHkuaGl0U2V0SUQsXG5cdFx0XHRcdHdvcmtlcl9pZCA6IHJlcXVlc3RCb2R5LndvcmtlcklELFxuXHRcdFx0XHRyZXF1ZXN0ZXJfaWQ6IHJlcXVlc3RCb2R5LnJlcXVlc3RlcklEXG5cdFx0XHR9KTtcblxuXHRcdFx0aWYodG9wVGlwcy5sZW5ndGggPiAwKXtcblx0XHRcdFx0Y29uc29sZS5sb2codG9wVGlwcyk7XG5cdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0b3BUaXBzKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRyZXR1cm4gXCJcIjtcblx0XHRcdH1cblxuXHRcdFx0XG5cdFx0fSxcblx0XHRcImdldEZlZWRiYWNrXCI6IGZ1bmN0aW9uKHJlcXVlc3RCb2R5KXtcblx0XHRcdGxldCBmZWVkYmFjayA9IEZlZWRiYWNrLmZpbmQoe3RpcF9pZDogcmVxdWVzdEJvZHkudGlwX2lkLCBmZWVkYmFja2VyX2lkOiByZXF1ZXN0Qm9keS5mZWVkYmFja2VyX2lkfSkuZmV0Y2goKTtcblx0XHRcdGlmKGZlZWRiYWNrLmxlbmd0aCA9PSAwKXtcblx0XHRcdFx0cmV0dXJuICd7XCJzY29yZVwiOjB9Jztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiAne1wic2NvcmVcIjonK2ZlZWRiYWNrWzBdLnNjb3JlKyd9Jztcblx0XHRcdH1cblx0XHR9LFxuXHRcdFwidXB2b3RlVGlwXCI6IGZ1bmN0aW9uKHJlcXVlc3RCb2R5KXtcblx0XHRcdGxldCBmZWVkYmFjayA9IEZlZWRiYWNrLmZpbmQoe3RpcF9pZDogcmVxdWVzdEJvZHkudGlwX2lkLCBmZWVkYmFja2VyX2lkOiByZXF1ZXN0Qm9keS5mZWVkYmFja2VyX2lkfSkuZmV0Y2goKTtcblx0XHRcdGxldCB0aXAgPSBUaXBzLmZpbmQoe19pZDogcmVxdWVzdEJvZHkudGlwX2lkfSkuZmV0Y2goKVswXTtcblx0XHRcdGlmKGZlZWRiYWNrLmxlbmd0aCA9PSAwKXsgLy90aGUgdXNlciBoYXNuJ3QgcHJvdmlkZSBmZWVkYmFjayB0byB0aGUgaGl0LlxuXHRcdFx0XHRGZWVkYmFjay5pbnNlcnQoe1xuXHRcdFx0XHRcdGZlZWRiYWNrZXJfaWQ6IHJlcXVlc3RCb2R5LmZlZWRiYWNrZXJfaWQsXG5cdFx0XHRcdFx0dGlwX2lkOiByZXF1ZXN0Qm9keS50aXBfaWQsXG5cdFx0XHRcdFx0c2NvcmU6IDEsXG5cdFx0XHRcdFx0Y3JlYXRlX3RpbWVzdGFtcDogcmVxdWVzdEJvZHkuY3JlYXRlX3RpbWVzdGFtcFxuXHRcdFx0XHR9KTtcblx0XHRcdFx0bGV0IHRpcFNjb3JlID0gdGlwLnNjb3JlICsgMTtcblx0XHRcdFx0VGlwcy51cGRhdGUoe19pZDogcmVxdWVzdEJvZHkudGlwX2lkfSwgeyRzZXQ6IHtzY29yZTogdGlwU2NvcmV9fSk7XG5cdFx0XHRcdHJldHVybiAne1wic2NvcmVcIjoxfSc7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0aWYoZmVlZGJhY2tbMF0uc2NvcmUgPT0gMSl7XG5cdFx0XHRcdFx0RmVlZGJhY2sudXBkYXRlKHt0aXBfaWQ6IHJlcXVlc3RCb2R5LnRpcF9pZCwgZmVlZGJhY2tlcl9pZDogcmVxdWVzdEJvZHkuZmVlZGJhY2tlcl9pZH0sIHskc2V0OiB7c2NvcmU6IDB9fSk7XG5cdFx0XHRcdFx0bGV0IHRpcFNjb3JlID0gdGlwLnNjb3JlIC0gMTtcblx0XHRcdFx0XHRUaXBzLnVwZGF0ZSh7X2lkOiByZXF1ZXN0Qm9keS50aXBfaWR9LCB7JHNldDoge3Njb3JlOiB0aXBTY29yZX19KTtcblx0XHRcdFx0XHRyZXR1cm4gJ3tcInNjb3JlXCI6MH0nO1xuXHRcdFx0XHR9ZWxzZSBpZihmZWVkYmFja1swXS5zY29yZSA9PSAwKXtcblx0XHRcdFx0XHRGZWVkYmFjay51cGRhdGUoe3RpcF9pZDogcmVxdWVzdEJvZHkudGlwX2lkLCBmZWVkYmFja2VyX2lkOiByZXF1ZXN0Qm9keS5mZWVkYmFja2VyX2lkfSwgeyRzZXQ6IHtzY29yZTogMX19KTtcblx0XHRcdFx0XHRsZXQgdGlwU2NvcmUgPSB0aXAuc2NvcmUgKyAxO1xuXHRcdFx0XHRcdFRpcHMudXBkYXRlKHtfaWQ6IHJlcXVlc3RCb2R5LnRpcF9pZH0sIHskc2V0OiB7c2NvcmU6IHRpcFNjb3JlfX0pO1xuXHRcdFx0XHRcdHJldHVybiAne1wic2NvcmVcIjoxfSc7XG5cdFx0XHRcdH1lbHNlIGlmKGZlZWRiYWNrWzBdLnNjb3JlID09IC0xKXtcblx0XHRcdFx0XHRGZWVkYmFjay51cGRhdGUoe3RpcF9pZDogcmVxdWVzdEJvZHkudGlwX2lkLCBmZWVkYmFja2VyX2lkOiByZXF1ZXN0Qm9keS5mZWVkYmFja2VyX2lkfSwgeyRzZXQ6IHtzY29yZTogMX19KTtcblx0XHRcdFx0XHRsZXQgdGlwU2NvcmUgPSB0aXAuc2NvcmUgKyAyO1xuXHRcdFx0XHRcdFRpcHMudXBkYXRlKHtfaWQ6IHJlcXVlc3RCb2R5LnRpcF9pZH0sIHskc2V0OiB7c2NvcmU6IHRpcFNjb3JlfX0pO1xuXHRcdFx0XHRcdHJldHVybiAne1wic2NvcmVcIjoxfSc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdH0sXG5cdFx0XCJkb3dudm90ZVRpcFwiOiBmdW5jdGlvbihyZXF1ZXN0Qm9keSl7XG5cdFx0XHRsZXQgZmVlZGJhY2sgPSBGZWVkYmFjay5maW5kKHt0aXBfaWQ6IHJlcXVlc3RCb2R5LnRpcF9pZCwgZmVlZGJhY2tlcl9pZDogcmVxdWVzdEJvZHkuZmVlZGJhY2tlcl9pZH0pLmZldGNoKCk7XG5cdFx0XHRsZXQgdGlwID0gVGlwcy5maW5kKHtfaWQ6IHJlcXVlc3RCb2R5LnRpcF9pZH0pLmZldGNoKClbMF07XG5cdFx0XHRpZihmZWVkYmFjay5sZW5ndGggPT0gMCl7IC8vdGhlIHVzZXIgaGFzbid0IHByb3ZpZGUgZmVlZGJhY2sgdG8gdGhlIGhpdC5cblx0XHRcdFx0RmVlZGJhY2suaW5zZXJ0KHtcblx0XHRcdFx0XHRmZWVkYmFja2VyX2lkOiByZXF1ZXN0Qm9keS5mZWVkYmFja2VyX2lkLFxuXHRcdFx0XHRcdHRpcF9pZDogcmVxdWVzdEJvZHkudGlwX2lkLFxuXHRcdFx0XHRcdHNjb3JlOiAtMSxcblx0XHRcdFx0XHRjcmVhdGVfdGltZXN0YW1wOiByZXF1ZXN0Qm9keS5jcmVhdGVfdGltZXN0YW1wXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRsZXQgdGlwU2NvcmUgPSB0aXAuc2NvcmUgLSAxO1xuXHRcdFx0XHRUaXBzLnVwZGF0ZSh7X2lkOiByZXF1ZXN0Qm9keS50aXBfaWR9LCB7JHNldDoge3Njb3JlOiB0aXBTY29yZX19KTtcblx0XHRcdFx0cmV0dXJuICd7XCJzY29yZVwiOi0xfSc7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0aWYoZmVlZGJhY2tbMF0uc2NvcmUgPT0gMSl7XG5cdFx0XHRcdFx0RmVlZGJhY2sudXBkYXRlKHt0aXBfaWQ6IHJlcXVlc3RCb2R5LnRpcF9pZCwgZmVlZGJhY2tlcl9pZDogcmVxdWVzdEJvZHkuZmVlZGJhY2tlcl9pZH0sIHskc2V0OiB7c2NvcmU6IC0xfX0pO1xuXHRcdFx0XHRcdGxldCB0aXBTY29yZSA9IHRpcC5zY29yZSAtIDI7XG5cdFx0XHRcdFx0VGlwcy51cGRhdGUoe19pZDogcmVxdWVzdEJvZHkudGlwX2lkfSwgeyRzZXQ6IHtzY29yZTogdGlwU2NvcmV9fSk7XG5cdFx0XHRcdFx0cmV0dXJuICd7XCJzY29yZVwiOi0xfSc7XG5cdFx0XHRcdH1lbHNlIGlmKGZlZWRiYWNrWzBdLnNjb3JlID09IDApe1xuXHRcdFx0XHRcdEZlZWRiYWNrLnVwZGF0ZSh7dGlwX2lkOiByZXF1ZXN0Qm9keS50aXBfaWQsIGZlZWRiYWNrZXJfaWQ6IHJlcXVlc3RCb2R5LmZlZWRiYWNrZXJfaWR9LCB7JHNldDoge3Njb3JlOiAtMX19KTtcblx0XHRcdFx0XHRsZXQgdGlwU2NvcmUgPSB0aXAuc2NvcmUgLSAxO1xuXHRcdFx0XHRcdFRpcHMudXBkYXRlKHtfaWQ6IHJlcXVlc3RCb2R5LnRpcF9pZH0sIHskc2V0OiB7c2NvcmU6IHRpcFNjb3JlfX0pO1xuXHRcdFx0XHRcdHJldHVybiAne1wic2NvcmVcIjotMX0nO1xuXHRcdFx0XHR9ZWxzZSBpZihmZWVkYmFja1swXS5zY29yZSA9PSAtMSl7XG5cdFx0XHRcdFx0RmVlZGJhY2sudXBkYXRlKHt0aXBfaWQ6IHJlcXVlc3RCb2R5LnRpcF9pZCwgZmVlZGJhY2tlcl9pZDogcmVxdWVzdEJvZHkuZmVlZGJhY2tlcl9pZH0sIHskc2V0OiB7c2NvcmU6IDB9fSk7XG5cdFx0XHRcdFx0bGV0IHRpcFNjb3JlID0gdGlwLnNjb3JlICsgMTtcblx0XHRcdFx0XHRUaXBzLnVwZGF0ZSh7X2lkOiByZXF1ZXN0Qm9keS50aXBfaWR9LCB7JHNldDoge3Njb3JlOiB0aXBTY29yZX19KTtcblx0XHRcdFx0XHRyZXR1cm4gJ3tcInNjb3JlXCI6MH0nO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxufSk7XG4iXX0=
