import { Meteor } from 'meteor/meteor';
import "./dataScheme.js";

Meteor.startup(() => {
	const MAXTOPTIP = 4;
	const MAXTYPETOPTIP = 3;


	function shuffle(tmparray) {
		let currentIndex = tmparray.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = tmparray[currentIndex];
		tmparray[currentIndex] = tmparray[randomIndex];
		tmparray[randomIndex] = temporaryValue;
		}
	return tmparray;
	}

	function guessHITType(id ,title, description, requester){

		let tipsByID = Tips.find({hit_set_id: id}).fetch();
		let type = "";
		let typeArray = [];
		if(tipsByID.length > 2){
			let maxCount = 0;
			for(let i = 0; i < tipsByID.length; i++){
				if (typeof typeArray[tipsByID[i].hit_set_id] == "undefined"){
					typeArray[tipsByID[i].hit_set_id] = 1;
				}else{
					typeArray[tipsByID[i].hit_set_id]++;
				}
				if(typeArray[tipsByID[i].hit_set_id] > maxCount){
					type = tipsByID[i].hit_type;
					maxCount = typeArray[tipsByID[i].hit_set_id];
				}
			}
			return type;
		}else{
			//Todo: use machine learning
			if(title.includes("media")){
				return "audio";
			}else if(title.includes("data")){
				return "data";
			}else if(title.includes("website")){
				return "data";
			}else if(title.includes("webpage")){
				return "data";
			}else if(title.includes("web page")){
				return "data";
			}else if(title.includes("receipt")){
				return "imgtrans";
			}else if(title.includes("survey")){
				return "survey";
			}else if(title.includes("tag")){
				return "imgtag";
			}else if(title.includes("categorization")){
				return "categorize";
			}else if(title.includes("categorize")){
				return "categorize";
			}else if(title.includes("category")){
				return "categorize";
			}else if(title.includes("class")){
				return "categorize";
			}else if(title.includes("collect")){
				return "categorize";
			}else if(title.includes("label")){
				return "imgtag";
			}else if(title.includes("article")){
				return "write";
			}else if(title.includes("write")){
				return "write";
			}else if(title.includes("writing")){
				return "write";
			}else if(title.includes("indicate")){
				return "survey";
			}else if(title.includes("postcard")){
				return "imgtrans";
			}else if(title.includes("contact")){
				return "data";
			}else if(title.includes("match")){
				return "categorize";
			}else if(title.includes("clean")){
				return "write";
			}else if(title.includes("video")){
				return "audio";
			}else if(title.includes("audio")){
				return "audio";
			}else if(title.includes("coin")){
				return "imgtag";
			}else if(title.includes("company")){
				return "data";
			}else if(title.includes("predict")){
				return "survey";
			}else if(title.includes("study")){
				return "survey";
			}else if(title.includes("questionnaire")){
				return "survey";
			}else if(title.includes("second")){
				return "audio";
			}else if(title.includes("transcribe")){
				return "imgtrans";
			}else if(title.includes("speech")){
				return "audio";
			}else if(title.includes("draw")){
				return "imgtag";
			}else if(title.includes("yourself")){
				return "survey";
			}else if(title.includes("official")){
				return "data";
			}
			return "others";
		}
	}
		
	function getTopTip(tipArray, getCount){
		let returnTips = [];
		if(tipArray.length > 0){
				tipArray.sort(function(a,b){return b.score - a.score});
				// console.log(tipArray);
				let tmpTips = []; //Handle the tips which has the same score 
				let prvScore = -3; //The plugin do not display the tips which score is lower than -3
				for(let i = 0 ; i < tipArray.length; i++){
					//Have the same score with previous one
					if(tipArray[i].score == prvScore){
						tmpTips.push(tipArray[i]);
						if( i == tipArray.length -1){
							if(tmpTips.length > 0){
								tmpTips = shuffle(tmpTips);
								//Return tip list has enough space to put all temporary tip list 
								if(tmpTips.length <= getCount - returnTips.length ){
									let tmpLength = tmpTips.length;
									for(let j = 0; j < tmpLength; j++){
										returnTips.push(tmpTips.pop());
									}
									
									return returnTips;

								}else{ //Return tip list don't have enough space to put all temporary tip list 
									let tmpLength = getCount - returnTips.length
									for (let j = 0; j < tmpLength; j++){
										returnTips.push(tmpTips.pop());
									}
									
									return returnTips;
								}
								
							}
						}
					}else{ //The first one or different score
						if(tmpTips.length > 0){
							tmpTips = shuffle(tmpTips);
							//Return tip list has enough space to put all temporary tip list 
							if(tmpTips.length <= getCount - returnTips.length ){
								let tmpLength = tmpTips.length;
								for(let j = 0; j < tmpLength; j++){
									returnTips.push(tmpTips.pop());
								}
							}else{ //Return tip list don't have enough space to put all temporary tip list 
								let tmpLength = getCount - returnTips.length
								for (let j = 0; j < tmpLength; j++){
									returnTips.push(tmpTips.pop());
								}
								
								return returnTips;
							}
							
						}
						prvScore = tipArray[i].score;
						tmpTips.push(tipArray[i]);
					}

					if(returnTips.length == getCount){
						break;
					}
					
				}
				
				return returnTips;
			}else{
				//Todo: error message
				console.log("There are no tips for the same hit id");
				return returnTips;
			}

	}


	Meteor.methods({
		storeTip: function(requestBody){
			Tips.insert({
				provider_id: requestBody.providerID,
				hit_set_id: requestBody.hitSetID,
				hit_type : requestBody.hitType,
				tip: requestBody.content,
				score: 0
			});
			//console.log("Success store raw tips to database");
		},
		storeRawType: function(requestBody){
			//Todo: think whether require to store the raw tips info
			HTType.insert({
				hit_set_id: requestBody.hitSetID,
				hit_raw_type: requestBody.hitType,
				worker_id: requestBody.providerID
			});
		},
		provideTip: function(requestBody){
			Tips.insert({
				provider_id: requestBody.providerID,
				hit_set_id: requestBody.hitSetID,
				hit_type : requestBody.hitType,
				tip: requestBody.content,
				score: 0,
				create_timestamp: requestBody.create_timestamp
			});
			console.log("Success store raw tips to database");
			
		},
		getTip: function(requestBody){
			let topTips = [];
			console.log(requestBody.hitTitle.toLowerCase());
			//Same ID
			let tipsByID = Tips.find({hit_set_id: requestBody.hitSetID}).fetch();
			if(tipsByID.length > 0){
				let topTipsByID = getTopTip(tipsByID, MAXTOPTIP);
				topTips.push.apply(topTips, topTipsByID);
			}
			
			//Same type top
			let hitType = guessHITType(requestBody.hitSetID, requestBody.hitTitle.toLowerCase(), requestBody.hitDesc.toLowerCase(), requestBody.requesterID);
			if(hitType != "others"){
				console.log(hitType);
				let tipsByType = Tips.find({hit_type: hitType, hit_set_id: {$ne: requestBody.hitSetID}}).fetch();
				if(tipsByType.length > 0){
					let topTipsByType = getTopTip(tipsByType, MAXTYPETOPTIP);
					topTips.push.apply(topTips, topTipsByType);
					// console.log(topTips);
				}
			}

			if(hitType != "others"){
				//Same type New, only add one new to the tip list
				let tipsByTypeID = Tips.find({hit_type: hitType}).fetch();
				tipsByTypeID = shuffle(tipsByTypeID); //random choose a advice from database
				for(let i = tipsByTypeID.length-1; i >= 0 ; i--){
					let isAlreadyIn = false;
					if(tipsByTypeID[i].score > -3 ){
						for(let j = 0 ; j < topTips.length; j++){
							if(tipsByTypeID[i]._id == topTips[j]._id){
								isAlreadyIn = true;
								break;
							}
						}
						if(!isAlreadyIn){
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
				worker_id : requestBody.workerID,
				requester_id: requestBody.requesterID
			});

			if(topTips.length > 0){
				console.log(topTips);
				return JSON.stringify(topTips);
			}else{
				return "";
			}

			
		},
		"getFeedback": function(requestBody){
			let feedback = Feedback.find({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}).fetch();
			if(feedback.length == 0){
				return '{"score":0}';
			} else {
				return '{"score":'+feedback[0].score+'}';
			}
		},
		"upvoteTip": function(requestBody){
			let feedback = Feedback.find({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}).fetch();
			let tip = Tips.find({_id: requestBody.tip_id}).fetch()[0];
			if(feedback.length == 0){ //the user hasn't provide feedback to the hit.
				Feedback.insert({
					feedbacker_id: requestBody.feedbacker_id,
					tip_id: requestBody.tip_id,
					score: 1,
					create_timestamp: requestBody.create_timestamp
				});
				let tipScore = tip.score + 1;
				Tips.update({_id: requestBody.tip_id}, {$set: {score: tipScore}});
				return '{"score":1}';
			}else{
				if(feedback[0].score == 1){
					Feedback.update({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}, {$set: {score: 0}});
					let tipScore = tip.score - 1;
					Tips.update({_id: requestBody.tip_id}, {$set: {score: tipScore}});
					return '{"score":0}';
				}else if(feedback[0].score == 0){
					Feedback.update({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}, {$set: {score: 1}});
					let tipScore = tip.score + 1;
					Tips.update({_id: requestBody.tip_id}, {$set: {score: tipScore}});
					return '{"score":1}';
				}else if(feedback[0].score == -1){
					Feedback.update({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}, {$set: {score: 1}});
					let tipScore = tip.score + 2;
					Tips.update({_id: requestBody.tip_id}, {$set: {score: tipScore}});
					return '{"score":1}';
				}
			}

		},
		"downvoteTip": function(requestBody){
			let feedback = Feedback.find({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}).fetch();
			let tip = Tips.find({_id: requestBody.tip_id}).fetch()[0];
			if(feedback.length == 0){ //the user hasn't provide feedback to the hit.
				Feedback.insert({
					feedbacker_id: requestBody.feedbacker_id,
					tip_id: requestBody.tip_id,
					score: -1,
					create_timestamp: requestBody.create_timestamp
				});
				let tipScore = tip.score - 1;
				Tips.update({_id: requestBody.tip_id}, {$set: {score: tipScore}});
				return '{"score":-1}';
			}else{
				if(feedback[0].score == 1){
					Feedback.update({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}, {$set: {score: -1}});
					let tipScore = tip.score - 2;
					Tips.update({_id: requestBody.tip_id}, {$set: {score: tipScore}});
					return '{"score":-1}';
				}else if(feedback[0].score == 0){
					Feedback.update({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}, {$set: {score: -1}});
					let tipScore = tip.score - 1;
					Tips.update({_id: requestBody.tip_id}, {$set: {score: tipScore}});
					return '{"score":-1}';
				}else if(feedback[0].score == -1){
					Feedback.update({tip_id: requestBody.tip_id, feedbacker_id: requestBody.feedbacker_id}, {$set: {score: 0}});
					let tipScore = tip.score + 1;
					Tips.update({_id: requestBody.tip_id}, {$set: {score: tipScore}});
					return '{"score":0}';
				}
			}
		}
	});

});
