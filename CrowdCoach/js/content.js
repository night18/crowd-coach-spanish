/**
Author: Chun-Wei Chiang
Create Date: 2018/06/07
Purpose: Handle the website content, we can get page information here.
Modify History:
**/

// chrome.runtime.onMessage.addListener(
// 	function (request, sender, sendResponse){
// 		console.log("chrome.runtime.onMessage",request);

// 		if(request.getWorkerInfo){
// 			console.log("received get worker infomation request", request);
// 			let workerName = $(".me-bar a[href='/account']").text();
// 			let workerID = $(".me-bar .copyable-content").text();

// 			return true;
// 		}


// 	}
// );
let serverURL = "https://aa4ccf4b.ngrok.io";

let workerName = $(".me-bar a[href='/account']").text();
let workerID = $(".me-bar .copyable-content").text();
let hitSetID = "";
let getHitDetail = function(){
	let props = $("span[data-react-class*='ShowModal']").attr("data-react-props");
	let detailJson = JSON.parse(props).modalOptions;
	
	return {
		hitTitle: detailJson.projectTitle,
		hitDesc: detailJson.description,
		requesterName: detailJson.requesterName,
	}
	
}
let hitdetail = getHitDetail();
let requesterID = $("a[title='"+ hitdetail.requesterName +"']").attr("href").split("/")[2];

chrome.runtime.sendMessage({method: "getHitSetID"}, function(response) {
	hitSetID = response.hitSetID;
	let xhrPost = $.post(serverURL, {
		method: "getTip",
		hitSetID: hitSetID,
		hitTitle: hitdetail.hitTitle,
		hitDesc: hitdetail.hitDesc,
		requesterName: hitdetail.requesterName,
		requesterID: requesterID,
		workerID: workerID
	}).done(function(tipsString){
		if(tipsString == ""){
			$("#hintContent").text("No tips yet! Provide a tip by clicking on the green 'provide tip' button at the bottom of the page!!");
			$(".feedbackButton").addClass("hidden");
			$(".hintSelectorButton").addClass("hidden");
		}else{
			tips = JSON.parse(tipsString);
			$("#hintContent").text(tips[tipsIndex].tip);
			getFeedback(tips[tipsIndex]._id);
		}
		
		xhrPost.abort();
		
	});
});

let getFeedback = function(tipID){
	let xhrfeedbackPost = $.post(serverURL, {
		method: "getFeedback",
		tip_id: tipID, 
		feedbacker_id: workerID
	}).done(function(scoreString){
		let score = JSON.parse(scoreString).score;

		switch (score){
			case 0:
				$("#likeButton").addClass("gray");
				$("#dislikeButton").addClass("gray");
				break;
			case 1:
				$("#likeButton").removeClass("gray");
				$("#dislikeButton").addClass("gray");
				break;
			case -1:
				$("#likeButton").addClass("gray");
				$("#dislikeButton").removeClass("gray");
				break;
		}

	});
}


let sendListener = function(){
	//Todo: get hit id, hit title, hit description, requester id 
	if( hitSetID == ""){
		return;
	}
	let xhrPostTips = $.post( serverURL, { 
		method: "provideTip", //Todo: seperate the method into provideTip and provide HIT type
		providerID: workerID,
		hitSetID: hitSetID,
		content: $("#hintPvdContent").val(),
		hitType: $("#typeSelector option:selected").val(), //Todo: add the following variable to the server
		hitTitle: hitdetail.hitTitle,
		hitDesc: hitdetail.hitDesc,
		requesterName: hitdetail.requesterName,
		requesterID: requesterID,
		create_timestamp: new Date().toUTCString()
	}).done(function(data) {
		$("#hintProvider").toggleClass("hidden");
		$("#hintProvider").toggleClass("show");
		if(data == "success"){
			sweetAlert("Good job!", "Thanks for your sharing!", "success");
		}
		xhrPostTips.abort();


	});

	

};

